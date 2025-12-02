import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch site settings for navbar
  const settings = await prisma.basicSettings.findFirst()

  return (
    <QueryProvider>
      <Navbar
        siteName={settings?.siteName}
        siteNameBn={settings?.siteNameBn}
        logo={settings?.logo}
        promoText={settings?.promoText}
        promoTextBn={settings?.promoTextBn}
        promoActive={settings?.promoActive}
      />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster position="top-center" richColors />
    </QueryProvider>
  )
}
