const INITIAL_REQUEST_KEYS = [
  "initial_request",
  "initialRequest",
  "additional_request",
  "additionalRequest",
  "initial_note",
  "note",
  "request",
  "memo",
];

function getInitialRequestFromObject(note) {
  for (const key of INITIAL_REQUEST_KEYS) {
    if (typeof note?.[key] === "string" && note[key].trim()) {
      return note[key].trim();
    }
  }

  return "";
}

export function parseReservationNote(note) {
  if (!note) {
    return { initialRequest: "", messages: [] };
  }

  if (typeof note === "object") {
    if (Array.isArray(note)) {
      return { initialRequest: "", messages: note };
    }

    return {
      initialRequest: getInitialRequestFromObject(note),
      messages: Array.isArray(note.chat)
        ? note.chat
        : Array.isArray(note.messages)
          ? note.messages
          : [],
    };
  }

  const trimmedNote = String(note).trim();
  if (!trimmedNote) {
    return { initialRequest: "", messages: [] };
  }

  try {
    const parsed = JSON.parse(trimmedNote);

    if (typeof parsed === "string") {
      return { initialRequest: parsed.trim(), messages: [] };
    }

    return parseReservationNote(parsed);
  } catch {
    return { initialRequest: trimmedNote, messages: [] };
  }
}

export function createLocalReservationNote(initialRequest, messages) {
  return JSON.stringify({
    initial_request: initialRequest || "",
    chat: messages,
  });
}
