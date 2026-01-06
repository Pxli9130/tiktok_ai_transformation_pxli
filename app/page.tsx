"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { ApiError, InsightResponse, Lang } from "@/lib/types";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import ScriptCard from "@/components/ScriptCard";
import Toast from "@/components/Toast";
import TopicForm from "@/components/TopicForm";
import TrendCard from "@/components/TrendCard";

const MIN_TOPIC = 2;
const MAX_TOPIC = 120;

export default function Home() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<Lang>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [data, setData] = useState<InsightResponse | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
    visible: boolean;
  }>({ message: "", tone: "success", visible: false });

  const trimmedTopic = useMemo(() => topic.trim(), [topic]);

  useEffect(() => {
    if (!inputError) return;
    if (trimmedTopic.length >= MIN_TOPIC) {
      setInputError(null);
    }
  }, [inputError, trimmedTopic.length]);

  const validateTopic = () => {
    if (!trimmedTopic) {
      return "Please enter a topic before generating.";
    }
    if (trimmedTopic.length < MIN_TOPIC || trimmedTopic.length > MAX_TOPIC) {
      return `Topic must be between ${MIN_TOPIC} and ${MAX_TOPIC} characters.`;
    }
    return null;
  };

  const showToast = (message: string, success: boolean) => {
    setToast({ message, tone: success ? "success" : "error", visible: true });
    window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 2600);
  };

  const handleGenerate = async () => {
    const validationError = validateTopic();
    if (validationError) {
      setInputError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmedTopic, language })
      });

      if (!response.ok) {
        const payload = (await response.json()) as ApiError;
        const message = payload?.error?.message ?? "Something went wrong.";
        setError(message);
        return;
      }

      const payload = (await response.json()) as InsightResponse;
      setData(payload);
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500">
              TikTok Creator Insight Assistant
            </p>
            <h1 className="text-balance text-4xl font-semibold text-slate-900 md:text-5xl">
              Turn a loose idea into three crisp short-video scripts.
            </h1>
            <p className="text-base text-slate-600">
              Generate hooks, narrative beats, and CTAs plus trend-ready hashtags
              and music vibe guidance in one click.
            </p>
          </div>
          <div className="card-surface relative overflow-hidden rounded-3xl p-6 shadow-soft">
            <div className="absolute -right-10 top-6 h-32 w-32 animate-float rounded-full bg-amber-200/70 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-32 w-32 animate-float rounded-full bg-sky-200/70 blur-3xl" />
            <div className="relative space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Workflow
              </p>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Describe your niche
                  </p>
                  <p className="text-xs text-slate-600">
                    Keep it short, mix zh/en as needed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-slate-900" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Generate structured scripts
                  </p>
                  <p className="text-xs text-slate-600">
                    Three distinct angles with trend signals.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Copy and create
                  </p>
                  <p className="text-xs text-slate-600">
                    Use one-click copy to move fast.
                  </p>
                </div>
              </div>
              {data ? (
                <a
                  href="#results"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
                >
                  Jump to results <ArrowUpRight className="h-3 w-3" />
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Jump to results <ArrowUpRight className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>
        </header>

        <TopicForm
          topic={topic}
          language={language}
          onTopicChange={setTopic}
          onLanguageChange={setLanguage}
          onSubmit={handleGenerate}
          disabled={loading}
          error={inputError}
        />

        {loading ? <LoadingState /> : null}

        {error ? <ErrorState message={error} onRetry={handleGenerate} /> : null}

        {data ? (
          <section id="results" className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">
                Your Insight Pack
              </h2>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {data.language.toUpperCase()} • {data.provider.model}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-[1.1fr_1.4fr]">
              <TrendCard
                trends={data.trends}
                onCopy={showToast}
              />
              <div className="grid gap-6">
                {data.scripts.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    onCopy={showToast}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
      <Toast message={toast.message} visible={toast.visible} tone={toast.tone} />
    </div>
  );
}
