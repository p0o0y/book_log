"use client";

import { useEffect, useState } from "react";

type Listener = (message: string) => void;

let listener: Listener | null = null;
let pending: string | null = null;

/** 어디서든 호출 가능한 전역 토스트 트리거 (Toaster가 마운트되어 있어야 표시됨) */
export function toast(message: string) {
  if (listener) {
    listener(message);
  } else {
    pending = message;
  }
}

/** 루트 레이아웃에 마운트되는 토스트 표시 컴포넌트 */
export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    listener = (m) => {
      setMessage(m);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setMessage(null), 3000);
    };
    if (pending) {
      listener(pending);
      pending = null;
    }
    return () => {
      listener = null;
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg"
    >
      {message}
    </div>
  );
}
