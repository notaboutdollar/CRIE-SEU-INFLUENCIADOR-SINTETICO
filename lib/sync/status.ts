"use client";

import { create } from "zustand";

export type SyncStatus = "local" | "loading" | "saving" | "saved" | "error";

interface SyncState {
  status: SyncStatus;
  error: string | null;
  set: (status: SyncStatus, error?: string | null) => void;
}

export const useSyncStatus = create<SyncState>()((set) => ({
  status: "local",
  error: null,
  set: (status, error = null) => set({ status, error }),
}));
