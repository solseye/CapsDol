import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { getAdminUsers } from "../../../api/adminApi";
import {
  deleteClientFile,
  getClientFiles,
  getClientFileSignedUrl,
  uploadClientFile,
} from "../../../api/clientFileApi";
import {
  addReservationChat,
  getReservationAvailability,
  getUserReservations,
} from "../../../api/reservationApi";
import { parseReservationNote } from "../../../utils/reservationNoteUtils";

import "./UsersDetailPage.css";

function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
}

function formatDateOnly(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue).slice(0, 10);
  return date.toLocaleDateString("ko-KR");
}

function formatTime(timeValue) {
  return String(timeValue || "").slice(0, 5) || "-";
}

function getStatusLabel(status) {
  const labels = {
    pending: "\uB300\uAE30",
    approved: "\uC2B9\uC778",
    confirmed: "\uC2B9\uC778",
    rejected: "\uBD88\uD5C8",
    cancelled: "\uCDE8\uC18C",
    canceled: "\uCDE8\uC18C",
  };
  return labels[status] || status || "-";
}

function getReservationRanges(reservation) {
  return Array.isArray(reservation?.available_ranges)
    ? reservation.available_ranges
    : [];
}

function getReservationId(reservation) {
  return reservation?.reservation_id || reservation?.id;
}

function getFirstRangeLabel(reservation) {
  const firstRange = getReservationRanges(reservation)[0];
  if (!firstRange) return "시간 미정";
  return `${formatDateOnly(firstRange.date)} ${formatTime(firstRange.start_time)}-${formatTime(firstRange.end_time)}`;
}

function toDateKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue || "").slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(timeValue) {
  const [hour, minute] = String(timeValue || "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

function isTimeInsideRange(slotTime, range) {
  const slot = timeToMinutes(slotTime);
  return (
    slot >= timeToMinutes(range.start_time) &&
    slot < timeToMinutes(range.end_time)
  );
}

function getWeekDateKeys(reservation) {
  const firstRange = getReservationRanges(reservation)[0];
  const base = firstRange ? new Date(firstRange.date) : new Date();
  if (Number.isNaN(base.getTime())) return [];

  const start = new Date(base);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return toDateKey(date);
  });
}

function getTimeSlots() {
  return Array.from({ length: 18 }, (_, index) => {
    const hour = String(Math.floor(index / 2) + 9).padStart(2, "0");
    const minute = index % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
  });
}

export default function UsersDetailPage() {
  const { uuid: encodedUuid } = useParams();
  const location = useLocation();
  const uuid = useMemo(
    () =>
      decodeURIComponent(encodedUuid || "") ||
      location.state?.user?.uuid ||
      "",
    [encodedUuid, location.state],
  );
  const fileInputRef = useRef(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [isReservationsLoading, setIsReservationsLoading] = useState(true);
  const [clientFiles, setClientFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [availabilityBlocks, setAvailabilityBlocks] = useState([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const reservationChatListRef = useRef(null);

  const [previewLoadingPath, setPreviewLoadingPath] = useState(null);
  const [downloadLoadingPath, setDownloadLoadingPath] = useState(null);
  const [deleteLoadingPath, setDeleteLoadingPath] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedReservation = useMemo(
    () =>
      reservations.find(
        (reservation) =>
          String(getReservationId(reservation)) ===
          String(selectedReservationId),
      ) || null,
    [reservations, selectedReservationId],
  );

  const selectedNote = useMemo(
    () => parseReservationNote(selectedReservation?.note),
    [selectedReservation],
  );

  useEffect(() => {
    const chatList = reservationChatListRef.current;
    if (!chatList) return;

    chatList.scrollTop = chatList.scrollHeight;
  }, [selectedReservationId, selectedNote.messages.length]);

  const fetchSelectedUser = useCallback(async () => {
    if (!uuid) {
      setSelectedUser(null);
      setError("사용자 UUID가 없습니다.");
      setIsUserLoading(false);
      return;
    }

    try {
      setIsUserLoading(true);
      setError("");

      const limit = 100;
      let offset = 0;
      let matchedUser = null;
      let hasMore = true;

      while (hasMore && !matchedUser) {
        const data = await getAdminUsers({ limit, offset });
        const users = Array.isArray(data.users) ? data.users : [];

        matchedUser =
          users.find((user) => String(user.uuid) === String(uuid)) || null;

        const total = Number(data.total);
        offset += limit;
        hasMore = Number.isFinite(total) && total > 0
          ? offset < total
          : users.length === limit;
      }

      if (!matchedUser) throw new Error("해당 사용자 정보를 찾을 수 없습니다.");
      setSelectedUser(matchedUser);
    } catch (err) {
      setSelectedUser(null);
      setError(err.message || "사용자 정보를 불러오지 못했습니다.");
    } finally {
      setIsUserLoading(false);
    }
  }, [uuid]);

  const fetchUserReservations = useCallback(async () => {
    if (!uuid) {
      setReservations([]);
      setIsReservationsLoading(false);
      return;
    }

    try {
      setIsReservationsLoading(true);
      setError("");
      const data = await getUserReservations({ uuid, limit: 100, offset: 0 });
      const nextReservations = Array.isArray(data.reservations)
        ? data.reservations
        : [];
      setReservations(nextReservations);
      setSelectedReservationId((currentId) =>
        currentId &&
        nextReservations.some(
          (reservation) =>
            String(getReservationId(reservation)) === String(currentId),
        )
          ? currentId
          : null,
      );
    } catch (err) {
      setReservations([]);
      setError(err.message || "상담 신청 내역을 불러오지 못했습니다.");
    } finally {
      setIsReservationsLoading(false);
    }
  }, [uuid]);

  const fetchUserFiles = useCallback(async () => {
    if (!uuid) {
      setClientFiles([]);
      setError("사용자 UUID가 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await getClientFiles({
        bucket: "users",
        prefix: uuid,
        limit: 100,
        offset: 0,
      });

      const files = Array.isArray(data.files) ? data.files : [];
      setClientFiles(
        [...files].sort((a, b) => {
          const dateA = new Date(a.uploadedAt || a.updatedAt || 0).getTime();
          const dateB = new Date(b.uploadedAt || b.updatedAt || 0).getTime();
          return dateB - dateA;
        }),
      );
    } catch (err) {
      setClientFiles([]);
      setError(err.message || "사용자 파일 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchSelectedUser();
    fetchUserReservations();
    fetchUserFiles();
  }, [fetchSelectedUser, fetchUserReservations, fetchUserFiles]);

  useEffect(() => {
    if (!uuid || !selectedReservation) {
      setAvailabilityBlocks([]);
      return;
    }

    let ignore = false;
    const firstRange = getReservationRanges(selectedReservation)[0];

    async function fetchAvailability() {
      try {
        setIsAvailabilityLoading(true);
        const data = await getReservationAvailability({
          uuid,
          baseDate: firstRange ? toDateKey(firstRange.date) : undefined,
          previousMonthCount: 2,
          nextMonthCount: 4,
        });

        if (!ignore) {
          setAvailabilityBlocks(Array.isArray(data.blocks) ? data.blocks : []);
        }
      } catch (err) {
        if (!ignore) {
          setAvailabilityBlocks([]);
          setError(err.message || "예약 가능 시간표를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setIsAvailabilityLoading(false);
      }
    }

    fetchAvailability();

    return () => {
      ignore = true;
    };
  }, [uuid, selectedReservation]);

  const handleRefresh = async () => {
    setSuccess("");
    await Promise.all([
      fetchSelectedUser(),
      fetchUserReservations(),
      fetchUserFiles(),
    ]);
  };

  const handleSendChat = async (event) => {
    event.preventDefault();
    if (!selectedReservation) return;

    const message = chatMessage.trim();
    if (!message) return;

    try {
      setIsChatSending(true);
      setError("");
      setSuccess("");

      const data = await addReservationChat({
        reservationId: getReservationId(selectedReservation),
        message,
      });

      setReservations((current) =>
        current.map((reservation) =>
          String(getReservationId(reservation)) ===
          String(getReservationId(selectedReservation))
            ? { ...reservation, note: data.note || reservation.note }
            : reservation,
        ),
      );
      setChatMessage("");
      setSuccess("채팅 메시지가 등록되었습니다.");
    } catch (err) {
      setError(err.message || "채팅 메시지 등록에 실패했습니다.");
    } finally {
      setIsChatSending(false);
    }
  };

  const handleOpenUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !uuid) return;

    const fileName = window.prompt("파일명을 입력하세요.", file.name);
    if (fileName === null) return;

    const description = window.prompt("파일 설명을 입력하세요.", "관리자 업로드");
    if (description === null) return;

    try {
      setIsUploading(true);
      setError("");
      setSuccess("");

      await uploadClientFile({
        file,
        fileName: fileName.trim() || file.name,
        description: description.trim() || "관리자 업로드",
        bucket: "users",
        uuid,
      });

      setSuccess("파일이 업로드되었습니다.");
      await fetchUserFiles();
    } catch (err) {
      setError(err.message || "파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewFile = async (file) => {
    const path = file.storagePath || file.path || "";
    if (!path) {
      setError("미리보기할 파일 경로를 찾을 수 없습니다.");
      return;
    }

    const previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      setError("팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.");
      return;
    }

    previewWindow.document.title = "파일 미리보기";
    previewWindow.document.body.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; font-family: sans-serif; color: #555;">
        파일을 불러오는 중입니다...
      </div>
    `;

    try {
      setError("");
      setSuccess("");
      setPreviewLoadingPath(path);

      const data = await getClientFileSignedUrl({
        bucket: file.bucket || "users",
        path,
        expiresIn: 600,
        download: false,
      });

      if (!data.signedUrl) throw new Error("미리보기 URL을 받지 못했습니다.");

      previewWindow.opener = null;
      previewWindow.location.replace(data.signedUrl);
    } catch (err) {
      previewWindow.close();
      setError(err.message || "파일 미리보기에 실패했습니다.");
    } finally {
      setPreviewLoadingPath(null);
    }
  };

  const handleDownloadFile = async (file) => {
    const path = file.storagePath || file.path || "";
    if (!path) {
      setError("다운로드할 파일 경로를 찾을 수 없습니다.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setDownloadLoadingPath(path);

      const data = await getClientFileSignedUrl({
        bucket: file.bucket || "users",
        path,
        expiresIn: 600,
        download: true,
      });

      if (!data.signedUrl) throw new Error("다운로드 URL을 받지 못했습니다.");

      const response = await fetch(data.signedUrl);
      if (!response.ok) throw new Error("파일 데이터를 불러오지 못했습니다.");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download =
        data.downloadName || file.originalName || file.fileName || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message || "파일 다운로드에 실패했습니다.");
    } finally {
      setDownloadLoadingPath(null);
    }
  };

  const handleDeleteFile = async (file) => {
    const path = file.storagePath || file.path || "";
    if (!path) {
      setError("삭제할 파일 경로를 찾을 수 없습니다.");
      return;
    }

    const displayName = file.fileName || file.originalName || "파일";
    const ok = window.confirm(
      `"${displayName}"을 삭제하시겠습니까?\n\n관리자가 삭제하면 사용자의 마이페이지에서도 제거됩니다.`,
    );
    if (!ok) return;

    try {
      setError("");
      setSuccess("");
      setDeleteLoadingPath(path);

      const data = await deleteClientFile({
        bucket: file.bucket || "users",
        path,
      });
      if (!data.success)
        throw new Error(data.message || "파일 삭제에 실패했습니다.");

      setClientFiles((prev) =>
        prev.filter((item) => (item.storagePath || item.path || "") !== path),
      );
      setSuccess("사용자 파일을 삭제했습니다.");
    } catch (err) {
      setError(err.message || "파일 삭제에 실패했습니다.");
    } finally {
      setDeleteLoadingPath(null);
    }
  };

  const modalWeekDates = selectedReservation
    ? getWeekDateKeys(selectedReservation)
    : [];
  const timeSlots = getTimeSlots();
  const selectedRanges = getReservationRanges(selectedReservation);

  const getSlotState = (dateKey, slotTime) => {
    const isAvailable = selectedRanges.some(
      (range) =>
        toDateKey(range.date) === dateKey && isTimeInsideRange(slotTime, range),
    );
    const block = availabilityBlocks.find((item) => {
      const blockDate = toDateKey(item.unavailable_date || item.blocked_date);
      const startTime = String(item.start_time || item.blocked_time || "").slice(
        0,
        5,
      );
      const endTime = String(item.end_time || "").slice(0, 5) || "23:59";

      return (
        blockDate === dateKey &&
        slotTime >= startTime &&
        slotTime < endTime &&
        !item.isMine
      );
    });

    if (block) return block.type === "manual_block" ? "blocked" : "booked";
    if (isAvailable) return "available";
    return "empty";
  };

  return (
    <main className="adm-main admin-user-detail-page">
      <section className="page-header">
        <h1 className="page-title">사용자 정보 조회</h1>
        <Link to="/admin/users" className="adm-btn-back">
          사용자 목록으로
        </Link>
      </section>

      {error && <p className="login-error text-danger">{error}</p>}
      {success && <p className="login-success text-primary">{success}</p>}

      <section className="adm-card info-card mb-2">
        <h2 className="file-list-title">사용자 정보</h2>
        {isUserLoading ? (
          <p>사용자 정보를 불러오는 중입니다...</p>
        ) : selectedUser ? (
          <div className="info-card-content">
            <div className="info-row">
              <span className="info-label">이름</span>
              <span>{selectedUser.username || "-"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">이메일</span>
              <span>{selectedUser.email || "-"}</span>
            </div>
          </div>
        ) : (
          <p>사용자를 찾을 수 없습니다.</p>
        )}
      </section>

      <section className="adm-card reservation-card mb-2">
        <div className="file-list-header">
          <div>
            <h2 className="file-list-title">상담 신청 내역</h2>
            <p className="file-count">총 {reservations.length}건의 신청 내역</p>
          </div>
        </div>

        {isReservationsLoading ? (
          <div className="reserve-empty-box text-center p-2 border">
            상담 신청 내역을 불러오는 중입니다...
          </div>
        ) : reservations.length === 0 ? (
          <div className="reserve-empty-box text-center p-2 border">
            상담 신청 내역이 없습니다.
          </div>
        ) : (
          <div className="reservation-list compact">
            {reservations.map((reservation) => {
              const reservationId = getReservationId(reservation);

              return (
                <button
                  type="button"
                  className="reservation-item summary"
                  key={reservationId}
                  onClick={() => setSelectedReservationId(reservationId)}
                ><span className={"reservation-summary-status " + (reservation.status || "")}>
                    {getStatusLabel(reservation.status)}
                  </span>
                  <strong>{reservation.c_name || "회사명 없음"}</strong>
                  <span>{reservation.field || "분야 미지정"}</span>
                  <span>{getFirstRangeLabel(reservation)}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedReservation && (
        <div className="reservation-modal-overlay">
          <section className="reservation-modal">
            <div className="reservation-modal-header">
              <div>
                <h2>상담 예약 상세</h2>
                <p>{selectedReservation.c_name || "회사명 없음"} ? {selectedReservation.field || "분야 미지정"}</p>
              </div>
              <button
                type="button"
                className="reservation-modal-close"
                onClick={() => setSelectedReservationId(null)}
                aria-label="상담 예약 상세 닫기"
              >
                x
              </button>
            </div>

            <div className="reservation-modal-grid">
              <div className="reservation-week-board">
                <div className="reservation-week-title">
                  <strong>주간 시간표</strong>
                  <span>파란색 가능 ? 빨간색 차단 ? 초록색 확정</span>
                </div>

                {isAvailabilityLoading ? (
                  <div className="reserve-empty-box text-center p-2 border">
                    시간표를 불러오는 중입니다...
                  </div>
                ) : modalWeekDates.length === 0 ? (
                  <div className="reserve-empty-box text-center p-2 border">
                    선택한 예약의 가능 시간이 없습니다.
                  </div>
                ) : (
                  <div className="reservation-week-grid">
                    <div className="reservation-week-corner" />
                    {modalWeekDates.map((dateKey) => (
                      <div className="reservation-week-day" key={dateKey}>
                        {dateKey}
                      </div>
                    ))}
                    {timeSlots.map((slotTime) => (
                      <Fragment key={slotTime}>
                        <div className="reservation-week-time">{slotTime}</div>
                        {modalWeekDates.map((dateKey) => {
                          const slotState = getSlotState(dateKey, slotTime);
                          return (
                            <div
                              className={"reservation-week-slot " + slotState}
                              key={dateKey + "-" + slotTime}
                              title={dateKey + " " + slotTime}
                            />
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                )}
              </div>

              <aside className="reservation-modal-side">
                <div className="selected-reservation-info">
                  <h3>예약 상세 정보</h3>
                  <div className="detail-row"><span>회사 이름</span><strong>{selectedReservation.c_name || "-"}</strong></div>
                  <div className="detail-row"><span>분야</span><strong>{selectedReservation.field || "-"}</strong></div>
                  <div className="detail-row"><span>상담 유형</span><strong>{selectedReservation.kind || "-"}</strong></div>
                  <div className="detail-row"><span>상태</span><strong>{getStatusLabel(selectedReservation.status)}</strong></div>
                  <div className="detail-row"><span>연락처</span><strong>{selectedReservation.phone || "-"}</strong></div>
                  <div className="detail-row"><span>신청 시간</span><strong>{formatDateTime(selectedReservation.requested_at)}</strong></div>
                  <div className="detail-ranges">
                    {selectedRanges.map((range) => (
                      <span className="reservation-range-chip" key={range.id}>
                        {formatDateOnly(range.date)} {formatTime(range.start_time)}-{formatTime(range.end_time)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="reservation-chat-panel">
                  <h3>상담 메모 및 채팅</h3>
                  {selectedNote.initialRequest && (
                    <div className="reservation-initial-request">
                      <strong>고객 추가 요청 사항</strong>
                      <p>{selectedNote.initialRequest}</p>
                    </div>
                  )}
                  <div
                    className="reservation-chat-list"
                    ref={reservationChatListRef}
                  >
                    {selectedNote.messages.length > 0 ? (
                      selectedNote.messages.map((message, index) => (
                        <div
                          className={`reservation-chat-message ${
                            message.role || ""
                          } ${
                            message.role === "admin" ? "is-own" : "is-other"
                          }`}
                          key={(message.created_at || index) + "-" + index}
                        >
                          <strong>{message.sender_name || message.role || "작성자"}</strong>
                          <p>{message.message || message.content || ""}</p>
                        </div>
                      ))
                    ) : (
                      <p className="reservation-chat-empty">등록된 채팅이 없습니다.</p>
                    )}
                  </div>

                  <form className="reservation-chat-form" onSubmit={handleSendChat}>
                    <input
                      value={chatMessage}
                      onChange={(event) => setChatMessage(event.target.value)}
                      placeholder="메시지를 입력하세요"
                      disabled={isChatSending}
                    />
                    <button type="submit" className="adm-btn primary" disabled={isChatSending || !chatMessage.trim()}>
                      {isChatSending ? "전송 중..." : "전송"}
                    </button>
                  </form>
                </div>
              </aside>
            </div>
          </section>
        </div>
      )}


      <section className="adm-card">
        <div className="file-list-header">
          <div>
            <h2 className="file-list-title">업로드 파일 목록</h2>
            <p className="file-count">
              총 {clientFiles.length}개의 파일이 업로드되었습니다.
            </p>
          </div>

          <div className="file-header-actions">
            <input
              ref={fileInputRef}
              className="hidden-file-input"
              type="file"
              onChange={handleUploadFile}
            />
            <button
              type="button"
              className="adm-btn primary"
              onClick={handleOpenUpload}
              disabled={isUploading || isLoading || isUserLoading}
            >
              {isUploading ? "업로드 중..." : "파일 업로드"}
            </button>
            <button
              type="button"
              className="adm-btn ghost"
              onClick={handleRefresh}
              disabled={
                isLoading ||
                isUserLoading ||
                isReservationsLoading ||
                isUploading
              }
            >
              {isLoading || isUserLoading || isReservationsLoading
                ? "조회 중..."
                : "새로고침"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="reserve-empty-box text-center p-2 border">
            파일을 불러오는 중입니다...
          </div>
        ) : clientFiles.length === 0 ? (
          <div className="reserve-empty-box text-center p-2 border">
            업로드한 파일이 없습니다.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="file-table">
              <thead>
                <tr>
                  <th>파일명</th>
                  <th>용량</th>
                  <th>업로드 시간</th>
                  <th>설명</th>
                  <th className="text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {clientFiles.map((file) => {
                  const path = file.storagePath || file.path || "";
                  const displayName =
                    file.fileName || file.originalName || "이름 없는 파일";
                  const isBusy =
                    previewLoadingPath === path ||
                    downloadLoadingPath === path ||
                    deleteLoadingPath === path;

                  return (
                    <tr key={file.id || path}>
                      <td>{displayName}</td>
                      <td>{formatFileSize(file.size)}</td>
                      <td>
                        {formatDateTime(file.uploadedAt || file.updatedAt)}
                      </td>
                      <td>{file.description || "-"}</td>
                      <td className="action-cell">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => handlePreviewFile(file)}
                          disabled={isBusy}
                          title="미리보기"
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => handleDownloadFile(file)}
                          disabled={isBusy}
                          title="다운로드"
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          onClick={() => handleDeleteFile(file)}
                          disabled={isBusy}
                          title="삭제"
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
