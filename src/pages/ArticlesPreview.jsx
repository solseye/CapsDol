import { Link, useLocation } from "react-router-dom";
import "../App.css";

export default function ArticlesPreview() {
  const location = useLocation();
  const articlesData = location.state?.articlesData;

  if (!articlesData) {
    return (
      <div className="App">
        <main className="hs-page">
          <div className="container hs-container">
            <h1 className="section-title">정관 확인</h1>
            <p className="section-desc">
              표시할 정관 데이터가 없습니다. 히어링 시트를 먼저 작성해 주세요.
            </p>

            <Link to="/hearing-sheet" className="btn primary">
              히어링 시트로 이동
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <main className="hs-page">
        <div className="container hs-container">
          <div className="hs-head">
            <div>
              <div className="kicker">Articles Preview</div>
              <h1 className="section-title hs-title">정관 확인</h1>
              <p className="section-desc hs-intro">
                히어링 시트 내용을 바탕으로 채워진 정관입니다. 입력 정보가
                맞는지 확인해 주세요.
              </p>
            </div>

            <Link to="/hearing-sheet" className="btn">
              히어링 시트 수정하기
            </Link>
          </div>

          <section className="hs-block articles-preview-block">
            <pre className="articles-content">{articlesData.content}</pre>
          </section>

          <div className="hs-actions">
            <Link to="/reservation" className="btn primary">
              내용 확인 후 상담 예약
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
