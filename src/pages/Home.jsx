import React, { useEffect, useState } from "react";
import "../App.css";

// 기존 공통 Header/Footer입니다. Visily 프레임 홈은 자체 헤더/푸터를 포함해 디자인 일관성을 맞춥니다.
// import Header from "../components/Header";
// import Footer from "../components/Footer";

// 기존 master 홈 구성입니다. 소니 디자인 선별 적용 중에도 되돌릴 수 있도록 남겨둡니다.
// import MainIntro from "./home/MainIntro";
// import ServiceInfo from "./home/ServiceInfo";
// import UsageInfo from "./home/UsageInfo";
// import MainIntroSelected from "./home/MainIntroSelected";
// import ExpansionRoadmap from "./home/ExpansionRoadmap";
// import CategoryGuide from "./home/CategoryGuide";
// import HearingShortcuts from "./home/HearingShortcuts";
// import SupportInfo from "./home/SupportInfo";
import HomeVisilyFrame from "./home/HomeVisilyFrame";
// 기존 챗봇 플로팅 버튼입니다. 새 홈 디자인에서는 버튼 UI만 별도 파일로 분리했습니다.
// import ChatFab from "./home/Chatbot";
// import FloatingChatBtn from "../components/FloatingChatBtn";
import { getCurrentLanguage } from "../i18n/translations";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 기존 Google Translate 기반 언어 감지 방식입니다.
    // const currentLang = document.cookie.includes("/ko/en")
    //   ? "en"
    //   : document.cookie.includes("/ko/ja")
    //     ? "ja"
    //     : "ko";
    // document.documentElement.setAttribute("data-lang", currentLang);
    //
    // window.googleTranslateElementInit = () => {
    //   if (!window.google?.translate?.TranslateElement) return;
    //
    //   new window.google.translate.TranslateElement(
    //     {
    //       pageLanguage: "ko",
    //       includedLanguages: "ko,en,ja",
    //       autoDisplay: false,
    //     },
    //     "google_translate_element",
    //   );
    // };
    //
    // const existingScript = document.querySelector(
    //   'script[src*="translate.google.com/translate_a/element.js"]',
    // );
    //
    // if (!existingScript) {
    //   const script = document.createElement("script");
    //   script.src =
    //     "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    //   script.async = true;
    //   document.body.appendChild(script);
    // } else if (window.google?.translate?.TranslateElement) {
    //   window.googleTranslateElementInit();
    // }

    // 변경 이유: 핵심 페이지는 자동 번역이 아니라 직접 번역 사전을 사용합니다.
    const currentLang = getCurrentLanguage();
    document.documentElement.setAttribute("data-lang", currentLang);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="App">
      <div
        id="google_translate_element"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          visibility: "hidden",
          height: 0,
          overflow: "hidden",
        }}
      />

      <main id="top">
        {/* 변경 이유: Visily에서 선택한 프레임을 기준으로 메인 페이지 전용 디자인을 적용합니다. */}
        <HomeVisilyFrame isLoggedIn={isLoggedIn} />
        {/* 소니 선별 적용 홈 섹션입니다. 필요하면 Visily 프레임 대신 아래 5개를 다시 사용할 수 있습니다. */}
        {/* <MainIntroSelected /> */}
        {/* <ExpansionRoadmap /> */}
        {/* <CategoryGuide /> */}
        {/* <HearingShortcuts /> */}
        {/* <SupportInfo /> */}
        {/* 기존 master 홈 섹션입니다. 필요하면 위 4개 섹션 대신 아래 3개를 다시 사용하면 됩니다. */}
        {/* <MainIntro /> */}
        {/* <ServiceInfo /> */}
        {/* <UsageInfo /> */}
      </main>
    </div>
  );
}
