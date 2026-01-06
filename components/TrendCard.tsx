import type { TrendInsight } from "@/lib/types";
import CopyButton from "./CopyButton";

export default function TrendCard({
  trends,
  onCopy
}: {
  trends: TrendInsight;
  onCopy: (message: string, success: boolean) => void;
}) {
  const hashtagsText = trends.hashtags.join(" ");

  return (
    <div className="card-surface flex h-full flex-col gap-4 rounded-3xl p-6 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Trend Signals
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">
          Hashtags + BGM Direction
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {trends.hashtags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 text-sm text-slate-700">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          BGM Suggestion
        </span>
        <p className="mt-1 whitespace-pre-line text-base text-slate-900">
          {trends.bgm_suggestion}
        </p>
      </div>
      <CopyButton text={hashtagsText} label="Copy Hashtags" onResult={onCopy} />
    </div>
  );
}
