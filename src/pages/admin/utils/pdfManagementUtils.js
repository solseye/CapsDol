export const FOLDER_OPTIONS = [
  { label: "통합", value: "normal" },
  { label: "인사", value: "human" },
  { label: "노무", value: "labor" },
  { label: "회계", value: "accounting" },
  { label: "법무", value: "law" },
];

export const STATUS_OPTIONS = [
  { label: "사용중", value: "active" },
  { label: "사용안함", value: "inactive" },
  { label: "예약 자료", value: "future" },
  { label: "보관됨", value: "archived" },
];

export const ACCEPTED_FILE_TYPES = ".pdf,.docx,.xlsx,.csv,.txt,.md";

export const ALLOWED_EXTENSIONS = ["pdf", "docx", "xlsx", "csv", "txt", "md"];

// 표에서 날짜를 짧은 업로드일 형식으로 보여줍니다.
export function formatDateShort(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

// 파일 크기를 사람이 읽기 쉬운 단위로 변환합니다.
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// 파일명에서 확장자 배지에 들어갈 값을 추출합니다.
export function getFileExtension(fileName) {
  if (!fileName) return "-";
  const ext = fileName.split(".").pop()?.toUpperCase();
  return ext || "-";
}

// 업로드 전에 허용된 문서 확장자인지 검사합니다.
export function isAllowedFile(file) {
  if (!file) return false;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(extension);
}
