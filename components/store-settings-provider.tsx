"use client"

import * as React from "react"
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from "@/lib/backend-settings"

const StoreSettingsContext = React.createContext<StoreSettings>(DEFAULT_STORE_SETTINGS)

/** Hands the server-fetched store settings to client components (logo, cart, banner). */
export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: StoreSettings
  children: React.ReactNode
}) {
  return <StoreSettingsContext.Provider value={settings}>{children}</StoreSettingsContext.Provider>
}

export function useStoreSettings(): StoreSettings {
  return React.useContext(StoreSettingsContext)
}
