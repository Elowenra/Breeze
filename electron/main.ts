import { app, BrowserWindow, ipcMain, clipboard, dialog, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto'
import { VaultData, EncryptedVault, Entry, Category, DEFAULT_CATEGORIES } from './types'

let mainWindow: BrowserWindow | null = null
let vaultData: VaultData | null = null
let isUnlocked = false

const VAULT_DIR = path.join(app.getPath('userData'), 'vault')
const VAULT_FILE = path.join(VAULT_DIR, 'vault.enc')
const ITERATIONS = 600000

function ensureVaultDir() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true })
  }
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha512')
}

function encryptVault(data: VaultData, password: string): EncryptedVault {
  const salt = crypto.randomBytes(32)
  const key = deriveKey(password, salt)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  const jsonData = JSON.stringify({
    categories: data.categories,
    entries: data.entries
  })

  let encrypted = cipher.update(jsonData, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')

  return {
    version: 1,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    iterations: ITERATIONS,
    data: encrypted + ':' + authTag
  }
}

function decryptVault(encrypted: EncryptedVault, password: string): VaultData | null {
  try {
    const salt = Buffer.from(encrypted.salt, 'hex')
    const iv = Buffer.from(encrypted.iv, 'hex')
    const key = deriveKey(password, salt)

    const [encryptedData, authTag] = encrypted.data.split(':')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    const parsed = JSON.parse(decrypted)
    return {
      version: encrypted.version,
      salt: encrypted.salt,
      iv: encrypted.iv,
      iterations: encrypted.iterations,
      categories: parsed.categories,
      entries: parsed.entries
    }
  } catch {
    return null
  }
}

function generateId(): string {
  return crypto.randomBytes(16).toString('hex')
}

// IPC Handlers
ipcMain.handle('vault:exists', () => {
  ensureVaultDir()
  return fs.existsSync(VAULT_FILE)
})

ipcMain.handle('vault:create', async (_event, password: string) => {
  ensureVaultDir()
  const newVault: VaultData = {
    version: 1,
    salt: '',
    iv: '',
    iterations: ITERATIONS,
    categories: [...DEFAULT_CATEGORIES],
    entries: []
  }

  const encrypted = encryptVault(newVault, password)
  fs.writeFileSync(VAULT_FILE, JSON.stringify(encrypted, null, 2))

  vaultData = newVault
  isUnlocked = true
  return { success: true, categories: newVault.categories, entries: newVault.entries }
})

ipcMain.handle('vault:verify', async (_event, password: string) => {
  try {
    const raw = fs.readFileSync(VAULT_FILE, 'utf8')
    const encrypted: EncryptedVault = JSON.parse(raw)
    const decrypted = decryptVault(encrypted, password)

    if (!decrypted) {
      return { success: false, error: '密码错误' }
    }

    vaultData = decrypted
    isUnlocked = true
    return { success: true, categories: decrypted.categories, entries: decrypted.entries }
  } catch (err) {
    return { success: false, error: '无法读取保险库文件' }
  }
})

ipcMain.handle('vault:lock', async () => {
  vaultData = null
  isUnlocked = false
  return { success: true }
})

ipcMain.handle('vault:status', () => {
  return { isUnlocked, hasVault: fs.existsSync(VAULT_FILE) }
})

ipcMain.handle('vault:addEntry', async (_event, entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (!vaultData || !isUnlocked) return { success: false, error: '保险库未解锁' }

  const newEntry: Entry = {
    ...entry,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  vaultData.entries.push(newEntry)
  return { success: true, entry: newEntry }
})

ipcMain.handle('vault:updateEntry', async (_event, id: string, updates: Partial<Entry>) => {
  if (!vaultData || !isUnlocked) return { success: false, error: '保险库未解锁' }

  const index = vaultData.entries.findIndex(e => e.id === id)
  if (index === -1) return { success: false, error: '条目不存在' }

  vaultData.entries[index] = {
    ...vaultData.entries[index],
    ...updates,
    updatedAt: Date.now()
  }

  return { success: true, entry: vaultData.entries[index] }
})

ipcMain.handle('vault:deleteEntry', async (_event, id: string) => {
  if (!vaultData || !isUnlocked) return { success: false, error: '保险库未解锁' }

  vaultData.entries = vaultData.entries.filter(e => e.id !== id)
  return { success: true }
})

ipcMain.handle('vault:addCategory', async (_event, category: Omit<Category, 'id'>) => {
  if (!vaultData || !isUnlocked) return { success: false, error: '保险库未解锁' }

  const newCategory: Category = {
    ...category,
    id: generateId()
  }

  vaultData.categories.push(newCategory)
  return { success: true, category: newCategory }
})

ipcMain.handle('vault:updateCategory', async (_event, id: string, updates: Partial<Category>) => {
  if (!vaultData || !isUnlocked) return { success: false, error: '保险库未解锁' }

  const index = vaultData.categories.findIndex(c => c.id === id)
  if (index === -1) return { success: false, error: '分类不存在' }

  vaultData.categories[index] = { ...vaultData.categories[index], ...updates }
  return { success: true, category: vaultData.categories[index] }
})

ipcMain.handle('vault:deleteCategory', async (_event, id: string) => {
  if (!vaultData || !isUnlocked) return { success: false, error: '保险库未解锁' }

  vaultData.categories = vaultData.categories.filter(c => c.id !== id)
  vaultData.entries = vaultData.entries.map(e =>
    e.categoryId === id ? { ...e, categoryId: 'other' } : e
  )
  return { success: true }
})

ipcMain.handle('vault:save', async (_event, password: string) => {
  if (!vaultData) return { success: false, error: '无数据可保存' }

  try {
    const encrypted = encryptVault(vaultData, password)
    fs.writeFileSync(VAULT_FILE, JSON.stringify(encrypted, null, 2))
    return { success: true }
  } catch (err) {
    return { success: false, error: '保存失败' }
  }
})

ipcMain.handle('vault:getData', () => {
  if (!vaultData || !isUnlocked) return null
  return { categories: vaultData.categories, entries: vaultData.entries }
})

ipcMain.handle('clipboard:copy', async (_event, text: string) => {
  clipboard.writeText(text)
  return { success: true }
})

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('shell:openExternal', async (_event, url: string) => {
  await shell.openExternal(url)
})

ipcMain.handle('vault:reset', () => {
  try {
    ensureVaultDir()
    if (fs.existsSync(VAULT_FILE)) {
      fs.unlinkSync(VAULT_FILE)
    }
    vaultData = null
    isUnlocked = false
    return { success: true }
  } catch (err) {
    return { success: false, error: '重置失败' }
  }
})

ipcMain.handle('dialog:export', async () => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: '导出保险库',
    defaultPath: 'breeze-backup.enc',
    filters: [{ name: 'Breeze Files', extensions: ['enc'] }]
  })

  if (!result.canceled && result.filePath) {
    const raw = fs.readFileSync(VAULT_FILE)
    fs.writeFileSync(result.filePath, raw)
    return { success: true, path: result.filePath }
  }
  return { success: false }
})

ipcMain.handle('dialog:import', async (_event, password: string) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '导入保险库',
    filters: [{ name: 'Breeze Files', extensions: ['enc'] }],
    properties: ['openFile']
  })

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const raw = fs.readFileSync(result.filePaths[0], 'utf8')
      const encrypted: EncryptedVault = JSON.parse(raw)
      const decrypted = decryptVault(encrypted, password)

      if (!decrypted) {
        return { success: false, error: '密码错误' }
      }

      ensureVaultDir()
      fs.writeFileSync(VAULT_FILE, raw)

      vaultData = decrypted
      isUnlocked = true
      return { success: true, categories: decrypted.categories, entries: decrypted.entries }
    } catch (err) {
      return { success: false, error: '无效的保险库文件' }
    }
  }
  return { success: false }
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f23',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
