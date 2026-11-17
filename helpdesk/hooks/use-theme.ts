"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "theme";
const listeners = new Set<() => void>();

function read(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, read, () => "light");

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(KEY, next);
    listeners.forEach((l) => l());
  }, []);

  const toggle = useCallback(
    () => setTheme(read() === "dark" ? "light" : "dark"),
    [setTheme]
  );

  return { theme, setTheme, toggle };
}