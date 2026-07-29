import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LanguageMenu from "../../components/LanguageMenu";
import image3 from "../../assets/image3-web.jpg";
import { getCurrentLanguage } from "../../i18n/translations";
import "../../styles/home-visily-frame.css";

// 메인 페이지에서 직접 사용하는 다국어 문구입니다.
// 텍스트를 수정하거나 언어를 추가할 때는 이 객체와 translations.js의 공통 문구를 함께 확인하세요.
const HOME_COPY = {
  ko: {
    brandSub: "일본 진출 운영 시스템",
    navServices: "서비스",
    navMethod: "진행 방식",
    navExperts: "전문가",
    navStandards: "운영 방식",
    adminPage: "관리자 페이지",
    myPage: "마이 페이지",
    reservation: "상담 예약",
    logout: "로그아웃",
    login: "로그인",
    signup: "시작하기",
    loginRequired: "AI 상담을 이용하려면 로그인이 필요합니다.",
    heroBadge: "일본 진출을 위한 AI 업무 지원",
    heroTitle: "일본 진출 준비를",
    heroTitleAccent: "AI와 전문가 상담으로 정리합니다",
    heroCopy:
      "WVA는 한국 기업이 일본 법인 설립, 세무·회계, 비자, 노무, 정관 초안 작성, 전문가 상담 예약까지 한 흐름으로 준비할 수 있도록 돕는 AI 컨설팅 플랫폼입니다.",
    searchPlaceholder:
      "일본 법인 설립, 세무, 비자, 정관 작성에 대해 질문해 보세요...",
    aiConsult: "AI 상담",
    trustText: "일본 진출을 준비하는 기업을 위한 문서·상담 워크플로우",
    servicesTitle: "핵심 서비스",
    servicesDesc:
      "초기 질문부터 상담 자료 작성, 정관 초안, 전문가 검토까지 일본 진출 준비 과정을 하나의 흐름으로 정리합니다.",
    viewMethod: "진행 방식 보기",
    moveNow: "바로 이동",
    service1Label: "AI 자동화",
    service1Title: "AI 기초 상담",
    service1Body:
      "일본 법인 설립, 세무, 비자, 노무, 시장 진출 의사결정에 대해 AI 챗봇으로 먼저 질문합니다.",
    service2Label: "문서화",
    service2Title: "히어링 시트·정관 초안",
    service2Body:
      "회사명, 사업 목적, 자본금, 발기인, 이사 정보를 입력해 전문가 상담용 자료와 정관 초안을 준비합니다.",
    service3Label: "전문가 검토",
    service3Title: "전문가 상담 예약",
    service3Body:
      "AI로 정리한 내용을 바탕으로 회계·세무·법무 전문가와 실제 상담 일정을 예약합니다.",
  },
  en: {
    brandSub: "Japan Entry OS",
    navServices: "Services",
    navMethod: "Method",
    navExperts: "Experts",
    navStandards: "Operating Model",
    adminPage: "Admin Page",
    myPage: "My Page",
    reservation: "Book Consultation",
    logout: "Logout",
    login: "Login",
    signup: "Start",
    loginRequired: "Please log in to use AI consultation.",
    heroBadge: "AI workflow support for Japan market entry",
    heroTitle: "Prepare your Japan expansion",
    heroTitleAccent: "with AI and expert consultation",
    heroCopy:
      "WVA helps Korean companies prepare incorporation, tax and accounting, visas, labor issues, articles drafts, and expert consultations in one connected workflow.",
    searchPlaceholder:
      "Ask about Japanese incorporation, tax, visas, or articles drafting...",
    aiConsult: "Ask AI",
    trustText: "Document and consultation workflow for companies entering Japan",
    servicesTitle: "Core Services",
    servicesDesc:
      "From initial questions to hearing sheets, articles drafts, and expert review, WVA organizes Japan entry preparation into one workflow.",
    viewMethod: "View Method",
    moveNow: "Open",
    service1Label: "AI Automation",
    service1Title: "AI Initial Consultation",
    service1Body:
      "Ask the AI chatbot first about incorporation, tax, visas, labor, and market-entry decisions.",
    service2Label: "Documentation",
    service2Title: "Hearing Sheet & Articles Draft",
    service2Body:
      "Enter company name, business purposes, capital, founders, and directors to prepare expert-ready materials and articles drafts.",
    service3Label: "Expert Review",
    service3Title: "Expert Consultation Booking",
    service3Body:
      "Book a consultation with accounting, tax, and legal experts based on information organized by AI.",
  },
  ja: {
    brandSub: "日本進出オペレーションシステム",
    navServices: "サービス",
    navMethod: "進行方法",
    navExperts: "専門家",
    navStandards: "運営方式",
    adminPage: "管理者ページ",
    myPage: "マイページ",
    reservation: "相談予約",
    logout: "ログアウト",
    login: "ログイン",
    signup: "始める",
    loginRequired: "AI相談を利用するにはログインが必要です。",
    heroBadge: "日本進出のためのAI業務支援",
    heroTitle: "日本進出準備を",
    heroTitleAccent: "AIと専門家相談で整理します",
    heroCopy:
      "WVAは、韓国企業が日本法人設立、税務・会計、ビザ、労務、定款草案、専門家相談予約まで一つの流れで準備できるよう支援するAIコンサルティングプラットフォームです。",
    searchPlaceholder:
      "日本法人設立、税務、ビザ、定款作成について質問してください...",
    aiConsult: "AI相談",
    trustText: "日本進出を準備する企業のための文書・相談ワークフロー",
    servicesTitle: "主要サービス",
    servicesDesc:
      "初期質問から相談資料作成、定款草案、専門家レビューまで、日本進出準備を一つの流れで整理します。",
    viewMethod: "進行方法を見る",
    moveNow: "移動する",
    service1Label: "AI自動化",
    service1Title: "AI初期相談",
    service1Body:
      "日本法人設立、税務、ビザ、労務、市場進出の意思決定について、まずAIチャットボットに質問できます。",
    service2Label: "文書化",
    service2Title: "ヒアリングシート・定款草案",
    service2Body:
      "会社名、事業目的、資本金、発起人、取締役情報を入力し、専門家相談用資料と定款草案を準備します。",
    service3Label: "専門家レビュー",
    service3Title: "専門家相談予約",
    service3Body:
      "AIで整理した内容をもとに、会計・税務・法務専門家との相談日程を予約します。",
  },
};

// "일본 진출을 실행으로 바꾸는 기준" 섹션의 카드 데이터입니다.
// 화면에서는 일정 시간마다 active 카드가 바뀌며, 마우스를 올리면 자동 전환이 잠시 멈춥니다.
const STANDARD_ITEMS = [
  {
    title: "핵심 문서 구조화",
    body: "법인 설립 및 상담용 기업 정보를 체계적으로 구조화하여 일본 진출 준비에 필요한 요구사항에 빠르게 대응합니다.",
    details: ["정관 초안 작성 흐름", "사업 목적 및 기본 정보 구조화"],
  },
  {
    title: "글로벌 커뮤니케이션",
    body: "한국어, 영어, 일본어 사용자를 고려해 다국어 비즈니스 흐름을 끊김 없이 지원합니다.",
    details: ["KO / EN / JA 전환", "현지 전문가 상담 연결"],
  },
  {
    title: "사전 전략 최적화",
    body: "전문가를 만나기 전 필요한 질문과 자료를 먼저 준비하여 상담 시간을 더 효율적으로 사용합니다.",
    details: ["상담 전 질문 정리", "업무 범위와 자료 사전 점검"],
  },
  {
    title: "디지털 워크플로우",
    body: "AI 질문, 히어링 시트, 정관 초안, 상담 예약을 연결해 준비 과정을 하나의 흐름으로 만듭니다.",
    details: ["AI 상담과 문서 작성 연결", "예약 및 제출 자료 관리"],
  },
];

export default function HomeVisilyFrame({ isLoggedIn }) {
  // 메인 페이지 전용 UI 상태입니다.
  // query: 히어로 검색창 입력값, processProgress: 준비 흐름 섹션의 스크롤 진행도입니다.
  const [query, setQuery] = useState("");
  const [activeStandardIndex, setActiveStandardIndex] = useState(0);
  const [isStandardPaused, setIsStandardPaused] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchDocked, setIsSearchDocked] = useState(false);
  const [activeNav, setActiveNav] = useState(() =>
    window.location.hash.replace("#", "")
  );
  const processSectionRef = useRef(null);
  const processWorkflowRef = useRef(null);
  const heroSearchRef = useRef(null);
  const heroSearchInputRef = useRef(null);
  const navSearchInputRef = useRef(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const language = getCurrentLanguage();
  const copy = HOME_COPY[language] || HOME_COPY.ko;

  const handleNavClick = (sectionId) => {
    setActiveNav(sectionId);
    setIsMobileMenuOpen(false);
  };

  // 히어로의 AI 입력창이 헤더를 지나면 같은 입력창을 헤더 내부에 고정합니다.
  // 위로 다시 스크롤하면 원래 입력창으로 자연스럽게 돌아갑니다.
  useEffect(() => {
    let animationFrameId = null;

    const updateDockedSearch = () => {
      const search = heroSearchRef.current;
      if (!search) return;

      const headerHeight = window.innerWidth <= 860 ? 64 : 68;
      const shouldDock = search.getBoundingClientRect().top <= headerHeight;

      setIsSearchDocked((current) =>
        current === shouldDock ? current : shouldDock
      );
      animationFrameId = null;
    };

    const requestDockedSearchUpdate = () => {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(updateDockedSearch);
    };

    requestDockedSearchUpdate();
    window.addEventListener("scroll", requestDockedSearchUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestDockedSearchUpdate);

    return () => {
      window.removeEventListener("scroll", requestDockedSearchUpdate);
      window.removeEventListener("resize", requestDockedSearchUpdate);
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // 입력 중에 스크롤하더라도 커서가 원래 입력창과 헤더 입력창 사이에서 이어집니다.
  useEffect(() => {
    if (
      isSearchDocked &&
      document.activeElement === heroSearchInputRef.current
    ) {
      navSearchInputRef.current?.focus({ preventScroll: true });
    } else if (
      !isSearchDocked &&
      document.activeElement === navSearchInputRef.current
    ) {
      heroSearchInputRef.current?.focus({ preventScroll: true });
    }
  }, [isSearchDocked]);

  // 스크롤 위치에 맞춰 현재 보고 있는 메인 섹션을 헤더에 표시합니다.
  // URL hash는 변경하지 않아 스크롤 중 화면이 튀거나 방문 기록이 쌓이지 않습니다.
  useEffect(() => {
    const sectionIds = ["services", "method", "experts", "standards"];
    let animationFrameId = null;

    const updateActiveNavigation = () => {
      const activationLine = 68 + window.innerHeight * 0.3;
      let nextActiveSection = "";

      sectionIds.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section && section.getBoundingClientRect().top <= activationLine) {
          nextActiveSection = sectionId;
        }
      });

      setActiveNav((currentSection) =>
        currentSection === nextActiveSection
          ? currentSection
          : nextActiveSection
      );
      animationFrameId = null;
    };

    const requestNavigationUpdate = () => {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(updateActiveNavigation);
    };

    requestNavigationUpdate();
    window.addEventListener("scroll", requestNavigationUpdate, { passive: true });
    window.addEventListener("resize", requestNavigationUpdate);

    return () => {
      window.removeEventListener("scroll", requestNavigationUpdate);
      window.removeEventListener("resize", requestNavigationUpdate);
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // 히어로 검색창에서 AI 상담 화면으로 이동시키는 로직입니다.
  // 로그인하지 않은 사용자는 먼저 로그인 페이지로 보냅니다.
  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    if (!localStorage.getItem("accessToken")) {
      alert(copy.loginRequired);
      navigate("/login");
      return;
    }

    navigate("/chat", { state: { initialQuery: query } });
  };

  // 로그아웃 시 로컬 토큰과 권한 정보를 제거합니다.
  // 모바일 메뉴가 열려 있을 수 있으므로 함께 닫습니다.
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  // 전문가 섹션에 표시되는 임시/정적 데이터입니다.
  // 실제 백엔드나 CMS와 연결한다면 이 배열 대신 API 응답을 매핑하면 됩니다.
  const experts = [
    {
      initial: "K",
      name: "김명구 회계사",
      role: "공인회계사 · 세무사",
      careers: [
        "2008년 공인회계사 시험 합격",
        "2008년~2014년 아라타 감사법인 (현 PwC Japan 유한책임감사법인)",
        "2014년 공인회계사 등록",
        "2014년 김공인회계사사무소 설립",
        "2015년 세무사 등록",
        "2015년 김공인회계사·세무사사무소 설립",
      ],
      specialties: [
        "일본 · 국제 세무",
        "회계 감사",
        "내부통제 구축 지원",
        "조직 재편 · M&A",
        "경영계획 수립 · 사업 재생",
        "주식 공개(IPO) 지원",
        "회계 · 재무 지원",
      ],
    },
    {
      initial: "G",
      name: "카네무라 미츠아키",
      role: "사법서사 · 행정서사",
      careers: [
        "2011년 오사카 체육대학 건강복지학부 졸업",
        "2016년 한일을 연결하는 사법서사 사무소 근무",
        "2023년 사법서사 시험 합격",
        "2024년 히카리 사법서사 사무소 개업",
        "2024년 행정서사 시험 합격",
        "2025년 히카리 행정서사 사무소 개업",
      ],
      specialties: ["회사 설립", "비자 취득", "상속", "부동산 매매", "M&A"],
    },
  ];

  // 운영 방식 카드의 자동 전환 효과입니다.
  // 사용자가 카드에 hover/focus하면 isStandardPaused로 전환을 멈춥니다.
  useEffect(() => {
    if (isStandardPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveStandardIndex((prev) => (prev + 1) % STANDARD_ITEMS.length);
    }, 5600);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isStandardPaused]);

  // 준비 흐름 섹션의 스크롤 연동 효과입니다.
  // 섹션 전체가 아니라 원형 단계들이 들어있는 workflow 영역을 기준으로 진행도를 계산합니다.
  useEffect(() => {
    const workflow = processWorkflowRef.current;
    if (!workflow) {
      return undefined;
    }

    let animationFrameId = 0;

    const updateProcessProgress = () => {
      const rect = workflow.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const startPoint = viewportHeight * 0.72;
      const endPoint = viewportHeight * 0.32;
      const progress = (startPoint - rect.top) / (startPoint - endPoint);
      const nextProgress = Math.min(1, Math.max(0, progress));

      setProcessProgress(nextProgress);
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateProcessProgress);
    };

    updateProcessProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // processProgress를 4단계 인덱스로 변환합니다.
  // -1이면 아직 아무 단계도 강조하지 않는 상태입니다.
  const activeProcessStep = processProgress <= 0 ? -1 : Math.min(3, Math.floor(processProgress * 4));

  return (
    <div className="visily-home">
      {/* Header: 데스크톱은 전체 메뉴를 보여주고, 좁은 화면은 Apple식 햄버거 메뉴로 전환합니다. */}
      <header
        className={`visily-nav ${isSearchDocked ? "is-search-docked" : ""}`}
      >
        <Link to="/" className="visily-brand" aria-label="WVA home">
          <span className="visily-brand-mark">◎</span>
          <span>
            <strong>WVA AI Consulting</strong>
            <small>{copy.brandSub}</small>
          </span>
        </Link>

        <nav className="visily-nav-links" aria-label="Main navigation">
          <a
            href="#services"
            className={activeNav === "services" ? "active" : ""}
            onClick={() => handleNavClick("services")}
          >
            {copy.navServices}
          </a>
          <a
            href="#method"
            className={activeNav === "method" ? "active" : ""}
            onClick={() => handleNavClick("method")}
          >
            {copy.navMethod}
          </a>
          <a
            href="#experts"
            className={activeNav === "experts" ? "active" : ""}
            onClick={() => handleNavClick("experts")}
          >
            {copy.navExperts}
          </a>
          <a
            href="#standards"
            className={activeNav === "standards" ? "active" : ""}
            onClick={() => handleNavClick("standards")}
          >
            {copy.navStandards}
          </a>
        </nav>

        <form
          className="visily-nav-search"
          onSubmit={handleSearch}
          aria-label={copy.aiConsult}
        >
          <span aria-hidden="true">⌕</span>
          <input
            ref={navSearchInputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            tabIndex={isSearchDocked ? 0 : -1}
          />
          <button type="submit">{copy.aiConsult}</button>
        </form>

        <div className="visily-nav-actions">
          <LanguageMenu className="visily-language-menu" />

          {/* 데스크톱 전용 액션 영역입니다. 작은 화면에서는 햄버거 메뉴 안으로 이동합니다. */}
          <div className="visily-desktop-actions">
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <Link to="/admin/calendar" className="visily-ghost-btn">
                    {copy.adminPage}
                  </Link>
                ) : (
                  <>
                    <Link to="/mypage" className="visily-ghost-btn">
                      {copy.myPage}
                    </Link>
                    <Link to="/reservation" className="visily-ghost-btn">
                      {copy.reservation}
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  className="visily-dark-btn"
                  onClick={handleLogout}
                >
                  {copy.logout}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="visily-ghost-btn">
                  {copy.login}
                </Link>
                <Link to="/signup" className="visily-dark-btn">
                  {copy.signup}
                </Link>
              </>
            )}
          </div>

          {/* 모바일/태블릿에서 중앙 메뉴와 액션 버튼을 여는 햄버거 버튼입니다. */}
          <button
            type="button"
            className={`visily-menu-toggle ${
              isMobileMenuOpen ? "is-open" : ""
            }`}
            aria-label="메뉴 열기"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
          </button>
        </div>

        {/* 모바일 메뉴 패널입니다. 중앙 메뉴와 로그인/예약 버튼을 한 곳에 모았습니다. */}
        <div
          className={`visily-mobile-menu ${
            isMobileMenuOpen ? "is-open" : ""
          }`}
        >
          <nav aria-label="Mobile navigation">
            <a
              href="#services"
              onClick={() => handleNavClick("services")}
            >
              {copy.navServices}
            </a>
            <a
              href="#method"
              onClick={() => handleNavClick("method")}
            >
              {copy.navMethod}
            </a>
            <a
              href="#experts"
              onClick={() => handleNavClick("experts")}
            >
              {copy.navExperts}
            </a>
            <a
              href="#standards"
              onClick={() => handleNavClick("standards")}
            >
              {copy.navStandards}
            </a>
          </nav>

          <div className="visily-mobile-actions">
          {isLoggedIn ? (
            <>
              {isAdmin ? (
                <Link
                  to="/admin/calendar"
                  className="visily-ghost-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {copy.adminPage}
                </Link>
              ) : (
                <>
                  <Link
                    to="/mypage"
                    className="visily-ghost-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {copy.myPage}
                  </Link>
                  <Link
                    to="/reservation"
                    className="visily-ghost-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {copy.reservation}
                  </Link>
                </>
              )}
              <button
                type="button"
                className="visily-dark-btn"
                onClick={handleLogout}
              >
                {copy.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="visily-ghost-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {copy.login}
              </Link>
              <Link
                to="/signup"
                className="visily-dark-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {copy.signup}
              </Link>
            </>
          )}
          </div>
        </div>
      </header>

      {/* Hero: 서비스 첫 인상 영역입니다. 검색 입력은 로그인 후 /chat으로 연결됩니다. */}
      <section className="visily-hero">
        <div
          className="visily-hero-bg"
          style={{ backgroundImage: `url(${image3})` }}
          aria-hidden="true"
        />
        <div className="visily-hero-content">
          <p className="visily-badge">{copy.heroBadge}</p>
          <h1>
            {copy.heroTitle}
            <span>{copy.heroTitleAccent}</span>
          </h1>
          <p className="visily-hero-copy">{copy.heroCopy}</p>

          <form
            ref={heroSearchRef}
            className="visily-ai-search"
            onSubmit={handleSearch}
          >
            <span aria-hidden="true">⌕</span>
            <input
              ref={heroSearchInputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
            />
            <button type="submit">{copy.aiConsult}</button>
          </form>

          <div className="visily-trust-row" aria-label="Trust indicators">
            <span>K</span>
            <span>T</span>
            <span>L</span>
            <p>{copy.trustText}</p>
          </div>
        </div>
      </section>

      {/* Services & Pricing: 핵심 서비스와 가격 안내를 하나의 카드 그룹으로 묶은 영역입니다. */}
      <section id="services" className="visily-pricing-section">
        <div className="visily-pricing-head">
          <span>Services & Pricing</span>
          <h2>필요한 준비 단계만 선택해서 시작합니다</h2>
          <p>
            AI 상담, 문서 초안, 전문가 검토를 하나의 흐름으로 제공하되
            비용은 사용자가 필요한 준비 범위에 맞춰 이해할 수 있도록 정리했습니다.
          </p>
        </div>

        <div className="visily-pricing-grid">
          <article className="visily-pricing-card">
            <div className="visily-price-overlay">
              <h3>즉시 상담 가능</h3>
              <p>
                회원가입 후 바로 AI 답변 서비스를 이용하고, 일본 진출 기초
                질문을 먼저 정리할 수 있습니다.
              </p>
            </div>

            <div className="visily-price-content">
              <div className="visily-price-label">Start</div>
              <h3>AI 기초 상담</h3>
              <strong>무료</strong>
              <p>
                일본 법인 설립, 세무, 비자, 노무 관련 기초 질문을 먼저 정리합니다.
              </p>
              <ul>
                <li>RAG 기반 AI 답변</li>
                <li>기초 진출 질문 정리</li>
                <li>히어링 시트 작성 전 가이드</li>
              </ul>
              <Link to="/chat">AI 상담 시작</Link>
            </div>
          </article>

          <article className="visily-pricing-card featured">
            <div className="visily-price-overlay">
              <h3>신속한 서류 준비</h3>
              <p>
                입력한 회사 정보를 바탕으로 정관 초안과 상담용 기초 자료를
                빠르게 준비합니다.
              </p>
            </div>

            <div className="visily-price-content">
              <div className="visily-price-label">Core</div>
              <h3>히어링 시트·정관 초안</h3>
              <strong>프로젝트별 안내</strong>
              <p>
                회사명, 사업 목적, 자본금, 발기인, 이사 정보를 바탕으로
                상담용 자료와 정관 초안을 준비합니다.
              </p>
              <ul>
                <li>히어링 시트 구조화</li>
                <li>정관 초안 미리보기</li>
                <li>PDF 저장/인쇄 흐름</li>
              </ul>
              <Link to="/hearing-sheet">히어링 시트 작성</Link>
            </div>
          </article>

          <article className="visily-pricing-card">
            {/* 전문가 상담 카드는 hover 시 대표 견적표를 보여줍니다. */}
            <div className="visily-price-overlay estimate">
              <span className="visily-estimate-badge">Pricing Details</span>

              <div className="visily-estimate-list">
                {[
                  [
                    "법인 설립",
                    "약 45만 엔 ~",
                    "세금 및 사법서사 설립 보수 포함. 조건에 따라 변동됩니다.",
                  ],
                  [
                    "설립 관련 업무",
                    "20만 엔 ~",
                    "한국어 지원, 계좌개설 지원 등. 세무서 제출 서류는 계약 범위에 따라 포함됩니다.",
                  ],
                  [
                    "비자 발행",
                    "상담 후 안내",
                    "체류자격 종류와 신청 난이도에 따라 달라집니다.",
                  ],
                  [
                    "회계 · 세무 고문",
                    "월 7만 엔 ~",
                    "기장, 결산, 세무 신고 범위와 운영 규모에 따라 산정됩니다.",
                  ],
                  [
                    "인사, 노무",
                    "12만 엔 ~",
                    "사회보험, 급여 계산, 취업규칙 등 범위별 산정.",
                  ],
                ].map(([title, price, desc]) => (
                  <div className="visily-estimate-item" key={title}>
                    <span>{title}</span>
                    <strong>{price}</strong>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>

              <small>
                정확한 가격은 상담 후 제시드립니다.
              </small>
            </div>

            <div className="visily-price-content">
              <div className="visily-price-label">Expert</div>
              <h3>전문가 상담 예약</h3>
              <strong>상담 범위별 견적</strong>
              <p>
                AI로 정리한 내용을 바탕으로 회계·세무·법무 전문가와 실제 상담
                일정을 예약합니다.
              </p>
              <ul>
                <li>분야별 전문가 연결</li>
                <li>문서 검토 범위 협의</li>
                <li>상담 후 후속 업무 안내</li>
              </ul>
              <Link to="/reservation">상담 예약</Link>
            </div>
          </article>
        </div>

        <p className="visily-pricing-note">
          실제 비용은 기업의 설립 형태, 상담 내역, 문서 검토 범위, 전문가 상담
          분야에 따라 달라질 수 있습니다.
        </p>
      </section>

      {/* Method: 일본 진출 준비 흐름입니다. 스크롤 위치에 따라 단계 강조와 선 진행도가 바뀝니다. */}
      <section
        id="method"
        ref={processSectionRef}
        className={`visily-process-section ${
          processProgress > 0 ? "is-visible" : ""
        }`}
        style={{ "--process-line-progress": processProgress }}
      >
        <div className="visily-process-head">
          <h2>일본 시장으로 이어지는 준비 흐름</h2>
          <p>
            WVA는 흩어진 일본 진출 준비 과정을 단계별 워크플로우로 바꿉니다.
            기업 정보를 정리하고, 문서 초안을 만들고, 전문가 검토로 최종 방향을
            구체화합니다.
          </p>
        </div>

        <div className="visily-zigzag-workflow" ref={processWorkflowRef}>
          <div className="visily-zigzag-line" aria-hidden="true">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M60 60 H1140" />
            </svg>
          </div>

          {[
            {
              number: "01",
              title: "상담 및 사전 준비",
              position: "down",
              items: [
                "초기 상담 및 진출 전략 협의",
                "법인 형태 결정 (KK / GK)",
                "자본금 · 사업 목적 설정",
              ],
            },
            {
              number: "02",
              title: "법인 설립 절차",
              position: "up",
              items: ["정관 작성 및 인증", "자본금 납입", "등기 신청 · 인감 등록"],
            },
            {
              number: "03",
              title: "세무 · 회계 고문",
              position: "down",
              items: ["세무 · 회계 자문", "기장 대행 및 결산", "정기 재무 리포트"],
            },
            {
              number: "04",
              title: "노무 · 사회보험",
              position: "up",
              items: ["사회보험 가입 절차", "급여 계산 체계 구축", "연말정산 및 노무 자문"],
            },
          ].map((step, index) => (
            <article
              className={`visily-zigzag-stage ${step.position} ${
                index <= activeProcessStep ? "is-scroll-active" : ""
              }`}
              key={step.title}
              style={{ "--step-order": index }}
              tabIndex={0}
            >
              <div className="visily-zigzag-node">
                <div className="visily-zigzag-default">
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                </div>

                <div className="visily-zigzag-hover">
                  <h4>{step.title}</h4>
                  <ul>
                    {step.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="visily-process-cta">
          <Link to="/hearing-sheet" className="visily-green-btn">
            히어링 시트 작성하기 <span>›</span>
          </Link>
        </div>
      </section>

      {/* Experts: 전문가 소개 영역입니다. 좁은 화면에서는 이력보다 사진과 전문 분야를 강조합니다. */}
      <section id="experts" className="visily-section visily-experts-section">
        <div className="visily-centered-head">
          <h2>일본 비즈니스 실무를 아는 전문가</h2>
          <p>
            WVA는 AI가 정리한 상담 자료를 바탕으로 일본 현지 실무 경험을 가진
            전문가와의 상담으로 이어질 수 있도록 돕습니다.
          </p>
        </div>

        <div className="visily-expert-grid">
          {experts.map((expert) => (
            <article className="visily-expert-card" key={expert.name}>
              <div className="visily-expert-avatar" aria-hidden="true">
                {expert.initial}
              </div>
              <div className="visily-expert-content">
                <div className="visily-expert-title">
                  <h3>{expert.name}</h3>
                  <p>{expert.role}</p>
                </div>

                <div className="visily-expert-detail-grid">
                  <div>
                    <h4>주요 경력</h4>
                    <ul>
                      {expert.careers.map((career) => (
                        <li key={career}>{career}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>전문 분야</h4>
                    <div className="visily-expert-tags">
                      {expert.specialties.map((specialty) => (
                        <span key={specialty}>{specialty}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Standards: WVA의 운영 방식/강점 카드입니다. 자동 순환과 hover pause가 적용되어 있습니다. */}
      <section id="standards" className="visily-section visily-standards">
        <div className="visily-centered-head">
          <h2>일본 진출을 실행으로 바꾸는 기준</h2>
          <p>
            WVA는 문서 준비, 다국어 지원, 상담 연결, 실행 워크플로우를
            하나로 묶어 일본 진출 준비를 더 명확하게 만듭니다.
          </p>
        </div>

        <div className="visily-metric-grid">
          {STANDARD_ITEMS.map((item, index) => (
            <article
              className={`visily-metric-card ${
                activeStandardIndex === index ? "active" : ""
              }`}
              key={item.title}
              tabIndex={0}
              onBlur={() => setIsStandardPaused(false)}
              onFocus={() => {
                setIsStandardPaused(true);
                setActiveStandardIndex(index);
              }}
              onMouseEnter={() => {
                setIsStandardPaused(true);
                setActiveStandardIndex(index);
              }}
              onMouseLeave={() => setIsStandardPaused(false)}
            >
              <div className="visily-metric-top">
                <small>WVA 기준</small>
                <span className="visily-metric-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3>{item.title}</h3>
              <div className="visily-metric-details">
                <p>{item.body}</p>
                <ul>
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="visily-contact-panel">
          <div className="visily-contact-copy">
            <h3>Strategy & Contact</h3>

            <div className="visily-contact-detail">
              <span>Location</span>
              <strong>
                〒530-0026
                <br />
                일본 오사카부 오사카시 기타구 가미야마초 8-1
              </strong>
              <p>
                일본 오사카 사무소에서 일본 진출 상담과 현지 전문가 연계를
                지원합니다.
              </p>
            </div>

            <div className="visily-contact-detail">
              <span>Contact</span>
              <strong>
                <a href="mailto:contact@wva-consulting.com">
                  contact@wva-consulting.com
                </a>
              </strong>
              <p>상담 예약, 자료 제출, 서비스 문의를 이메일로 남겨주세요.</p>
            </div>
          </div>

          <div className="visily-map-placeholder">
            <iframe
              title="WVA 오사카 사무소 Google 지도"
              src="https://www.google.com/maps?q=8-1%20Kamiyamacho%2C%20Kita%20Ward%2C%20Osaka%2C%20530-0026&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              href="https://www.google.com/maps/search/?api=1&query=8-1%20Kamiyamacho%2C%20Kita%20Ward%2C%20Osaka%2C%20530-0026"
              target="_blank"
              rel="noreferrer"
            >
              Google 지도에서 보기 ↗
            </a>
          </div>
        </div>
      </section>

      {/* Footer: 하단 고정 정보 영역입니다. */}
      <footer className="visily-footer">
        <Link to="/" className="visily-footer-brand">
          ◎ WVA AI Consulting
        </Link>
        <span>© 2026 WVA Group. All rights reserved.</span>
        <nav>
          <Link to="/chat">AI 상담</Link>
          <Link to="/reservation">상담 예약</Link>
          <Link to="/hearing-sheet">히어링 시트</Link>
          <Link to="/login">고객 지원</Link>
        </nav>
      </footer>
    </div>
  );
}
