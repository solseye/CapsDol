import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import "../../../App.css";
import "../../admin/admin.css";

import {
  cancelReservation,
  deleteReservation,
  getMyReservations,
} from "../../../api/reservationApi";

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
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const [reservations, setReservations] = useState([]);
  const [localCancelReasons, setLocalCancelReasons] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getMyReservations();

      setReservations(data.reservations || []);
    } catch (err) {
      setError(
        err.message || "예약 목록을 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    setIsLoggedIn(!!token);

    if (token) {
      fetchReservations();
    } else {
      setIsLoading(false);
      setError("로그인이 필요한 페이지입니다.");
    }
  }, []);

  const handleCancel = async (reservationId) => {
    const ok = window.confirm(
      "상담 예약을 취소하시겠습니까?"
    );

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
      setError(
        err.message || "상담 예약 취소에 실패했습니다."
      );
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    const ok = window.confirm(
      "이 상담 내역을 삭제하시겠습니까?"
    );

    if (!ok) return;

    try {
      setError("");
      setSuccess("");
      setDeleteLoadingId(reservationId);

      const data = await deleteReservation(reservationId);

      if (data.success) {
        setSuccess("상담 내역이 삭제되었습니다.");
      }

      await fetchReservations();
    } catch (err) {
      setError(
        err.message || "상담 내역 삭제에 실패했습니다."
      );
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const sortedReservations = [...reservations].sort(
    (a, b) => {
      const dateA = new Date(a.selected_date).getTime();
      const dateB = new Date(b.selected_date).getTime();

      if (dateB !== dateA) {
        return dateB - dateA;
      }

      return String(b.selected_time).localeCompare(
        String(a.selected_time)
      );
    }
  );

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <main className="reserve-page mypage mypage-reservations-page">
        <section className="reserve-hero">
          <p className="adm-eyebrow">Reservations</p>
          <h2>내 상담 내역</h2>
          <span>
            상담 예약 일정과 승인 상태를 확인합니다.
          </span>
        </section>

        <section className="adm-card reserve-history-card">
          <div className="adm-card-head">
            <div>
              <p className="adm-eyebrow">
                Reservation History
              </p>
              <h2>예약 정보</h2>
            </div>

            <Link to="/" className="adm-btn ghost">
              홈으로
            </Link>
          </div>

          {error && (
            <p className="login-error">{error}</p>
          )}

          {success && (
            <p className="login-success">{success}</p>
          )}

          {isLoading ? (
            <div className="reserve-empty-box">
              예약 정보를 불러오는 중입니다.
            </div>
          ) : sortedReservations.length === 0 ? (
            <div className="reserve-empty-box">
              아직 신청한 상담 예약이 없습니다.
            </div>
          ) : (
            <div className="reserve-list">
              {sortedReservations.map((item) => {
                const reservationId =
                  item.reservation_id;

                const statusLabel = getStatusLabel(
                  item.status
                );

                const fieldLabel = getFieldLabel(
                  item.field
                );

                const dateLabel = formatDate(
                  item.selected_date
                );

                const timeLabel = formatTime(
                  item.selected_time
                );

                const cancelAvailable = canCancel(
                  item.status
                );

                const cancelling =
                  cancelLoadingId === reservationId;

                const deleting =
                  deleteLoadingId === reservationId;

                const cancelReason =
                  item.cancel_reason ||
                  localCancelReasons[reservationId];

                return (
                  <article
                    className={`reserve-item reserve-status-${item.status}`}
                    key={reservationId}
                  >
                    <div>
                      <strong>
                        {fieldLabel} · {dateLabel} ·{" "}
                        {timeLabel}
                      </strong>

                      <small
                        className={`reservation-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        상태: {statusLabel}

                        {item.reject_reason && (
                          <>
                            <br />
                            불허 사유:{" "}
                            {item.reject_reason}
                          </>
                        )}

                        {cancelReason && (
                          <>
                            <br />
                            취소 사유: {cancelReason}
                          </>
                        )}
                      </small>
                    </div>

                    {cancelAvailable ? (
                      <button
                        type="button"
                        className="adm-btn ghost"
                        onClick={() =>
                          handleCancel(reservationId)
                        }
                        disabled={cancelling}
                      >
                        {cancelling
                          ? "취소 중..."
                          : "상담 취소"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="adm-btn danger"
                        onClick={() =>
                          handleDeleteReservation(
                            reservationId
                          )
                        }
                        disabled={deleting}
                      >
                        {deleting
                          ? "삭제 중..."
                          : "삭제"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
