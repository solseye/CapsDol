import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import "../admin/admin.css";
import {
  cancelReservation,
  getMyReservations,
} from "../../api/reservationApi";

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
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

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
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
    fetchReservations();
  }, []);

  const handleCancel = async (reservationId) => {
    const ok = window.confirm("상담 예약을 취소하시겠습니까?");
    if (!ok) return;

    const cancelReason = window.prompt(
      "취소 사유를 입력해 주세요. 선택 사항입니다.",
      ""
    );

    try {
      setError("");
      setSuccess("");
      setCancelLoadingId(reservationId);

      const data = await cancelReservation(reservationId, cancelReason || "");

      if (data.success) {
        setSuccess("상담 예약이 취소되었습니다.");
        await fetchReservations();
      } else {
        setSuccess("상담 예약이 취소되었습니다.");
        await fetchReservations();
      }
    } catch (err) {
      setError(err.message || "상담 예약 취소에 실패했습니다.");
    } finally {
      setCancelLoadingId(null);
    }
  };

  return (
    <main className="reserve-page">
      <section className="reserve-hero">
        <p className="adm-eyebrow">My Reservations</p>
        <h2>내 상담 내역</h2>

      </section>

      <section className="adm-card reserve-history-card">
        <div className="adm-card-head">
          <div>
            <h2>예약 정보</h2>
          </div>

          <Link to="/" className="adm-btn ghost">
            홈으로
          </Link>
        </div>

        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">{success}</p>}

        {isLoading ? (
          <div className="reserve-empty-box">예약 정보를 불러오는 중입니다.</div>
        ) : reservations.length === 0 ? (
          <div className="reserve-empty-box">
            아직 신청한 상담 예약이 없습니다.
          </div>
        ) : (
          <div className="reserve-list">
            {reservations.map((item) => {
              const reservationId = item.reservation_id;
              const statusLabel = getStatusLabel(item.status);
              const fieldLabel = getFieldLabel(item.field);
              const dateLabel = formatDate(item.selected_date);
              const timeLabel = formatTime(item.selected_time);
              const isCancelAvailable = canCancel(item.status);
              const isCancelling = cancelLoadingId === reservationId;

              return (
                <article
                  className={`reserve-item reserve-status-${item.status}`}
                  key={reservationId}
                >
                  <div>
                    <strong>
                      {fieldLabel} · {timeLabel}
                    </strong>

                    <span>
                      {dateLabel} · 일정 ID {item.schedule_id}
                    </span>

                  <small>
                    상태: {statusLabel}

                    {item.reject_reason && (
                      <>
                        <br />
                        불허 사유: {item.reject_reason}
                      </>
                    )}

                    {item.cancel_reason && (
                      <>
                        <br />
                        취소 사유: {item.cancel_reason}
                      </>
                    )}
                  </small>
                  </div>

                  <button
                    type="button"
                    className="adm-btn ghost"
                    onClick={() => handleCancel(reservationId)}
                    disabled={!isCancelAvailable || isCancelling}
                  >
                    {isCancelling ? "취소 중..." : "상담 취소"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="adm-card reserve-brand-card">
        <div className="reserve-brand-empty">
          <span className="adm-brand-mark">W</span>
          <h2>WVA</h2>
          <p>예약 상태와 상담 일정을 이곳에서 확인할 수 있습니다.</p>
        </div>
      </section>
    </main>
  );
}