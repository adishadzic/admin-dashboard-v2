// app/layout.tsx (NO "use client" here)

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ResponsiveLayout from './ResponsiveLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dashboard App',
  description: 'A simple dashboard application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ResponsiveLayout>{children}</ResponsiveLayout>
      </body>
    </html>
  )
}
