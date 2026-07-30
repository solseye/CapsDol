import { useEffect } from "react";
import { getCurrentLanguage } from "../i18n/translations";
import { localizeLegacyValue } from "../i18n/legacyPageCopy";

const TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title"];

function localizeElement(root, language) {
  if (!root) return;

  const localizeTextNode = (node) => {
    const value = node.nodeValue;
    if (!value || !/[가-힣]/.test(value)) return;

    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    const normalized = value.trim().replace(/\s+/g, " ");
    const translated = localizeLegacyValue(normalized, language);
    if (translated !== normalized) node.nodeValue = `${leading}${translated}${trailing}`;
  };

  if (root.nodeType === Node.TEXT_NODE) {
    localizeTextNode(root);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) localizeTextNode(walker.currentNode);

  const elements = root.nodeType === Node.ELEMENT_NODE
    ? [root, ...root.querySelectorAll("*")]
    : [...root.querySelectorAll("*")];

  elements.forEach((element) => {
    TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
      const value = element.getAttribute?.(attribute);
      if (!value || !/[가-힣]/.test(value)) return;
      const translated = localizeLegacyValue(value, language);
      if (translated !== value) element.setAttribute(attribute, translated);
    });
  });
}

export default function LegacyPageLocalization() {
  useEffect(() => {
    const language = getCurrentLanguage();
    if (language === "ko") return undefined;

    let scheduled = false;
    const run = () => {
      scheduled = false;
      localizeElement(document.body, language);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(run);
    };

    run();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
