'use client'

import { useState } from 'react'
import { bn } from '@/lib/translations'
import { Input } from '@/components/ui/input'
import { ShopButton } from '@/components/ShopButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Package,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'

type Order = {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  total: number
  orderStatus: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
}

export default function TrackOrderPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone.trim()) {
      setError('ফোন নম্বর লিখুন')
      return
    }

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      setError('সঠিক ফোন নম্বর দিন (01XXXXXXXXX)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/orders/track?phone=${encodeURIComponent(phone)}`
      )

      if (!response.ok) {
        throw new Error('অর্ডার খুঁজে পাওয়া যায়নি')
      }

      const data = await response.json()
      setOrders(data.orders)

      if (data.orders.length === 0) {
        setError('এই নম্বরে কোনো অর্ডার পাওয়া যায়নি')
      }
    } catch (error) {
      setError('অর্ডার খুঁজতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'পেন্ডিং'
      case 'CONFIRMED':
        return 'নিশ্চিত'
      case 'PROCESSING':
        return 'প্রসেসিং'
      case 'SHIPPED':
        return 'শিপড'
      case 'DELIVERED':
        return 'ডেলিভারড'
      case 'CANCELLED':
        return 'বাতিল'
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{bn.trackOrder}</h1>
          <p className="text-muted-foreground">
            আপনার ফোন নম্বর দিয়ে অর্ডারের তথ্য দেখুন
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {bn.trackOrderByPhone}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="h-12 text-lg"
                      maxLength={11}
                    />
                  </div>
                  <ShopButton
                    type="submit"
                    disabled={loading}
                    variant="primary"
                    className="h-12 px-8"
                  >
                    {loading ? 'খুঁজছি...' : bn.findOrder}
                  </ShopButton>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                উদাহরণ: 01712345678
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              আপনার অর্ডার ({orders.length}টি)
            </h2>

            {orders.map(order => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <Package className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <Link
                            href={`/orders/${order.orderNumber}`}
                            className="font-semibold text-lg hover:text-primary"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString(
                              'bn-BD',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-start sm:items-end">
                      <Badge className={getStatusColor(order.orderStatus)}>
                        {getStatusText(order.orderStatus)}
                      </Badge>
                      <span className="font-bold text-xl text-primary">
                        ৳{order.total.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">ফোন</p>
                        <p className="font-medium">{order.customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">পেমেন্ট</p>
                        <p className="font-medium">
                          {order.paymentMethod === 'COD'
                            ? 'ক্যাশ অন ডেলিভারি'
                            : 'বিকাশ'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-muted-foreground">ঠিকানা</p>
                        <p className="font-medium">{order.customerAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link href={`/orders/${order.orderNumber}`}>
                      <ShopButton
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        বিস্তারিত দেখুন
                      </ShopButton>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
