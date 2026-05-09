import React, { useEffect, useState } from "react";
import "../App.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

import MainIntro from "./home/MainIntro";
import Recommendation from "./home/Recommendation";
import About from "./home/About";
import ServiceInfo from "./home/ServiceInfo";
import Hearing from "./home/Hearing";
import SupportInfo from "./home/SupportInfo";
import UsageInfo from "./home/UsageInfo";
import Pricing from "./home/Pricing";
import FAQ from "./home/FAQ";
import ChatFab from "./home/Chatbot";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();

    const target = document.getElementById(sectionId);

    if (!target) return;

    const startPosition = window.pageYOffset;

    const targetPosition =
      target.getBoundingClientRect().top + window.pageYOffset - 80;

    const distance = targetPosition - startPosition;

    const duration = 1400;

    let start = null;

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime) => {
      if (start === null) start = currentTime;

      const timeElapsed = currentTime - start;

      const progress = Math.min(timeElapsed / duration, 1);

      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

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

      <Header isLoggedIn={isLoggedIn} onSectionClick={handleSectionClick} />

      <main id="top" className="home-page">
        <MainIntro />
        <Recommendation />
        <About />
        <ServiceInfo />
        <Hearing />
        <UsageInfo />
        <Pricing />
        <FAQ />
        <SupportInfo />
        <Footer />
      </main>

      <ChatFab />
    </div>
  );
}
