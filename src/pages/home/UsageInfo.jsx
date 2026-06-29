import { getCurrentLanguage, translate } from "../../i18n/translations";

export default function UsageInfo() {
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  return (
    <>
      {/* Flow */}
      <section id="flow">
        <div className="container">
          <div className="kicker">Flow</div>
          <h2 className="flow-title">{t("home.flowTitle")}</h2>
          <br />

          <div className="grid4">
            {/* 기존 2단계 흐름은 삭제하지 않고 보존합니다.
                요청 이미지처럼 상담 준비부터 노무까지 전체 흐름을 한눈에 보여주기 위해
                아래에 4단계 버전으로 확장했습니다.

            <div className="card flow-card">
              <div className="flow-num">1</div>
              <h3>상담부터 법인 설립까지 (약 2개월)</h3>
              <ul className="list">
                <li>상담, 체크리스트 작성</li>
                <li>정관 작성 및 인증</li>
                <li>등기 신청</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">2</div>
              <h3>세무 · 회계 고문 계약</h3>
              <ul className="list">
                <li>사회보험 가입</li>
                <li>급여 계산</li>
                <li>취업규칙 작성</li>
                <li>세무 회계 자문</li>
              </ul>
            </div>
            */}

            <div className="card flow-card">
              <div className="flow-num">1</div>
              <h3>{t("home.flow1Title")}</h3>
              <ul className="list">
                <li>{t("home.flow1Item1")}</li>
                <li>{t("home.flow1Item2")}</li>
                <li>{t("home.flow1Item3")}</li>
                <li>{t("home.flow1Item4")}</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">2</div>
              <h3>{t("home.flow2Title")}</h3>
              <ul className="list">
                <li>{t("home.flow2Item1")}</li>
                <li>{t("home.flow2Item2")}</li>
                <li>{t("home.flow2Item3")}</li>
                <li>{t("home.flow2Item4")}</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">3</div>
              <h3>{t("home.flow3Title")}</h3>
              <ul className="list">
                <li>{t("home.flow3Item1")}</li>
                <li>{t("home.flow3Item2")}</li>
                <li>{t("home.flow3Item3")}</li>
                <li>{t("home.flow3Item4")}</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">4</div>
              <h3>{t("home.flow4Title")}</h3>
              <ul className="list">
                <li>{t("home.flow4Item1")}</li>
                <li>{t("home.flow4Item2")}</li>
                <li>{t("home.flow4Item3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing">
        <div className="container">
          <div className="kicker">Pricing</div>
          <h2 className="pricing-title">{t("home.pricingTitle")}</h2>

          <div className="grid2">
            <div className="card pricing-card">
              <h3>{t("home.priceIncorporation")}</h3>
              <div className="list_price">
                <h4>{t("home.priceIncorporationAmount")}</h4>
                <p>{t("home.priceIncorporationDesc")}</p>
              </div>
            </div>

            <div className="card pricing-card">
              <h3>{t("home.priceSetupSupport")}</h3>
              <div className="list_price">
                <h4>{t("home.priceSetupSupportAmount")}</h4>
                <p>{t("home.priceSetupSupportDesc")}</p>
              </div>
            </div>

            <div className="card pricing-card">
              <h3>{t("home.priceVisa")}</h3>
              <div className="list_price">
                <h4>{t("home.priceConsult")}</h4>
                <p>{t("home.priceVisaDesc")}</p>
              </div>
            </div>

            <div className="card pricing-card">
              <h3>{t("home.priceTaxAdvisor")}</h3>
              <div className="list_price">
                <h4>{t("home.priceTaxAdvisorAmount")}</h4>
                <p>{t("home.priceTaxAdvisorDesc")}</p>
              </div>
            </div>

            <div className="card pricing-card">
              <h3>{t("home.priceHr")}</h3>
              <div className="list_price">
                <h4>{t("home.priceHrAmount")}</h4>
                <p>{t("home.priceHrDesc1")}</p>
                <p>{t("home.priceHrDesc2")}</p>
                <p>{t("home.priceHrDesc3")}</p>
              </div>
            </div>
          </div>

          <br />

          <div className="kicker">{t("home.pricingNotice")}</div>
        </div>
      </section>
    </>
  );
}
