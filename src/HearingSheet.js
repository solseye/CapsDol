import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

const initialForm = {
  companyName: "",
  companyNameEn: "",
  purposes: ["", "", "", "", "", ""],
  capital: "",
  bankName: "",
  bankBranch: "",
  founders: [
    { address: "", name: "", investment: "" },
    { address: "", name: "", investment: "" },
  ],
  directors: [
    { address: "", name: "", romanized: "" },
    { address: "", name: "", romanized: "" },
  ],
  representativeDirector: "",
  directorTerm: "",
};

export default function HearingSheet() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePurposeChange = (index, value) => {
    setForm((prev) => {
      const next = [...prev.purposes];
      next[index] = value;
      return { ...prev, purposes: next };
    });
  };

  const handleFounderChange = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.founders];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, founders: next };
    });
  };

  const handleDirectorChange = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.directors];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, directors: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("hearing sheet submitted:", form);
    alert("히어링 시트가 제출되었습니다.");
  };

  const handleReset = () => {
    setForm(initialForm);
  };

  return (
    <div className="App">
      <main style={{ minHeight: "100vh", padding: "72px 0 80px" }}>
        <section style={{ padding: 0, borderBottom: 0 }}>
          <div className="container" style={{ maxWidth: "980px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
              <div>
                <div className="kicker">Hearing Sheet</div>
                <h1
                  className="section-title"
                  style={{ fontSize: "32px", marginBottom: 0 }}
                >
                  일본 현지 법인 설립 히어링 시트
                </h1>
              </div>

              <Link to="/" className="btn">
                메인으로 돌아가기
              </Link>
            </div>

            <div className="card" style={{ marginBottom: "18px" }}>
              <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
                일본 현지 법인 설립 상담을 위한 기본 정보를 입력해 주세요.
                입력된 내용은 상담 및 설립 절차 검토 용도로 사용됩니다.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "18px" }}
            >
              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>1. 상호</h2>
                <div style={grid2Style}>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>상호</span>
                    <input
                      style={inputStyle}
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="회사명을 입력해 주세요"
                    />
                  </label>

                  <label style={fieldStyle}>
                    <span style={labelStyle}>영문 표기</span>
                    <input
                      style={inputStyle}
                      type="text"
                      name="companyNameEn"
                      value={form.companyNameEn}
                      onChange={handleChange}
                      placeholder="영문 회사명을 입력해 주세요"
                    />
                  </label>
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>2. 사업 목적</h2>
                <div style={{ display: "grid", gap: "12px" }}>
                  {form.purposes.map((value, index) => (
                    <label style={fieldStyle} key={index}>
                      <span style={labelStyle}>사업 목적 {index + 1}</span>
                      <input
                        style={inputStyle}
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handlePurposeChange(index, e.target.value)
                        }
                        placeholder="사업 목적을 입력해 주세요"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>3. 자본금</h2>
                <div style={grid2Style}>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>자본금 금액</span>
                    <input
                      style={inputStyle}
                      type="text"
                      name="capital"
                      value={form.capital}
                      onChange={handleChange}
                      placeholder="금액을 입력해 주세요"
                    />
                  </label>

                  <label style={fieldStyle}>
                    <span style={labelStyle}>통화</span>
                    <input style={inputStyle} type="text" value="엔" readOnly />
                  </label>
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>4. 자본금 납입 은행</h2>
                <div style={grid2Style}>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>은행명</span>
                    <input
                      style={inputStyle}
                      type="text"
                      name="bankName"
                      value={form.bankName}
                      onChange={handleChange}
                      placeholder="은행명을 입력해 주세요"
                    />
                  </label>

                  <label style={fieldStyle}>
                    <span style={labelStyle}>지점명</span>
                    <input
                      style={inputStyle}
                      type="text"
                      name="bankBranch"
                      value={form.bankBranch}
                      onChange={handleChange}
                      placeholder="지점명을 입력해 주세요"
                    />
                  </label>
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>5. 발기인 (출자자)</h2>

                {form.founders.map((founder, index) => (
                  <div style={subCardStyle} key={index}>
                    <h3 style={subTitleStyle}>발기인 {index + 1}</h3>

                    <div style={{ display: "grid", gap: "12px" }}>
                      <label style={fieldStyle}>
                        <span style={labelStyle}>주소</span>
                        <input
                          style={inputStyle}
                          type="text"
                          value={founder.address}
                          onChange={(e) =>
                            handleFounderChange(
                              index,
                              "address",
                              e.target.value,
                            )
                          }
                          placeholder="주소를 입력해 주세요"
                        />
                      </label>

                      <label style={fieldStyle}>
                        <span style={labelStyle}>성명</span>
                        <input
                          style={inputStyle}
                          type="text"
                          value={founder.name}
                          onChange={(e) =>
                            handleFounderChange(index, "name", e.target.value)
                          }
                          placeholder="성명을 입력해 주세요"
                        />
                      </label>

                      <label style={fieldStyle}>
                        <span style={labelStyle}>출자 금액</span>
                        <input
                          style={inputStyle}
                          type="text"
                          value={founder.investment}
                          onChange={(e) =>
                            handleFounderChange(
                              index,
                              "investment",
                              e.target.value,
                            )
                          }
                          placeholder="출자 금액을 입력해 주세요"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>6. 이사</h2>

                {form.directors.map((director, index) => (
                  <div style={subCardStyle} key={index}>
                    <h3 style={subTitleStyle}>이사 {index + 1}</h3>

                    <div style={{ display: "grid", gap: "12px" }}>
                      <label style={fieldStyle}>
                        <span style={labelStyle}>주소</span>
                        <input
                          style={inputStyle}
                          type="text"
                          value={director.address}
                          onChange={(e) =>
                            handleDirectorChange(
                              index,
                              "address",
                              e.target.value,
                            )
                          }
                          placeholder="주소를 입력해 주세요"
                        />
                      </label>

                      <label style={fieldStyle}>
                        <span style={labelStyle}>성명</span>
                        <input
                          style={inputStyle}
                          type="text"
                          value={director.name}
                          onChange={(e) =>
                            handleDirectorChange(index, "name", e.target.value)
                          }
                          placeholder="성명을 입력해 주세요"
                        />
                      </label>

                      <label style={fieldStyle}>
                        <span style={labelStyle}>로마자 표기</span>
                        <input
                          style={inputStyle}
                          type="text"
                          value={director.romanized}
                          onChange={(e) =>
                            handleDirectorChange(
                              index,
                              "romanized",
                              e.target.value,
                            )
                          }
                          placeholder="예: GILDONG HONG"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>7. 대표이사</h2>
                <label style={fieldStyle}>
                  <span style={labelStyle}>성명</span>
                  <input
                    style={inputStyle}
                    type="text"
                    name="representativeDirector"
                    value={form.representativeDirector}
                    onChange={handleChange}
                    placeholder="대표이사 성명을 입력해 주세요"
                  />
                </label>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>8. 이사의 임기</h2>
                <div style={grid2Style}>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>임기</span>
                    <select
                      style={inputStyle}
                      name="directorTerm"
                      value={form.directorTerm}
                      onChange={handleChange}
                    >
                      <option value="">선택해 주세요</option>
                      <option value="1년">1년</option>
                      <option value="2년">2년</option>
                      <option value="3년">3년</option>
                      <option value="4년">4년</option>
                      <option value="5년">5년</option>
                      <option value="6년">6년</option>
                      <option value="7년">7년</option>
                      <option value="8년">8년</option>
                      <option value="9년">9년</option>
                      <option value="10년">10년</option>
                    </select>
                  </label>

                  <label style={fieldStyle}>
                    <span style={labelStyle}>안내</span>
                    <input
                      style={inputStyle}
                      type="text"
                      value="1년 이상 10년 이하 선택 가능"
                      readOnly
                    />
                  </label>
                </div>
              </div>

              <div className="card">
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="btn primary" type="submit">
                    제출하기
                  </button>
                  <button className="btn" type="button" onClick={handleReset}>
                    초기화
                  </button>
                </div>

                <p className="notice" style={{ marginBottom: 0 }}>
                  * 현재는 UI 페이지 버전이며, 제출 데이터는 콘솔에 출력됩니다.
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

const blockStyle = {
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "18px",
  padding: "20px",
};

const blockTitleStyle = {
  fontSize: "18px",
  fontWeight: 900,
  margin: "0 0 14px",
  letterSpacing: "-0.2px",
};

const grid2Style = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const fieldStyle = {
  display: "grid",
  gap: "8px",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: 800,
};

const inputStyle = {
  width: "100%",
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.06)",
  color: "var(--text)",
  padding: "12px 14px",
  borderRadius: "12px",
  outline: "none",
  font: "inherit",
};

const subCardStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.025)",
  borderRadius: "14px",
  padding: "16px",
  marginTop: "12px",
};

const subTitleStyle = {
  fontSize: "15px",
  fontWeight: 800,
  margin: "0 0 12px",
  color: "var(--muted)",
};
