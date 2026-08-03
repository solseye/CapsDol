import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FormattedChatText from "../../../components/FormattedChatText";
import Header from "../../../components/Header";
import { getMyReservations } from "../../../api/reservationApi";
import { getClientFiles } from "../../../api/clientFileApi";
import { getChatHistory } from "../../../api/chatApi";
import { parseReservationNote } from "../../../utils/reservationNoteUtils";
import { loadWorkflowEvents } from "../../../utils/workflowProgress";
import "../../../App.css";
import "../../admin/admin.css";
import "../../../styles/my-page-visily.css";
import "../../../styles/mypage-transition.css";

const PROGRESS_STEPS = [
  ["strategy", "사전 정보 전송"],
  ["consult", "상담 신청 완료"],
  ["files", "자료 업로드"],
  ["review", "전문가 검토 대기"],
  ["meeting", "상담 일정 확정"],
];

const FAQ_ITEMS = [
  {
    id: "reservation",
    title: "상담 예약은 어떻게 진행되나요?",
    body: "원하는 상담 분야와 가능한 날짜·시간을 신청하면 관리자가 내용을 확인한 뒤 승인 또는 조정 결과를 안내합니다.",
  },
  {
    id: "files",
    title: "제출한 서류의 보안은 어떻게 유지되나요?",
    body: "제출 파일은 로그인한 사용자와 담당 관리자만 접근할 수 있도록 관리되며, 상담에 필요한 범위에서만 사용됩니다.",
  },
  {
    id: "support",
    title: "일본 현지 법인 설립 지원도 가능한가요?",
    body: "히어링 시트와 상담 내용을 기준으로 법인 형태, 정관 초안, 세무·회계 및 노무 준비 항목을 전문가와 함께 검토할 수 있습니다.",
  },
];

function getReservationDate(reservation) {
  const dateValue =
    reservation.selected_date || reservation.selectedDate;

  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return null;

  const timeValue =
    reservation.selected_time || reservation.selectedTime || "";
  const [hours, minutes] = String(timeValue)
    .split(":")
    .map(Number);

  if (Number.isFinite(hours)) {
    date.setHours(hours, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  }

  return date;
}

function formatReservationDate(reservation) {
  const date = getReservationDate(reservation);

  if (!date) return "일정 확인 필요";

  const dateText = date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const timeText = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateText} ${timeText}`;
}

function getStatusLabel(status) {
  switch (status) {
    case "approved":
      return "승인 완료";
    case "rejected":
      return "승인 거절";
    case "cancelled":
      return "취소 완료";
    default:
      return "승인 대기";
  }
}

function getFieldLabel(field) {
  const labels = {
    law: "법무",
    accounting: "회계·세무",
    labor: "노무",
    visa: "비자",
  };

  return labels[field] || field || "상담 분야 확인 중";
}

function formatChatHistoryDate(dateValue) {
  if (!dateValue) return "날짜 확인 필요";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "날짜 확인 필요";
  }

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function MyPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [clientFiles, setClientFiles] = useState([]);
  const [reservationLoading, setReservationLoading] = useState(true);
  const [reservationError, setReservationError] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [openFaq, setOpenFaq] = useState("reservation");
  const [chatHistories, setChatHistories] = useState([]);
  const [chatHistoryLoading, setChatHistoryLoading] =
    useState(true);
  const [chatHistoryError, setChatHistoryError] = useState("");
  const [openChatHistoryId, setOpenChatHistoryId] =
    useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    setIsLoggedIn(!!token);

    if (!token) {
      setReservationLoading(false);
      setChatHistoryLoading(false);

      setReservationError(
        "로그인 후 다음 상담 일정을 확인할 수 있습니다."
      );

      setChatHistoryError(
        "로그인 후 챗봇 대화 기록을 확인할 수 있습니다."
      );

      return;
    }

    const fetchWorkspace = async () => {
      try {
        setReservationLoading(true);
        setChatHistoryLoading(true);
        setReservationError("");
        setChatHistoryError("");

        const [
          reservationResult,
          fileResult,
          chatHistoryResult,
        ] = await Promise.allSettled([
          getMyReservations(),
          getClientFiles({
            bucket: "users",
            limit: 100,
            offset: 0,
          }),
          getChatHistory({
            limit: 5,
            offset: 0,
          }),
        ]);

        if (reservationResult.status === "fulfilled") {
          setReservations(
            Array.isArray(
              reservationResult.value.reservations
            )
              ? reservationResult.value.reservations
              : []
          );
        } else {
          setReservationError(
            reservationResult.reason?.message ||
              "예약 목록을 불러오지 못했습니다."
          );
        }

        if (fileResult.status === "fulfilled") {
          setClientFiles(
            Array.isArray(fileResult.value.files)
              ? fileResult.value.files
              : []
          );
        }

        if (chatHistoryResult.status === "fulfilled") {
          setChatHistories(
            Array.isArray(chatHistoryResult.value.histories)
              ? chatHistoryResult.value.histories
              : []
          );
        } else {
          setChatHistories([]);

          setChatHistoryError(
            chatHistoryResult.reason?.message ||
              "챗봇 대화 기록을 불러오지 못했습니다."
          );
        }
      } finally {
        setReservationLoading(false);
        setChatHistoryLoading(false);
      }
    };

    fetchWorkspace();
  }, []);

  const upcomingReservation = useMemo(() => {
    const now = Date.now();

    return reservations
      .filter((reservation) =>
        ["pending", "approved"].includes(reservation.status)
      )
      .map((reservation) => ({
        ...reservation,
        parsedDate: getReservationDate(reservation),
      }))
      .filter(
        (reservation) =>
          reservation.parsedDate &&
          reservation.parsedDate.getTime() >= now
      )
      .sort(
        (a, b) =>
          a.parsedDate.getTime() - b.parsedDate.getTime()
      )[0];
  }, [reservations]);

  const checkedSteps = useMemo(() => {
    const events = loadWorkflowEvents();
    const hasPendingReview = reservations.some((item) => item.status === "pending");
    const hasApprovedMeeting = reservations.some((item) => item.status === "approved");

    return {
      strategy: Boolean(events.hearingSubmittedAt),
      consult: reservations.length > 0,
      files: clientFiles.length > 0 || Boolean(events.fileUploadedAt),
      review: hasPendingReview || hasApprovedMeeting,
      meeting: hasApprovedMeeting,
    };
  }, [clientFiles, reservations]);

  const completedStepCount = Object.values(checkedSteps).filter(Boolean).length;
  const selectedNote = useMemo(
    () => parseReservationNote(selectedReservation?.note),
    [selectedReservation]
  );

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <main className="my-page-dashboard mypage-page-enter">
        <div className="my-page-shell">
          <section className="my-page-heading">
            <p>MY PAGE</p>
            <h1>마이페이지</h1>
            <span>
              상담 예약, 제출 파일, 전문가 검토 준비를 한 곳에서
              관리합니다.
            </span>
          </section>

          <section className="my-page-upcoming">
            <span className="my-page-square-tag">CAL</span>
            <div className="my-page-upcoming-copy">
              <p>UPCOMING CONSULTATION</p>

              {reservationLoading ? (
                <>
                  <h2>다음 상담 일정을 확인하고 있습니다.</h2>
                  <span>잠시만 기다려 주세요.</span>
                </>
              ) : upcomingReservation ? (
                <>
                  <h2>
                    다음 상담 일정:{" "}
                    {formatReservationDate(upcomingReservation)}
                  </h2>
                  <span>
                    {getFieldLabel(upcomingReservation.field)} ·{" "}
                    {getStatusLabel(upcomingReservation.status)}
                  </span>
                </>
              ) : (
                <>
                  <h2>예정된 상담 일정이 없습니다.</h2>
                  <span>
                    {reservationError ||
                      "새로운 상담이 필요하면 상담 예약에서 신청해 주세요."}
                  </span>
                </>
              )}
            </div>

            <div className="my-page-upcoming-actions">
              <button
                type="button"
                onClick={() =>
                  upcomingReservation &&
                  setSelectedReservation(upcomingReservation)
                }
                disabled={!upcomingReservation}
              >
                상세보기
              </button>
              <Link to="/reservation">일정 신청</Link>
            </div>
          </section>

          <section className="my-page-content-grid">
            <div className="my-page-action-grid">
              <article className="my-page-action-card">
                <div>
                  <p>
                    <span className="my-page-mini-tag">CAL</span>
                    RESERVATIONS
                  </p>
                  <h2>내 상담 내역</h2>
                  <span>
                    신청한 상담의 승인 상태와 일정을 확인하고
                    관리합니다.
                  </span>
                </div>
                <Link to="/mypage/reservations">
                  상담 내역 보기
                </Link>
              </article>

              <article className="my-page-action-card">
                <div>
                  <p>
                    <span className="my-page-mini-tag">DOC</span>
                    RESOURCES
                  </p>
                  <h2>내 파일 관리</h2>
                  <span>
                    필요 서류의 준비 상태와 발급일, 제출 파일을 한곳에서 관리합니다.
                  </span>
                </div>
                <Link to="/mypage/files">파일 관리하기</Link>
              </article>
            </div>

            <aside className="my-page-progress-card">
              <p>PROGRESS</p>
              <h2>진행 현황</h2>
              <div className="my-page-progress-value">
                <strong>{completedStepCount}/5</strong>
                <span>
                  {completedStepCount === 5
                    ? "상담 준비 완료"
                    : "실제 상담과 자료 상태를 기준으로 자동 반영됩니다."}
                </span>
              </div>
              <div
                className="my-page-progress-bar"
                aria-hidden="true"
              >
                <span
                  style={{
                    width: `${(completedStepCount / 5) * 100}%`,
                  }}
                />
              </div>
              <div className="my-page-step-list">
                {PROGRESS_STEPS.map(([id, label], index) => (
                  <div
                    className={checkedSteps[id] ? "is-complete" : ""}
                    key={id}
                  >
                    <span>
                      {checkedSteps[id] ? "✓" : index + 1}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
              <small>상담 신청, 파일 제출, 승인 상태가 자동으로 반영됩니다.</small>
            </aside>
          </section>

          <section className="my-page-faq">
            <header>
              <p>FAQ</p>
              <h2>자주 묻는 질문</h2>
              <span>
                상담과 자료 제출 전에 필요한 내용을 확인하세요.
              </span>
            </header>

            <div>
              {FAQ_ITEMS.map((item) => (
                <article
                  className={openFaq === item.id ? "is-open" : ""}
                  key={item.id}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(
                        openFaq === item.id ? "" : item.id
                      )
                    }
                    aria-expanded={openFaq === item.id}
                  >
                    <span>{item.title}</span>
                    <strong>+</strong>
                  </button>
                  <div>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="my-page-chat-history">
            <header className="my-page-chat-history-header">
              <div>
                <p>CHAT HISTORY</p>
                <h2>챗봇 대화 내역</h2>
                <span>
                  최근 챗봇 질문과 답변을 확인할 수 있습니다.
                </span>
              </div>

              <Link
                className="my-page-chat-history-button"
                to="/chat"
              >
                새 상담 시작
              </Link>
            </header>

            {chatHistoryLoading ? (
              <div className="my-page-chat-history-empty">
                <div
                  className="my-page-chat-history-empty-icon"
                  aria-hidden="true"
                >
                  AI
                </div>

                <strong>대화 기록을 확인하고 있습니다.</strong>

                <span>잠시만 기다려 주세요.</span>
              </div>
            ) : chatHistoryError ? (
              <div className="my-page-chat-history-empty">
                <div
                  className="my-page-chat-history-empty-icon"
                  aria-hidden="true"
                >
                  !
                </div>

                <strong>대화 기록을 불러오지 못했습니다.</strong>

                <span>{chatHistoryError}</span>
              </div>
            ) : chatHistories.length === 0 ? (
              <div className="my-page-chat-history-empty">
                <div
                  className="my-page-chat-history-empty-icon"
                  aria-hidden="true"
                >
                  AI
                </div>

                <strong>아직 저장된 대화가 없습니다.</strong>

                <span>
                  챗봇 상담을 시작하면 이전 대화가 이곳에
                  표시됩니다.
                </span>
              </div>
            ) : (
              <div className="my-page-chat-history-list">
                {chatHistories.map((history) => {
                  const historyId = String(history.id);
                  const isOpen =
                    openChatHistoryId === historyId;

                  return (
                    <article
                      className={`my-page-chat-history-item ${
                        isOpen ? "is-open" : ""
                      }`}
                      key={historyId}
                    >
                      <button
                        className="my-page-chat-history-question"
                        type="button"
                        onClick={() =>
                          setOpenChatHistoryId(
                            isOpen ? null : historyId
                          )
                        }
                        aria-expanded={isOpen}
                      >
                        <span
                          className="my-page-chat-history-item-icon"
                          aria-hidden="true"
                        >
                          AI
                        </span>

                        <span className="my-page-chat-history-summary">
                          <strong>
                            {history.question ||
                              "질문 내용이 없습니다."}
                          </strong>

                          <time dateTime={history.created_at}>
                            {formatChatHistoryDate(
                              history.created_at
                            )}
                          </time>
                        </span>

                        <span
                          className="my-page-chat-history-toggle"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </button>

                      <div className="my-page-chat-history-answer">
                        <div>
                          <section>
                            <span>QUESTION</span>

                            <p>
                              {history.question ||
                                "질문 내용이 없습니다."}
                            </p>
                          </section>

                          <section>
                            <span>ANSWER</span>

                            <p>
                              <FormattedChatText
                                text={history.answer}
                                fallback="저장된 답변이 없습니다."
                              />
                            </p>
                          </section>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedReservation && (
        <div
          className="my-page-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReservation(null);
            }
          }}
        >
          <section
            className="my-page-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-detail-title"
          >
            <header>
              <div>
                <p>CONSULTATION DETAIL</p>
                <h2 id="reservation-detail-title">
                  상담 신청 정보
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                aria-label="상세 창 닫기"
              >
                ×
              </button>
            </header>
            <dl>
              <div>
                <dt>상담 분야</dt>
                <dd>{getFieldLabel(selectedReservation.field)}</dd>
              </div>
              <div>
                <dt>일정</dt>
                <dd>
                  {formatReservationDate(selectedReservation)}
                </dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>
                  {getStatusLabel(selectedReservation.status)}
                </dd>
              </div>
              <div>
                <dt>예약 번호</dt>
                <dd>
                  {selectedReservation.reservation_id ||
                    selectedReservation.id ||
                    "-"}
                </dd>
              </div>
              {(selectedReservation.reject_reason ||
                selectedReservation.cancel_reason) && (
                <div>
                  <dt>처리 사유</dt>
                  <dd>
                    {selectedReservation.reject_reason ||
                      selectedReservation.cancel_reason}
                  </dd>
                </div>
              )}
            </dl>
            {selectedNote.initialRequest && (
              <section className="my-page-reservation-note">
                <strong>신청 시 추가 요청 사항</strong>
                <p>{selectedNote.initialRequest}</p>
              </section>
            )}
            {selectedNote.messages.length > 0 && (
              <section className="my-page-reservation-messages">
                <strong>최근 상담 메시지</strong>
                {selectedNote.messages.slice(-2).map((message, index) => (
                  <article key={`${message.created_at || index}-${index}`}>
                    <span>
                      {message.sender_name ||
                        (message.role === "admin" ? "관리자" : "고객")}
                    </span>
                    <p>{message.message || message.content || ""}</p>
                  </article>
                ))}
              </section>
            )}
            <Link to="/mypage/reservations">
              메시지 확인 및 답장
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
