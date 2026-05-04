import { Entry, Category } from '../../electron/types'

declare global {
  interface Window {
    electronAPI: {
      window: {
        minimize: () => Promise<void>
        maximize: () => Promise<void>
        close: () => Promise<void>
      }
      vault: {
        exists: () => Promise<boolean>
        create: (password: string) => Promise<{ success: boolean; categories?: Category[]; entries?: Entry[]; error?: string }>
        reset: () => Promise<{ success: boolean; error?: string }>
        verify: (password: string) => Promise<{ success: boolean; categories?: Category[]; entries?: Entry[]; error?: string }>
        lock: () => Promise<{ success: boolean }>
        status: () => Promise<{ isUnlocked: boolean; hasVault: boolean }>
        getData: () => Promise<{ categories: Category[]; entries: Entry[] } | null>
        save: (password: string) => Promise<{ success: boolean; error?: string }>
        addEntry: (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; entry?: Entry; error?: string }>
        updateEntry: (id: string, updates: Partial<Entry>) => Promise<{ success: boolean; entry?: Entry; error?: string }>
        deleteEntry: (id: string) => Promise<{ success: boolean; error?: string }>
        addCategory: (category: Omit<Category, 'id'>) => Promise<{ success: boolean; category?: Category; error?: string }>
        updateCategory: (id: string, updates: Partial<Category>) => Promise<{ success: boolean; category?: Category; error?: string }>
        deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>
      }
      clipboard: {
        copy: (text: string) => Promise<{ success: boolean }>
      }
      dialog: {
        exportVault: () => Promise<{ success: boolean; path?: string }>
        importVault: (password: string) => Promise<{ success: boolean; categories?: Category[]; entries?: Entry[]; error?: string }>
      }
      shell: {
        openExternal: (url: string) => Promise<void>
      }
    }
  }
}

export const api = window.electronAPI
