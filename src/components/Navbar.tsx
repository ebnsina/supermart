import { auth } from '@/lib/auth'
import NavbarClient from './NavbarClient'

interface NavbarProps {
  siteName?: string
  siteNameBn?: string
  logo?: string | null
  promoText?: string | null
  promoTextBn?: string | null
  promoActive?: boolean
}

export default async function Navbar({
  siteName = 'SuperMart',
  siteNameBn = 'সুপারমার্ট',
  logo,
  promoText,
  promoTextBn,
  promoActive = false,
}: NavbarProps) {
  const session = await auth()

  return (
    <>
      {/* Promo Bar */}
      {promoActive && promoTextBn && (
        <div className="bg-black text-white text-center py-2 px-4 text-sm">
          {promoTextBn}
        </div>
      )}

      {/* Main Navbar */}
      <nav className="bg-white sticky top-0 z-50">
        <NavbarClient
          siteName={siteName}
          siteNameBn={siteNameBn}
          logo={logo}
          isLoggedIn={!!session}
          userName={session?.user?.name}
        />
      </nav>
    </>
  )
}
