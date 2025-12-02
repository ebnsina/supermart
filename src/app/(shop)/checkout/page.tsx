'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/store'
import { bn } from '@/lib/translations'
import { useRouter } from 'next/navigation'
import { ShopButton } from '@/components/ShopButton'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ShoppingCart,
  Package,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string>('')
  const [couponSuccess, setCouponSuccess] = useState<string>('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount: number
    description?: string
  } | null>(null)
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({ isOpen: false, title: '', message: '' })
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'COD' as 'COD' | 'BKASH',
    bkashNumber: '',
    bkashTrxId: '',
    couponCode: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotalAmount = total()
  const discountAmount = appliedCoupon?.discount || 0
  const finalTotal = subtotalAmount - discountAmount

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  const applyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      return
    }

    setCouponLoading(true)
    setCouponError('')
    setCouponSuccess('')
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.couponCode,
          subtotal: subtotalAmount,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        setCouponError(error.error || 'কুপন প্রয়োগ করা যায়নি')
        return
      }

      const data = await response.json()
      setAppliedCoupon({
        code: data.coupon.code,
        discount: data.discount,
        description: data.coupon.description,
      })
      setCouponSuccess(
        `কুপন প্রয়োগ হয়েছে! আপনি ৳${data.discount.toLocaleString(
          'bn-BD'
        )} ছাড় পাচ্ছেন।`
      )
    } catch (error) {
      setCouponError('কুপন প্রয়োগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
    setCouponSuccess('')
    setFormData({ ...formData, couponCode: '' })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = bn.nameRequired
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = bn.phoneRequired
    } else if (!/^01[3-9]\d{8}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = bn.invalidPhone
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = bn.addressRequired
    }

    if (formData.paymentMethod === 'BKASH') {
      if (!formData.bkashNumber.trim()) {
        newErrors.bkashNumber = bn.bkashRequired
      }
      if (!formData.bkashTrxId.trim()) {
        newErrors.bkashTrxId = bn.transactionRequired
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: subtotalAmount,
          discount: discountAmount,
          total: finalTotal,
          couponCode: appliedCoupon?.code,
        }),
      })

      if (!response.ok) {
        throw new Error('অর্ডার সম্পন্ন হয়নি')
      }

      const data = await response.json()
      clearCart()
      router.push(`/orders/${data.orderNumber}`)
    } catch (error) {
      setDialogState({
        isOpen: true,
        title: 'ত্রুটি',
        message: 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{bn.checkout}</h1>

        {/* Guest Checkout Banner */}
        <div className="mb-6 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="font-semibold text-blue-900 mb-1">
                অতিথি হিসেবে অর্ডার করুন
              </h2>
              <p className="text-sm text-blue-700">
                লগইন ছাড়াই দ্রুত অর্ডার করুন। শুধু আপনার ফোন নম্বর দিয়ে অর্ডার
                ট্র্যাক করতে পারবেন।
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" size="sm" className="shrink-0">
                লগইন করুন
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-bold mb-4">{bn.shippingDetails}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">
                    {bn.name} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.customerName}
                    onChange={e =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="আপনার নাম লিখুন"
                    className="h-10"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {bn.phone} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        customerPhone: e.target.value,
                      })
                    }
                    placeholder="01XXXXXXXXX"
                    className="h-10"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {bn.address} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.customerAddress}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        customerAddress: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                  />
                  {errors.customerAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    {bn.paymentMethod}
                  </label>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={value =>
                      setFormData({
                        ...formData,
                        paymentMethod: value as 'COD' | 'BKASH',
                      })
                    }
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="COD" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        {bn.cod}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="BKASH" id="bkash" />
                      <Label htmlFor="bkash" className="cursor-pointer flex-1">
                        {bn.bkash}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.paymentMethod === 'BKASH' && (
                  <>
                    <div>
                      <label className="block font-semibold mb-1">
                        {bn.bkashNumber} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.bkashNumber}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bkashNumber: e.target.value,
                          })
                        }
                        placeholder="01XXXXXXXXX"
                        className="h-10"
                      />
                      {errors.bkashNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bkashNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">
                        {bn.transactionId}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.bkashTrxId}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bkashTrxId: e.target.value,
                          })
                        }
                        placeholder="ট্রানজেকশন আইডি লিখুন"
                        className="h-10"
                      />
                      {errors.bkashTrxId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bkashTrxId}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <ShopButton
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="w-full h-12"
                >
                  {loading ? 'প্রসেসিং...' : bn.placeOrder}
                </ShopButton>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-lg">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  অর্ডার সামারি
                </CardTitle>
                <CardDescription>আপনার অর্ডারের বিস্তারিত</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Items List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {items.map(item => {
                    const itemTotal = item.price * item.quantity
                    return (
                      <div
                        key={`${item.productId}-${item.variantId || ''}`}
                        className="flex justify-between text-sm items-start gap-3 pb-2 border-b last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.nameBn}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {item.variantNameBn && (
                              <Badge
                                variant="secondary"
                                className="text-xs h-5"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {item.variantNameBn}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              x {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-nowrap">
                          ৳{itemTotal.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Coupon Section */}
                <div className="space-y-2">
                  <label className="block font-semibold text-sm">
                    কুপন কোড (যদি থাকে)
                  </label>
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <p className="font-semibold text-green-800">
                              {appliedCoupon.code}
                            </p>
                          </div>
                          {appliedCoupon.description && (
                            <p className="text-xs text-green-600 ml-6">
                              {appliedCoupon.description}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={removeCoupon}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                        >
                          সরান
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={formData.couponCode}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              couponCode: e.target.value,
                            })
                          }
                          placeholder="কুপন কোড লিখুন"
                          className="h-10"
                        />
                        <Button
                          type="button"
                          onClick={applyCoupon}
                          disabled={
                            couponLoading || !formData.couponCode.trim()
                          }
                          variant="secondary"
                        >
                          {couponLoading ? 'চেক...' : 'প্রয়োগ'}
                        </Button>
                      </div>
                      {couponError && (
                        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{couponError}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {couponSuccess && (
                    <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      {bn.subtotal}
                      <span className="text-xs">({items.length} টি আইটেম)</span>
                    </span>
                    <span className="font-semibold text-base">
                      ৳{subtotalAmount.toLocaleString('bn-BD')}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm items-center text-green-600">
                      <span className="flex items-center gap-1">ছাড়</span>
                      <span className="font-semibold">
                        -৳{discountAmount.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-start gap-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      ডেলিভারি চার্জ
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-3 h-3 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>ডেলিভারি চার্জ নির্ধারিত হবে</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="font-medium text-muted-foreground text-xs text-right">
                      অর্ডার কনফার্মে গণনা করা হবে
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center bg-primary/5 -mx-6 px-6 py-4 rounded-lg">
                  <span className="font-semibold text-lg">{bn.total}</span>
                  <span className="font-bold text-2xl sm:text-3xl text-primary">
                    ৳{finalTotal.toLocaleString('bn-BD')}
                  </span>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <Package className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-800">
                    সব পণ্য স্টকে আছে এবং ডেলিভারির জন্য প্রস্তুত
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog
        open={dialogState.isOpen}
        onOpenChange={open =>
          !open && setDialogState({ ...dialogState, isOpen: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogState.title}</DialogTitle>
            <DialogDescription>{dialogState.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDialogState({ ...dialogState, isOpen: false })}
            >
              ঠিক আছে
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
