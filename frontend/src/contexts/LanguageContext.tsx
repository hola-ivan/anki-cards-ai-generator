"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "@/utils/translations";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        // Auto-detect language
        if (typeof window !== 'undefined') {
            const browserLang = navigator.language.split("-")[0] as Language;
            if (translations[browserLang]) {
                setLanguage(browserLang);
            }
        }
    }, []);

    const t = (key: string) => {
        return translations[language][key] || translations["en"][key] || key;
    };


    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
