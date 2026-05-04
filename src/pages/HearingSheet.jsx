import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function HearingSheet() {
  const [companyName, setCompanyName] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [capital, setCapital] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [representativeDirector, setRepresentativeDirector] = useState("");
  const [directorTerm, setDirectorTerm] = useState("");

  const [purposes, setPurposes] = useState([{ content: "" }]);

  const [founders, setFounders] = useState([
    {
      address: "",
      name: "",
      investmentAmount: "",
    },
  ]);

  const [directors, setDirectors] = useState([
    {
      address: "",
      name: "",
      romanizedName: "",
    },
  ]);

  const addPurpose = () => {
    setPurposes([...purposes, { content: "" }]);
  };

  const addFounder = () => {
    setFounders([
      ...founders,
      {
        address: "",
        name: "",
        investmentAmount: "",
      },
    ]);
  };

  const addDirector = () => {
    setDirectors([
      ...directors,
      {
        address: "",
        name: "",
        romanizedName: "",
      },
    ]);
  };

  const updatePurpose = (index, value) => {
    const next = [...purposes];
    next[index].content = value;
    setPurposes(next);
  };

  const updateFounder = (index, field, value) => {
    const next = [...founders];
    next[index][field] = value;
    setFounders(next);
  };

  const updateDirector = (index, field, value) => {
    const next = [...directors];
    next[index][field] = value;
    setDirectors(next);
  };

  const convertArrayToObject = (array) => {
    return array.reduce((acc, item, index) => {
      acc[index + 1] = item;
      return acc;
    }, {});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hearingSheetData = {
      companyName,
      companyNameEn,
      Purpose: convertArrayToObject(purposes),
      capital,
      capitalPaymentBank: {
        bankName,
        branchName,
      },
      Founder: convertArrayToObject(founders),
      Director: convertArrayToObject(directors),
      representativeDirector,
      directorTerm,
    };

    console.log("Backend로 보낼 JSON:", hearingSheetData);

    /*
      axios 또는 fetch 예시

      fetch("http://localhost:8080/api/hearing-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hearingSheetData),
      });
    */
  };

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

          <form className="hs-form" onSubmit={handleSubmit}>
            <section className="hs-block">
              <h2 className="hs-block-title">1. 상호</h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">상호</label>
                  <input
                    className="hs-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="회사명을 입력하세요"
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">영문 표기 선택</label>
                  <input
                    className="hs-input"
                    value={companyNameEn}
                    onChange={(e) => setCompanyNameEn(e.target.value)}
                    placeholder="영문 회사명을 입력하세요"
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <h2 className="hs-block-title">2. 사업 목적</h2>

                <button type="button" className="btn" onClick={addPurpose}>
                  + 사업 목적 추가
                </button>
              </div>

              <div className="hs-grid">
                {purposes.map((purpose, index) => (
                  <div className="hs-field" key={index}>
                    <label className="hs-label">사업 목적 {index + 1}</label>
                    <input
                      className="hs-input"
                      value={purpose.content}
                      onChange={(e) => updatePurpose(index, e.target.value)}
                      placeholder={`${index + 1}. 사업 목적을 입력하세요`}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">3. 자본금</h2>

              <div className="hs-field">
                <label className="hs-label">자본금</label>
                <input
                  className="hs-input"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder="예: 5,000,000엔"
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">4. 자본금 납입 은행</h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">은행명</label>
                  <input
                    className="hs-input"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="은행명을 입력하세요"
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">지점명</label>
                  <input
                    className="hs-input"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="지점명을 입력하세요"
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <h2 className="hs-block-title">5. 발기인 / 출자자</h2>

                <button type="button" className="btn" onClick={addFounder}>
                  + 발기인 추가
                </button>
              </div>

              {founders.map((founder, index) => (
                <div className="hs-subcard" key={index}>
                  <div className="hs-subtitle">발기인 {index + 1}</div>

                  <div className="hs-grid2">
                    <div className="hs-field">
                      <label className="hs-label">주소</label>
                      <input
                        className="hs-input"
                        value={founder.address}
                        onChange={(e) =>
                          updateFounder(index, "address", e.target.value)
                        }
                        placeholder="주소를 입력하세요"
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">성명</label>
                      <input
                        className="hs-input"
                        value={founder.name}
                        onChange={(e) =>
                          updateFounder(index, "name", e.target.value)
                        }
                        placeholder="성명을 입력하세요"
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">출자 금액</label>
                      <input
                        className="hs-input"
                        value={founder.investmentAmount}
                        onChange={(e) =>
                          updateFounder(
                            index,
                            "investmentAmount",
                            e.target.value,
                          )
                        }
                        placeholder="예: 2,500,000엔"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <div>
                  <h2 className="hs-block-title">6. 이사</h2>
                  <p className="hs-note">
                    성명은 로마자 병기를 함께 입력해 주세요.
                  </p>
                </div>

                <button type="button" className="btn" onClick={addDirector}>
                  + 이사 추가
                </button>
              </div>

              {directors.map((director, index) => (
                <div className="hs-subcard" key={index}>
                  <div className="hs-subtitle">이사 {index + 1}</div>

                  <div className="hs-grid2">
                    <div className="hs-field">
                      <label className="hs-label">주소</label>
                      <input
                        className="hs-input"
                        value={director.address}
                        onChange={(e) =>
                          updateDirector(index, "address", e.target.value)
                        }
                        placeholder="주소를 입력하세요"
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">성명</label>
                      <input
                        className="hs-input"
                        value={director.name}
                        onChange={(e) =>
                          updateDirector(index, "name", e.target.value)
                        }
                        placeholder="성명을 입력하세요"
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">로마자 성명</label>
                      <input
                        className="hs-input"
                        value={director.romanizedName}
                        onChange={(e) =>
                          updateDirector(index, "romanizedName", e.target.value)
                        }
                        placeholder="예: HONG GILDONG"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">7. 대표이사</h2>

              <div className="hs-field">
                <label className="hs-label">대표이사 성명</label>
                <input
                  className="hs-input"
                  value={representativeDirector}
                  onChange={(e) => setRepresentativeDirector(e.target.value)}
                  placeholder="대표이사 성명을 입력하세요"
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">8. 이사의 임기</h2>

              <div className="hs-field">
                <label className="hs-label">이사의 임기</label>
                <input
                  className="hs-input"
                  value={directorTerm}
                  onChange={(e) => setDirectorTerm(e.target.value)}
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
