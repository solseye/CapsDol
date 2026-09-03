import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo, { BrandMark } from "../../components/BrandLogo";
import LanguageMenu from "../../components/LanguageMenu";
import image3 from "../../assets/image3-web.jpg";
import { getCurrentLanguage } from "../../i18n/translations";
import { logoutAndGoHome } from "../../utils/logout";
import { confirmAction } from "../../utils/notifications";
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
      "RtJ 사무소는 한국 기업이 일본 법인 설립, 세무·회계, 비자, 노무, 정관 초안 작성, 전문가 상담 예약까지 한 흐름으로 준비할 수 있도록 돕는 일본 진출 파트너입니다.",
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
      "RtJ Office helps Korean companies prepare incorporation, tax and accounting, visas, labor matters, draft articles of incorporation, and expert consultations in one connected workflow.",
    searchPlaceholder:
      "Ask about Japanese incorporation, tax, visas, or articles drafting...",
    aiConsult: "Ask AI",
    trustText:
      "Document and consultation workflow for companies entering Japan",
    servicesTitle: "Core Services",
    servicesDesc:
      "From initial questions to hearing sheets, draft articles of incorporation, and expert review, RtJ Office organizes Japan-entry preparation into one workflow.",
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
      "RtJ事務所は、韓国企業が日本法人設立、税務・会計、ビザ、労務、定款草案、専門家相談予約まで一つの流れで準備できるよう支援するAIコンサルティングプラットフォームです。",
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

// 중앙 히어링 시트 카드의 hover에 가격표처럼 나열하는 회사 실무 범위입니다.
const CORE_SERVICE_SUMMARIES = [
  {
    title: "법인 설립·등기",
    description: "설립 컨설팅, 정관 인증, 인감 제작, 법인 등기",
  },
  {
    title: "세무·회계감사",
    description: "각종 세무 신고, 세무조사 대응, 회사법·PKG 감사",
  },
  {
    title: "인사·노무",
    description: "사회보험·노동보험 가입 및 관련 신고",
  },
  {
    title: "비자·인허가·보조금",
    description: "체류자격, 사업별 인허가, 보조금 신청",
  },
  {
    title: "계좌·부동산",
    description: "법인 계좌 개설, 은행·부동산 업체 연결",
  },
  {
    title: "실사·조직재편·M&A",
    description: "계약·세무·시장 리스크 분석 및 투자 지원",
  },
];

const HOME_SECTIONS = {
  ko: {
    brandName: "RtJ 사무소",
    brandHomeAria: "RtJ 사무소 홈",
    menuOpen: "메뉴 열기",
    trustAria: "RtJ 사무소 소개",
    logoutDialog: {
      title: "로그아웃할까요?",
      message: "작성 중인 히어링 시트 초안은 회원별로 유지됩니다.",
      confirmLabel: "로그아웃",
    },
    pricing: {
      eyebrow: "서비스 및 가격",
      title: "필요한 준비 단계부터 시작하세요",
      description:
        "AI 상담, 문서 초안, 전문가 검토를 하나의 흐름으로 제공하되 비용은 필요한 준비 범위에 맞춰 이해할 수 있도록 정리했습니다.",
      start: {
        overlayTitle: "즉시 상담 가능",
        overlayDescription:
          "회원가입 후 바로 AI 답변 서비스를 이용하고, 일본 진출 기초 질문을 먼저 정리할 수 있습니다.",
        label: "시작",
        title: "AI 기초 상담",
        price: "무료",
        description:
          "일본 법인 설립, 세무, 비자, 노무 관련 기초 질문을 먼저 정리합니다.",
        benefits: [
          "RAG 기반 AI 답변",
          "기초 진출 질문 정리",
          "히어링 시트 작성 전 가이드",
        ],
        cta: "AI 상담 시작",
      },
      core: {
        aria: "히어링 시트 작성과 상담 연계 업무 보기",
        overlayBadge: "상담 연계 업무",
        overlayTitle: "상담 가능 업무",
        label: "핵심",
        title: "히어링 시트·실무 준비",
        price: "프로젝트별 안내",
        description:
          "회사 기본 정보를 작성해 법인 설립 상담 자료와 정관 초안을 준비합니다. 필요한 후속 업무는 전문가 상담에서 확인합니다.",
        benefits: [
          "법인 설립·등기 / 세무·회계감사",
          "인사·노무 / 비자·인허가·보조금",
          "계좌·부동산 / 실사 / 조직재편 · M&A",
        ],
        cta: "히어링 시트 작성",
        services: CORE_SERVICE_SUMMARIES,
      },
      expert: {
        aria: "전문가 상담 대표 견적 보기",
        overlayBadge: "대표 견적",
        estimates: [
          {
            title: "법인 설립",
            price: "약 45만 엔 ~",
            description:
              "세금 및 사법서사 설립 보수 포함. 조건에 따라 변동됩니다.",
          },
          {
            title: "설립 관련 업무",
            price: "20만 엔 ~",
            description:
              "한국어 지원, 계좌개설 지원 등. 세무서 제출 서류는 계약 범위에 따라 포함됩니다.",
          },
          {
            title: "비자 신청·취득 지원",
            price: "상담 후 안내",
            description: "체류자격 종류와 신청 난이도에 따라 달라집니다.",
          },
          {
            title: "회계·세무 고문",
            price: "월 7만 엔 ~",
            description:
              "기장, 결산, 세무 신고 범위와 운영 규모에 따라 산정됩니다.",
          },
          {
            title: "인사·노무",
            price: "12만 엔 ~",
            description: "사회보험, 급여 계산, 취업규칙 등 범위별 산정.",
          },
        ],
        estimateNote: "정확한 가격은 상담 후 제시드립니다.",
        label: "전문가",
        title: "전문가 상담 예약",
        price: "상담 범위별 견적",
        description:
          "AI로 정리한 내용을 바탕으로 회계·세무·법무 전문가와 실제 상담 일정을 예약합니다.",
        benefits: [
          "분야별 전문가 연결",
          "문서 검토 범위 협의",
          "상담 후 후속 업무 안내",
        ],
        cta: "상담 예약",
      },
      note: "실제 비용은 기업의 설립 형태, 상담 내역, 문서 검토 범위, 전문가 상담 분야에 따라 달라질 수 있습니다.",
    },
    method: {
      title: "일본 시장으로 이어지는 준비 흐름",
      description:
        "RtJ 사무소는 흩어진 일본 진출 준비 과정을 단계별 워크플로우로 바꿉니다. 기업 정보를 정리하고, 문서 초안을 만들고, 전문가 검토로 최종 방향을 구체화합니다.",
      cta: "히어링 시트 작성하기",
      steps: [
        {
          number: "01",
          title: "상담 및 사전 준비",
          position: "down",
          items: [
            "초기 상담 및 진출 전략 협의",
            "법인 형태 결정 (KK / GK)",
            "자본금·사업 목적 설정",
          ],
        },
        {
          number: "02",
          title: "법인 설립 절차",
          position: "up",
          items: ["정관 작성 및 인증", "자본금 납입", "등기 신청·인감 등록"],
        },
        {
          number: "03",
          title: "세무·회계 고문",
          position: "down",
          items: ["세무·회계 자문", "기장 대행 및 결산", "정기 재무 리포트"],
        },
        {
          number: "04",
          title: "노무·사회보험",
          position: "up",
          items: [
            "사회보험 가입 절차",
            "급여 계산 체계 구축",
            "연말정산 및 노무 자문",
          ],
        },
      ],
    },
    experts: {
      title: "일본 비즈니스 실무를 아는 전문가",
      description:
        "RtJ 사무소는 AI가 정리한 상담 자료를 바탕으로 일본 현지 실무 경험을 가진 전문가와의 상담으로 이어질 수 있도록 돕습니다.",
      careerLabel: "주요 경력",
      specialtyLabel: "전문 분야",
      people: [
        {
          initial: "K",
          name: "김명구",
          role: "공인회계사·세무사",
          careers: [
            "2008년 공인회계사 시험 합격",
            "2008년~2014년 아라타 감사법인 (현 PwC Japan 유한책임감사법인)",
            "2014년 공인회계사 등록",
            "2014년 김공인회계사사무소 설립",
            "2015년 세무사 등록",
            "2015년 김공인회계사·세무사사무소 설립",
          ],
          specialties: [
            "일본·국제 세무",
            "회계 감사",
            "내부통제 구축 지원",
            "조직재편·M&A",
            "경영계획 수립·사업 재생",
            "주식 공개(IPO) 지원",
            "회계·재무 지원",
          ],
        },
        {
          initial: "G",
          name: "김충황",
          role: "사법서사·행정서사",
          careers: [
            "2016년 한일을 연결하는 사법서사 사무소 근무",
            "2023년 사법서사 시험 합격",
            "2024년 히카리 사법서사 사무소 개업",
            "2024년 행정서사 시험 합격",
            "2025년 히카리 행정서사 사무소 개업",
          ],
          specialties: [
            "회사 설립",
            "비자 취득",
            "각종 인허가",
            "보조금 신청",
            "부동산 매매",
            "조직재편·M&A",
          ],
        },
      ],
    },
    standards: {
      title: "일본 진출을 실행으로 바꾸는 기준",
      description:
        "RtJ 사무소는 문서 준비, 다국어 지원, 상담 연결, 실행 워크플로우를 하나로 묶어 일본 진출 준비를 더 명확하게 만듭니다.",
      badge: "RtJ 기준",
      items: STANDARD_ITEMS,
    },
    contact: {
      title: "오시는 길·문의",
      locationLabel: "오시는 길",
      address: "일본 오사카부 오사카시 기타구 가미야마초 8-1",
      locationDescription:
        "일본 오사카 사무소에서 일본 진출 상담과 현지 전문가 연계를 지원합니다.",
      onlineLabel: "온라인 문의",
      onlineLink: "상담 예약 및 문의하기",
      onlineDescription:
        "상담 분야와 원하는 일정을 남기면 확인 후 안내해 드립니다.",
      mapTitle: "RtJ 오사카 사무소 Google 지도",
      mapLink: "Google 지도에서 보기",
    },
    footer: {
      copyright: "© 2026 RtJ 사무소. All rights reserved.",
      ai: "AI 상담",
      reservation: "상담 예약",
      hearing: "히어링 시트",
      support: "고객 지원",
    },
  },
  en: {
    brandName: "RtJ Office",
    brandHomeAria: "RtJ Office home",
    menuOpen: "Open menu",
    trustAria: "About RtJ Office",
    logoutDialog: {
      title: "Log out?",
      message: "Your hearing sheet draft is retained for your account.",
      confirmLabel: "Log out",
    },
    pricing: {
      eyebrow: "Services & Pricing",
      title: "Start with the preparation you need",
      description:
        "AI consultation, document drafting, and expert review are connected in one workflow, with pricing organized around the scope you need.",
      start: {
        overlayTitle: "Available immediately",
        overlayDescription:
          "Sign up to use the AI answer service right away and organize your initial Japan-entry questions.",
        label: "Start",
        title: "AI Initial Consultation",
        price: "Free",
        description:
          "Organize initial questions about Japanese incorporation, tax, visas, and labor.",
        benefits: [
          "RAG-powered AI answers",
          "Initial market-entry questions",
          "Pre-hearing-sheet guidance",
        ],
        cta: "Start AI Consultation",
      },
      core: {
        aria: "View hearing sheet and related advisory services",
        overlayBadge: "Related Advisory Services",
        overlayTitle: "Services Available for Consultation",
        label: "Core",
        title: "Hearing Sheet & Practical Setup",
        price: "Quoted by Project",
        description:
          "Enter basic company information to prepare incorporation consultation materials and a draft of the articles. Confirm any follow-up work with an expert.",
        benefits: [
          "Incorporation & registration / Tax & audit",
          "HR & labor / Visas, permits & subsidies",
          "Banking & real estate / Due diligence / Reorganization & M&A",
        ],
        cta: "Complete Hearing Sheet",
        services: [
          {
            title: "Incorporation & Registration",
            description:
              "Formation consulting, articles certification, company seal, registration",
          },
          {
            title: "Tax, Accounting & Audit",
            description:
              "Tax filings, tax audit support, statutory and PKG audits",
          },
          {
            title: "HR & Labor",
            description:
              "Social and labor insurance enrollment and related filings",
          },
          {
            title: "Visas, Permits & Subsidies",
            description:
              "Residence status, business permits, subsidy applications",
          },
          {
            title: "Banking & Real Estate",
            description:
              "Corporate account setup and introductions to banks and real-estate firms",
          },
          {
            title: "Due Diligence, Reorganization & M&A",
            description:
              "Contract, tax, and market-risk analysis with investment support",
          },
        ],
      },
      expert: {
        aria: "View indicative expert consultation fees",
        overlayBadge: "Pricing Details",
        estimates: [
          {
            title: "Company Incorporation",
            price: "From approx. ¥450,000",
            description:
              "Includes taxes and judicial scrivener fees. Final cost varies by conditions.",
          },
          {
            title: "Formation Support",
            price: "From ¥200,000",
            description:
              "May include Korean-language and bank-account support. Tax-office filings depend on contract scope.",
          },
          {
            title: "Visa Application Support",
            price: "Quoted after consultation",
            description:
              "Depends on the residence-status category and application complexity.",
          },
          {
            title: "Accounting & Tax Advisory",
            price: "From ¥70,000/month",
            description:
              "Based on bookkeeping, closing, tax-filing scope, and operating scale.",
          },
          {
            title: "HR & Labor",
            price: "From ¥120,000",
            description:
              "Quoted by scope, including social insurance, payroll, and work rules.",
          },
        ],
        estimateNote: "Final pricing is provided after consultation.",
        label: "Expert",
        title: "Book an Expert Consultation",
        price: "Quote Based on Scope",
        description:
          "Book a consultation with accounting, tax, and legal experts based on information organized by AI.",
        benefits: [
          "Matched with a relevant expert",
          "Document-review scope agreed in advance",
          "Guidance on follow-up services",
        ],
        cta: "Book Consultation",
      },
      note: "Actual fees may vary based on the entity type, consultation details, document-review scope, and expert field.",
    },
    method: {
      title: "A clear path into the Japanese market",
      description:
        "RtJ Office turns fragmented Japan-entry preparation into a step-by-step workflow: organizing company information, drafting documents, and defining the final direction through expert review.",
      cta: "Complete the Hearing Sheet",
      steps: [
        {
          number: "01",
          title: "Consultation & Planning",
          position: "down",
          items: [
            "Initial consultation and market-entry strategy",
            "Entity selection (KK / GK)",
            "Capital and business-purpose planning",
          ],
        },
        {
          number: "02",
          title: "Company Incorporation",
          position: "up",
          items: [
            "Drafting and certification of articles",
            "Capital contribution",
            "Registration filing and company seal",
          ],
        },
        {
          number: "03",
          title: "Tax & Accounting Advisory",
          position: "down",
          items: [
            "Tax and accounting advice",
            "Bookkeeping and closing",
            "Regular financial reports",
          ],
        },
        {
          number: "04",
          title: "Labor & Social Insurance",
          position: "up",
          items: [
            "Social insurance enrollment",
            "Payroll system setup",
            "Year-end adjustment and labor advice",
          ],
        },
      ],
    },
    experts: {
      title: "Experts who know business in Japan",
      description:
        "RtJ Office connects AI-organized consultation materials with professionals experienced in practical business operations in Japan.",
      careerLabel: "Career Highlights",
      specialtyLabel: "Areas of Expertise",
      people: [
        {
          initial: "K",
          name: "Myung-gu Kim",
          role: "Certified Public Accountant · Tax Accountant",
          careers: [
            "Passed the CPA examination in 2008",
            "Arata Audit Corporation, now PwC Japan LLC (2008–2014)",
            "Registered as a CPA in 2014",
            "Founded Kim CPA Office in 2014",
            "Registered as a tax accountant in 2015",
            "Founded Kim CPA & Tax Accountant Office in 2015",
          ],
          specialties: [
            "Japanese & International Tax",
            "Financial Audit",
            "Internal-Control Implementation",
            "Reorganization & M&A",
            "Business Planning & Turnaround",
            "IPO Support",
            "Accounting & Finance Support",
          ],
        },
        {
          initial: "G",
          name: "Mitsuaki Kanemura",
          role: "Judicial Scrivener · Administrative Scrivener",
          careers: [
            "Joined a judicial scrivener office connecting Korea and Japan in 2016",
            "Passed the judicial scrivener examination in 2023",
            "Opened Hikari Judicial Scrivener Office in 2024",
            "Passed the administrative scrivener examination in 2024",
            "Opened Hikari Administrative Scrivener Office in 2025",
          ],
          specialties: [
            "Company Formation",
            "Visa Acquisition",
            "Permits & Licenses",
            "Subsidy Applications",
            "Real Estate Transactions",
            "Reorganization & M&A",
          ],
        },
      ],
    },
    standards: {
      title: "Principles that turn Japan entry into action",
      description:
        "RtJ Office brings document preparation, multilingual support, consultation, and execution workflows together to make Japan-entry planning clearer.",
      badge: "RtJ Standard",
      items: [
        {
          title: "Structured Core Documents",
          body: "We structure incorporation and consultation data so your team can respond quickly to Japan-entry requirements.",
          details: [
            "Articles-drafting workflow",
            "Structured business purposes and basic information",
          ],
        },
        {
          title: "Global Communication",
          body: "A multilingual business flow supports Korean, English, and Japanese users without interruption.",
          details: [
            "KO / EN / JA switching",
            "Connection to local professionals",
          ],
        },
        {
          title: "Pre-consultation Strategy",
          body: "Prepare questions and materials before meeting an expert to use consultation time more effectively.",
          details: [
            "Questions organized in advance",
            "Pre-check of scope and materials",
          ],
        },
        {
          title: "Digital Workflow",
          body: "AI questions, hearing sheets, articles drafts, and bookings are connected in one preparation flow.",
          details: [
            "AI consultation linked to document drafting",
            "Booking and submitted-material management",
          ],
        },
      ],
    },
    contact: {
      title: "Location & Contact",
      locationLabel: "Office",
      address: "8-1 Kamiyamacho, Kita Ward, Osaka, Japan",
      locationDescription:
        "Our Osaka office supports Japan-entry consultations and connections to local professionals.",
      onlineLabel: "Online Inquiry",
      onlineLink: "Book a Consultation or Send an Inquiry",
      onlineDescription:
        "Tell us your consultation field and preferred schedule, and we will follow up.",
      mapTitle: "Google Map for RtJ Osaka Office",
      mapLink: "View on Google Maps",
    },
    footer: {
      copyright: "© 2026 RtJ Office. All rights reserved.",
      ai: "AI Consultation",
      reservation: "Book Consultation",
      hearing: "Hearing Sheet",
      support: "Customer Support",
    },
  },
  ja: {
    brandName: "RtJ事務所",
    brandHomeAria: "RtJ事務所ホーム",
    menuOpen: "メニューを開く",
    trustAria: "RtJ事務所について",
    logoutDialog: {
      title: "ログアウトしますか？",
      message: "作成中のヒアリングシート下書きはアカウントごとに保存されます。",
      confirmLabel: "ログアウト",
    },
    pricing: {
      eyebrow: "サービス・料金",
      title: "必要な準備段階から始めましょう",
      description:
        "AI相談、文書草案、専門家レビューを一つの流れで提供し、必要な準備範囲に応じて料金を分かりやすく整理しています。",
      start: {
        overlayTitle: "すぐに相談可能",
        overlayDescription:
          "会員登録後すぐにAI回答サービスを利用し、日本進出に関する基礎的な質問を整理できます。",
        label: "スタート",
        title: "AI基礎相談",
        price: "無料",
        description:
          "日本法人設立、税務、ビザ、労務に関する基礎的な質問を整理します。",
        benefits: [
          "RAGベースのAI回答",
          "進出に関する基礎質問の整理",
          "ヒアリングシート作成前のガイド",
        ],
        cta: "AI相談を始める",
      },
      core: {
        aria: "ヒアリングシート作成と関連相談業務を見る",
        overlayBadge: "相談関連業務",
        overlayTitle: "相談可能な業務",
        label: "コア",
        title: "ヒアリングシート・実務準備",
        price: "案件ごとにご案内",
        description:
          "会社の基本情報を入力し、法人設立相談資料と定款草案を準備します。必要な後続業務は専門家相談で確認します。",
        benefits: [
          "法人設立・登記 / 税務・会計監査",
          "人事・労務 / ビザ・許認可・補助金",
          "口座・不動産 / デューデリジェンス / 組織再編・M&A",
        ],
        cta: "ヒアリングシートを作成",
        services: [
          {
            title: "法人設立・登記",
            description: "設立コンサルティング、定款認証、印鑑作成、法人登記",
          },
          {
            title: "税務・会計監査",
            description: "各種税務申告、税務調査対応、会社法・PKG監査",
          },
          {
            title: "人事・労務",
            description: "社会保険・労働保険加入および関連届出",
          },
          {
            title: "ビザ・許認可・補助金",
            description: "在留資格、事業別許認可、補助金申請",
          },
          {
            title: "口座・不動産",
            description: "法人口座開設、銀行・不動産会社の紹介",
          },
          {
            title: "デューデリジェンス・組織再編・M&A",
            description: "契約・税務・市場リスク分析および投資支援",
          },
        ],
      },
      expert: {
        aria: "専門家相談の参考料金を見る",
        overlayBadge: "料金詳細",
        estimates: [
          {
            title: "法人設立",
            price: "約45万円～",
            description:
              "税金および司法書士の設立報酬を含みます。条件により変動します。",
          },
          {
            title: "設立関連業務",
            price: "20万円～",
            description:
              "韓国語対応、口座開設支援など。税務署提出書類は契約範囲により含まれます。",
          },
          {
            title: "ビザ申請・取得支援",
            price: "相談後にご案内",
            description: "在留資格の種類と申請難易度により異なります。",
          },
          {
            title: "会計・税務顧問",
            price: "月額7万円～",
            description:
              "記帳、決算、税務申告の範囲と事業規模に応じて算定します。",
          },
          {
            title: "人事・労務",
            price: "12万円～",
            description:
              "社会保険、給与計算、就業規則など業務範囲に応じて算定します。",
          },
        ],
        estimateNote: "正確な料金はご相談後にご提示します。",
        label: "専門家",
        title: "専門家相談予約",
        price: "相談範囲別のお見積り",
        description:
          "AIで整理した内容をもとに、会計・税務・法務の専門家との相談日程を予約します。",
        benefits: [
          "分野別の専門家をご紹介",
          "文書レビュー範囲の事前確認",
          "相談後の後続業務をご案内",
        ],
        cta: "相談を予約",
      },
      note: "実際の料金は、設立形態、相談内容、文書レビュー範囲、専門分野により異なる場合があります。",
    },
    method: {
      title: "日本市場へつながる準備の流れ",
      description:
        "RtJ事務所は、分散しがちな日本進出準備を段階別のワークフローに変えます。企業情報を整理し、文書草案を作成し、専門家レビューで最終方針を具体化します。",
      cta: "ヒアリングシートを作成",
      steps: [
        {
          number: "01",
          title: "相談・事前準備",
          position: "down",
          items: [
            "初回相談・進出戦略の協議",
            "法人形態の決定（KK / GK）",
            "資本金・事業目的の設定",
          ],
        },
        {
          number: "02",
          title: "法人設立手続",
          position: "up",
          items: ["定款作成・認証", "資本金払込", "登記申請・印鑑登録"],
        },
        {
          number: "03",
          title: "税務・会計顧問",
          position: "down",
          items: ["税務・会計相談", "記帳代行・決算", "定期財務レポート"],
        },
        {
          number: "04",
          title: "労務・社会保険",
          position: "up",
          items: [
            "社会保険加入手続",
            "給与計算体制の構築",
            "年末調整・労務相談",
          ],
        },
      ],
    },
    experts: {
      title: "日本ビジネスの実務に精通した専門家",
      description:
        "RtJ事務所は、AIが整理した相談資料をもとに、日本現地での実務経験を持つ専門家との相談につなげます。",
      careerLabel: "主な経歴",
      specialtyLabel: "専門分野",
      people: [
        {
          initial: "K",
          name: "金明究",
          role: "公認会計士・税理士",
          careers: [
            "2008年 公認会計士試験合格",
            "2008年～2014年 あらた監査法人（現 PwC Japan有限責任監査法人）",
            "2014年 公認会計士登録",
            "2014年 金公認会計士事務所設立",
            "2015年 税理士登録",
            "2015年 金公認会計士・税理士事務所設立",
          ],
          specialties: [
            "日本・国際税務",
            "会計監査",
            "内部統制構築支援",
            "組織再編・M&A",
            "経営計画策定・事業再生",
            "株式公開（IPO）支援",
            "会計・財務支援",
          ],
        },
        {
          initial: "G",
          name: "金充晃",
          role: "司法書士・行政書士",
          careers: [
            "2016年 韓日をつなぐ司法書士事務所勤務",
            "2023年 司法書士試験合格",
            "2024年 ひかり司法書士事務所開業",
            "2024年 行政書士試験合格",
            "2025年 ひかり行政書士事務所開業",
          ],
          specialties: [
            "会社設立",
            "ビザ取得",
            "各種許認可",
            "補助金申請",
            "不動産売買",
            "組織再編・M&A",
          ],
        },
      ],
    },
    standards: {
      title: "日本進出を実行へ変える基準",
      description:
        "RtJ事務所は、文書準備、多言語対応、相談連携、実行ワークフローを一つにまとめ、日本進出準備をより明確にします。",
      badge: "RtJ基準",
      items: [
        {
          title: "主要文書の構造化",
          body: "法人設立・相談用の企業情報を体系的に構造化し、日本進出準備に必要な要件へ迅速に対応します。",
          details: ["定款草案作成フロー", "事業目的・基本情報の構造化"],
        },
        {
          title: "グローバルコミュニケーション",
          body: "韓国語・英語・日本語の利用者を考慮し、多言語のビジネスフローを途切れなく支援します。",
          details: ["KO / EN / JA切替", "現地専門家への相談連携"],
        },
        {
          title: "事前戦略の最適化",
          body: "専門家に会う前に必要な質問と資料を準備し、相談時間をより有効に活用します。",
          details: ["相談前の質問整理", "業務範囲・資料の事前確認"],
        },
        {
          title: "デジタルワークフロー",
          body: "AI相談、ヒアリングシート、定款草案、相談予約をつなぎ、準備過程を一つの流れにします。",
          details: ["AI相談と文書作成の連携", "予約・提出資料の管理"],
        },
      ],
    },
    contact: {
      title: "アクセス・お問い合わせ",
      locationLabel: "所在地",
      address: "日本国大阪府大阪市北区神山町8-1",
      locationDescription:
        "大阪事務所で日本進出相談と現地専門家への連携を支援します。",
      onlineLabel: "オンラインお問い合わせ",
      onlineLink: "相談予約・お問い合わせ",
      onlineDescription:
        "相談分野とご希望の日程をお知らせいただければ、確認後にご案内します。",
      mapTitle: "RtJ大阪事務所 Googleマップ",
      mapLink: "Googleマップで見る",
    },
    footer: {
      copyright: "© 2026 RtJ事務所. All rights reserved.",
      ai: "AI相談",
      reservation: "相談予約",
      hearing: "ヒアリングシート",
      support: "カスタマーサポート",
    },
  },
};

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
    window.location.hash.replace("#", ""),
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
  const sections = HOME_SECTIONS[language] || HOME_SECTIONS.ko;

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
        current === shouldDock ? current : shouldDock,
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
          : nextActiveSection,
      );
      animationFrameId = null;
    };

    const requestNavigationUpdate = () => {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(updateActiveNavigation);
    };

    requestNavigationUpdate();
    window.addEventListener("scroll", requestNavigationUpdate, {
      passive: true,
    });
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
      navigate("/login", {
        state: {
          from: "/chat",
          routeState: { initialQuery: query.trim() },
          message: copy.loginRequired,
        },
      });
      return;
    }

    navigate("/chat", { state: { initialQuery: query } });
  };

  // 로그아웃 시 서버 세션과 로컬 토큰을 함께 정리하고 메인 페이지로 돌아갑니다.
  // 모바일 메뉴가 열려 있을 수 있으므로 함께 닫습니다.
  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: sections.logoutDialog.title,
      message: sections.logoutDialog.message,
      confirmLabel: sections.logoutDialog.confirmLabel,
    });
    if (!confirmed) return;

    setIsMobileMenuOpen(false);
    await logoutAndGoHome();
  };

  // 운영 방식 카드의 자동 전환 효과입니다.
  // 사용자가 카드에 hover/focus하면 isStandardPaused로 전환을 멈춥니다.
  useEffect(() => {
    if (isStandardPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveStandardIndex(
        (prev) => (prev + 1) % sections.standards.items.length,
      );
    }, 5600);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isStandardPaused, sections.standards.items.length]);

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
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
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
  const activeProcessStep =
    processProgress <= 0 ? -1 : Math.min(3, Math.floor(processProgress * 4));

  return (
    <div className="visily-home">
      {/* Header: 데스크톱은 전체 메뉴를 보여주고, 좁은 화면은 Apple식 햄버거 메뉴로 전환합니다. */}
      <header
        className={`visily-nav ${isSearchDocked ? "is-search-docked" : ""}`}
      >
        <BrandLogo
          className="visily-brand"
          markClassName="visily-brand-logo"
          copyClassName="visily-brand-copy"
          name={sections.brandName}
          subtitle={copy.brandSub}
          ariaLabel={sections.brandHomeAria}
        />

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
            aria-label={sections.menuOpen}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
          </button>
        </div>

        {/* 모바일 메뉴 패널입니다. 중앙 메뉴와 로그인/예약 버튼을 한 곳에 모았습니다. */}
        <div
          className={`visily-mobile-menu ${isMobileMenuOpen ? "is-open" : ""}`}
        >
          <nav aria-label="Mobile navigation">
            <a href="#services" onClick={() => handleNavClick("services")}>
              {copy.navServices}
            </a>
            <a href="#method" onClick={() => handleNavClick("method")}>
              {copy.navMethod}
            </a>
            <a href="#experts" onClick={() => handleNavClick("experts")}>
              {copy.navExperts}
            </a>
            <a href="#standards" onClick={() => handleNavClick("standards")}>
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

          <div className="visily-trust-row" aria-label={sections.trustAria}>
            <BrandMark className="visily-trust-logo" />
            <p>
              <strong>{sections.brandName}</strong>
              {copy.trustText}
            </p>
          </div>
        </div>
      </section>

      {/* Services & Pricing: 핵심 서비스와 가격 안내를 하나의 카드 그룹으로 묶은 영역입니다. */}
      <section id="services" className="visily-pricing-section">
        <div className="visily-pricing-head">
          <span>{sections.pricing.eyebrow}</span>
          <h2>{sections.pricing.title}</h2>
          <p>{sections.pricing.description}</p>
        </div>

        <div className="visily-pricing-grid">
          <article className="visily-pricing-card">
            <div className="visily-price-overlay">
              <h3>{sections.pricing.start.overlayTitle}</h3>
              <p>{sections.pricing.start.overlayDescription}</p>
            </div>

            <div className="visily-price-content">
              <div className="visily-price-label">
                {sections.pricing.start.label}
              </div>
              <h3>{sections.pricing.start.title}</h3>
              <strong>{sections.pricing.start.price}</strong>
              <p>{sections.pricing.start.description}</p>
              <ul>
                {sections.pricing.start.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <Link to="/chat">{sections.pricing.start.cta}</Link>
            </div>
          </article>

          <article
            className="visily-pricing-card featured"
            tabIndex={0}
            aria-label={sections.pricing.core.aria}
          >
            <div className="visily-price-overlay core-services">
              <span className="visily-estimate-badge">
                {sections.pricing.core.overlayBadge}
              </span>
              <h3>{sections.pricing.core.overlayTitle}</h3>

              <div className="visily-core-service-list">
                {sections.pricing.core.services.map((service) => (
                  <div className="visily-core-service-item" key={service.title}>
                    <strong>{service.title}</strong>
                    <p>{service.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="visily-price-content">
              <div className="visily-price-label">
                {sections.pricing.core.label}
              </div>
              <h3>{sections.pricing.core.title}</h3>
              <strong>{sections.pricing.core.price}</strong>
              <p>{sections.pricing.core.description}</p>
              <ul>
                {sections.pricing.core.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <Link to="/hearing-sheet">{sections.pricing.core.cta}</Link>
            </div>
          </article>

          <article
            className="visily-pricing-card"
            tabIndex={0}
            aria-label={sections.pricing.expert.aria}
          >
            {/* 전문가 상담 카드는 hover 시 대표 견적표를 보여줍니다. */}
            <div className="visily-price-overlay estimate">
              <span className="visily-estimate-badge">
                {sections.pricing.expert.overlayBadge}
              </span>

              <div className="visily-estimate-list">
                {sections.pricing.expert.estimates.map((estimate) => (
                  <div className="visily-estimate-item" key={estimate.title}>
                    <span>{estimate.title}</span>
                    <strong>{estimate.price}</strong>
                    <p>{estimate.description}</p>
                  </div>
                ))}
              </div>

              <small>{sections.pricing.expert.estimateNote}</small>
            </div>

            <div className="visily-price-content">
              <div className="visily-price-label">
                {sections.pricing.expert.label}
              </div>
              <h3>{sections.pricing.expert.title}</h3>
              <strong>{sections.pricing.expert.price}</strong>
              <p>{sections.pricing.expert.description}</p>
              <ul>
                {sections.pricing.expert.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <Link to="/reservation">{sections.pricing.expert.cta}</Link>
            </div>
          </article>
        </div>

        <p className="visily-pricing-note">{sections.pricing.note}</p>
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
          <h2>{sections.method.title}</h2>
          <p>{sections.method.description}</p>
        </div>

        <div className="visily-zigzag-workflow" ref={processWorkflowRef}>
          <div className="visily-zigzag-line" aria-hidden="true">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M60 60 H1140" />
            </svg>
          </div>

          {sections.method.steps.map((step, index) => (
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
                  <strong>{step.title}</strong>
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
            {sections.method.cta} <span>›</span>
          </Link>
        </div>
      </section>

      {/* Experts: 전문가 소개 영역입니다. 좁은 화면에서는 이력보다 사진과 전문 분야를 강조합니다. */}
      <section id="experts" className="visily-section visily-experts-section">
        <div className="visily-centered-head">
          <h2>{sections.experts.title}</h2>
          <p>{sections.experts.description}</p>
        </div>

        <div className="visily-expert-grid">
          {sections.experts.people.map((expert) => (
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
                  <div className="visily-expert-career-block">
                    <h4>{sections.experts.careerLabel}</h4>
                    <ul>
                      {expert.careers.map((career) => (
                        <li key={career}>{career}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>{sections.experts.specialtyLabel}</h4>
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

      {/* Standards: RtJ 사무소의 운영 방식/강점 카드입니다. 자동 순환과 hover pause가 적용되어 있습니다. */}
      <section id="standards" className="visily-section visily-standards">
        <div className="visily-centered-head">
          <h2>{sections.standards.title}</h2>
          <p>{sections.standards.description}</p>
        </div>

        <div className="visily-metric-grid">
          {sections.standards.items.map((item, index) => (
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
                <small>{sections.standards.badge}</small>
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
            <h3>{sections.contact.title}</h3>

            <div className="visily-contact-detail">
              <span>{sections.contact.locationLabel}</span>
              <strong>
                〒530-0026
                <br />
                {sections.contact.address}
              </strong>
              <p>{sections.contact.locationDescription}</p>
            </div>

            <div className="visily-contact-detail">
              <span>{sections.contact.onlineLabel}</span>
              <strong>
                <Link to="/reservation">{sections.contact.onlineLink}</Link>
              </strong>
              <p>{sections.contact.onlineDescription}</p>
            </div>
          </div>

          <div className="visily-map-placeholder">
            <iframe
              title={sections.contact.mapTitle}
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
              {sections.contact.mapLink} ↗
            </a>
          </div>
        </div>
      </section>

      {/* Footer: 하단 고정 정보 영역입니다. */}
      <footer className="visily-footer">
        <BrandLogo
          className="visily-footer-brand"
          markClassName="visily-footer-logo"
          copyClassName="visily-footer-copy"
          name={sections.brandName}
          hideSubtitle
        />
        <span>{sections.footer.copyright}</span>
        <nav>
          <Link to="/chat">{sections.footer.ai}</Link>
          <Link to="/reservation">{sections.footer.reservation}</Link>
          <Link to="/hearing-sheet">{sections.footer.hearing}</Link>
          <Link to="/login">{sections.footer.support}</Link>
        </nav>
      </footer>
    </div>
  );
}
