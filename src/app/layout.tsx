import type { Metadata } from 'next'
import { Hind_Siliguri } from 'next/font/google'
import './globals.css'

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
})

export const metadata: Metadata = {
  title: 'সুপারমার্ট - অনলাইন শপিং',
  description: 'বাংলাদেশের সেরা অনলাইন শপিং সাইট',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn">
      <body className={`${hindSiliguri.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
