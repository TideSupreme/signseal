import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import {
  TideCloakProvider
} from '@tidecloak/nextjs'
import tcConfig from '../tidecloak.json'
import { ErrorSuppressor } from './lib/error-suppressor'


export const metadata: Metadata = {
  title: 'SignSeal — Trust the seal, not the platform',
  description: 'The first digital signature that doesn\'t need a digital signature platform. Prove who you are once. Every document carries its own proof.',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ErrorSuppressor />
        <TideCloakProvider config={tcConfig}>
          {children}
        </TideCloakProvider>
      </body>
    </html>
  )
}
