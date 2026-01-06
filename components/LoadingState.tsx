import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-slate-600 shadow-soft">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Generating insights. This usually takes a few seconds.</span>
    </div>
  );
}
