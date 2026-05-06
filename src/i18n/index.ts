import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import zh from "./locales/zh.json";
import en from "./locales/en.json";

// One-time migration: prior versions defaulted to Chinese (fallbackLng: "zh"),
// which caused the language detector to cache "zh" in localStorage even on
// English-locale systems. Reset that cached preference once so the detector
// re-evaluates against navigator.language with English as the new fallback.
const I18N_MIGRATION_KEY = "i18n.defaultEnglish.v1";
if (typeof window !== "undefined") {
  try {
    if (!window.localStorage.getItem(I18N_MIGRATION_KEY)) {
      window.localStorage.removeItem("i18nextLng");
      window.localStorage.setItem(I18N_MIGRATION_KEY, "1");
    }
  } catch {
    // localStorage may be unavailable in some sandboxed contexts; ignore.
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
