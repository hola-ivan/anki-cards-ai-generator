import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnkiGen.ai - AI-Powered Anki Card Generator",
  description: "Generate high-quality Anki cards automatically with AI. Add context, images (Flux), and audio (Minimax) to your vocabulary lists in seconds.",
  keywords: ["Anki", "Spaced Repetition", "AI", "Language Learning", "Flashcards", "GPT-5", "Flux"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How does AnkiGen.ai work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "AnkiGen.ai uses advanced AI models like GPT-5.1 for context, Fal.ai Flux for images, and Minimax for audio to turn CSV vocabulary lists into rich Anki cards (.apkg)."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is it free to use?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The tool is open-source. For the cloud version, we offer a demo mode and plan options based on AI API usage."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
