import { Sparkles } from "lucide-react";
import type { Lang } from "@/lib/types";

export default function TopicForm({
  topic,
  language,
  onTopicChange,
  onLanguageChange,
  onSubmit,
  disabled,
  error
}: {
  topic: string;
  language: Lang;
  onTopicChange: (value: string) => void;
  onLanguageChange: (value: Lang) => void;
  onSubmit: () => void;
  disabled: boolean;
  error: string | null;
}) {
  return (
    <div className="card-surface space-y-4 rounded-3xl p-6 shadow-soft">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Describe your topic
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter a niche or theme. We will craft three distinct short-video
          script directions with trend signals.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <input
          value={topic}
          onChange={(event) => onTopicChange(event.target.value)}
          placeholder="e.g. Japan Travel, Home Cooking, 城市夜跑"
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value as Lang)}
          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-slate-500">
          2-120 characters. Chinese and English supported.
        </p>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        <Sparkles className="h-4 w-4" />
        {disabled ? "Generating" : "Generate"}
      </button>
    </div>
  );
}
