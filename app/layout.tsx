import type { Metadata, Viewport } from 'next'
import { themeInitScript } from '@/lib/theme'
import { TeacherProvider } from '@/components/teacher-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlowJudge AI Teacher Portal',
  description: 'Modern EdTech dashboard for managing programming classes, modules, and student submissions',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body className="antialiased font-sans">
        <TeacherProvider>{children}</TeacherProvider>
      </body>
    </html>
  )
}
