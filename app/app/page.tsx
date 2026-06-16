'use client'

import { useCallback, type CSSProperties } from 'react'
import { useTideCloak } from '@tidecloak/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { login, authenticated } = useTideCloak()
  const router = useRouter()

  const onLogin = useCallback(() => {
    login()
  }, [login])

  useEffect(() => {
    if (authenticated) {
      router.push('/home')
    }
  }, [authenticated])

  return (
    <div style={styles.root}>
      <div style={styles.glow} />
      <div style={styles.card}>
        {/* Brand mark */}
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0f766e"/>
              <path d="M8 16.5L13.5 22L24 10" stroke="#fafaf9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.brandName}>SignSeal</span>
        </div>

        <h1 style={styles.headline}>Sign anything.<br/>Trust the seal, not the platform.</h1>

        <p style={styles.subhead}>
          The first digital signature that doesn't need a digital signature platform.
          Prove who you are once. Every document you sign carries its own proof — verifiable by anyone, forever, with no custodian in the middle.
        </p>

        {/* Feature chips */}
        <div style={styles.chipRow}>
          <span style={styles.chip}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{marginRight: 6}}>
              <path d="M3 8.5L6.5 12L13 4" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Zero-knowledge identity
          </span>
          <span style={styles.chip}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{marginRight: 6}}>
              <path d="M3 8.5L6.5 12L13 4" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Self-verifying documents
          </span>
          <span style={styles.chip}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{marginRight: 6}}>
              <path d="M3 8.5L6.5 12L13 4" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            No platform dependency
          </span>
        </div>

        <button onClick={onLogin} style={styles.cta}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: 10}}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" fill="#fafaf9"/>
          </svg>
          Continue with Tide
        </button>

        <p style={styles.footer}>
          Powered by Tide threshold cryptography &mdash; no passwords, no keys to steal
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #171717 0%, #1c1917 50%, #171717 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '-20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 600,
    height: 600,
    background: 'radial-gradient(circle, rgba(15,118,110,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: '#fafaf9',
    padding: '40px 40px 32px',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    maxWidth: 480,
    width: '100%',
    textAlign: 'center' as const,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  brandIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#171717',
    letterSpacing: '-0.3px',
  },
  headline: {
    margin: '0 0 12px',
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.15,
    color: '#171717',
    letterSpacing: '-0.5px',
  },
  subhead: {
    margin: '0 0 24px',
    fontSize: 15,
    lineHeight: 1.55,
    color: '#78716c',
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 500,
    color: '#0f766e',
    background: 'rgba(15,118,110,0.08)',
    borderRadius: 24,
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 32px',
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 12,
    border: 'none',
    background: '#0f766e',
    color: '#fafaf9',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.1s',
    width: '100%',
    marginBottom: 16,
  },
  footer: {
    margin: 0,
    fontSize: 12,
    color: '#a8a29e',
  },
}
