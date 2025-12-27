import Link from 'next/link';

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter flex items-center">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-lg mr-2">A</span>
                        AnkiGen.ai
                    </Link>
                    <nav className="flex items-center space-x-8">
                        <Link href="/" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Generator</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-20">
                <h1 className="text-5xl font-black text-slate-900 mb-8 tracking-tight">How it Works</h1>

                <section className="space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                            <span className="bg-blue-100 p-2 rounded-lg mr-3 text-lg">📁</span>
                            1. The Input Format
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-4">
                            AnkiGen.ai accepts CSV and Excel files. The core requirement is a simple table with two columns: <strong>word</strong> and <strong>context</strong>.
                        </p>
                        <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm shadow-inner">
                            <div className="border-b border-slate-700 pb-2 mb-2 text-slate-500">example.csv</div>
                            word;context<br />
                            serendipity;Finding something good without looking for it.<br />
                            fernweh;A longing for distant places.
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                            <span className="bg-blue-100 p-2 rounded-lg mr-3 text-lg">🤖</span>
                            2. The AI Pipeline
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            Our backend orchestrates three state-of-the-art AI models to create a holistic learning experience:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <li className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="font-black text-slate-900 mb-2">Text (AI)</div>
                                <p className="text-sm text-slate-500 italic">Analyzes words to generate precise, level-appropriate explanations and sample sentences.</p>
                            </li>
                            <li className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="font-black text-slate-900 mb-2">Visuals (AI)</div>
                                <p className="text-sm text-slate-500 italic">Creates unique, high-fidelity square images to provide a visual anchor for memory (Mnemonic).</p>
                            </li>
                            <li className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="font-black text-slate-900 mb-2">Audio (AI)</div>
                                <p className="text-sm text-slate-500 italic">Synthesizes natural-sounding speech for the target word to ensure you master the pronunciation.</p>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                            <span className="bg-blue-100 p-2 rounded-lg mr-3 text-lg">🗂️</span>
                            3. Processing & Export
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-4">
                            Once generated, the files are packaged into a <code>.apkg</code> file using standard Anki formatting. This ensures full compatibility with:
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <span className="px-4 py-2 bg-slate-100 rounded-full text-slate-700 font-bold">Anki Desktop</span>
                            <span className="px-4 py-2 bg-slate-100 rounded-full text-slate-700 font-bold">AnkiDroid</span>
                            <span className="px-4 py-2 bg-slate-100 rounded-full text-slate-700 font-bold">AnkiMobile (iOS)</span>
                        </div>
                    </div>
                </section>

                <div className="mt-20 p-10 bg-blue-600 rounded-[3rem] text-white text-center shadow-2xl shadow-blue-200">
                    <h3 className="text-3xl font-black mb-4">Ready to try it?</h3>
                    <p className="text-blue-100 mb-8 font-medium">No account required. Open Source. Forever.</p>
                    <Link href="/" className="inline-block px-10 py-5 bg-white text-blue-600 font-black rounded-2xl text-xl hover:scale-105 transition-all shadow-lg active:scale-95">
                        Back to Generator
                    </Link>
                </div>
            </main>

            <footer className="bg-slate-900 text-slate-400 mt-20">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center text-xs font-bold uppercase tracking-[0.2em]">
                    &copy; 2025 AnkiGen.ai • v1.1.0
                </div>
            </footer>
        </div>
    );
}
