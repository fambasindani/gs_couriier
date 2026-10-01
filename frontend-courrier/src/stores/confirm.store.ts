import type { ReactNode } from 'react'
import { create } from 'zustand'

export interface ConfirmOptions {
  title?: string
  message: ReactNode
  confirmLabel?: string
  tone?: 'danger' | 'primary'
}

interface ConfirmState {
  options: ConfirmOptions | null
  resolver: ((value: boolean) => void) | null
  request: (options: ConfirmOptions) => Promise<boolean>
  resolve: (value: boolean) => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  options: null,
  resolver: null,
  request: (options) =>
    new Promise<boolean>((resolve) => {
      set({ options, resolver: resolve })
    }),
  resolve: (value) => {
    const { resolver } = get()
    set({ options: null, resolver: null })
    resolver?.(value)
  },
}))

/** Demande une confirmation et renvoie une promesse (true = confirmé). */
export function useConfirm() {
  return useConfirmStore((state) => state.request)
}
