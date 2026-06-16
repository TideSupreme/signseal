'use client'

// Shared document store backed by localStorage.
// Only ciphertexts are persisted — no plaintext ever touches disk.

export interface StoredDoc {
  id: string
  name: string
  date: string
  ciphertext: string
}

const STORE_KEY = 'signseal-docs'

export function safeGetDocs(): StoredDoc[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (d: any) => d && typeof d.id === 'string' && typeof d.ciphertext === 'string'
    )
  } catch {
    return []
  }
}

export function safeSetDocs(docs: StoredDoc[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(docs))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function safeAddDoc(doc: StoredDoc): void {
  const docs = safeGetDocs()
  docs.unshift(doc)
  safeSetDocs(docs)
}