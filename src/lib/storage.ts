export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    return
  }
}

export function readJsonStorage<T>(key: string): T | null {
  const raw = readStorage(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJsonStorage(key: string, value: unknown): void {
  writeStorage(key, JSON.stringify(value))
}

export function removeStorageByPrefix(prefix: string): void {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => window.localStorage.removeItem(key))
  } catch {
    return
  }
}
