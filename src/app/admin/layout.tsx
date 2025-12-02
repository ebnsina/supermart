import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { bn } from '@/lib/translations'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { QueryProvider } from '@/providers/query-provider'
import { AdminNav } from '@/components/admin-nav'
import { LogOut, Home } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Redirect to admin login if not authenticated or not admin
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/admin-login')
  }

  const menuItems = [
    { href: '/admin', label: bn.dashboard, icon: 'LayoutGrid', exact: true },
    { href: '/admin/site-settings', label: 'সাইট সেটিংস', icon: 'Settings' },
    { href: '/admin/banners', label: 'ব্যানার', icon: 'Image' },
    { href: '/admin/categories', label: bn.categories, icon: 'Layers' },
    { href: '/admin/products', label: bn.products, icon: 'Package' },
    { href: '/admin/orders', label: bn.orders, icon: 'ShoppingBag' },
    { href: '/admin/coupons', label: 'কুপন', icon: 'Ticket' },
    {
      href: '/admin/questions',
      label: 'প্রশ্ন ও উত্তর',
      icon: 'MessageSquare',
    },
    { href: '/admin/homepage', label: 'হোমপেজ ম্যানেজ', icon: 'Star' },
  ]

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-72 bg-card shadow-sm fixed h-full border-r">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary p-2.5 rounded-xl">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{bn.admin} প্যানেল</h1>
                <p className="text-xs text-muted-foreground">সুপারমার্ট</p>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3 border">
              <p className="text-sm font-semibold">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </div>

          <nav className="mt-4 px-3 overflow-y-auto h-[calc(100vh-280px)]">
            <AdminNav items={menuItems} />
          </nav>

          <div className="absolute bottom-0 w-72 p-4 border-t bg-card">
            <form action="/api/auth/signout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span>লগআউট</span>
              </Button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-72 p-8">{children}</main>
        <Toaster position="top-center" richColors />
      </div>
    </QueryProvider>
  )
}
