"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const [level, setLevel] = useState("B2");
  const [deckName, setDeckName] = useState("AI Generated Deck");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);

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
              setStatus("completed");
            } else if (data.state === "error") {
              setStatus("error");
              setError(data.error || "Unknown worker error");
            } else {
              // assume processing
              if (status !== "processing") setStatus("processing");
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);
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
      // Status will eventually update via polling, but set to processing to start poll
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
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-indigo-600">Anki AI Generator</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">Input CSV File</label>
            <input
              type="file"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".csv"
            />
            <p className="text-xs text-gray-500 mt-1">Format: word;context (semicolon separated)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="english">English</option>
                <option value="german">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deck Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={status !== "idle" && status !== "error" && status !== "completed"}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {status === "processing" || status === "uploading" ? "Processing..." : "Generate Deck"}
          </button>
        </form>

        {status === "processing" && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">Task ID: {taskId}</p>
            <p className="text-sm text-blue-700 mt-2">Processing... (Polling status)</p>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full w-1/2 animate-pulse"></div>
            </div>
          </div>
        )}

        {status === "completed" && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <p className="text-sm text-green-700 font-bold">Done!</p>
            <button
              onClick={handleDownload}
              className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Download Deck
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700 text-sm">
            Error: {error}
          </div>
        )}
      </div>
    </main>
  );
}
