// 기존 ADMIN mock 데이터 형태입니다.
// 백엔드 예약 데이터 형태가 바뀔 예정이라 삭제하지 않고 보관합니다.
// export const mockApplications = [
//   {
//     id: "app-001",
//     name: "김민수",
//     phone: "010-1234-5678",
//     date: "2026-04-30",
//     time: "10:00",
//     type: "세무 상담",
//     memo: "일본 법인 설립 후 소비세 신고 일정 문의",
//   },
//   {
//     id: "app-002",
//     name: "박지현",
//     phone: "010-2222-3344",
//     date: "2026-04-30",
//     time: "14:00",
//     type: "법인 설립",
//     memo: "자본금 500만 엔 기준 설립 절차 확인",
//   },
//   {
//     id: "app-003",
//     name: "이준호",
//     phone: "010-9876-1111",
//     date: "2026-05-03",
//     time: "11:00",
//     type: "비자 상담",
//     memo: "경영관리비자 필요 서류 안내 요청",
//   },
//   {
//     id: "app-004",
//     name: "최서연",
//     phone: "010-7777-9000",
//     date: "2026-05-12",
//     time: "15:00",
//     type: "노무 상담",
//     memo: "현지 채용 시 급여 계산과 사회보험 가입 문의",
//   },
// ];

// 변경 이유: 백엔드와 협업할 때 예약 데이터가 아래 형태로 전달될 예정이라
// ADMIN 캘린더도 같은 필드명(phone, CName, kind, field, selectedDate, selectedTime)을 기준으로 표시합니다.
export const mockApplications = [
  {
    id: "app-001",
    phone: "010-4563-4382",
    CName: "jem-c",
    kind: "software",
    field: "법무",
    selectedDate: "2026-04-26T15:00:00.000Z",
    selectedTime: "10:00",
  },
  {
    id: "app-002",
    phone: "010-2222-3344",
    CName: "wva-korea",
    kind: "consulting",
    field: "회계",
    selectedDate: "2026-05-05T15:00:00.000Z",
    selectedTime: "14:00",
  },
  {
    id: "app-003",
    phone: "010-9876-1111",
    CName: "tokyo-branch",
    kind: "trade",
    field: "노무",
    selectedDate: "2026-05-12T15:00:00.000Z",
    selectedTime: "11:00",
  },
  {
    id: "app-004",
    phone: "010-7777-9000",
    CName: "startup-jp",
    kind: "platform",
    field: "인사",
    selectedDate: "2026-05-12T15:00:00.000Z",
    selectedTime: "15:00",
  },
];

export const mockPdfs = [
  {
    id: "pdf-001",
    fileName: "일본_법인설립_체크리스트.pdf",
    uploadedAt: "2026-04-20",
    size: "1.8 MB",
    status: "학습 완료",
  },
  {
    id: "pdf-002",
    fileName: "경영관리비자_안내자료.pdf",
    uploadedAt: "2026-04-24",
    size: "2.4 MB",
    status: "학습 완료",
  },
  {
    id: "pdf-003",
    fileName: "일본_세무회계_FAQ.pdf",
    uploadedAt: "2026-04-28",
    size: "932 KB",
    status: "처리 중",
  },
];
