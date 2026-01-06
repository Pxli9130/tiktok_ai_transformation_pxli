import { Copy } from "lucide-react";

export default function CopyButton({
  text,
  label,
  onResult
}: {
  text: string;
  label: string;
  onResult: (message: string, success: boolean) => void;
}) {
  const handleCopy = async () => {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(text);
      onResult("Copied to clipboard.", true);
    } catch (error) {
      onResult("Copy failed. Please select and copy manually.", false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:-translate-y-0.5 hover:shadow-glow"
    >
      <Copy className="h-4 w-4" />
      {label}
    </button>
  );
}
