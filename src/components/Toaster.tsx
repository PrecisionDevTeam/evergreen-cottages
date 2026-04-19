import { useSyncExternalStore } from "react";
import { subscribe, getSnapshot, dismiss, type ToastMessage } from "../lib/toast";

const COLORS: Record<ToastMessage["kind"], { bg: string; fg: string }> = {
  success: { bg: "bg-evergreen-50 border-evergreen-200", fg: "text-evergreen-700" },
  error:   { bg: "bg-red-50 border-red-200",             fg: "text-red-700" },
  info:    { bg: "bg-ocean-50 border-ocean-200",         fg: "text-ocean-700" },
};

function Icon({ kind }: { kind: ToastMessage["kind"] }) {
  if (kind === "success") {
    return (
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (kind === "error") {
    return (
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CloseX() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (toasts.length === 0) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none"
    >
      {toasts.map((t: ToastMessage) => {
        const c = COLORS[t.kind];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-xl border shadow-sm ${c.bg} ${c.fg}`}
          >
            <Icon kind={t.kind} />
            <p className="text-sm font-medium flex-1">{t.text}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-black/5"
              aria-label="Dismiss"
            >
              <CloseX />
            </button>
          </div>
        );
      })}
    </div>
  );
}
