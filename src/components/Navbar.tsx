'use client'

import Link from 'next/link'
import { useCart, useWishlist } from '@/lib/store'
import { bn } from '@/lib/translations'
import { ShoppingCart, Search, User, Menu, X, Heart } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NavbarProps {
  siteName?: string
  siteNameBn?: string
  logo?: string | null
  promoText?: string | null
  promoTextBn?: string | null
  promoActive?: boolean
}

export default function Navbar({
  siteName = 'SuperMart',
  siteNameBn = 'সুপারমার্ট',
  logo,
  promoText,
  promoTextBn,
  promoActive = false,
}: NavbarProps) {
  const { items } = useCart()
  const { items: wishlistItems } = useWishlist()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistItems.length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(
        searchQuery
      )}`
    }
  }

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
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-16">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              {logo ? (
                <img src={logo} alt={siteNameBn} className="h-10 w-auto" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {siteNameBn}
                </span>
              )}
            </Link>

            {/* Search Bar - Middle (Desktop) */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-3xl mx-6 mt-4"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={bn.searchProducts || 'পণ্য খুঁজুন...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-6 pr-16 text-base border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="flex justify-center items-center text-white absolute right-1 top-1/2 -translate-y-1/2 h-12 w-12 bg-primary hover:bg-primary/90"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </form>

            {/* Right Side - Cart & Account */}
            <div className="flex items-center space-x-4">
              {/* Account (Desktop) */}
              <Link
                href="/orders"
                className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-primary"
              >
                <User className="w-6 h-6" />
                <span className="text-sm">{bn.orders || 'অর্ডার'}</span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative text-gray-700 hover:text-primary flex items-center"
                title="উইশলিস্ট"
              >
                <Heart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-gray-700 hover:text-primary flex items-center"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          {/* Category Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6 py-3">
            <Link href="/" className="text-gray-700 hover:text-primary text-sm">
              {bn.home}
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-primary text-sm"
            >
              {bn.products}
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-primary text-sm"
            >
              {bn.categories}
            </Link>
            <Link
              href="/orders/track"
              className="text-gray-700 hover:text-primary text-sm"
            >
              {bn.trackOrder}
            </Link>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder={bn.searchProducts || 'পণ্য খুঁজুন...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-5 pr-14 text-base rounded-full border-2 border-gray-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full hover:bg-primary/10"
                >
                  <Search className="w-5 h-5 text-primary" />
                </Button>
              </form>

              {/* Mobile Links */}
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {bn.home}
                </Link>
                <Link
                  href="/products"
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {bn.products}
                </Link>
                <Link
                  href="/categories"
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {bn.categories}
                </Link>
                <Link
                  href="/orders/track"
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {bn.trackOrder}
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center justify-between py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>উইশলিস্ট</span>
                  {wishlistCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {bn.orders || 'অর্ডার'}
                </Link>
                <Link
                  href="/admin"
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {bn.account || 'অ্যাকাউন্ট'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
