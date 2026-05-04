const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

export const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true
}

export function generatePassword(options: PasswordOptions = DEFAULT_OPTIONS): string {
  let chars = ''
  const required: string[] = []

  if (options.uppercase) {
    chars += UPPERCASE
    required.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)])
  }
  if (options.lowercase) {
    chars += LOWERCASE
    required.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)])
  }
  if (options.numbers) {
    chars += NUMBERS
    required.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)])
  }
  if (options.symbols) {
    chars += SYMBOLS
    required.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
  }

  if (!chars) {
    chars = LOWERCASE + NUMBERS
    required.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)])
    required.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)])
  }

  const password: string[] = [...required]
  const array = new Uint32Array(options.length - required.length)
  crypto.getRandomValues(array)

  for (let i = 0; i < array.length; i++) {
    password.push(chars[array[i] % chars.length])
  }

  // Fisher-Yates shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}

export function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: '弱', color: '#FF6B6B' }
  if (score <= 4) return { score, label: '中', color: '#FFA502' }
  if (score <= 5) return { score, label: '强', color: '#00B894' }
  return { score, label: '极强', color: '#6C5CE7' }
}
