{
  /* Hearing Sheet */
}
<section id="hearing">
  <div className="container">
    <div className="kicker">Hearing Sheet</div>
    <h2 className="section-title">히어링 시트</h2>

    <div className="grid">
      <div className="card">
        <h3>간단 입력</h3>
        <p className="muted">
          아래 내용만 입력해도 1차 로드맵을 잡을 수 있어요.
        </p>

        <form id="hearingForm">
          <div className="form-grid">
            <input
              className="btn input-like"
              name="company"
              placeholder="회사명"
              required
            />
            <input
              className="btn input-like"
              name="contact"
              placeholder="담당자 / 연락처(메일 or 전화)"
              required
            />
            <input
              className="btn input-like"
              name="goal"
              placeholder="일본 진출 목적(예: 판매, 지사, 채용 등)"
              required
            />
            <button className="btn primary" type="submit">
              챗봇으로 전달
            </button>
          </div>
        </form>

        <p className="notice">* 제출 시 자동으로 챗봇에 내용이 전달됩니다.</p>
      </div>
    </div>
  </div>
</section>;
