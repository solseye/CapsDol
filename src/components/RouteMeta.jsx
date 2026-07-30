import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCurrentLanguage } from "../i18n/translations";

const ROUTE_META = {
  ko: {
    routes: [
      ["/mypage/files", "내 파일 관리", "상담 및 법인 설립에 필요한 파일을 관리합니다."],
      ["/mypage/reservations", "내 상담 내역", "상담 신청과 승인 상태를 확인합니다."],
      ["/mypage", "마이페이지", "상담, 파일, 전문가 검토 진행 상황을 관리합니다."],
      ["/hearing-sheet", "히어링 시트", "일본 진출 상담을 위한 사전 정보를 작성합니다."],
      ["/reservation", "상담 예약", "전문가 상담 가능 일정을 신청합니다."],
      ["/chat", "AI 상담", "일본 진출 준비에 필요한 내용을 AI에게 질문합니다."],
      ["/signup", "회원가입", "M&K 사무소 회원가입"],
      ["/login", "로그인", "M&K 사무소 로그인"],
      ["/admin", "관리자", "M&K 사무소 관리자 시스템"],
    ],
    defaultTitle: "일본 진출 운영 시스템",
    defaultDescription:
      "AI와 전문가 상담으로 일본 진출 준비를 체계적으로 관리하세요.",
    brand: "M&K 사무소",
  },
  en: {
    routes: [
      ["/mypage/files", "My Files", "Manage files required for consultation and incorporation."],
      ["/mypage/reservations", "My Consultations", "Review consultation requests and approval status."],
      ["/mypage", "My Page", "Manage consultations, files, and expert-review progress."],
      ["/hearing-sheet", "Hearing Sheet", "Enter preliminary information for your Japan-entry consultation."],
      ["/reservation", "Book Consultation", "Request an available expert consultation time."],
      ["/chat", "AI Consultation", "Ask AI about preparing your Japan market entry."],
      ["/signup", "Sign Up", "Create an M&K Office account."],
      ["/login", "Login", "Log in to M&K Office."],
      ["/admin", "Admin", "M&K Office administration system."],
    ],
    defaultTitle: "Japan Entry Operating System",
    defaultDescription:
      "Manage your Japan-entry preparation with AI and expert consultation.",
    brand: "M&K Office",
  },
  ja: {
    routes: [
      ["/mypage/files", "ファイル管理", "相談・法人設立に必要なファイルを管理します。"],
      ["/mypage/reservations", "相談履歴", "相談申請と承認状況を確認します。"],
      ["/mypage", "マイページ", "相談、ファイル、専門家レビューの進行状況を管理します。"],
      ["/hearing-sheet", "ヒアリングシート", "日本進出相談のための事前情報を入力します。"],
      ["/reservation", "相談予約", "専門家への相談可能な日時を申請します。"],
      ["/chat", "AI相談", "日本進出準備についてAIに質問します。"],
      ["/signup", "会員登録", "M&K事務所のアカウントを作成します。"],
      ["/login", "ログイン", "M&K事務所にログインします。"],
      ["/admin", "管理者", "M&K事務所の管理システムです。"],
    ],
    defaultTitle: "日本進出オペレーションシステム",
    defaultDescription:
      "AIと専門家相談で日本進出準備を体系的に管理します。",
    brand: "M&K事務所",
  },
};

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const language = getCurrentLanguage();
    const meta = ROUTE_META[language] || ROUTE_META.ko;
    const route = meta.routes.find(([path]) => pathname.startsWith(path));
    const title = route?.[1] || meta.defaultTitle;
    const description = route?.[2] || meta.defaultDescription;

    document.title = `${title} | ${meta.brand}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [pathname]);

  return null;
}
