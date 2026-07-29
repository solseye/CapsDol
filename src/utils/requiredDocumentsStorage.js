export const REQUIRED_DOCUMENT_GROUPS = [
  {
    id: "corporate-founder",
    title: "법인 발기인 기본 서류",
    description: "주식회사가 발기인으로 출자하는 경우 준비합니다.",
    canDisable: false,
    items: [
      { id: "company-registry", label: "회사 등본(이력사항전부증명서) 1통" },
      { id: "company-seal", label: "회사 인감증명서 1통" },
      { id: "shareholder-list", label: "주주명부 1통" },
    ],
  },
  {
    id: "owner-over-50",
    title: "50% 초과 주식 보유자가 있는 경우",
    description: "해당 주식을 보유한 개인의 서류를 준비합니다.",
    canDisable: true,
    items: [
      { id: "owner50-seal", label: "개인 인감증명서 1통" },
      { id: "owner50-resident", label: "주민등록표 1통" },
      {
        id: "owner50-id",
        label: "여권, 주민등록증 또는 운전면허증 사본",
      },
    ],
  },
  {
    id: "owner-over-25",
    title: "50% 초과 보유자가 없는 경우",
    description: "25%를 초과하여 보유한 사람의 서류를 준비합니다.",
    canDisable: true,
    items: [
      { id: "owner25-seal", label: "개인 인감증명서 1통" },
      { id: "owner25-resident", label: "주민등록표 1통" },
      {
        id: "owner25-id",
        label: "여권, 주민등록증 또는 운전면허증 사본",
      },
    ],
  },
  {
    id: "incoming-directors",
    title: "임원으로 취임하는 사람",
    description: "취임하는 각 임원별로 준비합니다.",
    canDisable: false,
    items: [
      { id: "director-seal", label: "개인 인감증명서 1통" },
      { id: "director-resident", label: "주민등록표 1통" },
      {
        id: "director-id",
        label: "여권, 주민등록증 또는 운전면허증 사본",
      },
    ],
  },
];

export const DOCUMENT_STATUS_OPTIONS = [
  { value: "pending", label: "준비 전" },
  { value: "ready", label: "준비 완료" },
  { value: "uploaded", label: "업로드 완료" },
  { value: "reviewed", label: "관리자 확인" },
  { value: "resubmit", label: "재제출 필요" },
];

function getChecklistOwner() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.uuid || user.email || user.username || "local-user";
  } catch {
    return "local-user";
  }
}

function getStorageKey() {
  return `wvaRequiredDocuments:${getChecklistOwner()}`;
}

function createInitialChecklist() {
  const now = new Date().toISOString();

  return {
    version: 2,
    createdAt: now,
    updatedAt: now,
    groups: REQUIRED_DOCUMENT_GROUPS.map((group) => ({
      id: group.id,
      applicable: true,
      items: group.items.map((item) => ({
        id: item.id,
        status: "pending",
        issuedAt: "",
        note: "",
        linkedFileName: "",
        linkedFilePath: "",
        updatedAt: now,
      })),
    })),
  };
}

function normalizeChecklist(checklist) {
  const now = new Date().toISOString();

  return {
    ...checklist,
    version: 2,
    groups: REQUIRED_DOCUMENT_GROUPS.map((templateGroup) => {
      const savedGroup = checklist.groups.find(
        (group) => group.id === templateGroup.id
      );

      return {
        id: templateGroup.id,
        applicable: savedGroup?.applicable ?? true,
        items: templateGroup.items.map((templateItem) => {
          const savedItem = savedGroup?.items?.find(
            (item) => item.id === templateItem.id
          );

          return {
            id: templateItem.id,
            status: savedItem?.status || "pending",
            issuedAt: savedItem?.issuedAt || "",
            note: savedItem?.note || "",
            linkedFileName: savedItem?.linkedFileName || "",
            linkedFilePath: savedItem?.linkedFilePath || "",
            updatedAt: savedItem?.updatedAt || now,
          };
        }),
      };
    }),
  };
}

export function loadRequiredDocumentsChecklist() {
  try {
    const saved = localStorage.getItem(getStorageKey());
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed?.groups)
      ? normalizeChecklist(parsed)
      : null;
  } catch {
    return null;
  }
}

export function saveRequiredDocumentsChecklist(checklist) {
  const nextChecklist = {
    ...checklist,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(getStorageKey(), JSON.stringify(nextChecklist));
  return nextChecklist;
}

export function ensureRequiredDocumentsChecklist() {
  const existing = loadRequiredDocumentsChecklist();
  if (existing) {
    return saveRequiredDocumentsChecklist(existing);
  }
  return saveRequiredDocumentsChecklist(createInitialChecklist());
}

export function isDocumentExpired(issuedAt) {
  if (!issuedAt) return false;

  const issuedDate = new Date(`${issuedAt}T00:00:00`);
  if (Number.isNaN(issuedDate.getTime())) return false;

  const expiresAt = new Date(issuedDate);
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  expiresAt.setHours(23, 59, 59, 999);

  return Date.now() > expiresAt.getTime();
}
