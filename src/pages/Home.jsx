import React, { useEffect, useState } from "react";
import "../App.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

import MainIntro from "./home/MainIntro";
import ServiceInfo from "./home/ServiceInfo";
import UsageInfo from "./home/UsageInfo";
import SupportInfo from "./home/SupportInfo";
import ChatFab from "./home/Chatbot";
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

      <Header isLoggedIn={isLoggedIn} />

      <main id="top">
        <MainIntro />
        <ServiceInfo />
        <UsageInfo />
        <SupportInfo />
        <Footer />
      </main>

      <ChatFab />
    </div>
  );
}
