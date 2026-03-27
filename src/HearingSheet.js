import React, { useState } from "react";
import "./App.css";

export default function HearingSheet() {
  const [form, setForm] = useState({
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
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePurposeChange(index, value) {
    setForm((prev) => {
      const next = [...prev.purposes];
      next[index] = value;
      return { ...prev, purposes: next };
    });
  }

  function handleFounderChange(index, field, value) {
    setForm((prev) => {
      const next = [...prev.founders];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, founders: next };
    });
  }

  function handleDirectorChange(index, field, value) {
    setForm((prev) => {
      const next = [...prev.directors];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, directors: next };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("hearing sheet submitted:", form);
    alert("히어링 시트가 제출되었습니다.");
  }

  const pageStyle = {
    minHeight: "100vh",
    padding: "72px 0 80px",
  };

  const wrapperStyle = {
    maxWidth: "980px",
  };

  const introCardStyle = {
    marginBottom: "18px",
  };

  const formStyle = {
    display: "grid",
    gap: "18px",
  };

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

  const gridStyle = {
    display: "grid",
    gap: "12px",
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
    color: "var(--text)",
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

  const actionsStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "8px",
  };

  return (
    <div className="App">
      <main style={pageStyle}>
        <section style={{ padding: 0, borderBottom: 0 }}>
          <div className="container" style={wrapperStyle}>
            <div className="kicker">Hearing Sheet</div>
            <h1
              className="section-title"
              style={{ fontSize: "32px", marginBottom: "10px" }}
            >
              일본 현지 법인 설립 히어링 시트
            </h1>

            <div className="card" style={introCardStyle}>
              <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
                일본 현지 법인 설립 상담을 위한 기본 정보를 입력해 주세요.
                입력된 내용은 상담 및 설립 절차 검토 용도로 사용됩니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>1. 상호</h2>
                <div style={grid2Style}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>상호</label>
                    <input
                      style={inputStyle}
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="회사명을 입력해 주세요"
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>영문 표기</label>
                    <input
                      style={inputStyle}
                      type="text"
                      name="companyNameEn"
                      value={form.companyNameEn}
                      onChange={handleChange}
                      placeholder="영문 회사명을 입력해 주세요"
                    />
                  </div>
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>2. 사업 목적</h2>
                <div style={gridStyle}>
                  {form.purposes.map((value, index) => (
                    <div style={fieldStyle} key={index}>
                      <label style={labelStyle}>사업 목적 {index + 1}</label>
                      <input
                        style={inputStyle}
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handlePurposeChange(index, e.target.value)
                        }
                        placeholder="사업 목적을 입력해 주세요"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>3. 자본금</h2>
                <div style={grid2Style}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>자본금 금액</label>
                    <input
                      style={inputStyle}
                      type="text"
                      name="capital"
                      value={form.capital}
                      onChange={handleChange}
                      placeholder="금액을 입력해 주세요"
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>통화</label>
                    <input style={inputStyle} type="text" value="엔" readOnly />
                  </div>
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>4. 자본금 납입 은행</h2>
                <div style={grid2Style}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>은행명</label>
                    <input
                      style={inputStyle}
                      type="text"
                      name="bankName"
                      value={form.bankName}
                      onChange={handleChange}
                      placeholder="은행명을 입력해 주세요"
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>지점명</label>
                    <input
                      style={inputStyle}
                      type="text"
                      name="bankBranch"
                      value={form.bankBranch}
                      onChange={handleChange}
                      placeholder="지점명을 입력해 주세요"
                    />
                  </div>
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>5. 발기인 (출자자)</h2>

                {form.founders.map((founder, index) => (
                  <div style={subCardStyle} key={index}>
                    <h3 style={subTitleStyle}>발기인 {index + 1}</h3>
                    <div style={gridStyle}>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>주소</label>
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
                      </div>

                      <div style={fieldStyle}>
                        <label style={labelStyle}>성명</label>
                        <input
                          style={inputStyle}
                          type="text"
                          value={founder.name}
                          onChange={(e) =>
                            handleFounderChange(index, "name", e.target.value)
                          }
                          placeholder="성명을 입력해 주세요"
                        />
                      </div>

                      <div style={fieldStyle}>
                        <label style={labelStyle}>출자 금액</label>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>6. 이사</h2>

                {form.directors.map((director, index) => (
                  <div style={subCardStyle} key={index}>
                    <h3 style={subTitleStyle}>이사 {index + 1}</h3>
                    <div style={gridStyle}>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>주소</label>
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
                      </div>

                      <div style={fieldStyle}>
                        <label style={labelStyle}>성명</label>
                        <input
                          style={inputStyle}
                          type="text"
                          value={director.name}
                          onChange={(e) =>
                            handleDirectorChange(index, "name", e.target.value)
                          }
                          placeholder="성명을 입력해 주세요"
                        />
                      </div>

                      <div style={fieldStyle}>
                        <label style={labelStyle}>로마자 표기</label>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>7. 대표이사</h2>
                <div style={gridStyle}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>성명</label>
                    <input
                      style={inputStyle}
                      type="text"
                      name="representativeDirector"
                      value={form.representativeDirector}
                      onChange={handleChange}
                      placeholder="대표이사 성명을 입력해 주세요"
                    />
                  </div>
                </div>
              </div>

              <div style={blockStyle}>
                <h2 style={blockTitleStyle}>8. 이사의 임기</h2>
                <div style={grid2Style}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>임기</label>
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
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>안내</label>
                    <input
                      style={inputStyle}
                      type="text"
                      value="1년 이상 10년 이하 선택 가능"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={actionsStyle}>
                  <button className="btn primary" type="submit">
                    제출하기
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() =>
                      setForm({
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
                      })
                    }
                  >
                    초기화
                  </button>
                </div>

                <p className="notice" style={{ marginBottom: 0 }}>
                  * 현재는 UI 페이지 버전이며, 제출 데이터는 콘솔에 출력되도록
                  되어 있습니다.
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
