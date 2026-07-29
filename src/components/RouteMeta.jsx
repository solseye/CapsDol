import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_META = [
  ["/mypage/files", "내 파일 관리", "상담 및 법인 설립에 필요한 파일을 관리합니다."],
  ["/mypage/reservations", "내 상담 내역", "상담 신청과 승인 상태를 확인합니다."],
  ["/mypage", "마이페이지", "상담, 파일, 전문가 검토 진행 상황을 관리합니다."],
  ["/hearing-sheet", "히어링 시트", "일본 진출 상담을 위한 사전 정보를 작성합니다."],
  ["/reservation", "상담 예약", "전문가 상담 가능 일정을 신청합니다."],
  ["/chat", "AI 상담", "일본 진출 준비에 필요한 내용을 AI에게 질문합니다."],
  ["/signup", "회원가입", "WVA AI Consulting 회원가입"],
  ["/login", "로그인", "WVA AI Consulting 로그인"],
  ["/admin", "관리자", "WVA AI Consulting 관리자 시스템"],
];

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const route = ROUTE_META.find(([path]) => pathname.startsWith(path));
    const title = route?.[1] || "일본 진출 운영 시스템";
    const description =
      route?.[2] || "AI와 전문가 상담으로 일본 진출 준비를 체계적으로 관리하세요.";

    document.title = `${title} | WVA AI Consulting`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [pathname]);

  return null;
}
