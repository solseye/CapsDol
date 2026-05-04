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
                법인 설립에 필요한 정보를 입력해 주세요.
              </p>
            </div>

            <Link to="/" className="btn">
              메인으로 돌아가기
            </Link>
          </div>

          <form className="hs-form">
            {/* 1. 상호 */}
            <section className="hs-block">
              <h2 className="hs-block-title">1. 상호</h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">상호</label>
                  <input
                    className="hs-input"
                    placeholder="회사명을 입력하세요"
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">영문 표기 선택</label>
                  <input
                    className="hs-input"
                    placeholder="영문 회사명을 입력하세요"
                  />
                </div>
              </div>
            </section>

            {/* 2. 사업 목적 */}
            <section className="hs-block">
              <h2 className="hs-block-title">2. 사업 목적</h2>

              <div className="hs-grid">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div className="hs-field" key={num}>
                    <label className="hs-label">사업 목적 {num}</label>
                    <input
                      className="hs-input"
                      placeholder={`${num}. 사업 목적을 입력하세요`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 3. 자본금 */}
            <section className="hs-block">
              <h2 className="hs-block-title">3. 자본금</h2>

              <div className="hs-field">
                <label className="hs-label">자본금</label>
                <input className="hs-input" placeholder="예: 5,000,000엔" />
              </div>
            </section>

            {/* 4. 자본금 납입 은행 */}
            <section className="hs-block">
              <h2 className="hs-block-title">4. 자본금 납입 은행</h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">은행명</label>
                  <input
                    className="hs-input"
                    placeholder="은행명을 입력하세요"
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">지점명</label>
                  <input
                    className="hs-input"
                    placeholder="지점명을 입력하세요"
                  />
                </div>
              </div>
            </section>

            {/* 5. 발기인 */}
            <section className="hs-block">
              <h2 className="hs-block-title">5. 발기인 / 출자자</h2>

              {[1, 2].map((num) => (
                <div className="hs-subcard" key={num}>
                  <div className="hs-subtitle">발기인 {num}</div>

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
                      <label className="hs-label">출자 금액</label>
                      <input
                        className="hs-input"
                        placeholder="예: 2,500,000엔"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* 6. 이사 */}
            <section className="hs-block">
              <h2 className="hs-block-title">6. 이사</h2>
              <p className="hs-note">
                성명은 로마자 병기를 함께 입력해 주세요.
              </p>

              {[1, 2].map((num) => (
                <div className="hs-subcard" key={num}>
                  <div className="hs-subtitle">이사 {num}</div>

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
                        placeholder="예: 홍길동 / HONG GILDONG"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* 7. 대표이사 */}
            <section className="hs-block">
              <h2 className="hs-block-title">7. 대표이사</h2>

              <div className="hs-field">
                <label className="hs-label">대표이사 성명</label>
                <input
                  className="hs-input"
                  placeholder="대표이사 성명을 입력하세요"
                />
              </div>
            </section>

            {/* 8. 이사의 임기 */}
            <section className="hs-block">
              <h2 className="hs-block-title">8. 이사의 임기</h2>

              <div className="hs-field">
                <label className="hs-label">이사의 임기</label>
                <input
                  className="hs-input"
                  placeholder="1년 이상 10년 이하에서 입력하세요"
                />
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
