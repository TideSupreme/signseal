'use client'

import { useTideCloak } from '@tidecloak/nextjs'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { safeGetDocs } from '../lib/store'

export default function HomePage() {
  const { logout, getValueFromIdToken, token } = useTideCloak()
  const [username, setUsername] = useState("")
  const [recentDocs, setRecentDocs] = useState<Array<{name: string, date: string, id: string}>>([])

  useEffect(() => {
    if (token) {
      try {
        const name = getValueFromIdToken("preferred_username")
        if (name) setUsername(name)
      } catch {}
      try {
        const docs = safeGetDocs()
        setRecentDocs(docs.slice(0, 3))
      } catch {}
    }
  }, [token])

  const onLogout = useCallback(() => {
    logout()
  }, [logout])

  return (
    <div style={styles.root}>
      {/* Top nav */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.brandIcon}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0f766e"/>
              <path d="M8 16.5L13.5 22L24 10" stroke="#fafaf9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.brandName}>SignSeal</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: 6}}>
              <circle cx="12" cy="8" r="4" stroke="#78716c" strokeWidth="2"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#78716c" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {username}
          </span>
          <button onClick={onLogout} style={styles.logoutBtn}>Sign out</button>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome back{username ? `, ${username}` : ''}</h1>
        <p style={styles.heroSub}>Your documents. Your signature. No platform required.</p>
      </section>

      {/* Feature cards */}
      <section style={styles.grid}>
        {/* Sign a document */}
        <Link href="/sign" style={{textDecoration: 'none'}}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={styles.cardTitle}>Sign a Document</h2>
            <p style={styles.cardDesc}>Cryptographically seal any document with your identity. The signature lives in the document — no keys, no platform custody.</p>
            <span style={styles.cardLink}>Start signing <span style={{fontSize: 14}}>→</span></span>
          </div>
        </Link>

        {/* Verify a document */}
        <Link href="/verify" style={{textDecoration: 'none'}}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={styles.cardTitle}>Verify a Signature</h2>
            <p style={styles.cardDesc}>Anyone can verify a SignSeal document — no account needed. The proof is self-contained. Trust the seal.</p>
            <span style={{...styles.cardLink, color: '#d97706'}}>Verify now <span style={{fontSize: 14}}>→</span></span>
          </div>
        </Link>
      </section>

      {/* Recent activity */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Recent Documents</h3>
        {recentDocs.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{marginBottom: 12, opacity: 0.4}}>
              <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p style={styles.emptyText}>No documents signed yet</p>
            <p style={styles.emptySub}>Sign your first document to see it here.</p>
          </div>
        ) : (
          <div style={styles.docList}>
            {recentDocs.map((doc) => (
              <div key={doc.id} style={styles.docRow}>
                <div style={styles.docInfo}>
                  <span style={styles.docName}>{doc.name}</span>
                  <span style={styles.docDate}>{doc.date}</span>
                </div>
                <span style={styles.docBadge}>Sealed</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>SignSeal &middot; Powered by Tide threshold cryptography</span>
        <span>No private keys. No platform custody. No trust required.</span>
      </footer>
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: { display: 'flex', alignItems: 'center' },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#171717',
    letterSpacing: '-0.3px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 13,
    color: '#78716c',
    fontWeight: 500,
  },
  logoutBtn: {
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    border: '1px solid #d6d3d1',
    background: '#fff',
    color: '#57534e',
    cursor: 'pointer',
  },
  hero: {
    padding: '40px 24px 32px',
    textAlign: 'center' as const,
  },
  heroTitle: {
    margin: '0 0 8px',
    fontSize: 32,
    fontWeight: 700,
    color: '#171717',
    letterSpacing: '-0.5px',
  },
  heroSub: {
    margin: 0,
    fontSize: 15,
    color: '#78716c',
    lineHeight: 1.55,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 16,
    padding: '0 24px',
    maxWidth: 860,
    margin: '0 auto',
  },
  card: {
    background: '#fff',
    padding: 24,
    borderRadius: 12,
    border: '1px solid #e7e5e4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s, border-color 0.2s',
    cursor: 'pointer',
  },
  cardIcon: { marginBottom: 16 },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: 18,
    fontWeight: 600,
    color: '#171717',
  },
  cardDesc: {
    margin: '0 0 12px',
    fontSize: 14,
    lineHeight: 1.5,
    color: '#78716c',
  },
  cardLink: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0f766e',
  },
  section: {
    maxWidth: 860,
    margin: '32px auto',
    padding: '0 24px',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: 14,
    fontWeight: 600,
    color: '#78716c',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  emptyState: {
    background: '#fff',
    border: '1px solid #e7e5e4',
    borderRadius: 12,
    padding: '40px 24px',
    textAlign: 'center' as const,
  },
  emptyText: {
    margin: '0 0 4px',
    fontSize: 15,
    fontWeight: 600,
    color: '#57534e',
  },
  emptySub: {
    margin: 0,
    fontSize: 13,
    color: '#a8a29e',
  },
  docList: {
    background: '#fff',
    border: '1px solid #e7e5e4',
    borderRadius: 12,
    overflow: 'hidden',
  },
  docRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #f5f5f4',
  },
  docInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  docName: { fontSize: 14, fontWeight: 600, color: '#171717' },
  docDate: { fontSize: 12, color: '#a8a29e' },
  docBadge: {
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: '#0f766e',
    background: 'rgba(15,118,110,0.08)',
    borderRadius: 24,
  },
  footer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    padding: '24px',
    borderTop: '1px solid #e7e5e4',
    fontSize: 12,
    color: '#a8a29e',
    textAlign: 'center' as const,
  },
}

