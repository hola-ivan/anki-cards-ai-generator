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

    if (taskId && (status === "processing" || status === "initializing" || status === "uploading")) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/status/${taskId}`);
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
      fetch(`http://localhost:8000/api/tasks/${taskId}/cards`)
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
      const res = await fetch("http://localhost:8000/api/generate", {
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
    window.open(`http://localhost:8000/api/download/${taskId}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-extrabold text-indigo-600 tracking-tight">AnkiGen.ai</div>
          <nav className="hidden md:block">
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 mx-4 font-medium transition-colors">How it works</a>
            <a href="https://github.com/example/repo" className="text-gray-500 hover:text-gray-900 mx-4 font-medium transition-colors">GitHub</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {status === "idle" && (
        <div className="bg-white overflow-hidden pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center lg:pt-32">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Master Languages <span className="text-indigo-600">Faster</span> with AI
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Turn your vocabulary lists into rich, visual Anki cards in seconds.
              Powered by GenAI to give you context, images, and audio automatically.
            </p>

            {/* Steps */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" id="how-it-works">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-bold mb-2">1. Upload Words</h3>
                <p className="text-gray-600">Provide a simple CSV file with words and optional context.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-lg font-bold mb-2">2. AI Magic</h3>
                <p className="text-gray-600">We analyze, define, and generate custom images for each word.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-lg font-bold mb-2">3. Learn</h3>
                <p className="text-gray-600">Download the .apkg deck and start your spaced repetition journey.</p>
              </div>
            </div>

            <div className="mt-12">
              <button
                onClick={() => document.getElementById('generator-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Start Generating Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Generator Section */}
      <main id="generator-form" className="max-w-4xl mx-auto px-4 py-12">

        {/* Form State */}
        {(status === "idle" || status === "uploading" || status === "error") && (
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Create Your Deck</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="english">English</option>
                    <option value="german">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="A1">A1 (Beginner)</option>
                    <option value="A2">A2 (Elementary)</option>
                    <option value="B1">B1 (Intermediate)</option>
                    <option value="B2">B2 (Upper Intermediate)</option>
                    <option value="C1">C1 (Advanced)</option>
                    <option value="C2">C2 (Mastery)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deck Name</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="e.g. My German Vocab"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Input CSV File</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          accept=".csv"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV up to 10MB (Format: word;context)</p>
                    {file && <p className="text-sm font-medium text-indigo-600 mt-2">{file.name}</p>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "uploading"}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-all"
              >
                {status === "uploading" ? "Uploading..." : "Generate Deck"}
              </button>

              {error && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Processing State */}
        {(status === "processing" || status === "initializing") && (
          <div className="bg-white p-12 rounded-2xl shadow-xl w-full text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating your deck...</h2>
            <p className="text-gray-500 mb-8">This might take a minute depending on the number of words. We are generating images and audio.</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-md mx-auto">
              <div className="bg-indigo-600 h-2.5 rounded-full w-2/3 animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Task ID: {taskId}</p>
          </div>
        )}

        {/* Completed / Preview State */}
        {(status === "completed" || status === "fetching_preview") && (
          <div className="space-y-8">
            <div className="bg-green-50 p-8 rounded-2xl border border-green-100 text-center shadow-lg">
              <span className="text-5xl mb-4 block">🎉</span>
              <h2 className="text-3xl font-bold text-green-800 mb-4">Your Deck is Ready!</h2>
              <button
                onClick={handleDownload}
                className="px-8 py-4 bg-green-600 text-white font-bold rounded-full text-xl shadow-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Download .apkg
              </button>
              <p className="mt-4 text-green-700 text-sm">Import this file directly into your Anki desktop or mobile app.</p>
            </div>

            {/* Preview Section */}
            {cards.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-2">👀</span> Card Preview ({cards.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cards.map((card, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      {card.image && (
                        <div className="h-48 bg-gray-100 w-full relative">
                          {/* We fetch image from backend media endpoint */}
                          <img
                            src={`http://localhost:8000/api/tasks/${taskId}/media/${card.image}`}
                            alt={card.word}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-indigo-900 mb-2">{card.word}</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">{card.text}</p>
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
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          &copy; 2025 AnkiGen.ai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
