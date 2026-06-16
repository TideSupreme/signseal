'use client'

import { useTideCloak } from '@tidecloak/nextjs'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { safeGetDocs } from '../lib/store'

export default function VerifyPage() {
  const { token, doDecrypt, getValueFromIdToken } = useTideCloak()
  const [username, setUsername] = useState("")

  const TAG = "message"
  const [ciphertextInput, setCiphertextInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [result, setResult] = useState<null | {name: string, signer: string, signedAt: string, content: string}>(null)

  const [savedDocs, setSavedDocs] = useState<Array<{id: string, name: string, date: string, ciphertext: string}>>([])

  useEffect(() => {
    if (token) {
      try {
        const name = getValueFromIdToken("preferred_username")
        if (name) setUsername(name)
      } catch {}
    }
    try { setSavedDocs(safeGetDocs()) } catch {}
  }, [token])

  const onVerify = useCallback(async (ct?: string) => {
    const ctToVerify = ct || ciphertextInput.trim()
    if (!ctToVerify) {
      setError("Paste a sealed document ciphertext or select one below.")
      return
    }
    setBusy(true); setError(""); setStatus(""); setResult(null)
    try {
      const [pt] = await doDecrypt([{ encrypted: ctToVerify, tags: [TAG] }])
      const doc = JSON.parse(String(pt))
      setResult(doc)
      setStatus("Verification successful — signature is valid")
    } catch (err: any) {
      setError("Verification failed. The seal could not be decrypted — it may not be a valid SignSeal document, or you may not be the intended signer.")
    } finally {
      setBusy(false)
    }
  }, [ciphertextInput, doDecrypt])

  return (
    <div style={styles.root}>
      {/* Top nav */}
      <header style={styles.header}>
        <Link href="/home" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={styles.brandIcon}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0f766e"/>
              <path d="M8 16.5L13.5 22L24 10" stroke="#fafaf9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.brandName}>SignSeal</span>
        </Link>
        <div style={styles.headerRight}>
          <Link href="/home" style={styles.backLink}>← Dashboard</Link>
        </div>
      </header>

      <div style={styles.container}>
        <div style={styles.main}>
          <h1 style={styles.title}>Verify a Signature</h1>
          <p style={styles.subtitle}>
            Paste a sealed document ciphertext to verify its signature. The proof is self-contained — anyone with the ciphertext can verify it against the signer's identity.
          </p>

          <div style={styles.formCard}>
            <label style={styles.label}>Sealed document ciphertext</label>
            <textarea
              value={ciphertextInput}
              onChange={(e) => setCiphertextInput(e.target.value)}
              placeholder="Paste the ciphertext from a sealed SignSeal document…"
              style={styles.textarea}
            />

            <button onClick={() => onVerify()} style={styles.cta} disabled={busy} type="submit">
              {busy ? (
                <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={styles.spinner} /> Verifying…
                </span>
              ) : (
                <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fafaf9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Verify
                </span>
              )}
            </button>

            {status && (
              <div style={styles.toast}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{flexShrink: 0}}>
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{status}</span>
              </div>
            )}
            {error && (
              <div style={{...styles.toast, background: 'rgba(220,38,38,0.08)', color: '#dc2626'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{flexShrink: 0}}>
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Quick-verify from saved docs */}
            {savedDocs.length > 0 && (
              <div style={styles.savedSection}>
                <h3 style={styles.savedTitle}>Your sealed documents</h3>
                {savedDocs.map((doc) => (
                  <div key={doc.id} style={styles.savedRow}>
                    <div style={styles.savedInfo}>
                      <span style={styles.savedName}>{doc.name}</span>
                      <span style={styles.savedDate}>{doc.date}</span>
                    </div>
                    <button onClick={() => {
                      setCiphertextInput(doc.ciphertext)
                      onVerify(doc.ciphertext)
                    }} style={styles.savedBtn}>
                      Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — verification result */}
        <aside style={styles.sidebar}>
          {result ? (
            <div style={styles.resultCard}>
              <div style={{...styles.sealIcon, background: 'rgba(217,119,6,0.1)'}}>
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#d97706"/>
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fafaf9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={styles.resultTitle}>Signature Verified</h3>
              <div style={styles.resultDetail}>
                <span style={styles.resultLabel}>Document</span>
                <span style={styles.resultValue}>{result.name}</span>
              </div>
              <div style={styles.resultDetail}>
                <span style={styles.resultLabel}>Signed by</span>
                <span style={styles.resultValue}>{result.signer}</span>
              </div>
              <div style={styles.resultDetail}>
                <span style={styles.resultLabel}>Signed at</span>
                <span style={styles.resultValue}>{new Date(result.signedAt).toLocaleString()}</span>
              </div>
              <div style={styles.resultDetail}>
                <span style={styles.resultLabel}>Content preview</span>
                <span style={{...styles.resultValue, fontSize: 12, color: '#78716c'}}>
                  {result.content.slice(0, 120)}{result.content.length > 120 ? '…' : ''}
                </span>
              </div>
              <div style={styles.resultNote}>
                This document's integrity is verified by Tide threshold cryptography. The signature is self-contained — no platform custody, no keys to steal, no trust required.
              </div>
            </div>
          ) : (
            <div style={styles.emptySidebar}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{marginBottom: 16, opacity: 0.3}}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#57534e'}}>Awaiting verification</p>
              <p style={{margin: 0, fontSize: 13, color: '#a8a29e', textAlign: 'center'}}>Paste a ciphertext and click Verify, or select a saved document.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#fafaf9',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderBottom: '1px solid #e7e5e4',
    background: '#fff',
  },
  brandIcon: { display: 'flex', alignItems: 'center' },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#171717',
    letterSpacing: '-0.3px',
  },
  headerRight: { display: 'flex', alignItems: 'center' },
  backLink: {
    fontSize: 14,
    color: '#0f766e',
    textDecoration: 'none',
    fontWeight: 500,
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 24,
    maxWidth: 960,
    margin: '32px auto',
    padding: '0 24px',
  },
  main: { minWidth: 0 },
  title: {
    margin: '0 0 8px',
    fontSize: 24,
    fontWeight: 700,
    color: '#171717',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    margin: '0 0 24px',
    fontSize: 14,
    lineHeight: 1.55,
    color: '#78716c',
  },
  formCard: {
    background: '#fff',
    padding: 24,
    borderRadius: 12,
    border: '1px solid #e7e5e4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#57534e',
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    padding: '10px 12px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid #d6d3d1',
    background: '#fafaf9',
    color: '#171717',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'monospace',
    resize: 'vertical' as const,
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: '12px 28px',
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 12,
    border: 'none',
    background: '#d97706',
    color: '#fafaf9',
    cursor: 'pointer',
    width: '100%',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fafaf9',
    borderRadius: '50%',
    display: 'inline-block',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: '12px 16px',
    background: 'rgba(15,118,110,0.08)',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: '#0f766e',
  },
  savedSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1px solid #e7e5e4',
  },
  savedTitle: {
    margin: '0 0 12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#78716c',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  savedRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f5f5f4',
  },
  savedInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  savedName: { fontSize: 14, fontWeight: 500, color: '#171717' },
  savedDate: { fontSize: 12, color: '#a8a29e' },
  savedBtn: {
    padding: '5px 14px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    border: '1px solid #d97706',
    background: '#fff',
    color: '#d97706',
    cursor: 'pointer',
  },
  sidebar: {},
  resultCard: {
    background: '#fff',
    padding: 24,
    borderRadius: 12,
    border: '1px solid #e7e5e4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    textAlign: 'center' as const,
  },
  sealIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  resultTitle: {
    margin: '0 0 20px',
    fontSize: 18,
    fontWeight: 700,
    color: '#171717',
  },
  resultDetail: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    marginBottom: 12,
    textAlign: 'left' as const,
  },
  resultLabel: { fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase' as const },
  resultValue: { fontSize: 14, color: '#171717', fontWeight: 500 },
  resultNote: {
    marginTop: 20,
    padding: '12px',
    background: 'rgba(217,119,6,0.06)',
    borderRadius: 8,
    fontSize: 12,
    color: '#d97706',
    lineHeight: 1.5,
  },
  emptySidebar: {
    background: '#fff',
    padding: '40px 24px',
    borderRadius: 12,
    border: '1px solid #e7e5e4',
    textAlign: 'center' as const,
  },
}