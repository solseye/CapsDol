import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import image1 from "../../assets/image1.png";
import image3 from "../../assets/image3.png";
import "../../styles/home-visily-frame.css";

export default function HomeVisilyFrame({ isLoggedIn }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    if (!localStorage.getItem("accessToken")) {
      alert("AI 상담을 이용하려면 로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    navigate("/chat", { state: { initialQuery: query } });
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

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

  return (
    <div className="visily-home">
      <header className="visily-nav">
        <Link to="/" className="visily-brand" aria-label="WVA home">
          <span className="visily-brand-mark">◎</span>
          <span>
            <strong>WVA AI Consulting</strong>
            <small>일본 진출 운영 시스템</small>
          </span>
        </Link>

        <nav className="visily-nav-links" aria-label="Main navigation">
          <a href="#services">서비스</a>
          <a href="#method">진행 방식</a>
          <a href="#experts">전문가</a>
          <a href="#standards">신뢰 기준</a>
        </nav>

        <div className="visily-nav-actions">
          {isLoggedIn ? (
            <>
              {isAdmin ? (
                <Link to="/admin/calendar" className="visily-ghost-btn">
                  관리자 페이지
                </Link>
              ) : (
                <>
                  <Link to="/myreservations" className="visily-ghost-btn">
                    개인 페이지
                  </Link>
                  <Link to="/reservation" className="visily-ghost-btn">
                    상담 예약
                  </Link>
                </>
              )}
              <button
                type="button"
                className="visily-dark-btn"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="visily-ghost-btn">
                로그인
              </Link>
              <Link to="/signup" className="visily-dark-btn">
                시작하기
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="visily-hero">
        <div
          className="visily-hero-bg"
          style={{ backgroundImage: `url(${image3})` }}
          aria-hidden="true"
        />
        <div className="visily-hero-content">
          <p className="visily-badge">일본 진출을 위한 AI 업무 지원</p>
          <h1>
            일본 진출 준비를
            <span>AI와 전문가 상담으로 정리합니다</span>
          </h1>
          <p className="visily-hero-copy">
            WVA는 한국 기업이 일본 법인 설립, 세무·회계, 비자, 노무,
            정관 초안 작성, 전문가 상담 예약까지 한 흐름으로 준비할 수 있도록
            돕는 AI 컨설팅 플랫폼입니다.
          </p>

          <form className="visily-ai-search" onSubmit={handleSearch}>
            <span aria-hidden="true">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="일본 법인 설립, 세무, 비자, 정관 작성에 대해 질문해 보세요..."
            />
            <button type="submit">AI 상담</button>
          </form>

          <div className="visily-trust-row" aria-label="Trust indicators">
            <span>K</span>
            <span>T</span>
            <span>L</span>
            <p>일본 진출을 준비하는 기업을 위한 문서·상담 워크플로우</p>
          </div>
        </div>
      </section>

      <section id="services" className="visily-section">
        <div className="visily-section-head">
          <div>
            <h2>핵심 서비스</h2>
            <p>
              초기 질문부터 상담 자료 작성, 정관 초안, 전문가 검토까지
              일본 진출 준비 과정을 하나의 흐름으로 정리합니다.
            </p>
          </div>
          <a href="#method" className="visily-link-btn">
            진행 방식 보기 <span>→</span>
          </a>
        </div>

        <div className="visily-card-grid">
          {[
            {
              label: "AI 자동화",
              icon: "AI",
              title: "AI 기초 상담",
              body: "일본 법인 설립, 세무, 비자, 노무, 시장 진출 의사결정에 대해 AI 챗봇으로 먼저 질문합니다.",
              to: "/chat",
            },
            {
              label: "문서화",
              icon: "DOC",
              title: "히어링 시트·정관 초안",
              body: "회사명, 사업 목적, 자본금, 발기인, 이사 정보를 입력해 전문가 상담용 자료와 정관 초안을 준비합니다.",
              to: "/hearing-sheet",
            },
            {
              label: "전문가 검토",
              icon: "PRO",
              title: "전문가 상담 예약",
              body: "AI로 정리한 내용을 바탕으로 회계·세무·법무 전문가와 실제 상담 일정을 예약합니다.",
              to: "/reservation",
            },
          ].map((service) => (
            <Link to={service.to} className="visily-service-card" key={service.title}>
              <div className="visily-service-top">
                <span className="visily-service-icon">{service.icon}</span>
              <small>{service.label}</small>
              </div>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
              <strong>바로 이동 <span>→</span></strong>
            </Link>
          ))}
        </div>
      </section>

      <section id="pricing" className="visily-pricing-section">
        <div className="visily-pricing-head">
          <span>Transparent Pricing</span>
          <h2>진출 준비 단계에 맞춘 비용 구조</h2>
          <p>
            초기 정보 탐색은 부담 없이 시작하고, 문서 검토와 전문가 상담은
            필요한 범위에 따라 선택할 수 있도록 구성합니다.
          </p>
        </div>

        <div className="visily-pricing-grid">
          <article>
            <div className="visily-price-label">Start</div>
            <h3>AI 사전 상담</h3>
            <strong>무료</strong>
            <p>일본 법인 설립, 세무, 비자, 노무 관련 기초 질문을 먼저 정리합니다.</p>
            <ul>
              <li>RAG 기반 AI 답변</li>
              <li>기초 진출 질문 정리</li>
              <li>히어링 시트 작성 전 가이드</li>
            </ul>
            <Link to="/chat">AI 상담 시작</Link>
          </article>

          <article className="featured">
            <div className="visily-price-label">Core</div>
            <h3>문서 초안 패키지</h3>
            <strong>프로젝트별 안내</strong>
            <p>히어링 시트 입력값을 바탕으로 정관 초안과 상담용 기초 자료를 준비합니다.</p>
            <ul>
              <li>히어링 시트 구조화</li>
              <li>정관 초안 미리보기</li>
              <li>PDF 저장/인쇄 흐름</li>
            </ul>
            <Link to="/hearing-sheet">히어링 시트 작성</Link>
          </article>

          <article>
            <div className="visily-price-label">Expert</div>
            <h3>전문가 상담</h3>
            <strong>상담 범위별 견적</strong>
            <p>법무, 세무, 회계, 노무, 비자 등 실제 판단이 필요한 내용을 전문가와 검토합니다.</p>
            <ul>
              <li>분야별 전문가 연결</li>
              <li>문서 검토 범위 협의</li>
              <li>상담 후 후속 업무 안내</li>
            </ul>
            <Link to="/reservation">상담 예약</Link>
          </article>
        </div>

        <p className="visily-pricing-note">
          실제 비용은 기업의 설립 형태, 문서 검토 범위, 전문가 상담 분야에 따라
          달라질 수 있습니다.
        </p>
      </section>

      <section id="method" className="visily-process-section">
        <div className="visily-process-head">
          <h2>일본 시장으로 이어지는 준비 흐름</h2>
          <p>
            WVA는 흩어진 일본 진출 준비 과정을 단계별 워크플로우로 바꿉니다.
            기업 정보를 정리하고, 문서 초안을 만들고, 전문가 검토로 최종 방향을
            구체화합니다.
          </p>
        </div>

        <div className="visily-process-banner">
          <img src={image1} alt="일본 시장 진출 이미지" />
          <div className="visily-art-label">Japan Gateway</div>
        </div>

        <div className="visily-process-flow">
          <article className="visily-process-card">
            <div className="visily-process-top">
              <span className="visily-step-number">01</span>
              <strong>DOC</strong>
            </div>
            <h3>정보 수집</h3>
            <p>
              히어링 시트를 작성해 회사 구조, 사업 목적, 설립 조건, 상담 목표를
              정리합니다. 진출의 첫 걸음인 기본 정보를 체계적으로 구조화합니다.
            </p>
          </article>

          <article className="visily-process-card">
            <div className="visily-process-top">
              <span className="visily-step-number">02</span>
              <strong>AI</strong>
            </div>
            <h3>문서 초안 생성</h3>
            <p>
              입력한 내용을 바탕으로 정관 초안을 확인하고, 반영된 정보를 문서
              안에서 명확히 검토합니다. 반복 작성과 누락을 줄이는 단계입니다.
            </p>
          </article>

          <article className="visily-process-card">
            <div className="visily-process-top">
              <span className="visily-step-number">03</span>
              <strong>PRO</strong>
            </div>
            <h3>전문가 검토</h3>
            <p>
              상담 예약을 통해 법무, 세무, 회계, 비자, 노무 관련 판단을 전문가와
              함께 점검합니다. 최종 비즈니스 정합성을 확보합니다.
            </p>
          </article>
        </div>

        <div className="visily-process-cta">
          <Link to="/hearing-sheet" className="visily-green-btn">
            히어링 시트 작성하기 <span>›</span>
          </Link>
        </div>

        <div className="visily-process-insights">
          <article>
            <span>✓</span>
            <div>
              <p>문서 준비</p>
              <strong>정관 초안</strong>
            </div>
          </article>
          <article>
            <span>⏱</span>
            <div>
              <p>평균 작성</p>
              <strong>15분 내외</strong>
            </div>
          </article>
          <article>
            <span>👥</span>
            <div>
              <p>전문가 연결</p>
              <strong>법무·세무</strong>
            </div>
          </article>
          <article>
            <span>●</span>
            <div>
              <p>검토 상태</p>
              <strong>상담 예약</strong>
            </div>
          </article>
        </div>
      </section>

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

      <section id="standards" className="visily-section visily-standards">
        <div className="visily-centered-head">
          <h2>신뢰 가능한 업무 기준</h2>
          <p>문서, 상담, 다국어 지원, 예약 흐름을 실제 서비스 기준으로 정리합니다.</p>
        </div>

        <div className="visily-metric-grid">
          {[
            ["문서 중심 준비", "법인 설립과 상담에 필요한 기업 정보를 구조화합니다."],
            ["KO / EN / JA", "한국어, 영어, 일본어 사용자를 고려한 다국어 흐름을 지원합니다."],
            ["상담 전 정리", "전문가를 만나기 전 필요한 질문과 자료를 먼저 준비합니다."],
            ["워크플로우 연결", "AI 질문, 히어링 시트, 정관 초안, 상담 예약을 연결합니다."],
          ].map(([title, body]) => (
            <article className="visily-metric-card" key={title}>
              <small>WVA 기준</small>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="visily-cta">
        <h2>일본 진출 준비를 시작해볼까요?</h2>
        <p>
          AI 상담으로 질문을 정리하고, 히어링 시트로 자료를 만들고,
          전문가 상담으로 실제 실행 방향을 점검하세요.
        </p>
        <div>
          <Link to="/signup" className="visily-green-btn">
            계정 만들기
          </Link>
          <Link to="/reservation" className="visily-outline-btn">
            전문가 상담 예약
          </Link>
        </div>
      </section>

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
