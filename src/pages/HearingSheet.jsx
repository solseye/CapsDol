import { Link } from "react-router-dom";
import "../App.css";

export default function HearingSheet() {
  return (
    <div className="App">
      <main className="hs-page">
        <div className="container hs-container">
          <div className="hs-head">
            <div>
              <div className="kicker">Hearing Sheet</div>
              <h1 className="section-title hs-title">히어링 시트</h1>
              <p className="section-desc hs-intro">
                상담 전 필요한 기본 정보를 미리 작성해 주세요.
              </p>
            </div>

            <Link to="/" className="btn">
              메인으로 돌아가기
            </Link>
          </div>

          <form className="hs-form">
            <section className="hs-block">
              <h2 className="hs-block-title">기본 정보</h2>
              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">회사명</label>
                  <input
                    className="hs-input"
                    placeholder="회사명을 입력하세요"
                  />
                </div>
                <div className="hs-field">
                  <label className="hs-label">영문 회사명</label>
                  <input
                    className="hs-input"
                    placeholder="영문 회사명을 입력하세요"
                  />
                </div>
                <div className="hs-field">
                  <label className="hs-label">담당자명</label>
                  <input
                    className="hs-input"
                    placeholder="담당자명을 입력하세요"
                  />
                </div>
                <div className="hs-field">
                  <label className="hs-label">연락처</label>
                  <input
                    className="hs-input"
                    placeholder="연락처를 입력하세요"
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">설립 목적 및 개요</h2>
              <div className="hs-grid">
                <div className="hs-field">
                  <label className="hs-label">설립 목적</label>
                  <textarea
                    className="hs-textarea"
                    placeholder="법인 설립 목적과 배경을 작성해 주세요"
                  />
                </div>
                <div className="hs-field">
                  <label className="hs-label">사업 개요</label>
                  <textarea
                    className="hs-textarea"
                    placeholder="예정 사업 내용과 주요 활동을 작성해 주세요"
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">자본금 및 은행 정보</h2>
              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">자본금</label>
                  <input className="hs-input" placeholder="예: 500만 엔" />
                </div>
                <div className="hs-field">
                  <label className="hs-label">희망 은행</label>
                  <input
                    className="hs-input"
                    placeholder="희망 은행명을 입력하세요"
                  />
                </div>
                <div className="hs-field">
                  <label className="hs-label">지점명</label>
                  <input
                    className="hs-input"
                    placeholder="희망 지점명을 입력하세요"
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">발기인 정보</h2>

              <div className="hs-subcard">
                <div className="hs-subtitle">발기인 1</div>
                <div className="hs-grid2">
                  <div className="hs-field">
                    <label className="hs-label">주소</label>
                    <input
                      className="hs-input"
                      placeholder="주소를 입력하세요"
                    />
                  </div>
                  <div className="hs-field">
                    <label className="hs-label">성명</label>
                    <input
                      className="hs-input"
                      placeholder="성명을 입력하세요"
                    />
                  </div>
                  <div className="hs-field">
                    <label className="hs-label">출자금액</label>
                    <input
                      className="hs-input"
                      placeholder="출자금액을 입력하세요"
                    />
                  </div>
                </div>
              </div>

              <div className="hs-subcard">
                <div className="hs-subtitle">발기인 2</div>
                <div className="hs-grid2">
                  <div className="hs-field">
                    <label className="hs-label">주소</label>
                    <input
                      className="hs-input"
                      placeholder="주소를 입력하세요"
                    />
                  </div>
                  <div className="hs-field">
                    <label className="hs-label">성명</label>
                    <input
                      className="hs-input"
                      placeholder="성명을 입력하세요"
                    />
                  </div>
                  <div className="hs-field">
                    <label className="hs-label">출자금액</label>
                    <input
                      className="hs-input"
                      placeholder="출자금액을 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">이사 정보</h2>

              <div className="hs-subcard">
                <div className="hs-subtitle">이사 1</div>
                <div className="hs-grid2">
                  <div className="hs-field">
                    <label className="hs-label">주소</label>
                    <input
                      className="hs-input"
                      placeholder="주소를 입력하세요"
                    />
                  </div>
                  <div className="hs-field">
                    <label className="hs-label">성명</label>
                    <input
                      className="hs-input"
                      placeholder="성명을 입력하세요"
                    />
                  </div>
                  <div className="hs-field">
                    <label className="hs-label">영문명</label>
                    <input
                      className="hs-input"
                      placeholder="영문명을 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">추가 정보</h2>
              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">대표이사</label>
                  <input
                    className="hs-input"
                    placeholder="대표이사를 입력하세요"
                  />
                </div>
                <div className="hs-field">
                  <label className="hs-label">이사 임기</label>
                  <input className="hs-input" placeholder="예: 2년" />
                </div>
              </div>
            </section>

            <div className="hs-actions">
              <button type="button" className="btn">
                임시 저장
              </button>
              <Link to="/reservation" className="btn primary nav-cta">
                상담 예약페이지로 이동
              </Link>
              <button type="submit" className="btn primary">
                제출하기
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
