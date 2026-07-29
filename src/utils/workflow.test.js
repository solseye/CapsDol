import {
  clearSession,
  getSafeReturnPath,
  getSessionOwner,
  saveSession,
} from "./authSession";
import {
  clearHearingSheetDraft,
  loadHearingSheetDraft,
  saveHearingSheetDraft,
} from "./hearingSheetDraft";
import {
  loadWorkflowEvents,
  markWorkflowEvent,
} from "./workflowProgress";

beforeEach(() => {
  localStorage.clear();
});

test("로그인 세션을 저장하고 회원 식별자를 반환한다", () => {
  saveSession({
    accessToken: "token",
    role: "user",
    user: { uuid: "user-1", username: "tester" },
  });

  expect(getSessionOwner()).toBe("user-1");
  clearSession();
  expect(localStorage.getItem("accessToken")).toBeNull();
});

test("외부 주소를 로그인 후 이동 경로로 사용하지 않는다", () => {
  expect(getSafeReturnPath({ from: "//malicious.example" }, "user")).toBe(
    "/mypage"
  );
  expect(getSafeReturnPath({ from: "/mypage/files" }, "user")).toBe(
    "/mypage/files"
  );
});

test("히어링 시트 초안과 워크플로 이벤트를 회원별로 저장한다", () => {
  saveSession({
    accessToken: "token",
    role: "user",
    user: { uuid: "member-7" },
  });

  saveHearingSheetDraft({ companyName: "WVA" }, 2);
  markWorkflowEvent("hearingSubmittedAt", "2026-07-29T00:00:00.000Z");

  expect(loadHearingSheetDraft()).toMatchObject({
    source: { companyName: "WVA" },
    currentStep: 2,
  });
  expect(loadWorkflowEvents().hearingSubmittedAt).toBe(
    "2026-07-29T00:00:00.000Z"
  );

  clearHearingSheetDraft();
  expect(loadHearingSheetDraft()).toBeNull();
});
