"use client";

import { useState } from "react";

export default function HeroCardPreview() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isOccluded, setIsOccluded] = useState(true);

    const handleAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance("Serendipity");
            utterance.lang = "en-US";
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const toggleOcclusion = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOccluded(!isOccluded);
    };

    return (
        <div className="relative w-80 h-[28rem] mx-auto perspective-1000 group cursor-pointer" onClick={handleFlip}>
            {/* Card Container */}
            <div
                className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] [transform-style:preserve-3d] shadow-2xl rounded-[2rem] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
            >

                {/* FRONT */}
                <div className="absolute inset-0 w-full h-full bg-white rounded-[2rem] [backface-visibility:hidden] overflow-hidden flex flex-col border border-slate-100">
                    {/* Image Section */}
                    <div className="h-3/5 relative bg-slate-100 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-20"></div>
                        {/* Abstract visualization representing 'Serendipity' */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-32 h-32 text-blue-500/50 drop-shadow-lg animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>

                        {/* Audio Button */}
                        <button
                            onClick={handleAudio}
                            className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-all z-10 hover:scale-110 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </button>
                    </div>

                    {/* Text Section */}
                    <div className="flex-1 p-8 flex flex-col justify-center items-center text-center bg-white relative z-0">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Serendipity</h3>
                        <div className="w-12 h-1 bg-blue-500 rounded-full mb-4"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Noun</span>

                        <div className="absolute bottom-6 text-xs text-slate-300 font-bold uppercase tracking-widest flex items-center animate-bounce">
                            Tap to Flip
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-[2rem] [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 flex flex-col justify-center text-white border border-slate-700 shadow-2xl">
                    <div className="mb-8">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Definition</div>
                        <div
                            className={`text-lg font-medium leading-relaxed transition-all duration-300 cursor-pointer p-2 rounded-lg ${isOccluded ? 'bg-slate-800 text-transparent select-none blur-sm' : 'text-slate-100'}`}
                            onClick={toggleOcclusion}
                        >
                            The occurrence and development of events by chance in a happy or beneficial way.
                            {isOccluded && <span className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest">Tap to Reveal</span>}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Context</div>
                        <p className="text-slate-300 italic font-light leading-relaxed">
                            "We found the restaurant by pure <span className="text-white font-bold not-italic">serendipity</span>, and it turned out to be the best meal of our trip."
                        </p>
                    </div>

                    <div className="absolute bottom-6 left-0 w-full text-center text-xs text-slate-600 font-bold uppercase tracking-widest">
                        Example Card
                    </div>
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute -right-12 top-10 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -z-10 animate-pulse"></div>
            <div className="absolute -left-12 bottom-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -z-10 animate-pulse delay-700"></div>

            {/* Floating Badges */}
            <div className="absolute -right-6 top-8 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-xl border border-white/10 z-20 flex items-center transform rotate-3 hover:rotate-0 transition-transform">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                AI Definitions
            </div>
            <div className="absolute -left-6 bottom-32 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-xl border border-white/10 z-20 flex items-center transform -rotate-3 hover:rotate-0 transition-transform">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                AI Visuals
            </div>
        </div>
    );
}
