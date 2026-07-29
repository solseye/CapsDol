import React, { useEffect, useState } from "react";
import "../App.css";
import HomeVisilyFrame from "./home/HomeVisilyFrame";
import { getCurrentLanguage } from "../i18n/translations";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentLang = getCurrentLanguage();
    document.documentElement.setAttribute("data-lang", currentLang);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="App">
      <main id="top">
        <HomeVisilyFrame isLoggedIn={isLoggedIn} />
      </main>
    </div>
  );
}
