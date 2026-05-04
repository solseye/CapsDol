import React, { useEffect, useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MainIntro from "../components/home/MainIntro";
import ServiceInfo from "../components/home/ServiceInfo";
import UsageInfo from "../components/home/UsageInfo";
import SupportInfo from "../components/home/SupportInfo";
import Chatbot from "../components/home/Chatbot";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentLang = document.cookie.includes("/ko/ja") ? "ja" : "ko";
    document.documentElement.setAttribute("data-lang", currentLang);

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "ko",
          includedLanguages: "ko,ja",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    const existingScript = document.querySelector(
      'script[src*="translate.google.com/translate_a/element.js"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
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

      <div id="top"></div>

      <Header isLoggedIn={isLoggedIn} />

      <main id="top">
        <MainIntro />
        <ServiceInfo />
        <UsageInfo />
        <SupportInfo />
        <Footer />
      </main>

      <Chatbot />
    </div>
  );
}
