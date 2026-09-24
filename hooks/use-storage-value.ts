"use client"

import * as React from "react"

type StorageArea = "local" | "session"

// Same-tab writes don't fire the native `storage` event, so writers dispatch
// this one; other tabs are covered by the native event.
const LOCAL_WRITE_EVENT = "aura:storage-write"

function getStorage(area: StorageArea): Storage | null {
  try {
    return area === "local" ? window.localStorage : window.sessionStorage
  } catch {
    // Access throws when storage is blocked (privacy mode, disabled cookies).
    return null
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange)
  window.addEventListener(LOCAL_WRITE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(LOCAL_WRITE_EVENT, onChange)
  }
}

/**
 * Reads a Web Storage key as external state via useSyncExternalStore: the
 * server snapshot is always `null`, so SSR markup and the first client
 * render agree (no hydration mismatch), and every component using the same
 * key re-renders when it changes — without setState-in-effect round trips.
 */
export function useStorageValue(
  area: StorageArea,
  key: string
): [string | null, (value: string | null) => void] {
  const value = React.useSyncExternalStore(
    subscribe,
    () => {
      try {
        return getStorage(area)?.getItem(key) ?? null
      } catch {
        return null
      }
    },
    () => null
  )

  const setValue = React.useCallback(
    (next: string | null) => {
      try {
        const storage = getStorage(area)
        if (next === null) storage?.removeItem(key)
        else storage?.setItem(key, next)
      } catch {
        // Quota exceeded or storage blocked — the value simply isn't persisted.
      }
      window.dispatchEvent(new Event(LOCAL_WRITE_EVENT))
    },
    [area, key]
  )

  return [value, setValue]
}

const noopSubscribe = (): (() => void) => () => {}

/** Keyboard-shortcut label for the current platform; "Ctrl K" during SSR. */
export function useShortcutLabel(): string {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => "Ctrl K"
  )
}
