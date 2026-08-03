import { Fragment } from "react";

const EMPHASIS_PATTERN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;

// 챗봇의 Markdown식 강조 표기를 안전한 React 요소로 변환합니다.
// HTML 문자열을 삽입하지 않으므로 답변에 태그가 포함되어도 일반 텍스트로 표시됩니다.
export default function FormattedChatText({ text, fallback = "" }) {
  const value = String(text || fallback);

  return value.split(EMPHASIS_PATTERN).map((part, index) => {
    const isDoubleEmphasis = part.startsWith("**") && part.endsWith("**");
    const isSingleEmphasis =
      !isDoubleEmphasis && part.startsWith("*") && part.endsWith("*");

    if (isDoubleEmphasis) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (isSingleEmphasis) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}
