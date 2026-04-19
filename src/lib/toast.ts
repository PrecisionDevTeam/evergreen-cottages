"use client";

// Tiny toast primitive — no dependencies, no global state library.
// The Toaster component subscribes via useSyncExternalStore.

export type ToastKind = "success" | "error" | "info";

export type ToastMessage = {
  id: number;
  kind: ToastKind;
  text: string;
};

type Listener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => { listeners.delete(listener); };
}

export function getSnapshot(): ToastMessage[] {
  return toasts;
}

function push(kind: ToastKind, text: string, durationMs = 3500) {
  const id = nextId++;
  toasts = [...toasts, { id, kind, text }];
  emit();
  if (durationMs > 0) {
    setTimeout(() => dismiss(id), durationMs);
  }
  return id;
}

export function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (text: string, durationMs?: number) => push("success", text, durationMs),
  error: (text: string, durationMs?: number) => push("error", text, durationMs ?? 5000),
  info: (text: string, durationMs?: number) => push("info", text, durationMs),
};
