"use client";

import { useState, useEffect } from "react";

interface Card {
  word: string;
  text: string;
  image: string | null;
  audio: string | null;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const [level, setLevel] = useState("B2");
  const [deckName, setDeckName] = useState("AI Generated Deck");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  // Status polling effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    if (taskId && (status === "processing" || status === "initializing" || status === "uploading")) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/status/${taskId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.state === "completed") {
              setStatus("fetching_preview"); // intermediate state to fetch cards
            } else if (data.state === "error") {
              setStatus("error");
              setError(data.error || "Unknown worker error");
            }
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 2000);
    }

    if (taskId && status === "fetching_preview") {
      fetch(`${API_URL}/api/tasks/${taskId}/cards`)
        .then(res => res.json())
        .then(data => {
          setCards(data);
          setStatus("completed");
        })
        .catch(e => {
          console.error(e);
          setStatus("completed"); // ignore preview error, allow download
        });
    }

    return () => clearInterval(interval);
  }, [taskId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    if (!file) {
      alert("Please provide a file");
      return;
    }

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("level", level);
    formData.append("deck_name", deckName);

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setTaskId(data.task_id);
      setStatus("processing");
    } catch (err) {
      console.error(err);
      setError("Failed to start generation");
      setStatus("error");
    }
  };

  const handleDownload = async () => {
    if (!taskId) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.open(`${API_URL}/api/download/${taskId}`, "_blank");
  };

  const loadSampleData = () => {
    const sampleCsvContent = `Word;Context
Serendipity;Finding something good without looking for it
Petrichor;The pleasant smell of earth after rain
Ephemeral;Lasting for a very short time
Luminous;Full of or shedding light
`;
    const blob = new Blob([sampleCsvContent], { type: "text/csv" });
    const file = new File([blob], "demo_words.csv", { type: "text/csv" });

    setFile(file);
    setDeckName("Demo: Beautiful Words");
    setLanguage("english");
    setLevel("C1");

    // Smooth scroll to form
    document.getElementById('generator-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-black text-blue-600 tracking-tighter flex items-center">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-lg mr-2">A</span>
            AnkiGen.ai
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/how-it-works" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">How it works</a>
            <a href="https://github.com/hola-ivan/anki-cards-ai-generator" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">GitHub</a>
            <button
              onClick={loadSampleData}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-100 transition-all"
            >
              Try Demo
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {status === "idle" && (
        <div className="bg-white overflow-hidden pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center lg:pt-32">
            <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-7xl mb-6">
              Master Languages <span className="text-blue-600 italic">Faster</span> with AI
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500 leading-relaxed">
              Transform boring vocabulary lists into vibrant, visual Anki cards in seconds.
              Powered by <span className="font-bold text-blue-600">GPT-5.1</span> and <span className="font-bold text-blue-600">Flux</span>.
            </p>

            {/* Steps */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto" id="how-it-works">
              <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 mx-auto shadow-lg shadow-blue-200">1</div>
                <h3 className="text-xl font-bold mb-3">Upload Words</h3>
                <p className="text-slate-600">Upload a CSV file with your target words and context.</p>
              </div>
              <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 mx-auto shadow-lg shadow-blue-200">2</div>
                <h3 className="text-xl font-bold mb-3">AI Enrichment</h3>
                <p className="text-slate-600">We generate definitions, Flux images, and Minimax audio.</p>
              </div>
              <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 mx-auto shadow-lg shadow-blue-200">3</div>
                <h3 className="text-xl font-bold mb-3">Flashcard Fun</h3>
                <p className="text-slate-600">Download your .apkg and start your SRS journey immediately.</p>
              </div>
            </div>

            <div className="mt-16">
              <button
                onClick={() => document.getElementById('generator-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
              >
                Start Generating Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Generator Section */}
      <main id="generator-form" className="max-w-4xl mx-auto px-4 py-20">

        {/* Form State */}
        {(status === "idle" || status === "uploading" || status === "error") && (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full border border-slate-100">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Your Deck</h2>
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                <div className="w-3 h-3 rounded-full bg-blue-100"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 font-medium transition-all"
                  >
                    <option value="english">🇺🇸 English</option>
                    <option value="german">🇩🇪 German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Target Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 font-medium transition-all"
                  >
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="C2">C2 - Mastery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Deck Name</label>
                <input
                  type="text"
                  className="block w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 font-medium transition-all"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="e.g. My Travel Vocab"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Input CSV File</label>
                <div className="mt-1 flex justify-center px-8 pt-8 pb-10 border-2 border-slate-200 border-dashed rounded-[2rem] hover:bg-blue-50/30 hover:border-blue-300 transition-all group">
                  <div className="space-y-2 text-center">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="h-8 w-8 text-blue-600" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex text-base text-slate-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none transition-colors">
                        <span>Upload word list</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          accept=".csv"
                        />
                      </label>
                      <p className="pl-1">or drag & drop</p>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      No file? <span onClick={loadSampleData} className="text-blue-600 font-bold hover:underline cursor-pointer">Use sample data</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium tracking-tight">CSV (Format: word;context) • Max 10MB</p>
                    {file && (
                      <div className="mt-4 p-2 bg-blue-600 text-white rounded-xl text-sm font-bold animate-bounce ink-0 inline-block px-4">
                        {file.name} ⚡️
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "uploading"}
                className="w-full flex justify-center py-5 px-4 border border-transparent rounded-2xl shadow-xl text-xl font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:bg-slate-300 transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                {status === "uploading" ? "Launching AI..." : "✨ Generate My Deck"}
              </button>

              {error && (
                <div className="p-5 bg-red-50 rounded-2xl border border-red-100 text-red-700 text-sm font-medium">
                  <strong className="font-black">Oops!</strong> {error}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Processing State */}
        {(status === "processing" || status === "initializing") && (
          <div className="bg-white p-16 rounded-[3rem] shadow-2xl w-full text-center border border-slate-100">
            <div className="mb-8 relative">
              <div className="absolute inset-0 animate-ping rounded-full h-24 w-24 bg-blue-100 mx-auto"></div>
              <div className="relative animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600 mx-auto shadow-inner"></div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">AI is Thinking...</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">We are weaving text, Flux images, and Minimax audio into your perfect cards.</p>
            <div className="w-full bg-slate-100 rounded-full h-4 max-w-md mx-auto overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-2/3 animate-[shimmer_2s_infinite] bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-[length:200%_100%]"></div>
            </div>
            <p className="text-[10px] font-bold text-slate-300 mt-6 tracking-[0.2em]">TASK ID: {taskId}</p>
          </div>
        )}

        {/* Completed / Preview State */}
        {(status === "completed" || status === "fetching_preview") && (
          <div className="space-y-10">
            <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 text-center shadow-2xl">
              <span className="text-6xl mb-6 block">🌋</span>
              <h2 className="text-4xl font-black text-emerald-900 mb-6 tracking-tight">It's Alive!</h2>
              <button
                onClick={handleDownload}
                className="px-12 py-6 bg-emerald-600 text-white font-black rounded-[2rem] text-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-110 transition-all active:scale-95"
              >
                Download .apkg
              </button>
              <p className="mt-6 text-emerald-700 font-semibold">Ready to import into Anki Desktop or Mobile.</p>
            </div>

            {/* Preview Section */}
            {cards.length > 0 && (
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                <div className="flex items-center mb-8">
                  <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 font-black">?</div>
                  <h3 className="text-2xl font-black text-slate-900">Preview ({cards.length} cards)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cards.map((card, idx) => (
                    <div key={idx} className="group bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all hover:-translate-y-2">
                      {card.image && (
                        <div className="h-56 w-full relative overflow-hidden">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/tasks/${taskId}/media/${card.image}`}
                            alt={card.word}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-xl font-black text-blue-900 leading-none">{card.word}</h4>
                          <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-1 rounded font-black">AI GEN</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium line-clamp-4 leading-relaxed italic">"{card.text}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-20">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-10 mb-10">
            <div className="text-2xl font-black text-white mb-6 md:mb-0 tracking-tighter">AnkiGen.ai</div>
            <div className="flex space-x-6">
              <a href="/how-it-works" className="hover:text-blue-400 font-bold transition-colors">Documentation</a>
              <a href="https://github.com/hola-ivan/anki-cards-ai-generator" className="hover:text-blue-400 font-bold transition-colors">GitHub</a>
            </div>
          </div>
          <div className="text-center text-xs font-bold uppercase tracking-[0.2em] flex flex-col items-center">
            <div>&copy; 2025 AnkiGen.ai • v1.1.0</div>
            <div className="mt-2 text-slate-600">Built with Love for Lang Learners</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
