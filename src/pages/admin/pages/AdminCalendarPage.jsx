import { useMemo, useState } from "react";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
const todayKey = "2026-05-19";

// [기능 1, 2 연동] 백엔드 schedules 및 reservations 응답 구조 가상 데이터 매핑
const initialApplications = [
  {
    id: 1,
    name: "test1",
    phone: "010-1111-1111",
    email: "test1@gmail.com",
    company: "Test One Company",
    date: "2026-06-03",
    time: "10:00",
    type: "법률 상담",
    status: "승인 대기",
    memo: "계약 관련 상담 요청",
  },
  {
    id: 2,
    name: "test2",
    phone: "010-2222-2222",
    email: "test2@gmail.com",
    company: "Green Labs",
    date: "2026-06-03",
    time: "10:00",
    type: "법률 상담",
    status: "승인 완료",
    memo: "사업자 계약 검토 요청",
  },
  {
    id: 3,
    name: "test3",
    phone: "010-3333-3333",
    email: "test3@gmail.com",
    company: "Blue Works",
    date: "2026-06-18",
    time: "13:00",
    type: "회계 상담",
    status: "불허",
    memo: "세무 처리 문의",
  },
];

// [기능 1, 2 연동] 백엔드 admin_blocks 데이터 모델 가상 초기화
const initialBlocks = [
  {
    id: 1,
    date: "2026-06-12",
    time: "13:00",
    field: "회계",
    reason: "관리자 외부 일정",
  },
  {
    id: 2,
    date: "2026-07-14",
    time: "전체",
    field: "전체 분야",
    reason: "전체 상담 불가",
  },
];

// 달력 날짜 뷰 매트릭스 계산기
function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    days.push(date.toISOString().slice(0, 10));
  }
  while (days.length % 7 !== 0) {
    days.push(null);
  }
  return days;
}

export default function AdminCalendarPage() {
  const [viewDate, setViewDate] = useState(new Date(2026, 5, 1));
  const [selectedDate, setSelectedDate] = useState("2026-06-03");
  const [selectedApplication, setSelectedApplication] = useState(null);

  // 컴포넌트 핵심 Mock 상태 팩터
  const [applications, setApplications] = useState(initialApplications);
  const [blocks, setBlocks] = useState(initialBlocks);

  // 블락 컨트롤 제어용 인풋 상태 셋
  const [blockDate, setBlockDate] = useState("2026-06-12");
  const [blockTime, setBlockTime] = useState("10:00");
  const [blockField, setBlockField] = useState("법률");
  const [blockReason, setBlockReason] = useState("");

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  // [기능 1, 2] 날짜별 유저 신청서 딕셔너리 매핑 가속화
  const applicationsByDate = useMemo(() => {
    return applications.reduce((acc, item) => {
      acc[item.date] = [...(acc[item.date] || []), item];
      return acc;
    }, {});
  }, [applications]);

  // [기능 1, 2] 날짜별 관리자 차단 스케줄 딕셔너리 매핑 가속화
  const blocksByDate = useMemo(() => {
    return blocks.reduce((acc, item) => {
      acc[item.date] = [...(acc[item.date] || []), item];
      return acc;
    }, {});
  }, [blocks]);

  const selectedItems = applicationsByDate[selectedDate] || [];
  const selectedBlocks = blocksByDate[selectedDate] || [];

  // 3. POST /reserv/admin/block (관리자 개인 일정으로 예약 막기) UI 구현
  const handleAddBlock = () => {
    if (!blockDate) return;

    const mockNewBlock = {
      id: Date.now(),
      date: blockDate,
      time: blockTime,
      field: blockTime === "전체" ? "전체 분야" : blockField,
      reason: blockReason || "관리자 일정으로 상담 불가",
    };

    console.log(
      "백엔드 전송 데이터 양식 [기능 3 - POST /reserv/admin/block]:",
      {
        field: mockNewBlock.field === "전체 분야" ? null : mockNewBlock.field,
        selectedDate: `${mockNewBlock.date}T00:00:00.000Z`,
        selectedTime:
          mockNewBlock.time === "전체" ? "00:00" : mockNewBlock.time,
        reason: mockNewBlock.reason,
      },
    );

    setBlocks((prev) => [...prev, mockNewBlock]);
    setBlockReason("");
    setSelectedDate(blockDate);
    alert("선택한 타임 시퀀스에 차단(Block)이 선언되었습니다.");
  };

  // 4. POST /reserv/admin/unblock (막힌 예약 풀기) UI 구현
  const handleUnblock = (id) => {
    if (
      window.confirm(
        "지정된 블락 일정을 파기하고 일반 상담 접수가 가능하도록 전면 해제할까요?",
      )
    ) {
      console.log(
        "백엔드 파기 대상 blockId 인덱스 [기능 4 - POST /reserv/admin/unblock]:",
        id,
      );
      setBlocks((prev) => prev.filter((item) => item.id !== id));
      alert("해당 타임라인의 기 차단 조치가 해제되었습니다.");
    }
  };

  // 5. POST /reserv/admin/allow (관리자 상담 허락) UI 구현
  const handleAllowDecision = (id) => {
    if (
      window.confirm(
        "이 유저의 상담 신청서 심사를 최종 통과 및 확정(Allow) 처리할까요?",
      )
    ) {
      console.log(
        "백엔드 가결 승인 송신 데이터 [기능 5 - POST /reserv/admin/allow]:",
        [{ id: id, approved: true, reason: null }],
      );
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "승인 완료" } : app,
        ),
      );
      setSelectedApplication(null);
      alert("해당 유저의 예약이 확정 조치되었습니다.");
    }
  };

  // 6. POST /reserv/admin/disallow (관리자 상담 불허) UI 구현
  const handleDisallowDecision = (id) => {
    const rejectReason = prompt("반려 및 불허 사유를 상세 기술하세요:");
    if (rejectReason === null) return;

    if (
      window.confirm(
        "이 유저의 상담 일정을 최종 불허 및 거절(Disallow) 처리할까요?",
      )
    ) {
      console.log(
        "백엔드 반려 거절 송신 데이터 [기능 6 - POST /reserv/admin/disallow]:",
        [
          {
            id: id,
            approved: false,
            reason: rejectReason || "행정 판단 하 거절",
          },
        ],
      );
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: "불허" } : app)),
      );
      setSelectedApplication(null);
      alert("해당 신청서가 반려 처리되었습니다.");
    }
  };

  return (
    <div className="adm-page">
      {/* 타이틀 헤더 상단부 */}
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Reservations Control Tower</p>
          <h2>신청 기록 및 통합 행정 캘린더</h2>
          <span>
            예약 신청 관제, 허락 및 불허 조치, 시스템 일괄 일정 막기 정책을
            일원화하여 통제합니다.
          </span>
        </div>
      </div>

      {/* 💡 [기능 3] 신규 시스템 스케줄 차단 카드 박스 */}
      <section className="adm-card" style={{ marginBottom: "24px" }}>
        <div className="adm-card-head">
          <h2>신규 시스템 스케줄 차단 (Block 정책 설정)</h2>
        </div>
        <div
          className="reserve-admin-form"
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            padding: "4px 0",
          }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "13px",
              fontWeight: "bold",
              gap: "6px",
            }}
          >
            차단 일자
            <input
              type="date"
              style={{
                minHeight: "40px",
                border: "1px solid #dfe5ee",
                borderRadius: "10px",
                padding: "0 10px",
              }}
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "13px",
              fontWeight: "bold",
              gap: "6px",
            }}
          >
            차단 타임라인
            <select
              style={{
                minHeight: "40px",
                minWidth: "100px",
                border: "1px solid #dfe5ee",
                borderRadius: "10px",
                padding: "0 10px",
                background: "#fff",
              }}
              value={blockTime}
              onChange={(e) => setBlockTime(e.target.value)}
            >
              <option>10:00</option>
              <option>13:00</option>
              <option>15:00</option>
              <option>전체</option>
            </select>
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "13px",
              fontWeight: "bold",
              gap: "6px",
            }}
          >
            제한 전공 분야
            <select
              style={{
                minHeight: "40px",
                minWidth: "120px",
                border: "1px solid #dfe5ee",
                borderRadius: "10px",
                padding: "0 10px",
                background: "#fff",
              }}
              value={blockField}
              onChange={(e) => setBlockField(e.target.value)}
              disabled={blockTime === "전체"}
            >
              <option>법률</option>
              <option>회계</option>
              <option>소프트웨어</option>
              <option>전체</option>
            </select>
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              flex: "1",
              fontSize: "13px",
              fontWeight: "bold",
              gap: "6px",
            }}
          >
            공식 행정 사유 기입
            <input
              placeholder="차단 행정 사유 명시 (예: 내부 세미나)"
              style={{
                minHeight: "40px",
                border: "1px solid #dfe5ee",
                borderRadius: "10px",
                padding: "0 14px",
              }}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="adm-btn primary"
            style={{ alignSelf: "flex-end", height: "40px" }}
            onClick={handleAddBlock}
          >
            일정 막기 실행
          </button>
        </div>
      </section>

      {/* 💡 [기능 1, 2, 4] 메인 통합 캘린더 관제 섹션 */}
      <section className="adm-card">
        <div className="adm-card-head">
          <h2>월간 상담 신청 기록 관제 현황</h2>
          <div className="adm-calendar-nav">
            <button
              type="button"
              className="adm-btn ghost"
              style={{ minHeight: "32px", padding: "0 12px" }}
              onClick={() =>
                setViewDate(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                )
              }
            >
              이전
            </button>
            <strong style={{ margin: "0 8px" }}>
              {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
            </strong>
            <button
              type="button"
              className="adm-btn ghost"
              style={{ minHeight: "32px", padding: "0 12px" }}
              onClick={() =>
                setViewDate(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                )
              }
            >
              다음
            </button>
          </div>
        </div>

        <div className="adm-calendar-layout">
          {/* 달력 그리드 영역 */}
          <div className="adm-calendar">
            {weekDays.map((day) => (
              <div key={day} className="adm-weekday">
                {day}
              </div>
            ))}

            {calendarDays.map((date, index) => {
              if (!date) return <div key={index} className="adm-day empty" />;

              const itemCount = (applicationsByDate[date] || []).length;
              const blockCount = (blocksByDate[date] || []).length;
              const isPast = date < todayKey;

              return (
                <button
                  key={date}
                  type="button"
                  className={[
                    "adm-day",
                    selectedDate === date ? "selected" : "",
                    isPast ? "past" : "",
                    blockCount > 0 ? "blocked" : "",
                  ].join(" ")}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{Number(date.slice(8, 10))}</span>
                  {itemCount > 0 && <b>{itemCount}</b>}
                  {blockCount > 0 && <em>BLOCK</em>}
                </button>
              );
            })}
          </div>

          {/* 우측 실시간 정보 패널 상황실 */}
          <aside className="adm-side-panel">
            <div className="adm-side-panel-head">
              <h3>{selectedDate}</h3>
              <span style={{ fontSize: "13px" }}>
                신청{" "}
                <strong style={{ color: "#2563eb" }}>
                  {selectedItems.length}
                </strong>
                건 / 블락{" "}
                <strong style={{ color: "#dc2626" }}>
                  {selectedBlocks.length}
                </strong>
                건
              </span>
            </div>

            {/* [기능 4] 블락 일정 목록 및 해제 */}
            {selectedBlocks.length > 0 && (
              <div
                className="adm-block-list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {selectedBlocks.map((block) => (
                  <div
                    className="adm-block-item"
                    key={block.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fee2e2",
                      borderRadius: "10px",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#dc2626", fontSize: "14px" }}>
                        [{block.field}] {block.time}
                      </strong>
                      <small
                        style={{
                          display: "block",
                          marginTop: "2px",
                          color: "#657185",
                        }}
                      >
                        사유: {block.reason}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="adm-btn ghost"
                      style={{
                        minHeight: "30px",
                        padding: "0 10px",
                        fontSize: "12px",
                        background: "#fff",
                      }}
                      onClick={() => handleUnblock(block.id)}
                    >
                      해제
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedItems.length === 0 ? (
              <div
                className="adm-empty"
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#657185",
                }}
              >
                본 일자에는 인입된 예약 서류가 없습니다.
              </div>
            ) : (
              <div
                className="adm-application-list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {selectedItems.map((item) => (
                  <button
                    type="button"
                    className="adm-application-item"
                    key={item.id}
                    style={{
                      textAlign: "left",
                      width: "100%",
                      padding: "14px",
                      border: "1px solid #e6eaf0",
                      borderRadius: "12px",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedApplication(item)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <strong style={{ fontSize: "15px", color: "#172033" }}>
                        {item.name}{" "}
                        <small
                          style={{ fontWeight: "normal", color: "#657185" }}
                        >
                          ({item.company})
                        </small>
                      </strong>
                      <span
                        style={{
                          color:
                            item.status === "승인 완료"
                              ? "#27ae60"
                              : item.status === "불허"
                                ? "#dc2626"
                                : "#d97706",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        marginTop: "6px",
                        color: "#4b5563",
                      }}
                    >
                      {item.type} · {item.time}
                    </div>
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#657185",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.memo}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* 💡 [기능 5, 6] 심사 상세 모달창 팝업 */}
      {selectedApplication && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "9999",
          }}
        >
          <section
            className="adm-modal"
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="adm-modal-head"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "900" }}>
                신청 상세 정보
              </h3>
              <button
                type="button"
                className="adm-btn ghost"
                style={{ minHeight: "auto", padding: "4px 10px" }}
                onClick={() => setSelectedApplication(null)}
              >
                ✕
              </button>
            </div>

            <dl
              className="adm-detail-list"
              style={{
                margin: "0 0 24px 0",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                <dt
                  style={{
                    width: "100px",
                    fontWeight: "bold",
                    color: "#657185",
                  }}
                >
                  신청 고객명
                </dt>
                <dd style={{ margin: "0", color: "#172033" }}>
                  {selectedApplication.name}
                </dd>
              </div>
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                <dt
                  style={{
                    width: "100px",
                    fontWeight: "bold",
                    color: "#657185",
                  }}
                >
                  비즈니스 연락처
                </dt>
                <dd style={{ margin: "0", color: "#172033" }}>
                  {selectedApplication.phone}
                </dd>
              </div>
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                <dt
                  style={{
                    width: "100px",
                    fontWeight: "bold",
                    color: "#657185",
                  }}
                >
                  소속 기업
                </dt>
                <dd style={{ margin: "0", color: "#172033" }}>
                  {selectedApplication.company}
                </dd>
              </div>
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                <dt
                  style={{
                    width: "100px",
                    fontWeight: "bold",
                    color: "#657185",
                  }}
                >
                  전자 우편
                </dt>
                <dd style={{ margin: "0", color: "#172033" }}>
                  {selectedApplication.email}
                </dd>
              </div>
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                <dt
                  style={{
                    width: "100px",
                    fontWeight: "bold",
                    color: "#657185",
                  }}
                >
                  희망 일정
                </dt>
                <dd
                  style={{ margin: "0", fontWeight: "bold", color: "#172033" }}
                >
                  {selectedApplication.date} {selectedApplication.time}
                </dd>
              </div>
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                <dt
                  style={{
                    width: "100px",
                    fontWeight: "bold",
                    color: "#657185",
                  }}
                >
                  상담 전공
                </dt>
                <dd style={{ margin: "0", color: "#172033" }}>
                  {selectedApplication.type}
                </dd>
              </div>
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                <dt
                  style={{
                    width: "100px",
                    fontWeight: "bold",
                    color: "#657185",
                  }}
                >
                  행정 상태
                </dt>
                <dd
                  style={{
                    margin: "0",
                    fontWeight: "bold",
                    color:
                      selectedApplication.status === "승인 완료"
                        ? "#27ae60"
                        : selectedApplication.status === "불허"
                          ? "#dc2626"
                          : "#d97706",
                  }}
                >
                  {selectedApplication.status}
                </dd>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <dt style={{ fontWeight: "bold", color: "#657185" }}>
                  고객 메모 사유
                </dt>
                <dd
                  style={{
                    margin: "0",
                    color: "#172033",
                    background: "#f8fafc",
                    padding: "10px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.5",
                  }}
                >
                  {selectedApplication.memo}
                </dd>
              </div>
            </dl>

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
                borderTop: "1px solid #e6eaf0",
                paddingTop: "16px",
              }}
            >
              <button
                type="button"
                className="adm-btn ghost"
                onClick={() => setSelectedApplication(null)}
              >
                심사 보류
              </button>
              <button
                type="button"
                className="adm-btn danger"
                disabled={selectedApplication.status === "불허"}
                onClick={() => handleDisallowDecision(selectedApplication.id)}
              >
                불허 (Disallow)
              </button>
              <button
                type="button"
                className="adm-btn primary"
                disabled={selectedApplication.status === "승인 완료"}
                onClick={() => handleAllowDecision(selectedApplication.id)}
              >
                승인 허락 (Allow)
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
