import { useEffect } from "react";

export default function useDocumentLanguage(lang, dir = "ltr") {
  useEffect(() => {
    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;

    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    return () => {
      document.documentElement.lang = previousLang || "fr";
      document.documentElement.dir = previousDir || "ltr";
    };
  }, [dir, lang]);
}
