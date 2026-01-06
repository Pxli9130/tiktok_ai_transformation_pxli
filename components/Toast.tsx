export default function Toast({
  message,
  visible,
  tone
}: {
  message: string;
  visible: boolean;
  tone: "success" | "error";
}) {
  if (!visible) {
    return null;
  }

  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-2xl border px-4 py-3 text-sm shadow-soft ${toneClasses} animate-rise`}
      role="status"
    >
      {message}
    </div>
  );
}
