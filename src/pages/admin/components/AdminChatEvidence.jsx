const SOURCE_METADATA_FIELDS = [
  ["chunkType", "청크 유형"],
  ["row", "행"],
  ["page", "페이지"],
  ["bucket", "버킷"],
  ["fileType", "파일 형식"],
  ["chunkIndex", "청크 번호"],
  ["fileStatus", "파일 상태"],
  ["storagePath", "저장 경로"],
];

function firstDefined(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

// `[1] 파일명\nchunk_type: ...\ncontent: ...` 형태의 RAG 컨텍스트를
// 관리자 화면에서 사용할 수 있는 근거 객체 배열로 변환합니다.
function parseSourceText(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return [];

  const blocks = text.split(/\n\s*(?=\[\d+\]\s)/g);

  return blocks.map((block, blockIndex) => {
    const lines = block.trim().split("\n");
    const headingMatch = lines[0]?.match(/^\[(\d+)\]\s*(.*)$/);
    const metadata = {};
    const contentLines = [];
    let readingContent = false;

    lines.slice(headingMatch ? 1 : 0).forEach((line) => {
      if (readingContent) {
        contentLines.push(line);
        return;
      }

      const contentMatch = line.match(/^content:\s?(.*)$/i);
      if (contentMatch) {
        readingContent = true;
        if (contentMatch[1]) contentLines.push(contentMatch[1]);
        return;
      }

      const metadataMatch = line.match(/^([a-z_]+):\s?(.*)$/i);
      if (metadataMatch) {
        metadata[metadataMatch[1].toLowerCase()] = metadataMatch[2];
      } else if (line.trim()) {
        contentLines.push(line);
      }
    });

    return {
      sourceNumber: headingMatch?.[1] || blockIndex + 1,
      sourceName:
        headingMatch?.[2] || metadata.source_name || metadata.storage_path,
      chunkType: metadata.chunk_type,
      row: metadata.row,
      page: metadata.page,
      bucket: metadata.bucket,
      fileType: metadata.file_type,
      chunkIndex: metadata.chunk_index,
      fileStatus: metadata.file_status,
      storagePath: metadata.storage_path,
      content: contentLines.join("\n").trim(),
    };
  });
}

function normalizeSourceObject(source, sourceIndex) {
  const metadata = source.metadata || source.ragMetadata || {};

  return {
    ...source,
    sourceNumber: firstDefined(source.sourceNumber, sourceIndex + 1),
    sourceName: firstDefined(
      source.sourceName,
      source.source_name,
      source.originalName,
      source.original_name,
      source.fileName,
      source.file_name,
      source.name,
      source.storagePath,
      source.storage_path,
      metadata.sourceName,
      metadata.source_name,
      metadata.storagePath,
      metadata.storage_path,
    ),
    chunkType: firstDefined(
      source.chunkType,
      source.chunk_type,
      metadata.chunkType,
      metadata.chunk_type,
    ),
    row: firstDefined(source.row, metadata.row),
    page: firstDefined(source.page, metadata.page),
    bucket: firstDefined(source.bucket, metadata.bucket),
    fileType: firstDefined(
      source.fileType,
      source.file_type,
      metadata.fileType,
      metadata.file_type,
    ),
    chunkIndex: firstDefined(
      source.chunkIndex,
      source.chunk_index,
      metadata.chunkIndex,
      metadata.chunk_index,
    ),
    fileStatus: firstDefined(
      source.fileStatus,
      source.file_status,
      metadata.fileStatus,
      metadata.file_status,
    ),
    storagePath: firstDefined(
      source.storagePath,
      source.storage_path,
      metadata.storagePath,
      metadata.storage_path,
    ),
    content: firstDefined(
      source.content,
      source.text,
      source.document,
      source.chunkContent,
      source.chunk_content,
      source.chunkText,
      source.chunk_text,
      metadata.content,
    ),
    similarity: firstDefined(
      source.similarity,
      source.score,
      metadata.similarity,
    ),
  };
}

function normalizeSources(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((source, index) =>
      typeof source === "string"
        ? parseSourceText(source)
        : [normalizeSourceObject(source, index)],
    );
  }

  if (typeof value === "string") {
    try {
      return normalizeSources(JSON.parse(value));
    } catch {
      return parseSourceText(value);
    }
  }

  if (typeof value === "object") {
    return normalizeSources(value.sources || [value]);
  }

  return [];
}

// 상세 원문 컨텍스트가 있으면 요약된 sources보다 우선 사용합니다.
export function getResponseSources(data = {}) {
  const detailedSources = normalizeSources(
    data.context ||
      data.ragContext ||
      data.rag_context ||
      data.sourceContext ||
      data.source_context,
  );

  if (detailedSources.length > 0) return detailedSources;

  return normalizeSources(
    data.sources ||
      data.ragSources ||
      data.rag_sources ||
      data.evidence ||
      data.references ||
      data.matches ||
      data.retrievedChunks ||
      data.retrieved_chunks ||
      data.chunks,
  );
}

// 관리자 챗봇과 사용자 대화 조회 화면에서 동일한 근거 UI를 사용합니다.
export default function AdminChatEvidence({ data, className = "" }) {
  const sources = getResponseSources(data);
  if (sources.length === 0) return null;

  return (
    <div className={`adm-ai-sources ${className}`.trim()}>
      <strong>참고 근거 {sources.length}개</strong>

      {sources.map((source, sourceIndex) => (
        <details
          key={`${source.fileId || source.file_id || "source"}-${source.chunkId || source.chunk_id || source.chunkIndex || sourceIndex}`}
          className="adm-ai-source"
        >
          <summary>
            <span>
              [{source.sourceNumber || sourceIndex + 1}]{" "}
              {source.sourceName || "이름 없는 참고 자료"}
            </span>
            <small>
              {source.row && <span>{source.row}행</span>}
              {source.page && <span>{source.page}페이지</span>}
              {source.similarity !== undefined &&
                source.similarity !== null && (
                  <span>
                    유사도{" "}
                    {Number.isFinite(Number(source.similarity))
                      ? Number(source.similarity).toFixed(3)
                      : String(source.similarity)}
                  </span>
                )}
            </small>
          </summary>

          <div className="adm-ai-source-detail">
            <dl>
              {SOURCE_METADATA_FIELDS.map(([field, label]) =>
                source[field] !== undefined &&
                source[field] !== null &&
                source[field] !== "" ? (
                  <div key={field}>
                    <dt>{label}</dt>
                    <dd>{String(source[field])}</dd>
                  </div>
                ) : null,
              )}
            </dl>

            {source.content ? (
              <div className="adm-ai-source-content">
                <strong>근거 원문</strong>
                <pre>{String(source.content)}</pre>
              </div>
            ) : (
              <p className="adm-ai-source-empty">
                백엔드 응답에 근거 원문이 포함되지 않았습니다.
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
