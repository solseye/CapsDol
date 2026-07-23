import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import "../../styles/my-reservations-visily.css";
import {
  cancelReservation,
  deleteReservation,
  getMyReservations,
} from "../../api/reservationApi";

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getFullYear()}년 ${
    date.getMonth() + 1
  }월 ${date.getDate()}일`;
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

function getStatusClass(status) {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled") return "cancelled";

  return "pending";
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [localCancelReasons, setLocalCancelReasons] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    }
  }, []);

  const handleCancel = async (reservationId) => {
    const ok = window.confirm("상담 예약을 취소하시겠습니까?");
    if (!ok) return;

    const cancelReason = window.prompt(
      "취소 사유를 입력해 주세요. 선택 사항입니다.",
      ""
    );

    if (cancelReason === null) return;

    const trimmedReason = cancelReason.trim();

    try {
      setError("");
      setSuccess("");
      setCancelLoadingId(reservationId);

      const data = await cancelReservation(
        reservationId,
        trimmedReason || null
      );

      if (data.success) {
        setLocalCancelReasons((prev) => ({
          ...prev,
          [reservationId]: trimmedReason,
        }));

        await fetchReservations();

        setReservations((prev) =>
          prev.map((item) =>
            item.reservation_id === reservationId
              ? {
                  ...item,
                  status: "cancelled",
                  cancel_reason: trimmedReason,
                }
              : item
          )
        );

        setSuccess("상담 예약이 취소되었습니다.");
      }
    } catch (err) {
      setError(err.message || "상담 예약 취소에 실패했습니다.");
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    const ok = window.confirm("이 상담 내역을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      setError("");
      setSuccess("");

      const data = await deleteReservation(reservationId);

      if (data.success) {
        setSuccess("상담 내역이 삭제되었습니다.");
      }

      await fetchReservations();
    } catch (err) {
      setError(err.message || "상담 내역 삭제에 실패했습니다.");
    }
  };

  const sortedReservations = [...reservations].sort((a, b) => {
    const dateA = new Date(a.selected_date).getTime();
    const dateB = new Date(b.selected_date).getTime();

    if (dateB !== dateA) return dateB - dateA;

    return String(b.selected_time).localeCompare(
      String(a.selected_time)
    );
  });

  const statusCounts = sortedReservations.reduce(
    (acc, item) => {
      const status = item.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 }
  );

  return (
    <div className="mrv-page">
      <aside className="mrv-sidebar">
        <Link to="/" className="mrv-logo">
          <span>◎</span>
          <strong>WVA AI Consulting</strong>
          <small>Japan Entry OS</small>
        </Link>

        <nav className="mrv-side-nav">
          <Link to="/">Home</Link>
          <Link to="/hearing-sheet">Hearing Sheet</Link>
          <Link to="/articles-result">Articles</Link>
          <Link to="/reservation">Consultations</Link>
          <Link to="/myreservations" className="active">
            My Reservations
          </Link>
          <Link to="/chat">AI Chatbot</Link>
        </nav>
      </aside>

      <div className="mrv-shell">
        <header className="mrv-topbar">
          <div className="mrv-breadcrumb">
            <Link to="/">Dashboard</Link>
            <span>›</span>
            <strong>My Reservations</strong>
          </div>

          <Link to="/reservation" className="mrv-top-link">
            새 상담 예약
          </Link>
        </header>

        <main className="mrv-main">
          <section className="mrv-hero">
            <div>
              <p>Reservation Status</p>
              <h1>내 상담 내역</h1>
              <span>
                신청한 상담의 승인 여부, 취소 상태, 불허 사유를 한곳에서
                확인합니다.
              </span>
            </div>
          </section>

          <section className="mrv-metrics">
            <article>
              <span>전체 예약</span>
              <strong>{statusCounts.total}</strong>
            </article>
            <article>
              <span>승인 대기</span>
              <strong>{statusCounts.pending || 0}</strong>
            </article>
            <article>
              <span>승인 완료</span>
              <strong>{statusCounts.approved || 0}</strong>
            </article>
            <article>
              <span>취소/불허</span>
              <strong>
                {(statusCounts.cancelled || 0) + (statusCounts.rejected || 0)}
              </strong>
            </article>
          </section>

          <section className="mrv-panel">
            <div className="mrv-panel-head">
              <div>
                <span>Consultation Timeline</span>
                <h2>예약 정보</h2>
              </div>
              <Link to="/reservation">상담 예약하기</Link>
            </div>

            {error && <p className="mrv-error">{error}</p>}
            {success && <p className="mrv-success">{success}</p>}

            {isLoading ? (
              <div className="mrv-empty-box">예약 정보를 불러오는 중입니다.</div>
            ) : sortedReservations.length === 0 ? (
              <div className="mrv-empty-box">
                <strong>아직 신청한 상담 예약이 없습니다.</strong>
                <p>상담 예약을 신청하면 이곳에서 승인 상태를 확인할 수 있습니다.</p>
                <Link to="/reservation">상담 예약 시작</Link>
              </div>
            ) : (
              <div className="mrv-list">
                {sortedReservations.map((item) => {
                  const reservationId = item.reservation_id;

                  const statusLabel = getStatusLabel(item.status);

                  const fieldLabel = getFieldLabel(item.field);

                  const dateLabel = formatDate(item.selected_date);

                  const timeLabel = formatTime(item.selected_time);

                  const cancelAvailable = canCancel(item.status);

                  const cancelling = cancelLoadingId === reservationId;

                  const cancelReason =
                    item.cancel_reason || localCancelReasons[reservationId];

                  return (
                    <article className="mrv-item" key={reservationId}>
                      <div className="mrv-item-main">
                        <div className="mrv-date-box">
                          <span>{dateLabel}</span>
                          <strong>{timeLabel}</strong>
                        </div>

                        <div className="mrv-info">
                          <div className="mrv-title-row">
                            <h3>{fieldLabel} 상담</h3>
                            <span className={`mrv-status ${getStatusClass(item.status)}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <dl>
                            <div>
                              <dt>상담 분야</dt>
                              <dd>{fieldLabel}</dd>
                            </div>
                            <div>
                              <dt>예약 번호</dt>
                              <dd>#{reservationId}</dd>
                            </div>
                            <div>
                              <dt>신청일</dt>
                              <dd>{formatDate(item.requested_at)}</dd>
                            </div>
                          </dl>

                          {item.reject_reason && (
                            <p className="mrv-reason">불허 사유: {item.reject_reason}</p>
                          )}

                          {cancelReason && (
                            <p className="mrv-reason">취소 사유: {cancelReason}</p>
                          )}
                        </div>
                      </div>

                      <div className="mrv-actions">
                        {cancelAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleCancel(reservationId)}
                            disabled={cancelling}
                          >
                            {cancelling ? "취소 중..." : "상담 취소"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDeleteReservation(reservationId)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mrv-brand-card">
            <div>
              <span>W</span>
              <h2>WVA</h2>
              <p>상담 예약 상태와 전문가 검토 흐름을 이곳에서 확인할 수 있습니다.</p>
            </div>
            <Link to="/hearing-sheet">히어링 시트 작성</Link>
          </section>
        </main>
      </div>
    </div>
  );
}
