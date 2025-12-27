"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroCardPreview() {
    // We can eventually make this content dynamic based on language too, 
    // but for now, let's stick to a beautiful English example or a universal one.
    // Actually, showing the target language word + native definition is the core value.

    const { language } = useLanguage();

    // Sample data that changes slightly based on the interface language if we wanted,
    // but let's stick to a constant "Beautiful Card" example. 
    // Maybe "Serendipity" is a good one.

    return (
        <div className="relative w-72 h-96 sm:w-80 sm:h-[28rem] perspective-1000 mx-auto transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 ease-out">
            <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>

                {/* Card Front (Image) */}
                <div className="absolute inset-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
                    <div className="h-3/5 relative bg-blue-100 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-80 mix-blend-multiply"></div>
                        {/* Abstract art serving as "Flux Image" placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-9xl opacity-20 filter blur-sm">🌸</span>
                        </div>

                        {/* Audio Icon Mock */}
                        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md text-white p-2 rounded-full cursor-pointer hover:bg-black/30 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                        </div>

                        <div className="absolute bottom-4 left-4 text-white font-bold text-shadow-sm">
                            AI Generated
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between bg-white relative">
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Serendipity</h3>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Noun</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Finding something good without looking for it.
                            </p>
                        </div>

                        <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 w-3/4 h-full rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -right-8 top-10 bg-white/90 backdrop-blur shadow-lg border border-blue-100 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 animate-bounce delay-700">
                    GPT-4o Definitions
                </div>
                <div className="absolute -left-8 bottom-20 bg-white/90 backdrop-blur shadow-lg border-purple-100 px-4 py-2 rounded-xl text-xs font-bold text-purple-600 animate-bounce delay-1000">
                    Flux Visuals
                </div>
            </div>
        </div>
    );
}
