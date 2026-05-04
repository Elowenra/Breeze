const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16
const ITERATIONS = 100000

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptField(plaintext: string, key: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const cryptoKey = await deriveKey(key, salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    cryptoKey,
    encoder.encode(plaintext)
  )

  const encryptedArray = new Uint8Array(encrypted)
  const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(encryptedArray, salt.length + iv.length)

  return btoa(String.fromCharCode(...combined))
}

export async function decryptField(ciphertext: string, key: string): Promise<string> {
  try {
    const decoder = new TextDecoder()
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))

    const salt = combined.slice(0, SALT_LENGTH)
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const data = combined.slice(SALT_LENGTH + IV_LENGTH)

    const cryptoKey = await deriveKey(key, salt)

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      cryptoKey,
      data
    )

    return decoder.decode(decrypted)
  } catch {
    return '[解密失败]'
  }
}
