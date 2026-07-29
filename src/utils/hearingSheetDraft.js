import { getSessionOwner } from "./authSession";

export const HEARING_SHEET_DRAFT_KEY = "wvaHearingSheetDraft";

function getDraftKey(owner = getSessionOwner()) {
  return `${HEARING_SHEET_DRAFT_KEY}:${owner}`;
}

export function loadHearingSheetDraft() {
  if (typeof window === "undefined") return null;

  try {
    const ownerKey = getDraftKey();
    const savedDraft =
      window.localStorage.getItem(ownerKey) ||
      window.localStorage.getItem(getDraftKey("guest")) ||
      window.localStorage.getItem(HEARING_SHEET_DRAFT_KEY);
    if (!savedDraft) return null;

    const parsed = JSON.parse(savedDraft);
    return parsed?.source ? parsed : null;
  } catch {
    return null;
  }
}

export function saveHearingSheetDraft(source, currentStep) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    getDraftKey(),
    JSON.stringify({
      source,
      currentStep,
      savedAt: new Date().toISOString(),
    })
  );
}

export function clearHearingSheetDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getDraftKey());
  window.localStorage.removeItem(getDraftKey("guest"));
  window.localStorage.removeItem(HEARING_SHEET_DRAFT_KEY);
}

export function collectionToArray(collection, fallback) {
  const values = Array.isArray(collection)
    ? collection
    : Object.values(collection || {});

  return values.length > 0 ? values : fallback;
}
