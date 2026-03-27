import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";

const I18N = {
  ko: {
    hero_eyebrow: "한국 기업의 일본 진출, 한국어로 끝까지",
    hero_title: "일본 법인 설립부터 운영까지 원스톱으로 지원합니다",
    hero_lead:
      "정관 작성·등기·세무서 신고·비자·계좌개설·회계/세무·노무까지. 김명구 회계사와 사법서사/행정사 가네무라가 팀으로 지원합니다.",
    hero_cta_primary: "무료 상담 문의",
    hero_cta_secondary: "지원 범위 보기",
    trust_1: "한국어 상담·문서 안내",
    trust_2: "설립/등기/비자/세무·노무 연계",
    trust_3: "일본 비즈니스 실무 중심",
    hero_card_title: "핵심 지원",
    hero_card_note:
      "설립 전·후 절차를 한 팀에서 설계해 시행착오와 세무 리스크를 줄입니다.",
    hero_card_link: "진행 흐름 확인 →",
    chip_1: "법인설립",
    chip_2: "등기(사법서사)",
    chip_3: "비자(행정사)",
    chip_4: "계좌개설",
    chip_5: "세무·회계",
    chip_6: "인사·노무",
    chip_7: "부동산",

    services_title: "이런 기업에 추천드립니다",
    services_subtitle:
      "일본 진출은 “설립”보다 “운영”이 더 어렵습니다. 설립부터 운영 체계까지 함께 만듭니다.",
    recommend_title: "추천 대상",
    rec_1: "현지 법인 설립 절차가 복잡하게 느껴지는 경우",
    rec_2: "등기·비자·세무·회계·노무를 종합 지원받고 싶은 경우",
    rec_3: "상담부터 진행까지 한국어로 진행하길 원하는 경우",
    rec_4: "일본 비즈니스 환경에 정통한 컨설팅이 필요한 경우",
    rec_5: "세무 리스크를 줄이고 안정 운영을 원하는 경우",

    scope_title: "지원 범위",
    svc_1_t: "법인설립",
    svc_1_d: "설립 컨설팅, 정관 작성/인증, 법인 인감 등",
    svc_2_t: "등기(사법서사)",
    svc_2_d: "설립 등기 및 변경 등기 등 절차 지원",
    svc_3_t: "비자(행정사)",
    svc_3_d: "취업 비자, 경영·관리 비자 등",
    svc_4_t: "계좌개설",
    svc_4_d: "필요서류 안내, 준비/제출 지원, 심사 대응",
    svc_5_t: "세무·회계",
    svc_5_d: "기장, 신고, 세무 상담, 국제세무 리스크 검토",
    svc_6_t: "인사·노무",
    svc_6_d: "사회보험, 급여계산, 취업규칙 등",
    scope_note:
      "필요 시 부동산 중개(사무실/점포/투자용)도 파트너 네트워크로 연계합니다.",

    flow_title: "한국 기업의 일본 진출 흐름",
    flow_subtitle:
      "대표적인 진행 예시입니다. 상황에 맞춰 일정과 업무 범위를 조정합니다.",
    flow_1_t: "상담 → 법인 설립(약 2개월)",
    flow_1_d: "체크리스트 정리, 정관 작성/인증, 등기 신청",
    flow_2_t: "부동산 검토 및 소개",
    flow_2_d: "사무실/점포 상담, 물건 검토 및 중개 (STEP 1과 병행 가능)",
    flow_3_t: "법인 계좌 개설 지원(약 1.5개월)",
    flow_3_d: "서류 안내, 준비/제출 지원, 은행 심사 대응",
    flow_4_t: "세무·회계 고문 + 노무 체계 구축",
    flow_4_d: "세무 신고, 기장, 사회보험, 급여, 취업규칙 등 운영 기반 정착",
    flow_callout_t: "원스톱의 장점",
    flow_callout_d:
      "등기·비자·세무·노무가 따로 움직이면 일정 지연과 리스크가 커집니다. 한 팀에서 “설립 이후”까지 역산해 준비합니다.",

    pricing_title: "견적 요금(예시)",
    pricing_subtitle:
      "아래는 참고용 예시입니다(세금 제외). 업무 범위·설립 형태·자본금 규모에 따라 달라집니다.",
    price_1_t: "법인 설립",
    price_1_p: "약 45만 엔 ~",
    price_1_d: "세금 및 사법서사 설립 보수 포함(상황에 따라 변동)",
    price_2_t: "설립 관련 업무(한국어 지원/계좌개설 지원 등)",
    price_2_p: "20만 엔 ~",
    price_2_d:
      "설립 후 세무서 제출 서류는 고문 계약 범위에 포함될 수 있습니다.",
    price_3_t: "비자 발행",
    price_3_p: "상담 후 안내",
    price_3_d: "체류자격 종류/난이도에 따라 상이",
    price_4_t: "회계·세무 고문",
    price_4_p: "월 7만 엔 ~",
    price_4_d: "세무 신고 보수 30만 엔 ~ (번역/한국어 대응은 별도)",
    price_5_t: "인사·노무",
    price_5_p: "12만 엔 ~",
    price_5_d:
      "사회보험 신규 적용 12만 엔~, 급여 계산 1만 엔 + 2천 엔/1인, 취업규칙 30만 엔~",
    pricing_note:
      "은행 심사 기준에 따라 계좌 개설이 불가할 수 있습니다. 정확한 견적은 상담 후 제시드립니다.",

    faq_title: "자주 묻는 질문",
    faq_1_q: "비거주자(일본 비거주)도 회사를 설립할 수 있나요?",
    faq_1_a:
      "일반적으로 대표가 일본 비거주자여도 법인 설립 절차 진행은 가능합니다. 다만 지점(支店) 설립의 경우 일본 거주 책임자가 필요할 수 있습니다.",
    faq_2_q: "자본금은 많을수록 좋은가요?",
    faq_2_a:
      "자본금 규모에 따라 소비세 면세 여부, 과세 방식 등 달라질 수 있습니다. 사업 모델과 초기 투자 계획을 함께 검토해 적정 자본금을 설계합니다.",
    faq_3_q: "회사 설립 후 어떤 절차가 필요하나요?",
    faq_3_a:
      "세무서·지자체 신고, 사회보험/노동보험 절차 등이 필요하며 기한 관리가 중요합니다. 직원 채용 시 노동 관련 신고도 발생합니다.",
    faq_4_q: "한국 본사에서 구매해 일본 자회사가 판매할 때 유의점은?",
    faq_4_a:
      "이전가격(Transfer Pricing) 리스크를 점검해야 합니다. 거래 조건과 가격 산정 근거를 갖추는 것이 중요합니다.",

    experts_title: "전문가 소개",
    experts_subtitle:
      "각 분야 자격자가 한 팀으로 움직여 일정과 품질을 동시에 확보합니다.",
    expert_1_name: "김명구 회계사",
    expert_1_role: "공인회계사(CPA) · 세무/회계 · 국제세무",
    expert_1_b1: "일본 진출 구조 설계(설립/운영/세무 리스크)",
    expert_1_b2: "기장·결산·법인세/소비세 등 세무 신고",
    expert_1_b3: "한·일 거래(이전가격 등) 이슈 점검",
    expert_2_name: "가네무라 사법서사 · 행정사",
    expert_2_role: "사법서사(등기) · 행정사(비자/허가)",
    expert_2_b1: "정관/등기 서류 작성 및 설립 등기",
    expert_2_b2: "비자(취업/경영·관리) 신청 서류 준비",
    expert_2_b3: "각종 행정 절차, 허가/신고 대응",
    experts_note:
      "실제 자격·등록 정보, 사무소 주소/연락처, 개인정보 처리방침은 운영 정보에 맞게 기재해 주세요.",

    contact_title: "무료 상담 문의",
    contact_subtitle:
      "간단히 남겨주시면 1~2영업일 내 회신드리겠습니다. (긴급 건은 메시지에 표시해 주세요)",
    field_company: "회사명",
    field_name: "담당자",
    field_email: "이메일",
    field_phone: "연락처",
    field_message: "문의 내용",
    contact_submit: "메일로 문의 보내기",
    contact_hint:
      "메일 수신 주소는 `contact@example.com`을 실제 주소로 변경해 주세요.",
    contact_side_t: "상담 전 준비하면 좋은 정보",
    prep_1: "사업 개요(업종/거래 구조/판매 방식)",
    prep_2: "진출 형태(법인/지점), 희망 일정",
    prep_3: "대표/파견 인력의 비자 필요 여부",
    prep_4: "사무실 필요 여부(지역/규모)",
    prep_5: "예상 매출, 직원 수, 회계 처리 방식",
    disclaimer_t: "면책/유의사항",
    disclaimer_d:
      "본 페이지의 정보는 일반적 안내이며, 개별 사안에 대한 자문/보증을 의미하지 않습니다. 정확한 판단은 상담을 통해 진행합니다.",
    footer_line_1: "일본 진출 원스톱 지원",
    footer_line_2: "법인설립/등기/비자/세무·회계/노무",
  },

  ja: {
    hero_eyebrow: "韓国企業の日本進出、韓国語で最後まで",
    hero_title: "日本法人設立から運営まで\nワンストップで支援します",
    hero_lead:
      "定款作成・登記・税務署届出・ビザ・口座開設・会計/税務・労務まで。金明国CPAと司法書士/行政書士カネムラがチームで支援します。",
    hero_cta_primary: "無料相談はこちら",
    hero_cta_secondary: "支援範囲を見る",
    trust_1: "韓国語相談・書類案内",
    trust_2: "設立/登記/ビザ/税務・労務連携",
    trust_3: "日本ビジネス実務中心",
    hero_card_title: "主な支援",
    hero_card_note:
      "設立前後の手続きを一つのチームで設計し、手戻りと税務リスクを減らします。",
    hero_card_link: "進行フローを見る →",
    chip_1: "法人設立",
    chip_2: "登記(司法書士)",
    chip_3: "ビザ(行政書士)",
    chip_4: "口座開設",
    chip_5: "税務・会計",
    chip_6: "人事・労務",
    chip_7: "不動産",

    services_title: "このような企業におすすめです",
    services_subtitle:
      "日本進出は「設立」より「運営」のほうが難しいです。設立から運営体制まで一緒に作ります。",
    recommend_title: "おすすめ対象",
    rec_1: "現地法人設立手続きが複雑に感じられる場合",
    rec_2: "登記・ビザ・税務・会計・労務を総合支援してほしい場合",
    rec_3: "相談から進行まで韓国語で対応してほしい場合",
    rec_4: "日本ビジネス環境に精通したコンサルティングが必要な場合",
    rec_5: "税務リスクを減らし、安定運営を目指したい場合",

    scope_title: "支援範囲",
    svc_1_t: "法人設立",
    svc_1_d: "設立コンサル、定款作成/認証、法人印鑑など",
    svc_2_t: "登記(司法書士)",
    svc_2_d: "設立登記および変更登記などの手続き支援",
    svc_3_t: "ビザ(行政書士)",
    svc_3_d: "就労ビザ、経営・管理ビザなど",
    svc_4_t: "口座開設",
    svc_4_d: "必要書類案内、準備/提出支援、審査対応",
    svc_5_t: "税務・会計",
    svc_5_d: "記帳、申告、税務相談、国際税務リスク確認",
    svc_6_t: "人事・労務",
    svc_6_d: "社会保険、給与計算、就業規則など",
    scope_note:
      "必要に応じて不動産仲介(事務所/店舗/投資用)もパートナーネットワークで連携します。",

    flow_title: "韓国企業の日本進出フロー",
    flow_subtitle:
      "代表的な進行例です。状況に応じてスケジュールと業務範囲を調整します。",
    flow_1_t: "相談 → 法人設立(約2ヶ月)",
    flow_1_d: "チェックリスト整理、定款作成/認証、登記申請",
    flow_2_t: "不動産検討および紹介",
    flow_2_d: "事務所/店舗相談、物件検討および仲介 (STEP 1と並行可能)",
    flow_3_t: "法人口座開設支援(約1.5ヶ月)",
    flow_3_d: "書類案内、準備/提出支援、銀行審査対応",
    flow_4_t: "税務・会計顧問 + 労務体制構築",
    flow_4_d: "税務申告、記帳、社会保険、給与、就業規則など運営基盤の定着",
    flow_callout_t: "ワンストップの強み",
    flow_callout_d:
      "登記・ビザ・税務・労務が別々に動くと、遅延とリスクが大きくなります。一つのチームで「設立後」まで逆算して準備します。",

    pricing_title: "料金目安(例)",
    pricing_subtitle:
      "以下は参考例です(税抜)。業務範囲・設立形態・資本金規模により変動します。",
    price_1_t: "法人設立",
    price_1_p: "約45万円〜",
    price_1_d: "税金および司法書士設立報酬を含む(状況により変動)",
    price_2_t: "設立関連業務(韓国語支援/口座開設支援など)",
    price_2_p: "20万円〜",
    price_2_d: "設立後の税務署提出書類は顧問契約範囲に含まれる場合があります。",
    price_3_t: "ビザ発給",
    price_3_p: "相談後案内",
    price_3_d: "在留資格の種類/難易度により異なる",
    price_4_t: "会計・税務顧問",
    price_4_p: "月7万円〜",
    price_4_d: "税務申告報酬30万円〜 (翻訳/韓国語対応は別途)",
    price_5_t: "人事・労務",
    price_5_p: "12万円〜",
    price_5_d:
      "社会保険新規適用12万円〜、給与計算1万円 + 2千円/1人、就業規則30万円〜",
    pricing_note:
      "銀行審査基準により口座開設が不可となる場合があります。正確な見積は相談後に提示いたします。",

    faq_title: "よくある質問",
    faq_1_q: "非居住者(日本非居住)でも会社を設立できますか？",
    faq_1_a:
      "一般的に、代表者が日本非居住者でも法人設立手続きは可能です。ただし、支店設立の場合は日本居住責任者が必要な場合があります。",
    faq_2_q: "資本金は多いほど良いですか？",
    faq_2_a:
      "資本金規模によって消費税免税可否や課税方式が変わる場合があります。事業モデルと初期投資計画を踏まえ適正資本金を設計します。",
    faq_3_q: "会社設立後にはどんな手続きが必要ですか？",
    faq_3_a:
      "税務署・自治体への届出、社会保険/労働保険手続き等が必要で、期限管理が重要です。従業員採用時には労働関連届出も発生します。",
    faq_4_q: "韓国本社から仕入れ、日本子会社が販売する際の注意点は？",
    faq_4_a:
      "移転価格(Transfer Pricing)リスクを確認する必要があります。取引条件と価格算定根拠を整備することが重要です。",

    experts_title: "専門家紹介",
    experts_subtitle:
      "各分野の有資格者が一つのチームとして動き、スケジュールと品質を同時に確保します。",
    expert_1_name: "金明国 CPA",
    expert_1_role: "公認会計士(CPA) · 税務/会計 · 国際税務",
    expert_1_b1: "日本進出ストラクチャー設計(設立/運営/税務リスク)",
    expert_1_b2: "記帳・決算・法人税/消費税等の税務申告",
    expert_1_b3: "韓日取引(移転価格等)イシュー確認",
    expert_2_name: "カネムラ 司法書士 · 行政書士",
    expert_2_role: "司法書士(登記) · 行政書士(ビザ/許認可)",
    expert_2_b1: "定款/登記書類作成および設立登記",
    expert_2_b2: "ビザ(就労/経営・管理)申請書類準備",
    expert_2_b3: "各種行政手続き、許認可/届出対応",
    experts_note:
      "実際の資格・登録情報、事務所住所/連絡先、個人情報保護方針は運営情報に合わせて記載してください。",

    contact_title: "無料相談お問い合わせ",
    contact_subtitle:
      "簡単に内容を残していただければ、1〜2営業日以内にご返信します。(緊急案件はメッセージにご記載ください)",
    field_company: "会社名",
    field_name: "担当者",
    field_email: "メール",
    field_phone: "連絡先",
    field_message: "お問い合わせ内容",
    contact_submit: "メールで問い合わせる",
    contact_hint:
      "送信先メールアドレス `contact@example.com` は実際のアドレスに変更してください。",
    contact_side_t: "相談前に準備すると良い情報",
    prep_1: "事業概要(業種/取引構造/販売方式)",
    prep_2: "進出形態(法人/支店)、希望時期",
    prep_3: "代表/派遣人員のビザ必要有無",
    prep_4: "事務所必要有無(地域/規模)",
    prep_5: "予想売上、従業員数、会計処理方式",
    disclaimer_t: "免責/注意事項",
    disclaimer_d:
      "本ページの情報は一般的な案内であり、個別案件に対する助言/保証を意味しません。正確な判断はご相談を通じて行います。",
    footer_line_1: "日本進出ワンストップ支援",
    footer_line_2: "法人設立/登記/ビザ/税務・会計/労務",
  },
};

export default function MainPage() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "ko");
  const [menuOpen, setMenuOpen] = useState(false);
  const [elevated, setElevated] = useState(false);

  const t = I18N[lang] || I18N.ko;
  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  const chips = [
    t.chip_1,
    t.chip_2,
    t.chip_3,
    t.chip_4,
    t.chip_5,
    t.chip_6,
    t.chip_7,
  ];

  const recommendList = [t.rec_1, t.rec_2, t.rec_3, t.rec_4, t.rec_5];

  const serviceList = [
    { title: t.svc_1_t, desc: t.svc_1_d },
    { title: t.svc_2_t, desc: t.svc_2_d },
    { title: t.svc_3_t, desc: t.svc_3_d },
    { title: t.svc_4_t, desc: t.svc_4_d },
    { title: t.svc_5_t, desc: t.svc_5_d },
    { title: t.svc_6_t, desc: t.svc_6_d },
  ];

  const pricingList = [
    { title: t.price_1_t, price: t.price_1_p, desc: t.price_1_d },
    { title: t.price_2_t, price: t.price_2_p, desc: t.price_2_d },
    { title: t.price_3_t, price: t.price_3_p, desc: t.price_3_d },
    { title: t.price_4_t, price: t.price_4_p, desc: t.price_4_d },
    { title: t.price_5_t, price: t.price_5_p, desc: t.price_5_d },
  ];

  const faqList = [
    { q: t.faq_1_q, a: t.faq_1_a },
    { q: t.faq_2_q, a: t.faq_2_a },
    { q: t.faq_3_q, a: t.faq_3_a },
    { q: t.faq_4_q, a: t.faq_4_a },
  ];

  return (
    <div className="App">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>

      <header
        className="site-header"
        data-elevate={elevated ? "true" : "false"}
      >
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="홈으로">
            <span className="brand-mark" aria-hidden="true">
              KK
            </span>
            <span className="brand-text">
              <span className="brand-title">일본</span>
              <span className="brand-sub">
                Kim Myung-gu CPA · Kanemura Judicial/Administrative Scrivener
              </span>
            </span>
          </a>

          <nav aria-label="주요 메뉴">
            <ul>
              <li>
                <a href="#services">서비스</a>
              </li>
              <li>
                <a href="#flow">업무 흐름</a>
              </li>
              <li>
                <a href="#pricing">견적 요금</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <Link to="/hearing-sheet" className="btn nav-cta">
                  히어링시트
                </Link>
              </li>
              <li>
                <a href="#contact" className="btn primary nav-cta">
                  상담 신청(챗봇)
                </a>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <button
              className="lang-toggle"
              type="button"
              aria-label="언어 전환"
              onClick={() => setLang((prev) => (prev === "ko" ? "ja" : "ko"))}
            >
              <span className="pill" data-lang="ko" aria-hidden="true">
                KO
              </span>
              <span className="pill" data-lang="ja" aria-hidden="true">
                JA
              </span>
            </button>

            <button
              className="menu-toggle"
              type="button"
              aria-label="모바일 메뉴 열기"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-nav">
            <div className="container mobile-nav-inner">
              <a href="#services" onClick={() => setMenuOpen(false)}>
                서비스
              </a>
              <a href="#flow" onClick={() => setMenuOpen(false)}>
                진행 흐름
              </a>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>
                요금
              </a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>
                FAQ
              </a>
              <a href="#experts" onClick={() => setMenuOpen(false)}>
                전문가
              </a>
              <Link
                className="nav-cta"
                to="/hearing-sheet"
                onClick={() => setMenuOpen(false)}
              >
                히어링시트
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        <section id="top" className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">{t.hero_eyebrow}</p>
              <h1 className="hero-title">
                {t.hero_title.split("\n").map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < t.hero_title.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h1>
              <p className="hero-lead">{t.hero_lead}</p>

              <div className="hero-actions">
                <a className="btn primary" href="#contact">
                  {t.hero_cta_primary}
                </a>
                <a className="btn ghost" href="#services">
                  {t.hero_cta_secondary}
                </a>
              </div>

              <ul className="trust">
                <li>{t.trust_1}</li>
                <li>{t.trust_2}</li>
                <li>{t.trust_3}</li>
              </ul>
            </div>

            <div className="hero-card" aria-label="핵심 지원 항목">
              <div className="card">
                <h2 className="card-title">{t.hero_card_title}</h2>
                <div className="chips">
                  {chips.map((chip) => (
                    <span className="chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="card-note">
                  <p className="muted">{t.hero_card_note}</p>
                </div>
                <a className="card-link" href="#flow">
                  {t.hero_card_link}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <header className="section-head">
              <h2>{t.services_title}</h2>
              <p className="muted">{t.services_subtitle}</p>
            </header>

            <div className="grid two">
              <div className="panel">
                <h3>{t.recommend_title}</h3>
                <ul className="bullets">
                  {recommendList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <h3>{t.scope_title}</h3>
                <div className="service-grid">
                  {serviceList.map((item) => (
                    <div className="service" key={item.title}>
                      <h4>{item.title}</h4>
                      <p className="muted">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="muted small">{t.scope_note}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section alt" id="flow">
          <div className="container">
            <header className="section-head">
              <h2>{t.flow_title}</h2>
              <p className="muted">{t.flow_subtitle}</p>
            </header>

            <ol className="steps">
              <li className="step">
                <div className="step-badge">STEP 1</div>
                <h3>{t.flow_1_t}</h3>
                <p className="muted">{t.flow_1_d}</p>
              </li>
              <li className="step">
                <div className="step-badge">STEP 2</div>
                <h3>{t.flow_2_t}</h3>
                <p className="muted">{t.flow_2_d}</p>
              </li>
              <li className="step">
                <div className="step-badge">STEP 3</div>
                <h3>{t.flow_3_t}</h3>
                <p className="muted">{t.flow_3_d}</p>
              </li>
              <li className="step">
                <div className="step-badge">STEP 4</div>
                <h3>{t.flow_4_t}</h3>
                <p className="muted">{t.flow_4_d}</p>
              </li>
            </ol>

            <div className="callout">
              <h3>{t.flow_callout_t}</h3>
              <p className="muted">{t.flow_callout_d}</p>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="container">
            <header className="section-head">
              <h2>{t.pricing_title}</h2>
              <p className="muted">{t.pricing_subtitle}</p>
            </header>

            <div className="pricing-grid">
              {pricingList.map((item) => (
                <div className="price-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p className="price">{item.price}</p>
                  <p className="muted">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="muted small">{t.pricing_note}</p>
          </div>
        </section>

        <section className="section alt" id="faq">
          <div className="container">
            <header className="section-head">
              <h2>{t.faq_title}</h2>
            </header>

            <div className="faq">
              {faqList.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p className="muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="experts">
          <div className="container">
            <header className="section-head">
              <h2>{t.experts_title}</h2>
              <p className="muted">{t.experts_subtitle}</p>
            </header>

            <div className="grid two">
              <article className="profile">
                <div className="avatar" aria-hidden="true">
                  K
                </div>
                <div className="profile-body">
                  <h3>{t.expert_1_name}</h3>
                  <p className="role">{t.expert_1_role}</p>
                  <ul className="bullets compact">
                    <li>{t.expert_1_b1}</li>
                    <li>{t.expert_1_b2}</li>
                    <li>{t.expert_1_b3}</li>
                  </ul>
                </div>
              </article>

              <article className="profile">
                <div className="avatar" aria-hidden="true">
                  G
                </div>
                <div className="profile-body">
                  <h3>{t.expert_2_name}</h3>
                  <p className="role">{t.expert_2_role}</p>
                  <ul className="bullets compact">
                    <li>{t.expert_2_b1}</li>
                    <li>{t.expert_2_b2}</li>
                    <li>{t.expert_2_b3}</li>
                  </ul>
                </div>
              </article>
            </div>

            <div className="note" role="note">
              <p className="muted small">{t.experts_note}</p>
            </div>
          </div>
        </section>

        <section className="section alt" id="contact">
          <div className="container">
            <header className="section-head">
              <h2>{t.contact_title}</h2>
              <p className="muted">{t.contact_subtitle}</p>
            </header>

            <div className="grid two">
              <form
                className="contact-form"
                action="mailto:contact@example.com"
                method="post"
                encType="text/plain"
              >
                <label>
                  <span>{t.field_company}</span>
                  <input name="company" autoComplete="organization" />
                </label>
                <label>
                  <span>{t.field_name}</span>
                  <input name="name" autoComplete="name" required />
                </label>
                <label>
                  <span>{t.field_email}</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  <span>{t.field_phone}</span>
                  <input name="phone" autoComplete="tel" />
                </label>
                <label className="full">
                  <span>{t.field_message}</span>
                  <textarea
                    name="message"
                    rows="6"
                    required
                    placeholder="예: 설립 형태(자회사/지점), 일정, 예상 매출/인원, 비자 필요 여부 등"
                  />
                </label>

                <div className="form-actions">
                  <button className="btn primary" type="submit">
                    {t.contact_submit}
                  </button>
                  <p className="muted small">{t.contact_hint}</p>
                </div>
              </form>

              <aside className="contact-side">
                <div className="panel">
                  <h3>{t.contact_side_t}</h3>
                  <ul className="bullets">
                    <li>{t.prep_1}</li>
                    <li>{t.prep_2}</li>
                    <li>{t.prep_3}</li>
                    <li>{t.prep_4}</li>
                    <li>{t.prep_5}</li>
                  </ul>
                </div>

                <div className="panel subtle">
                  <h3>{t.disclaimer_t}</h3>
                  <p className="muted small">{t.disclaimer_d}</p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">Kim Myung-guk CPA · Kanemura</div>
            <div className="muted small">
              <span>{t.footer_line_1}</span>
              <span className="dot" aria-hidden="true">
                ·
              </span>
              <span>{t.footer_line_2}</span>
            </div>
          </div>
          <div className="muted small">
            <span>© {year} Japan Expansion Desk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
