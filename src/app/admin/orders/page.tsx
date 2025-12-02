'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Search, Eye, Package } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  bkashNumber?: string | null
  bkashTrxId?: string | null
  notes?: string | null
  createdAt: string
  coupon?: {
    code: string
    description: string | null
    type: string
    value: number
  } | null
  items?: Array<{
    id: string
    product?: {
      nameBn: string
      name: string
    }
    variant?: {
      nameBn: string
      valueBn: string
    } | null
    quantity: number
    price: number
    total: number
  }>
}

// API functions
const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch('/api/orders')
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

const updateOrderStatus = async ({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string
  orderStatus?: string
  paymentStatus?: string
}): Promise<Order> => {
  const res = await fetch(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderStatus,
      paymentStatus,
    }),
  })
  if (!res.ok) throw new Error('Failed to update order')
  return res.json()
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch orders query
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })

  // Update order mutation
  const updateMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: updatedOrder => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      // Update the selected order in the dialog
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder)
      }
      toast.success('অর্ডার স্ট্যাটাস আপডেট হয়েছে')
    },
    onError: () => {
      toast.error('অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে')
    },
  })

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDialogOpen(true)
  }

  const handleStatusUpdate = (
    orderId: string,
    field: 'orderStatus' | 'paymentStatus',
    value: string
  ) => {
    updateMutation.mutate({
      orderId,
      [field]: value,
    })
  }

  const filteredOrders = orders.filter(
    order =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery)
  )

  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: 'অপেক্ষমাণ',
        className:
          'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
      },
      CONFIRMED: {
        label: 'নিশ্চিত',
        className:
          'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
      },
      PROCESSING: {
        label: 'প্রসেসিং',
        className:
          'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
      },
      SHIPPED: {
        label: 'শিপড',
        className:
          'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20',
      },
      DELIVERED: {
        label: 'ডেলিভার হয়েছে',
        className:
          'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
      },
      CANCELLED: {
        label: 'বাতিল',
        className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: 'অপেক্ষমাণ',
        className:
          'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
      },
      PAID: {
        label: 'পেইড',
        className:
          'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
      },
      FAILED: {
        label: 'ব্যর্থ',
        className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              অর্ডার ম্যানেজমেন্ট
            </h1>
            <p className="text-muted-foreground">
              অর্ডার দেখুন এবং পরিচালনা করুন
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="অর্ডার নম্বর, গ্রাহকের নাম বা ফোন নম্বর খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                অর্ডার লোড করতে সমস্যা হয়েছে
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-16 w-16 mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">কোনো অর্ডার পাওয়া যায়নি</p>
                <p className="text-sm mt-1">
                  {searchQuery
                    ? 'অনুসন্ধান ফলাফল খালি'
                    : 'এখনও কোনো অর্ডার দেওয়া হয়নি'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>অর্ডার নম্বর</TableHead>
                    <TableHead>গ্রাহক</TableHead>
                    <TableHead>মোট</TableHead>
                    <TableHead>পেমেন্ট</TableHead>
                    <TableHead>অর্ডার স্ট্যাটাস</TableHead>
                    <TableHead>পেমেন্ট স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ৳{order.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {order.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getOrderStatusBadge(order.orderStatus)}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                          বিস্তারিত
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl! max-h-[90vh] p-0">
          {selectedOrder && (
            <>
              <DialogHeader className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">
                      অর্ডার বিস্তারিত
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedOrder.orderNumber}
                    </DialogDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        অর্ডার:
                      </span>
                      {getOrderStatusBadge(selectedOrder.orderStatus)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        পেমেন্ট:
                      </span>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              <ScrollArea className="max-h-[calc(90vh-140px)]">
                <div className="p-6 space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      গ্রাহকের তথ্য
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground block mb-1">
                              নাম
                            </span>
                            <span className="font-medium">
                              {selectedOrder.customerName}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-1">
                              ফোন নম্বর
                            </span>
                            <span className="font-medium">
                              {selectedOrder.customerPhone}
                            </span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground block mb-1">
                              ঠিকানা
                            </span>
                            <span className="font-medium">
                              {selectedOrder.customerAddress}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      পণ্যের তালিকা
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {selectedOrder.items &&
                          selectedOrder.items.length > 0 ? (
                            selectedOrder.items.map((item, idx) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {item.product?.nameBn ||
                                      item.product?.name ||
                                      'N/A'}
                                  </div>
                                  {item.variant && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {item.variant.nameBn}:{' '}
                                      {item.variant.valueBn}
                                    </div>
                                  )}
                                  <div className="text-sm text-muted-foreground mt-1">
                                    ৳{item.price.toLocaleString()} ×{' '}
                                    {item.quantity}
                                  </div>
                                </div>
                                <div className="font-semibold text-right">
                                  ৳{item.total.toLocaleString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              পণ্যের তথ্য নেই
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      অর্ডার সামারি
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              সাবটোটাল
                            </span>
                            <span className="font-medium">
                              ৳{selectedOrder.subtotal.toLocaleString()}
                            </span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  ডিসকাউন্ট
                                  {selectedOrder.coupon && (
                                    <Badge variant="outline" className="ml-2">
                                      {selectedOrder.coupon.code}
                                    </Badge>
                                  )}
                                </span>
                                <span className="font-medium text-green-600">
                                  -৳{selectedOrder.discount.toLocaleString()}
                                </span>
                              </div>
                              {selectedOrder.coupon && (
                                <div className="text-xs text-muted-foreground pl-4">
                                  {selectedOrder.coupon.description ||
                                    `${
                                      selectedOrder.coupon.type === 'PERCENTAGE'
                                        ? `${selectedOrder.coupon.value}%`
                                        : `৳${selectedOrder.coupon.value}`
                                    } ছাড়`}
                                </div>
                              )}
                            </>
                          )}
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>মোট</span>
                            <span className="text-primary">
                              ৳{selectedOrder.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      পেমেন্ট তথ্য
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              পেমেন্ট পদ্ধতি
                            </span>
                            <span className="font-medium">
                              {selectedOrder.paymentMethod === 'COD'
                                ? 'ক্যাশ অন ডেলিভারি'
                                : 'বিকাশ'}
                            </span>
                          </div>
                          {selectedOrder.paymentMethod === 'BKASH' && (
                            <>
                              {selectedOrder.bkashNumber && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    বিকাশ নম্বর
                                  </span>
                                  <span className="font-medium">
                                    {selectedOrder.bkashNumber}
                                  </span>
                                </div>
                              )}
                              {selectedOrder.bkashTrxId && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    ট্রানজেকশন আইডি
                                  </span>
                                  <span className="font-medium font-mono">
                                    {selectedOrder.bkashTrxId}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-semibold text-base mb-3">নোট</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.notes}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Order Date */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      অর্ডার তারিখ
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm">
                          <div className="text-muted-foreground">
                            {new Date(selectedOrder.createdAt).toLocaleString(
                              'bn-BD',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Management */}
                  <div>
                    <h3 className="font-semibold text-base mb-3">
                      স্ট্যাটাস আপডেট
                    </h3>
                    <Card>
                      <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            অর্ডার স্ট্যাটাস
                          </label>
                          <Select
                            value={selectedOrder.orderStatus}
                            onValueChange={value =>
                              handleStatusUpdate(
                                selectedOrder.id,
                                'orderStatus',
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">অপেক্ষমাণ</SelectItem>
                              <SelectItem value="CONFIRMED">নিশ্চিত</SelectItem>
                              <SelectItem value="PROCESSING">
                                প্রসেসিং
                              </SelectItem>
                              <SelectItem value="SHIPPED">শিপড</SelectItem>
                              <SelectItem value="DELIVERED">
                                ডেলিভার হয়েছে
                              </SelectItem>
                              <SelectItem value="CANCELLED">বাতিল</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            পেমেন্ট স্ট্যাটাস
                          </label>
                          <Select
                            value={selectedOrder.paymentStatus}
                            onValueChange={value =>
                              handleStatusUpdate(
                                selectedOrder.id,
                                'paymentStatus',
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">অপেক্ষমাণ</SelectItem>
                              <SelectItem value="PAID">পেইড</SelectItem>
                              <SelectItem value="FAILED">ব্যর্থ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
