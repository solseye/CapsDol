import { useState, useEffect } from "react";
import "../admin.css"; // 한 단계 위(src/pages/admin/admin.css) 경로 설정 및 동기화 완료

export default function AdminReservations() {
  // [기능 6, 7 연동] 관리자 실시간 예약 신청 및 스케줄 상태 팩터
  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null); // 실시간 유저 서류 상세 보기 상태

  useEffect(() => {
    // 가상 데이터 세팅 - 백엔드 명세서 규격 구조(schedules 배열 내 reservations 배치 포맷)
    setSchedules([
      {
        schedule_id: 101,
        field: "law",
        selected_date: "2026-11-09",
        selected_time: "10:00:00",
        reservations: [
          {
            reservation_id: 1,
            username: "test1",
            email: "hjkim041113@gmail.com",
            CName: "Test One Company",
            phone: "010-1111-1111",
            kind: "software",
            status: "pending",
          },
        ],
      },
    ]);

    setBlocks([
      {
        id: 50,
        field: "accounting",
        blocked_date: "2026-11-11",
        blocked_time: "13:00:00",
        reason: "admin test block",
      },
    ]);
  }, []);

  // [기능 8] 관리자 개인 일정으로 예약 막기 (Block)
  const handleBlockTime = () => {
    const field = prompt(
      "막을 상담 분야를 입력하세요 (insa, labor, accounting, law 또는 전체 차단은 빈칸):",
    );
    const selectedDate = prompt("막을 날짜를 입력하세요 (YYYY-MM-DD):");
    const selectedTime = prompt("막을 시간을 입력하세요 (HH:MM):");
    const reason = prompt("막는 사유를 입력하세요:");

    if (!selectedDate || !selectedTime)
      return alert("날짜와 시간은 필수 항목입니다.");

    const blockData = {
      field: field ? field.trim() : null,
      selectedDate: `${selectedDate}T00:00:00.000Z`,
      selectedTime: selectedTime.trim(),
      reason: reason || "관리자 사정으로 인한 블락",
    };

    console.log(
      "POST /reserv/admin/block 송신 양식 데이터 [기능 8]:",
      blockData,
    );
    alert("지정된 일정이 성공적으로 차단 처리되었습니다.");
  };

  // [기능 9] 막힌 예약 풀기 (Allow/Unblock)
  const handleUnblock = (blockId) => {
    if (window.confirm("선택하신 차단(Block) 일정을 전면 해제하시겠습니까?")) {
      console.log("POST /reserv/admin/unblock 타겟 ID [기능 9]:", blockId);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      alert("블락 정책이 정상 해제되었습니다.");
    }
  };

  // [기능 10 & 11] 관리자 상담 허락 및 불허 결정 처리
  const handleDecision = (reservationId, isApprove) => {
    const reason = isApprove
      ? null
      : prompt("불허 사유를 입력하세요 (공란 제출 시 기본 사유로 처리):");
    if (!isApprove && reason === null) return; // 불허 취소 시 탈출

    // 명세서 맞춤 트랜잭션 데이터 배열화
    const decisionBody = [
      {
        id: reservationId,
        approved: isApprove,
        reason: reason || "행정 판단 하 거절",
      },
    ];

    console.log(
      `POST /reserv/admin/${isApprove ? "allow" : "disallow"} 데이터 [기능 ${isApprove ? 10 : 11}]:`,
      decisionBody,
    );
    alert(
      isApprove
        ? "상담 신청을 최종 승인(Allow)했습니다."
        : "상담 신청을 최종 불허(Disallow)했습니다.",
    );
    setSelectedDetail(null);
  };

  return (
    <div className="adm-page">
      {/* 대시보드 타이틀 헤더 존 */}
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Reservation Admin Controls</p>
          <h2>종합 예약 행정 및 통제 시스템</h2>
          <span>
            사용자들의 실시간 상담 신청 현황을 정밀 심사하여 승인/불허하거나
            시스템 특정 시간을 차단합니다.
          </span>
        </div>
        {/* 💡 변경 포인트: AdminButton 대신 순수 태그와 admin.css 결합 버튼 배치 */}
        <button
          type="button"
          className="adm-btn primary"
          onClick={handleBlockTime}
        >
          + 특정 시간 예약 막기 (Block 정책 선언)
        </button>
      </div>

      {/* 2단 메인 화면 관제 구조 */}
      <div
        className="grid2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "24px",
          marginTop: "12px",
        }}
      >
        {/* 왼쪽 섹션: 인입된 실시간 유저 신청 관리 서류첩 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>실시간 상담 승인 대기 명단 [기능 6, 10, 11]</h2>
            </div>

            <div className="adm-table-wrap">
              <table
                className="adm-table"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      background: "#f8fafc",
                      borderBottom: "2px solid #e6eaf0",
                    }}
                  >
                    <th style={{ padding: "14px" }}>일시 / 분과</th>
                    <th style={{ padding: "14px" }}>소속 기업 (고객 정보)</th>
                    <th style={{ padding: "14px", textAlign: "center" }}>
                      행정 처리 단락
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((sch) =>
                    sch.reservations.map((res) => (
                      <tr
                        key={res.reservation_id}
                        style={{ borderBottom: "1px solid #e6eaf0" }}
                      >
                        <td style={{ padding: "14px" }}>
                          <strong style={{ color: "#172033" }}>
                            {sch.selected_date}
                          </strong>{" "}
                          <br />
                          <small
                            style={{ color: "#2563eb", fontWeight: "bold" }}
                          >
                            {sch.selected_time.slice(0, 5)} (
                            {sch.field.toUpperCase()})
                          </small>
                        </td>
                        <td style={{ padding: "14px" }}>
                          {/* 💡 클릭 시 하단에 모달 뷰어가 열리도록 바인딩 유도 */}
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              padding: "0",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setSelectedDetail({
                                ...res,
                                date: sch.selected_date,
                                time: sch.selected_time,
                                field: sch.field,
                              })
                            }
                          >
                            <strong
                              style={{
                                color: "#172033",
                                textDecoration: "underline",
                              }}
                            >
                              {res.CName}
                            </strong>{" "}
                            <br />
                            <small style={{ color: "#657185" }}>
                              {res.username} ({res.email})
                            </small>
                          </button>
                        </td>
                        <td style={{ padding: "14px", textAlign: "center" }}>
                          {/* 💡 순수 버튼 요소 결합 배치 */}
                          <button
                            type="button"
                            className="adm-btn primary"
                            style={{
                              marginRight: "6px",
                              padding: "6px 12px",
                              fontSize: "13px",
                            }}
                            onClick={() =>
                              handleDecision(res.reservation_id, true)
                            }
                          >
                            허락
                          </button>
                          <button
                            type="button"
                            className="adm-btn danger"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            onClick={() =>
                              handleDecision(res.reservation_id, false)
                            }
                          >
                            불허
                          </button>
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 💡 [UX 고도화 결합] 테이블 행 클릭 시 나타나는 디테일 심사 서류 뷰어 */}
          {selectedDetail && (
            <section
              className="adm-card"
              style={{ borderLeft: "4px solid #27ae60" }}
            >
              <div className="adm-card-head" style={{ marginBottom: "14px" }}>
                <h3>상세 행정 심사 서류: {selectedDetail.CName}</h3>
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#657185",
                    fontWeight: "bold",
                  }}
                  onClick={() => setSelectedDetail(null)}
                >
                  닫기 ✕
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "14px",
                  color: "#172033",
                }}
              >
                <div>
                  • <strong>신청 대표자:</strong> {selectedDetail.username}
                </div>
                <div>
                  • <strong>대표자 연락처:</strong> {selectedDetail.phone}
                </div>
                <div>
                  • <strong>운영 비즈니스 직종:</strong> {selectedDetail.kind}
                </div>
                <div>
                  • <strong>지정 희망시각:</strong> {selectedDetail.date}{" "}
                  {selectedDetail.time.slice(0, 5)} (
                  {selectedDetail.field.toUpperCase()})
                </div>
              </div>
            </section>
          )}
        </div>

        {/* 오른쪽 섹션: 전역 일정 예외 격리 및 격리 해제소 통제구역 */}
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>현재 시스템 차단(Block) 목록 [기능 9]</h2>
          </div>
          <div
            className="adm-block-list"
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {blocks.length === 0 ? (
              <p
                style={{
                  color: "#657185",
                  fontSize: "14px",
                  padding: "16px 0",
                  textAlign: "center",
                }}
              >
                격리 차단된 예외 일정이 없습니다.
              </p>
            ) : (
              blocks.map((block) => (
                <div
                  key={block.id}
                  className="adm-block-item"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px",
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    borderRadius: "12px",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        color: "#991b1b",
                        display: "block",
                        fontSize: "14px",
                      }}
                    >
                      [{block.field ? block.field.toUpperCase() : "전체 분야"}]
                      차단
                    </strong>
                    <small
                      style={{
                        color: "#7f1d1d",
                        display: "block",
                        marginTop: "4px",
                      }}
                    >
                      일시: {block.blocked_date} ·{" "}
                      {block.blocked_time.slice(0, 5)} <br />
                      사유: {block.reason}
                    </small>
                  </div>
                  {/* 💡 순수 버튼 요소 결합 배치 */}
                  <button
                    type="button"
                    className="adm-btn ghost"
                    style={{
                      minHeight: "32px",
                      padding: "0 12px",
                      fontSize: "12px",
                      background: "#ffffff",
                      border: "1px solid #fca5a5",
                      color: "#991b1b",
                    }}
                    onClick={() => handleUnblock(block.id)}
                  >
                    해제
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
