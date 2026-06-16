'use client'

import { useTideCloak } from '@tidecloak/nextjs'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { safeGetDocs, safeAddDoc } from '../lib/store'

export default function SignPage() {
  const { getValueFromIdToken, token, doEncrypt, doDecrypt, authenticated } = useTideCloak()
  const [username, setUsername] = useState("")

  const TAG = "message"
  const [docName, setDocName] = useState("")
  const [docContent, setDocContent] = useState("")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [sealedDoc, setSealedDoc] = useState<{id: string, name: string, ciphertext: string, timestamp: string} | null>(null)

  useEffect(() => {
    if (token) {
      try {
        const name = getValueFromIdToken("preferred_username")
        if (name) setUsername(name)
      } catch {}
    }
  }, [token])

  const onSign = useCallback(async () => {
    if (!docName.trim() || !docContent.trim()) {
      setError("Please provide both a document name and content.")
      return
    }
    setBusy(true); setError(""); setStatus(""); setSealedDoc(null)
    try {
      const payload = JSON.stringify({
        name: docName.trim(),
        content: docContent,
        signer: username || "unknown",
        signedAt: new Date().toISOString(),
      })
      const [ct] = await doEncrypt([{ data: payload, tags: [TAG] }])

      // Verify round-trip
      const [pt] = await doDecrypt([{ encrypted: ct, tags: [TAG] }])
      const verified = JSON.parse(String(pt))

      const doc = {
        id: `ss-${Date.now()}`,
        name: docName.trim(),
        ciphertext: ct,
        timestamp: verified.signedAt,
      }

      // Persist via shared store
      safeAddDoc({
        id: doc.id,
        name: doc.name,
        date: new Date(verified.signedAt).toLocaleDateString(),
        ciphertext: ct,
      })

      setSealedDoc(doc)
      setStatus("Document sealed successfully")
      setDocName("")
      setDocContent("")
    } catch (err: any) {
      setError(err.message || "Sealing failed")
    } finally {
      setBusy(false)
    }
  }, [docName, docContent, username, doEncrypt, doDecrypt])

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
          <h1 style={styles.title}>Sign a Document</h1>
          <p style={styles.subtitle}>
            Your document will be cryptographically sealed with your Tide identity.
            Only you can ever decrypt it. The seal is self-verifying — no platform required.
          </p>

          <div style={styles.formCard}>
            <label style={styles.label}>Document name</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Employment Agreement, Lease Addendum"
              style={styles.input}
            />

            <label style={{...styles.label, marginTop: 16}}>Document content</label>
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Enter the document text to be sealed and signed…"
              style={styles.textarea}
            />

            <button onClick={onSign} style={styles.cta} disabled={busy} type="submit">
              {busy ? (
                <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={styles.spinner} /> Sealing…
                </span>
              ) : (
                <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="#fafaf9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Seal & Sign
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
          </div>
        </div>

        {/* Sidebar — sealed doc result */}
        <aside style={styles.sidebar}>
          {sealedDoc ? (
            <div style={styles.sealCard}>
              <div style={styles.sealIcon}>
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#0f766e"/>
                  <path d="M8 16.5L13.5 22L24 10" stroke="#fafaf9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={styles.sealTitle}>Document Sealed</h3>
              <div style={styles.sealDetail}>
                <span style={styles.sealLabel}>Name</span>
                <span style={styles.sealValue}>{sealedDoc.name}</span>
              </div>
              <div style={styles.sealDetail}>
                <span style={styles.sealLabel}>Sealed by</span>
                <span style={styles.sealValue}>{username}</span>
              </div>
              <div style={styles.sealDetail}>
                <span style={styles.sealLabel}>Timestamp</span>
                <span style={styles.sealValue}>{new Date(sealedDoc.timestamp).toLocaleString()}</span>
              </div>
              <div style={styles.sealDetail}>
                <span style={styles.sealLabel}>Seal ID</span>
                <span style={{...styles.sealValue, fontSize: 11, fontFamily: 'monospace'}}>{sealedDoc.id}</span>
              </div>
              <div style={styles.sealNote}>
                This document carries its own proof. Anyone with the ciphertext can verify it against your Tide identity — no platform needed.
              </div>
            </div>
          ) : (
            <div style={styles.emptySidebar}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{marginBottom: 16, opacity: 0.3}}>
                <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#57534e'}}>No document yet</p>
              <p style={{margin: 0, fontSize: 13, color: '#a8a29e', textAlign: 'center'}}>Fill in the form and click Seal & Sign to create your first sealed document.</p>
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
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid #d6d3d1',
    background: '#fafaf9',
    color: '#171717',
    boxSizing: 'border-box',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    minHeight: 160,
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid #d6d3d1',
    background: '#fafaf9',
    color: '#171717',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
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
    background: '#0f766e',
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
    animation: 'spin 0.6s linear infinite',
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
  sidebar: {},
  sealCard: {
    background: '#fff',
    padding: 24,
    borderRadius: 12,
    border: '1px solid #e7e5e4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    textAlign: 'center' as const,
  },
  sealIcon: { marginBottom: 12 },
  sealTitle: {
    margin: '0 0 20px',
    fontSize: 18,
    fontWeight: 700,
    color: '#171717',
  },
  sealDetail: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    marginBottom: 12,
    textAlign: 'left' as const,
  },
  sealLabel: { fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase' as const },
  sealValue: { fontSize: 14, color: '#171717', fontWeight: 500 },
  sealNote: {
    marginTop: 20,
    padding: '12px',
    background: 'rgba(15,118,110,0.06)',
    borderRadius: 8,
    fontSize: 12,
    color: '#0f766e',
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