import { contextBridge, ipcRenderer } from 'electron'
import { Entry, Category } from './types'

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },
  vault: {
    exists: () => ipcRenderer.invoke('vault:exists'),
    create: (password: string) => ipcRenderer.invoke('vault:create', password),
    reset: () => ipcRenderer.invoke('vault:reset'),
    verify: (password: string) => ipcRenderer.invoke('vault:verify', password),
    lock: () => ipcRenderer.invoke('vault:lock'),
    status: () => ipcRenderer.invoke('vault:status'),
    getData: () => ipcRenderer.invoke('vault:getData'),
    save: (password: string) => ipcRenderer.invoke('vault:save', password),
    addEntry: (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke('vault:addEntry', entry),
    updateEntry: (id: string, updates: Partial<Entry>) =>
      ipcRenderer.invoke('vault:updateEntry', id, updates),
    deleteEntry: (id: string) => ipcRenderer.invoke('vault:deleteEntry', id),
    addCategory: (category: Omit<Category, 'id'>) =>
      ipcRenderer.invoke('vault:addCategory', category),
    updateCategory: (id: string, updates: Partial<Category>) =>
      ipcRenderer.invoke('vault:updateCategory', id, updates),
    deleteCategory: (id: string) => ipcRenderer.invoke('vault:deleteCategory', id)
  },
  clipboard: {
    copy: (text: string) => ipcRenderer.invoke('clipboard:copy', text)
  },
  dialog: {
    exportVault: () => ipcRenderer.invoke('dialog:export'),
    importVault: (password: string) => ipcRenderer.invoke('dialog:import', password)
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
  }
})
