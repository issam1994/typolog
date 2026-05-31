"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const COLOR = "#6366f1";

function NavigationWatcher({ onComplete }: { onComplete: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    onComplete();
  }, [pathname, searchParams, onComplete]);

  return null;
}

type Phase = "idle" | "loading" | "done";

export default function TopProgressBar() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const clearTimers = () => {
      if (fadeTimer.current) {
        clearTimeout(fadeTimer.current);
        fadeTimer.current = null;
      }
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
    };

    const start = () => {
      clearTimers();
      setAnimKey((k) => k + 1);
      setPhase("loading");
      setScale(0);
      setVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setScale(0.85);
          setVisible(true);
        });
      });
    };

    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;

    window.history.pushState = function patchedPush(...args) {
      const result = origPush.apply(this, args as Parameters<typeof origPush>);
      start();
      return result;
    };
    window.history.replaceState = function patchedReplace(...args) {
      const result = origReplace.apply(
        this,
        args as Parameters<typeof origReplace>,
      );
      start();
      return result;
    };
    window.addEventListener("popstate", start);

    return () => {
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener("popstate", start);
      clearTimers();
    };
  }, []);

  const handleComplete = useCallback(() => {
    setPhase((current) => {
      if (current !== "loading") return current;
      setScale(1);
      fadeTimer.current = setTimeout(() => setVisible(false), 200);
      resetTimer.current = setTimeout(() => {
        setPhase("idle");
        setScale(0);
      }, 600);
      return "done";
    });
  }, []);

  const barStyle: React.CSSProperties = {
    height: "100%",
    width: "100%",
    backgroundColor: COLOR,
    transformOrigin: "left",
    transform: `scaleX(${scale})`,
    opacity: visible ? 1 : 0,
    transition:
      phase === "loading"
        ? "transform 8s cubic-bezier(0, 0.7, 0.2, 1), opacity 200ms ease-out 150ms"
        : "transform 200ms ease-out, opacity 300ms ease-out",
    boxShadow: `0 0 8px ${COLOR}80`,
  };

  return (
    <>
      <Suspense fallback={null}>
        <NavigationWatcher onComplete={handleComplete} />
      </Suspense>
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 right-0 h-[3px] z-[9999]"
      >
        <div key={animKey} style={barStyle} />
      </div>
    </>
  );
}
