import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../../App.css";
import "../../../styles/my-reservations-visily.css";
import "../../../styles/mypage-transition.css";

import {
  addReservationChat,
  cancelReservation,
  deleteReservation,
  getMyReservations,
} from "../../../api/reservationApi";
import {
  createLocalReservationNote,
  parseReservationNote,
} from "../../../utils/reservationNoteUtils";
import { confirmAction } from "../../../utils/notifications";

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatDateTime(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(timeString) {
  if (!timeString) return "-";

  return String(timeString).slice(0, 5);
}

function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "승인 대기";
    case "approved":
      return "승인 완료";
    case "rejected":
      return "불허";
    case "cancelled":
      return "취소 완료";
    default:
      return status || "-";
  }
}

function getFieldLabel(field) {
  switch (field) {
    case "law":
    case "법무":
      return "법무";
    case "accounting":
    case "회계":
      return "회계";
    case "hr":
    case "인사":
      return "인사";
    case "labor":
    case "노무":
      return "노무";
    default:
      return field || "-";
  }
}

function canCancel(status) {
  return status === "pending" || status === "approved";
}

function canDelete(status) {
  return status === "cancelled" || status === "rejected";
}

function isUpcoming(item) {
  const selectedDate = new Date(item.selected_date);

  if (Number.isNaN(selectedDate.getTime())) return false;

  const timeParts = String(item.selected_time || "00:00")
    .split(":")
    .map(Number);

  selectedDate.setHours(timeParts[0] || 0, timeParts[1] || 0, 0, 0);

  return selectedDate.getTime() >= Date.now();
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [localCancelReasons, setLocalCancelReasons] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const reservationChatListRef = useRef(null);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getMyReservations();

      setReservations(data.reservations || []);
    } catch (err) {
      setError(err.message || "예약 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      fetchReservations();
    } else {
      setIsLoading(false);
      setError("로그인이 필요한 페이지입니다.");
    }
  }, []);

  useEffect(() => {
    if (!selectedReservation) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedReservation(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedReservation]);

  useEffect(() => {
    setChatMessage("");
  }, [selectedReservation?.reservation_id]);

  const selectedNote = useMemo(
    () => parseReservationNote(selectedReservation?.note),
    [selectedReservation],
  );

  useEffect(() => {
    const chatList = reservationChatListRef.current;
    if (!chatList) return;

    chatList.scrollTop = chatList.scrollHeight;
  }, [selectedReservation?.reservation_id, selectedNote.messages.length]);

  const handleSendChat = async (event) => {
    event.preventDefault();
    if (!selectedReservation) return;

    const message = chatMessage.trim();
    if (!message) return;

    const reservationId = selectedReservation.reservation_id;

    try {
      setIsChatSending(true);
      setError("");
      setSuccess("");

      const data = await addReservationChat({
        reservationId,
        message,
      });
      const fallbackMessage = {
        role: "user",
        sender_name: "나",
        message,
        created_at: new Date().toISOString(),
      };
      const nextNote =
        data.note ||
        data.reservation?.note ||
        createLocalReservationNote(selectedNote.initialRequest, [
          ...selectedNote.messages,
          fallbackMessage,
        ]);

      setReservations((current) =>
        current.map((reservation) =>
          String(reservation.reservation_id) === String(reservationId)
            ? { ...reservation, note: nextNote }
            : reservation,
        ),
      );
      setSelectedReservation((current) =>
        current ? { ...current, note: nextNote } : current,
      );
      setChatMessage("");
      setSuccess("메시지가 등록되었습니다.");
    } catch (err) {
      setError(err.message || "메시지 등록에 실패했습니다.");
    } finally {
      setIsChatSending(false);
    }
  };

  const handleCancel = async (reservationId) => {
    const ok = await confirmAction({
      title: "상담 예약을 취소할까요?",
      message: "취소한 일정은 다시 승인받아야 합니다.",
      confirmLabel: "예약 취소",
      tone: "danger",
    });

    if (!ok) return;

    const cancelReason = window.prompt(
      "취소 사유를 입력해 주세요. 선택 사항입니다.",
      "",
    );

    if (cancelReason === null) return;

    const trimmedReason = cancelReason.trim();

    try {
      setError("");
      setSuccess("");
      setCancelLoadingId(reservationId);

      const data = await cancelReservation({
        reservationId,
        cancelReason: trimmedReason,
      });

      if (data.success) {
        setLocalCancelReasons((prev) => ({
          ...prev,
          [reservationId]: trimmedReason,
        }));

        await fetchReservations();
        setSelectedReservation(null);
        setSuccess("상담 예약이 취소되었습니다.");
      }
    } catch (err) {
      setError(err.message || "상담 예약 취소에 실패했습니다.");
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    const ok = await confirmAction({
      title: "상담 내역을 삭제할까요?",
      message:
        "상담 메시지를 포함한 내역이 목록에서 제거되며 복구할 수 없습니다.",
      confirmLabel: "내역 삭제",
      tone: "danger",
    });

    if (!ok) return;

    try {
      setError("");
      setSuccess("");
      setDeleteLoadingId(reservationId);

      const data = await deleteReservation({ reservationId });

      if (data.success) {
        setSuccess("상담 내역이 삭제되었습니다.");
      }

      await fetchReservations();
      setSelectedReservation(null);
    } catch (err) {
      setError(err.message || "상담 내역 삭제에 실패했습니다.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const sortedReservations = useMemo(
    () =>
      [...reservations].sort((a, b) => {
        const dateA = new Date(a.selected_date).getTime();
        const dateB = new Date(b.selected_date).getTime();

        if (dateB !== dateA) return dateB - dateA;

        return String(b.selected_time).localeCompare(String(a.selected_time));
      }),
    [reservations],
  );

  const filteredReservations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return sortedReservations.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        getFieldLabel(item.field).toLowerCase().includes(normalizedSearch) ||
        formatDate(item.selected_date).includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const upcoming = isUpcoming(item);
      const matchesPeriod =
        periodFilter === "all" ||
        (periodFilter === "upcoming" && upcoming) ||
        (periodFilter === "past" && !upcoming);

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [periodFilter, searchTerm, sortedReservations, statusFilter]);

  const approvedCount = reservations.filter(
    (item) => item.status === "approved",
  ).length;
  const pendingCount = reservations.filter(
    (item) => item.status === "pending",
  ).length;
  const upcomingCount = reservations.filter(
    (item) => isUpcoming(item) && canCancel(item.status),
  ).length;

  return (
    <>
      <main className="my-reservations-page mypage-page-enter">
        <div className="my-reservations-shell">
          <header className="my-reservations-heading">
            <p>CONSULTATION HISTORY</p>
            <div>
              <h1>내 상담 내역</h1>
              <Link to="/mypage">마이페이지로</Link>
            </div>
            <span>신청한 상담의 일정과 승인 상태를 확인하고 관리합니다.</span>
          </header>

          <section
            className="my-reservations-summary"
            aria-label="상담 예약 요약"
          >
            <article>
              <span>전체 상담</span>
              <strong>{reservations.length}</strong>
            </article>
            <article>
              <span>예정 상담</span>
              <strong>{upcomingCount}</strong>
            </article>
            <article>
              <span>승인 대기</span>
              <strong>{pendingCount}</strong>
            </article>
            <article>
              <span>승인 완료</span>
              <strong>{approvedCount}</strong>
            </article>
          </section>

          <section className="my-reservations-panel">
            <div className="my-reservations-panel-head">
              <div>
                <p>RESERVATIONS</p>
                <h2>상담 목록</h2>
              </div>
              <Link to="/reservation" className="my-reservations-primary">
                새 상담 예약
              </Link>
            </div>

            <div className="my-reservations-filters">
              <label>
                <span>상담 검색</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="분야 또는 날짜 검색"
                />
              </label>
              <label>
                <span>기간</span>
                <select
                  value={periodFilter}
                  onChange={(event) => setPeriodFilter(event.target.value)}
                >
                  <option value="all">전체 기간</option>
                  <option value="upcoming">예정 상담</option>
                  <option value="past">지난 상담</option>
                </select>
              </label>
              <label>
                <span>상태</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">전체 상태</option>
                  <option value="pending">승인 대기</option>
                  <option value="approved">승인 완료</option>
                  <option value="rejected">불허</option>
                  <option value="cancelled">취소 완료</option>
                </select>
              </label>
            </div>

            {error && <p className="my-reservations-alert error">{error}</p>}
            {success && (
              <p className="my-reservations-alert success">{success}</p>
            )}

            {isLoading ? (
              <div className="my-reservations-empty">
                예약 정보를 불러오는 중입니다.
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="my-reservations-empty">
                <strong>
                  {reservations.length === 0
                    ? "아직 신청한 상담이 없습니다."
                    : "조건에 맞는 상담이 없습니다."}
                </strong>
                <span>검색 조건을 바꾸거나 새로운 상담을 예약해 주세요.</span>
              </div>
            ) : (
              <div className="my-reservations-list">
                {filteredReservations.map((item) => {
                  const reservationId = item.reservation_id;
                  const cancelling = cancelLoadingId === reservationId;
                  const deleting = deleteLoadingId === reservationId;
                  const cancelReason =
                    item.cancel_reason || localCancelReasons[reservationId];

                  return (
                    <article
                      className="my-reservation-item"
                      key={reservationId}
                    >
                      <div className="my-reservation-date">
                        <span>{formatDate(item.selected_date)}</span>
                        <strong>{formatTime(item.selected_time)}</strong>
                      </div>

                      <div className="my-reservation-info">
                        <div>
                          <h3>{getFieldLabel(item.field)} 상담</h3>
                          <span
                            className={`status ${item.status || "pending"}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                        <p>
                          예약 번호 #{reservationId}
                          {item.requested_at
                            ? ` · ${formatDate(item.requested_at)} 신청`
                            : ""}
                        </p>
                        {(item.reject_reason || cancelReason) && (
                          <small>
                            {item.reject_reason
                              ? `불허 사유: ${item.reject_reason}`
                              : `취소 사유: ${cancelReason}`}
                          </small>
                        )}
                      </div>

                      <div className="my-reservation-actions">
                        <button
                          type="button"
                          onClick={() => setSelectedReservation(item)}
                        >
                          상세보기
                        </button>
                        {canCancel(item.status) ? (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => handleCancel(reservationId)}
                            disabled={cancelling}
                          >
                            {cancelling ? "취소 중..." : "상담 취소"}
                          </button>
                        ) : canDelete(item.status) ? (
                          <button
                            type="button"
                            className="text-danger"
                            onClick={() =>
                              handleDeleteReservation(reservationId)
                            }
                            disabled={deleting}
                          >
                            {deleting ? "삭제 중..." : "내역 삭제"}
                          </button>
                        ) : null}
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
          className="my-reservation-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReservation(null);
            }
          }}
        >
          <section
            className="my-reservation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-detail-title"
          >
            <div className="my-reservation-modal-head">
              <div>
                <p>RESERVATION DETAIL</p>
                <h2 id="reservation-detail-title">상담 상세 정보</h2>
              </div>
              <button
                type="button"
                aria-label="상세 정보 닫기"
                onClick={() => setSelectedReservation(null)}
              >
                ×
              </button>
            </div>

            <dl>
              <div>
                <dt>상담 분야</dt>
                <dd>{getFieldLabel(selectedReservation.field)}</dd>
              </div>
              <div>
                <dt>상담 일시</dt>
                <dd>
                  {formatDate(selectedReservation.available_ranges[0].date)}{" "}
                  {formatTime(
                    selectedReservation.available_ranges[0].start_time,
                  )}{" "}
                  ~{" "}
                  {formatTime(selectedReservation.available_ranges[0].end_time)}
                </dd>
              </div>
              <div>
                <dt>예약 상태</dt>
                <dd>{getStatusLabel(selectedReservation.status)}</dd>
              </div>
              <div>
                <dt>신청 일시</dt>
                <dd>{formatDateTime(selectedReservation.requested_at)}</dd>
              </div>
              <div>
                <dt>승인 일시</dt>
                <dd>{formatDateTime(selectedReservation.decided_at)}</dd>
              </div>
              <div>
                <dt>상담 번호</dt>
                <dd>#{selectedReservation.reservation_id}</dd>
              </div>
            </dl>

            {selectedNote.initialRequest && (
              <section className="my-reservation-request">
                <strong>신청 시 추가 요청 사항</strong>
                <p>{selectedNote.initialRequest}</p>
              </section>
            )}

            {(selectedReservation.reject_reason ||
              selectedReservation.cancel_reason ||
              localCancelReasons[selectedReservation.reservation_id]) && (
              <div className="my-reservation-modal-reason">
                <strong>처리 사유</strong>
                <p>
                  {selectedReservation.reject_reason ||
                    selectedReservation.cancel_reason ||
                    localCancelReasons[selectedReservation.reservation_id]}
                </p>
              </div>
            )}

            <section className="my-reservation-chat" aria-label="상담 메시지">
              <div className="my-reservation-chat-head">
                <strong>상담 메시지</strong>
                <span>*주의: 상담에 필요한 내용만 문의해주시길 바랍니다.</span>
              </div>
              <div
                className="my-reservation-chat-list"
                aria-live="polite"
                ref={reservationChatListRef}
              >
                {selectedNote.messages.length > 0 ? (
                  selectedNote.messages.map((message, index) => (
                    <article
                      className={`my-reservation-chat-message ${
                        message.role || ""
                      } ${message.role === "admin" ? "is-other" : "is-own"}`}
                      key={`${message.created_at || index}-${index}`}
                    >
                      <strong>
                        {message.sender_name ||
                          (message.role === "admin" ? "관리자" : "고객")}
                      </strong>
                      <p>{message.message || message.content || ""}</p>
                    </article>
                  ))
                ) : (
                  <p className="my-reservation-chat-empty">
                    아직 등록된 메시지가 없습니다.
                  </p>
                )}
              </div>
              <form
                className="my-reservation-chat-form"
                onSubmit={handleSendChat}
              >
                <input
                  value={chatMessage}
                  onChange={(event) => setChatMessage(event.target.value)}
                  placeholder="관리자에게 전달할 메시지를 입력하세요"
                  disabled={isChatSending}
                />
                <button
                  type="submit"
                  disabled={isChatSending || !chatMessage.trim()}
                >
                  {isChatSending ? "전송 중..." : "전송"}
                </button>
              </form>
            </section>

            <div className="my-reservation-modal-actions">
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
              >
                확인
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
