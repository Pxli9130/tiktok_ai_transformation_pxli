import type { VideoScript } from "@/lib/types";
import CopyButton from "./CopyButton";

export default function ScriptCard({
  script,
  onCopy
}: {
  script: VideoScript;
  onCopy: (message: string, success: boolean) => void;
}) {
  const formattedScript = `Style: ${script.style}\nHook: ${script.hook}\nNarrative:\n${script.narrative
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n")}\nCTA: ${script.cta}`;

  return (
    <div className="card-surface flex h-full flex-col gap-4 rounded-3xl p-6 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {script.style} Script
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">
          {script.hook}
        </h3>
      </div>
      <div className="space-y-3 text-sm text-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Narrative Beats
        </p>
        <ul className="list-disc space-y-2 pl-4">
          {script.narrative.map((beat, index) => (
            <li key={`${script.id}-${index}`}>{beat}</li>
          ))}
        </ul>
      </div>
      <div className="mt-auto rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 text-sm text-slate-700">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          CTA
        </span>
        <p className="mt-1 text-base text-slate-900">{script.cta}</p>
      </div>
      <CopyButton text={formattedScript} label="Copy Script" onResult={onCopy} />
    </div>
  );
}
