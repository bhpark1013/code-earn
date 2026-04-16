"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// ─── Data ────────────────────────────────────────────────────────────────────

const tips = [
  // Claude Code
  {
    category: "Claude Code",
    tag: "CC",
    text: "/compact 명령으로 컨텍스트를 압축하면 긴 세션에서도 토큰을 절약할 수 있습니다.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "CLAUDE.md 파일에 프로젝트 규칙을 작성하면 에이전트가 자동으로 참고합니다.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "Shift+Tab으로 여러 줄을 입력하면 복잡한 명령도 한 번에 전달할 수 있습니다.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "/cost 명령으로 현재 세션의 토큰 사용량과 비용을 실시간으로 확인하세요.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "MCP 서버를 연결하면 데이터베이스, Slack, GitHub 등 외부 도구와 연동됩니다.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "Hook 설정으로 PreToolUse, PostToolUse 이벤트에 자동 명령을 실행할 수 있습니다.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "Git worktree를 활용하면 여러 브랜치를 동시에 서로 다른 디렉토리에서 작업할 수 있습니다.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "Plan 모드를 사용하면 에이전트가 실행 전에 계획을 수립하고 검토를 기다립니다.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "/clear 명령으로 대화 히스토리를 초기화하면 새로운 컨텍스트로 시작할 수 있습니다.",
  },
  {
    category: "Claude Code",
    tag: "CC",
    text: "AGENTS.md 파일로 서브에이전트별 역할과 권한을 세밀하게 제어할 수 있습니다.",
  },
  // GitHub Copilot
  {
    category: "GitHub Copilot",
    tag: "GH",
    text: "Tab 키로 Copilot 제안을 수락하고, Alt+] / Alt+[ 로 다음·이전 제안을 탐색하세요.",
  },
  {
    category: "GitHub Copilot",
    tag: "GH",
    text: "주석으로 의도를 명확히 작성하면 Copilot이 훨씬 정확한 코드를 제안합니다.",
  },
  {
    category: "GitHub Copilot",
    tag: "GH",
    text: "Copilot Chat에서 /explain, /fix, /tests 슬래시 명령을 사용하면 빠른 작업이 가능합니다.",
  },
  {
    category: "GitHub Copilot",
    tag: "GH",
    text: "여러 파일을 열어두면 Copilot이 프로젝트 문맥을 더 잘 이해하여 제안의 질이 올라갑니다.",
  },
  {
    category: "GitHub Copilot",
    tag: "GH",
    text: "Copilot Workspace로 이슈에서 PR까지 전체 개발 플로우를 자동화할 수 있습니다.",
  },
  // General AI Coding
  {
    category: "AI 코딩 일반",
    tag: "AI",
    text: "AI에게 코드를 요청할 때 입출력 예시를 함께 제공하면 정확도가 크게 높아집니다.",
  },
  {
    category: "AI 코딩 일반",
    tag: "AI",
    text: "생성된 코드를 그대로 쓰지 말고, 항상 로직을 이해하고 테스트를 작성하세요.",
  },
  {
    category: "AI 코딩 일반",
    tag: "AI",
    text: "AI에게 '왜 이 방법을 선택했나요?'를 물으면 대안과 트레이드오프를 파악할 수 있습니다.",
  },
  {
    category: "AI 코딩 일반",
    tag: "AI",
    text: "에러 메시지 전체를 복사해서 붙여넣으면 AI가 스택 트레이스를 분석해 원인을 찾습니다.",
  },
  {
    category: "AI 코딩 일반",
    tag: "AI",
    text: "리팩토링 요청 시 '변경 범위를 최소화하고 기존 패턴을 유지해줘'라고 명시하면 좋습니다.",
  },
  {
    category: "AI 코딩 일반",
    tag: "AI",
    text: "복잡한 기능은 한 번에 요청하지 말고 작은 단계로 나눠 대화하며 구현하세요.",
  },
  {
    category: "AI 코딩 일반",
    tag: "AI",
    text: "AI가 생성한 SQL 쿼리는 실행 계획(EXPLAIN)으로 성능을 반드시 확인하세요.",
  },
];

const trendingRepos = [
  {
    name: "anthropics/claude-code",
    stars: "12.4k",
    desc: "터미널에서 직접 Claude AI와 페어 프로그래밍할 수 있는 공식 CLI 도구",
    lang: "TypeScript",
    langColor: "#3178c6",
  },
  {
    name: "microsoft/vscode",
    stars: "165k",
    desc: "가장 인기 있는 오픈소스 코드 에디터. Copilot, 확장성, 멀티 플랫폼 지원",
    lang: "TypeScript",
    langColor: "#3178c6",
  },
  {
    name: "continuedev/continue",
    stars: "21k",
    desc: "VS Code / JetBrains용 오픈소스 AI 코딩 어시스턴트. 로컬 모델 연동 가능",
    lang: "TypeScript",
    langColor: "#3178c6",
  },
  {
    name: "ollama/ollama",
    stars: "98k",
    desc: "로컬에서 Llama 3, Mistral, Gemma 등 LLM을 손쉽게 실행하는 툴",
    lang: "Go",
    langColor: "#00aed8",
  },
  {
    name: "cline/cline",
    stars: "38k",
    desc: "VS Code에서 AI가 파일을 직접 수정·실행하는 자율 코딩 에이전트 확장",
    lang: "TypeScript",
    langColor: "#3178c6",
  },
  {
    name: "vercel/ai",
    stars: "14k",
    desc: "React/Next.js에서 스트리밍 AI UI를 빠르게 구축하는 공식 AI SDK",
    lang: "TypeScript",
    langColor: "#3178c6",
  },
];

const devNews = [
  {
    time: "2시간 전",
    title: "Claude 4 Opus 출시 — 코딩 벤치마크에서 GPT-5 능가",
    tag: "AI",
  },
  {
    time: "5시간 전",
    title: "GitHub Copilot, 에이전트 모드 GA — 이슈에서 PR까지 자동화",
    tag: "도구",
  },
  {
    time: "1일 전",
    title: "Next.js 16 정식 출시 — React 19 완전 지원·Turbopack 기본 설정",
    tag: "프레임워크",
  },
  {
    time: "1일 전",
    title: "Stack Overflow 설문: 개발자 76%가 AI 코딩 도구 매일 사용",
    tag: "업계",
  },
  {
    time: "2일 전",
    title: "Google DeepMind AlphaCode 3, IOI 금메달 수준 도달",
    tag: "AI",
  },
  {
    time: "3일 전",
    title: "Rust, JavaScript를 제치고 WebAssembly 생태계 1위 언어 등극",
    tag: "언어",
  },
];

const quizItems = [
  {
    question: "`git rebase`는 무엇을 하는 명령어인가요?",
    code: null,
    options: [
      "새 브랜치를 만든다",
      "커밋 히스토리를 다른 베이스 위로 재배치한다",
      "원격 브랜치를 로컬로 복제한다",
      "스테이징 영역을 초기화한다",
    ],
    answer: 1,
    explanation:
      "rebase는 현재 브랜치의 커밋들을 지정한 베이스 커밋 위에 순서대로 재적용합니다. merge와 달리 선형 히스토리를 유지합니다.",
  },
  {
    question: "다음 TypeScript 코드의 출력 결과는?",
    code: `type T = string extends unknown ? 'yes' : 'no';`,
    options: ["'no'", "'yes'", "TypeError", "undefined"],
    answer: 1,
    explanation:
      "string은 unknown의 서브타입이므로 조건부 타입 'string extends unknown'은 true가 되어 'yes'가 됩니다.",
  },
  {
    question: "HTTP 상태 코드 429의 의미는?",
    code: null,
    options: [
      "요청 형식 오류",
      "인증 필요",
      "요청 횟수 초과 (Rate Limit)",
      "서버 내부 오류",
    ],
    answer: 2,
    explanation:
      "429 Too Many Requests — 클라이언트가 짧은 시간 내에 너무 많은 요청을 보냈을 때 서버가 반환합니다. AI API에서 자주 마주치는 코드입니다.",
  },
  {
    question: "React의 `useCallback` 훅의 주요 목적은?",
    code: null,
    options: [
      "비동기 함수를 동기로 변환",
      "함수 참조를 메모이제이션하여 불필요한 리렌더 방지",
      "전역 상태를 구독",
      "컴포넌트 언마운트 시 정리 작업 실행",
    ],
    answer: 1,
    explanation:
      "useCallback은 의존성 배열이 변경될 때만 새 함수 참조를 생성합니다. 자식 컴포넌트에 함수를 props로 전달할 때 불필요한 리렌더를 막는 데 사용합니다.",
  },
  {
    question: "CSS `z-index`가 동작하려면 반드시 필요한 조건은?",
    code: null,
    options: [
      "display: flex 설정",
      "position이 static이 아닌 값으로 설정",
      "overflow: hidden 설정",
      "width/height 명시",
    ],
    answer: 1,
    explanation:
      "z-index는 position 속성이 relative, absolute, fixed, sticky 중 하나일 때만 동작합니다. position: static(기본값)인 요소에는 z-index가 적용되지 않습니다.",
  },
];

// ─── Tag color map ────────────────────────────────────────────────────────────
const tagStyle: Record<string, string> = {
  CC: "bg-green-950 text-green-400 border border-green-800",
  GH: "bg-blue-950 text-blue-400 border border-blue-800",
  AI: "bg-violet-950 text-violet-400 border border-violet-800",
  도구: "bg-orange-950 text-orange-400 border border-orange-800",
  프레임워크: "bg-sky-950 text-sky-400 border border-sky-800",
  업계: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  AI뉴스: "bg-violet-950 text-violet-400 border border-violet-800",
  언어: "bg-yellow-950 text-yellow-400 border border-yellow-800",
};

function getTagClass(tag: string) {
  return (
    tagStyle[tag] ?? "bg-zinc-800 text-zinc-300 border border-zinc-700"
  );
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

function TipCard({ tip, visible }: { tip: (typeof tips)[0]; visible: boolean }) {
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
        <span className="text-zinc-600 font-mono text-[10px]">tip</span>
      </div>
      <p className="text-zinc-300 leading-relaxed text-sm">{tip.text}</p>
    </div>
  );
}

function TrendingRepos() {
  return (
    <section className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-green-500 font-mono text-xs">$</span>
        <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">
          인기 개발 도구 &amp; 레포
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
  const newsTagMap: Record<string, string> = {
    AI: "AI",
    도구: "도구",
    프레임워크: "프레임워크",
    업계: "업계",
    언어: "언어",
  };

  return (
    <section className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-green-500 font-mono text-xs">$</span>
        <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">
          개발자 뉴스
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
              className={`mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${getTagClass(newsTagMap[item.tag] ?? item.tag)}`}
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
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const quiz = quizItems[quizIndex];
  const answered = selected !== null;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setTotal((t) => t + 1);
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
          미니 코딩 퀴즈
        </h2>
        <div className="flex-1 h-px bg-zinc-800" />
        {total > 0 && (
          <span className="text-zinc-500 font-mono text-[10px]">
            {score}/{total} 정답
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
            style={{
              animation: "fadeSlideIn 0.4s ease forwards",
            }}
            className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 mb-4"
          >
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              <span className="text-green-400 font-mono font-bold mr-1">
                {selected === quiz.answer ? "✓ 정답!" : "✗ 오답"}
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
            다음 문제 →
          </button>
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ elapsed }: { elapsed: number }) {
  // Visual rhythm: fills over 60 seconds then resets
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
  const searchParams = useSearchParams();
  const userId = searchParams.get("uid");
  const sessionId = searchParams.get("sid");

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
  }, [reportSession]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr =
    minutes > 0
      ? `${minutes}분 ${String(seconds).padStart(2, "0")}초`
      : `${seconds}초`;

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
              광고를 시청하며 수익을 쌓고 있습니다
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
                aria-label={`팁 ${i + 1}`}
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
          에이전트 응답이 완료되면 이 페이지는 자동으로 닫힙니다
        </footer>
      </div>
    </>
  );
}
