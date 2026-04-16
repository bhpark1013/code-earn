"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Terminal Animation ───────────────────────────────────────────────────────

const TERMINAL_LINES = [
  { type: "prompt", text: "$ claude \"refactor payment module\"" },
  { type: "info", text: "  Thinking..." },
  { type: "spacer", text: "" },
  { type: "ad-label", text: "  --- sponsored ---" },
  { type: "ad-body", text: "  Sentry - Error tracking, free tier" },
  { type: "ad-url", text: "  sentry.io/for/developers" },
  { type: "ad-label", text: "  -----------------" },
  { type: "spacer", text: "" },
  { type: "earn", text: "  + $0.0031 earned" },
  { type: "spacer", text: "" },
  { type: "output", text: "  Done. 8 files, 247 lines changed." },
];

const DELAYS: Record<string, number> = {
  prompt: 100,
  info: 900,
  spacer: 300,
  "ad-border": 500,
  "ad-label": 500,
  "ad-body": 220,
  "ad-url": 220,
  earn: 400,
  output: 800,
};

const COLOR_MAP: Record<string, string> = {
  prompt: "text-zinc-200",
  info: "text-zinc-500",
  spacer: "",
  "ad-border": "text-zinc-600",
  "ad-label": "text-zinc-600",
  "ad-body": "text-zinc-400",
  "ad-url": "text-zinc-500",
  earn: "text-zinc-300",
  output: "text-zinc-200",
};

function TerminalDemo() {
  const [visible, setVisible] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (visible >= TERMINAL_LINES.length) {
      const t = setTimeout(() => setVisible(0), 4000);
      return () => clearTimeout(t);
    }
    const line = TERMINAL_LINES[visible];
    const delay = DELAYS[line?.type ?? "spacer"] ?? 300;
    const t = setTimeout(() => setVisible((v) => v + 1), delay);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    const t = setInterval(() => setCursor((c) => !c), 560);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl shadow-black/40">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="ml-3 text-xs text-zinc-600 font-mono select-none">
            ~/work/my-project
          </span>
        </div>

        {/* Body */}
        <div className="px-5 py-4 font-mono text-sm h-[220px] overflow-hidden relative">
          <div
            className="transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(-${Math.max(0, (visible - 7) * 24)}px)`,
            }}
          >
            {TERMINAL_LINES.slice(0, visible).map((line, i) => (
              <div
                key={i}
                className={`leading-6 ${COLOR_MAP[line.type] ?? "text-zinc-400"}`}
              >
                {line.text === "" ? <>&nbsp;</> : line.text}
              </div>
            ))}
            <span
              className={`inline-block w-[7px] h-[14px] bg-zinc-400 align-middle transition-opacity duration-75 ${
                cursor ? "opacity-70" : "opacity-0"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Copy snippet with copy button ────────────────────────────────────────────

function CopySnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5">
      <span className="text-zinc-600 font-mono text-sm select-none">$</span>
      <code className="font-mono text-sm text-zinc-300">{code}</code>
      <button
        onClick={handleCopy}
        className="text-zinc-600 hover:text-zinc-300 transition-colors ml-1"
        aria-label="복사"
      >
        {copied ? (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-zinc-300">
            <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z" />
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-900/80 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-13 flex items-center justify-between">
          <span className="font-mono text-sm font-semibold text-zinc-200 tracking-tight">
            code-earn
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              로그인
            </Link>
            <a
              href="#install"
              className="text-xs font-medium text-zinc-900 bg-zinc-200 hover:bg-white px-3 py-1.5 rounded transition-colors"
            >
              설치하기
            </a>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-14 lg:gap-20">
            {/* Left: copy */}
            <div className="flex-1 flex flex-col gap-7 pt-2">
              <div className="space-y-4">
                <p className="text-xs font-mono text-zinc-500 tracking-wider uppercase">
                  베타 테스트 중
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1] text-zinc-100">
                  대기 시간,
                  <br />
                  낭비하지 마세요.
                </h1>
                <p className="text-base text-zinc-400 leading-relaxed max-w-sm">
                  Claude Code가 생각하는 동안 터미널에 짧은 광고가 표시됩니다.
                  코딩 흐름은 그대로, 부수입은 자동으로.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-3" id="install">
                <a
                  href="https://github.com/bhpark1013/code-earn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded bg-zinc-200 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors"
                >
                  플러그인 설치
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center gap-1 h-10 px-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  어떻게 작동하나요
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 ml-0.5">
                    <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: terminal */}
            <div className="w-full lg:flex-1">
              <TerminalDemo />
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how" className="py-20 px-6 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-xl space-y-10">
              <h2 className="text-xs font-mono text-zinc-500 tracking-wider uppercase">
                작동 방식
              </h2>

              <ol className="space-y-8">
                {[
                  {
                    n: "01",
                    title: "GitHub에서 플러그인 클론",
                    desc: "git clone 후 ~/.claude/plugins/ 에 복사하면 끝. setup.sh로 계정 등록.",
                  },
                  {
                    n: "02",
                    title: "평소처럼 코딩한다",
                    desc: "프롬프트를 보낼 때 터미널에 짧은 텍스트 광고가 뜹니다. 프롬프트나 코드는 수집하지 않습니다.",
                  },
                  {
                    n: "03",
                    title: "잔액이 쌓이면 출금",
                    desc: "대시보드에서 수익 확인. $20 이상이면 PayPal로 출금.",
                  },
                ].map((step) => (
                  <li key={step.n} className="flex gap-6 items-start">
                    <span className="font-mono text-xs text-zinc-700 pt-0.5 shrink-0 w-6 tabular-nums">
                      {step.n}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-zinc-200">{step.title}</p>
                      <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Honest pitch ─────────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-xl space-y-4">
              <h2 className="text-xs font-mono text-zinc-500 tracking-wider uppercase">
                솔직하게 말하면
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                지금은 베타입니다. 광고 인벤토리가 많지 않고, 수익도 아직 크지 않습니다.
                하루에 커피 한 잔 값 수준이라면 솔직히 잘 된 케이스입니다.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                그래도 Claude Code를 이미 쓰고 있다면, 플러그인 하나 설치하는 데 5분이면 됩니다.
                손해볼 것도 없고, 생각하고 싶지 않으면 언제든 제거하면 그만입니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer CTA ───────────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-200">설치해보기</h2>
              <p className="text-sm text-zinc-500">
                Claude Code 필수. GitHub에서 클론 후 플러그인 디렉토리에 복사.
              </p>
            </div>

            <div className="space-y-3">
              <CopySnippet code="git clone https://github.com/bhpark1013/code-earn.git" />
              <CopySnippet code="cp -r code-earn/plugin ~/.claude/plugins/marketplaces/custom/code-earn" />
              <CopySnippet code="bash ~/.claude/plugins/marketplaces/custom/code-earn/hooks/setup.sh" />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <a
                href="https://github.com/bhpark1013/code-earn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-4 rounded bg-zinc-200 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors"
              >
                GitHub
              </a>
              <Link
                href="/dashboard"
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                대시보드
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="font-mono text-xs text-zinc-700">code-earn</span>
          <div className="flex gap-5 text-xs text-zinc-700">
            <a href="#" className="hover:text-zinc-400 transition-colors">
              개인정보 처리방침
            </a>
            <a href="#" className="hover:text-zinc-400 transition-colors">
              이용약관
            </a>
            <a
              href="mailto:hello@codearn.dev"
              className="hover:text-zinc-400 transition-colors"
            >
              문의
            </a>
          </div>
          <span className="text-xs text-zinc-700">© 2025 CodeEarn</span>
        </div>
      </footer>
    </div>
  );
}
