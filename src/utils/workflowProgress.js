import { getSessionOwner } from "./authSession";

const WORKFLOW_KEY = "wvaWorkflow";

function getKey() {
  return `${WORKFLOW_KEY}:${getSessionOwner()}`;
}

export function loadWorkflowEvents() {
  try {
    return JSON.parse(localStorage.getItem(getKey()) || "{}");
  } catch {
    return {};
  }
}

export function markWorkflowEvent(eventName, value = true) {
  const current = loadWorkflowEvents();
  const next = {
    ...current,
    [eventName]: value,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(getKey(), JSON.stringify(next));
  return next;
}
