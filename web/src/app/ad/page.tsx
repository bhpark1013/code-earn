"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useCallback, useState } from "react";
import { useT } from "@/lib/i18n";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// ─── Tag color map ────────────────────────────────────────────────────────────
const tagStyle: Record<string, string> = {
  CC: "bg-green-950 text-green-400 border border-green-800",
  GH: "bg-blue-950 text-blue-400 border border-blue-800",
  AI: "bg-violet-950 text-violet-400 border border-violet-800",
  Tools: "bg-orange-950 text-orange-400 border border-orange-800",
  도구: "bg-orange-950 text-orange-400 border border-orange-800",
  Framework: "bg-sky-950 text-sky-400 border border-sky-800",
  프레임워크: "bg-sky-950 text-sky-400 border border-sky-800",
  Industry: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  업계: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  Languages: "bg-yellow-950 text-yellow-400 border border-yellow-800",
  언어: "bg-yellow-950 text-yellow-400 border border-yellow-800",
};

function getTagClass(tag: string) {
  return tagStyle[tag] ?? "bg-zinc-800 text-zinc-300 border border-zinc-700";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AdSlot({ format }: { format: string }) {
  return (
    <div className="w-full">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format={format}
        data-full-width-responsive={format === "auto" ? "true" : undefined}
      />
    </div>
  );
}

function TipCard({ tip, visible }: { tip: { category: string; tag: string; text: string }; visible: boolean }) {
  const { t } = useT();
  return (
    <div
      style={{
        transition: "opacity 0.6s ease, transform 0.6s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-5 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${getTagClass(tip.tag)}`}
        >
          {tip.category}
        </span>
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-600 font-mono text-[10px]">{t("ad_tip_label")}</span>
      </div>
      <p className="text-zinc-300 leading-relaxed text-sm">{tip.text}</p>
    </div>
  );
}

function TrendingRepos() {
  const { t } = useT();

  const trendingRepos = [
    {
      name: "anthropics/claude-code",
      stars: "12.4k",
      desc: t("repo_claude_code_desc"),
      lang: "TypeScript",
      langColor: "#3178c6",
    },
    {
      name: "microsoft/vscode",
      stars: "165k",
      desc: t("repo_vscode_desc"),
      lang: "TypeScript",
      langColor: "#3178c6",
    },
    {
      name: "continuedev/continue",
      stars: "21k",
      desc: t("repo_continue_desc"),
      lang: "TypeScript",
      langColor: "#3178c6",
    },
    {
      name: "ollama/ollama",
      stars: "98k",
      desc: t("repo_ollama_desc"),
      lang: "Go",
      langColor: "#00aed8",
    },
    {
      name: "cline/cline",
      stars: "38k",
      desc: t("repo_cline_desc"),
      lang: "TypeScript",
      langColor: "#3178c6",
    },
    {
      name: "vercel/ai",
      stars: "14k",
      desc: t("repo_vercel_ai_desc"),
      lang: "TypeScript",
      langColor: "#3178c6",
    },
  ];

  return (
    <section className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-green-500 font-mono text-xs">$</span>
        <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">
          {t("ad_trending_title")}
        </h2>
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-600 font-mono text-[10px]">trending</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {trendingRepos.map((repo) => (
          <div
            key={repo.name}
            className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-mono text-xs text-green-400 break-all leading-tight">
                {repo.name}
              </span>
              <span className="flex items-center gap-1 text-zinc-500 text-[11px] shrink-0">
                <svg
                  className="w-3 h-3 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {repo.stars}
              </span>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed mb-2">
              {repo.desc}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: repo.langColor }}
              />
              <span className="text-zinc-600 text-[10px] font-mono">
                {repo.lang}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DevNews() {
  const { t } = useT();

  const devNews = [
    { time: t("news_1_time"), title: t("news_1_title"), tag: t("news_1_tag") },
    { time: t("news_2_time"), title: t("news_2_title"), tag: t("news_2_tag") },
    { time: t("news_3_time"), title: t("news_3_title"), tag: t("news_3_tag") },
    { time: t("news_4_time"), title: t("news_4_title"), tag: t("news_4_tag") },
    { time: t("news_5_time"), title: t("news_5_title"), tag: t("news_5_tag") },
    { time: t("news_6_time"), title: t("news_6_title"), tag: t("news_6_tag") },
  ];

  return (
    <section className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-green-500 font-mono text-xs">$</span>
        <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">
          {t("ad_news_title")}
        </h2>
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-600 font-mono text-[10px]">dev news</span>
      </div>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
        {devNews.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors duration-150"
          >
            <span
              className={`mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${getTagClass(item.tag)}`}
            >
              {item.tag}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 text-xs leading-snug">{item.title}</p>
              <p className="text-zinc-600 text-[10px] mt-0.5 font-mono">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniQuiz() {
  const { t } = useT();

  const quizItems = [
    {
      question: t("quiz_1_question"),
      code: null,
      options: [t("quiz_1_opt_0"), t("quiz_1_opt_1"), t("quiz_1_opt_2"), t("quiz_1_opt_3")],
      answer: 1,
      explanation: t("quiz_1_explanation"),
    },
    {
      question: t("quiz_2_question"),
      code: `type T = string extends unknown ? 'yes' : 'no';`,
      options: [t("quiz_2_opt_0"), t("quiz_2_opt_1"), t("quiz_2_opt_2"), t("quiz_2_opt_3")],
      answer: 1,
      explanation: t("quiz_2_explanation"),
    },
    {
      question: t("quiz_3_question"),
      code: null,
      options: [t("quiz_3_opt_0"), t("quiz_3_opt_1"), t("quiz_3_opt_2"), t("quiz_3_opt_3")],
      answer: 2,
      explanation: t("quiz_3_explanation"),
    },
    {
      question: t("quiz_4_question"),
      code: null,
      options: [t("quiz_4_opt_0"), t("quiz_4_opt_1"), t("quiz_4_opt_2"), t("quiz_4_opt_3")],
      answer: 1,
      explanation: t("quiz_4_explanation"),
    },
    {
      question: t("quiz_5_question"),
      code: null,
      options: [t("quiz_5_opt_0"), t("quiz_5_opt_1"), t("quiz_5_opt_2"), t("quiz_5_opt_3")],
      answer: 1,
      explanation: t("quiz_5_explanation"),
    },
  ];

  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const quiz = quizItems[quizIndex];
  const answered = selected !== null;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setTotal((tv) => tv + 1);
    if (idx === quiz.answer) setScore((s) => s + 1);
  }

  function handleNext() {
    setSelected(null);
    setQuizIndex((i) => (i + 1) % quizItems.length);
  }

  return (
    <section className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-green-500 font-mono text-xs">$</span>
        <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">
          {t("ad_quiz_title")}
        </h2>
        <div className="flex-1 h-px bg-zinc-800" />
        {total > 0 && (
          <span className="text-zinc-500 font-mono text-[10px]">
            {score}/{total} {t("ad_score_suffix")}
          </span>
        )}
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
        {/* Question */}
        <p className="text-zinc-200 text-sm leading-relaxed mb-3">
          {quiz.question}
        </p>

        {/* Code block */}
        {quiz.code && (
          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs font-mono text-green-300 mb-4 overflow-x-auto">
            <code>{quiz.code}</code>
          </pre>
        )}

        {/* Options */}
        <div className="flex flex-col gap-2 mb-4">
          {quiz.options.map((opt, idx) => {
            let style =
              "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300";
            if (answered) {
              if (idx === quiz.answer) {
                style = "border border-green-600 bg-green-950 text-green-300";
              } else if (idx === selected) {
                style = "border border-red-700 bg-red-950 text-red-400";
              } else {
                style = "border border-zinc-800 text-zinc-600";
              }
            } else if (idx === selected) {
              style = "border border-green-600 bg-green-950 text-green-300";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer disabled:cursor-default ${style}`}
              >
                <span className="text-zinc-600 mr-2">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div
            style={{ animation: "fadeSlideIn 0.4s ease forwards" }}
            className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 mb-4"
          >
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              <span className="text-green-400 font-mono font-bold mr-1">
                {selected === quiz.answer ? t("ad_quiz_correct") : t("ad_quiz_wrong")}
              </span>
              {quiz.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-700 font-mono text-[10px]">
            {quizIndex + 1} / {quizItems.length}
          </span>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg bg-green-900 border border-green-700 text-green-300 text-xs font-mono hover:bg-green-800 transition-colors duration-150 cursor-pointer"
          >
            {t("ad_quiz_next")}
          </button>
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ elapsed }: { elapsed: number }) {
  const pct = (elapsed % 60) / 60;
  return (
    <div className="w-full h-0.5 bg-zinc-800 overflow-hidden">
      <div
        className="h-full bg-green-500"
        style={{
          width: `${pct * 100}%`,
          transition: "width 1s linear",
        }}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500 font-mono text-sm">
          <span className="animate-pulse">loading...</span>
        </div>
      }
    >
      <AdContent />
    </Suspense>
  );
}

function AdContent() {
  const { t, locale } = useT();
  const searchParams = useSearchParams();
  const userId = searchParams.get("uid");
  const sessionId = searchParams.get("sid");

  const tips = [
    { category: "Claude Code", tag: "CC", text: t("tip_cc_1") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_2") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_3") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_4") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_5") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_6") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_7") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_8") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_9") },
    { category: "Claude Code", tag: "CC", text: t("tip_cc_10") },
    { category: "GitHub Copilot", tag: "GH", text: t("tip_gh_1") },
    { category: "GitHub Copilot", tag: "GH", text: t("tip_gh_2") },
    { category: "GitHub Copilot", tag: "GH", text: t("tip_gh_3") },
    { category: "GitHub Copilot", tag: "GH", text: t("tip_gh_4") },
    { category: "GitHub Copilot", tag: "GH", text: t("tip_gh_5") },
    { category: locale === "en" ? "AI General" : "AI 코딩 일반", tag: "AI", text: t("tip_ai_1") },
    { category: locale === "en" ? "AI General" : "AI 코딩 일반", tag: "AI", text: t("tip_ai_2") },
    { category: locale === "en" ? "AI General" : "AI 코딩 일반", tag: "AI", text: t("tip_ai_3") },
    { category: locale === "en" ? "AI General" : "AI 코딩 일반", tag: "AI", text: t("tip_ai_4") },
    { category: locale === "en" ? "AI General" : "AI 코딩 일반", tag: "AI", text: t("tip_ai_5") },
    { category: locale === "en" ? "AI General" : "AI 코딩 일반", tag: "AI", text: t("tip_ai_6") },
    { category: locale === "en" ? "AI General" : "AI 코딩 일반", tag: "AI", text: t("tip_ai_7") },
  ];

  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  const reported = useRef(false);

  const reportSession = useCallback(async () => {
    if (reported.current || !userId || !sessionId) return;
    reported.current = true;
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, sessionId, duration }),
    });
  }, [userId, sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    const tipTimer = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
        setTipVisible(true);
      }, 650);
    }, 9000);

    window.addEventListener("beforeunload", reportSession);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
      window.removeEventListener("beforeunload", reportSession);
      reportSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportSession]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr =
    locale === "ko"
      ? minutes > 0
        ? `${minutes}분 ${String(seconds).padStart(2, "0")}초`
        : `${seconds}초`
      : minutes > 0
        ? `${minutes}m ${String(seconds).padStart(2, "0")}s`
        : `${seconds}s`;

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-mono">
        {/* Progress bar */}
        <ProgressBar elapsed={elapsed} />

        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight">
              Code<span className="text-green-500">Earn</span>
            </span>
            <span className="hidden sm:block text-[11px] text-zinc-600">
              {t("ad_earning_header")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="tabular-nums">{timeStr}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col items-center gap-6 px-4 py-8 max-w-2xl mx-auto w-full">
          {/* Ad slot 1 */}
          <AdSlot format="auto" />

          {/* Tip card */}
          <TipCard tip={tips[tipIndex]} visible={tipVisible} />

          {/* Tip dots navigation */}
          <div className="flex gap-1.5">
            {tips.slice(0, 8).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setTipVisible(false);
                  setTimeout(() => {
                    setTipIndex(i);
                    setTipVisible(true);
                  }, 300);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  tipIndex % tips.length === i
                    ? "bg-green-500 scale-125"
                    : "bg-zinc-700 hover:bg-zinc-500"
                }`}
                aria-label={`${t("ad_tip_aria")} ${i + 1}`}
              />
            ))}
          </div>

          {/* Ad slot 2 */}
          <AdSlot format="rectangle" />

          {/* Trending repos */}
          <TrendingRepos />

          {/* Dev news */}
          <DevNews />

          {/* Ad slot 3 */}
          <AdSlot format="auto" />

          {/* Mini quiz */}
          <MiniQuiz />
        </main>

        {/* Footer */}
        <footer className="px-5 py-4 border-t border-zinc-800 text-center text-[11px] text-zinc-700 font-mono">
          {t("ad_footer")}
        </footer>
      </div>
    </>
  );
}
