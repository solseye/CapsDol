import { useState } from "react";

export default function FAQ() {
  const [faqOpen, setFaqOpen] = useState([false, false, false]);

  return (
    <>
      {/* FAQ */}
      <section id="faq">
        <div className="container">
          <div className="kicker">FAQ</div>

          <h2 className="faq-title">자주 묻는 질문</h2>

          <br></br>

          <div className="grid">
            {[
              {
                q: "일본 법인에 소비세 납부 의무에 대하여.납부 의무 요건",
                a: "1. 전전 사업연도(기준 기간)의 과세 매출액이 1,000만 엔 이상인 경우",
              },
              {
                q: "일본 법인에서 한국 본사로 이자를 송금할 때 원천징수 세율은?",
                a: "원칙적으로 20.42%",
              },
              {
                q: "국경을 넘는 EC를 활용한 일본 진출 시 인보이스 등록 여부",
                a: "과세 매출액 기준 충족 시 등록 필요",
              },
            ].map((item, idx) => (
              <div className="faq-item faq-card" key={idx}>
                <div className="faq-badge">Q</div>

                <button
                  className="faq-q"
                  type="button"
                  onClick={() =>
                    setFaqOpen((prev) => {
                      const next = [...prev];
                      next[idx] = !next[idx];
                      return next;
                    })
                  }
                >
                  {item.q}

                  <span className="chev">{faqOpen[idx] ? "–" : "+"}</span>
                </button>

                {faqOpen[idx] && <div className="faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
