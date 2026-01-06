import { AlertTriangle } from "lucide-react";

export default function ErrorState({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-900 shadow-soft">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4" />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-700 transition hover:-translate-y-0.5 hover:shadow-glow"
      >
        Retry
      </button>
    </div>
  );
}
