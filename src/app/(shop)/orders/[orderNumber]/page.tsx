import { prisma } from '@/lib/prisma'
import { bn } from '@/lib/translations'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { ShopButton } from '@/components/ShopButton'

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  })

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">অর্ডার পাওয়া যায়নি</h1>
        <Link href="/" className="text-primary hover:underline">
          হোমপেজে ফিরে যান
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            অর্ডার সফল হয়েছে!
          </h1>
          <p className="text-green-700 mb-4">
            আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ
            করব।
          </p>
          <p className="text-sm text-green-600">
            আপনার ফোন নম্বর <strong>{order.customerPhone}</strong> দিয়ে যেকোনো
            সময় অর্ডার ট্র্যাক করতে পারবেন।
          </p>
        </div>

        {/* Guest Account Creation Prompt */}
        {!order.userId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">
              অ্যাকাউন্ট তৈরি করে আরও সুবিধা পান!
            </h3>
            <ul className="text-sm text-blue-700 mb-4 space-y-1">
              <li>✓ সব অর্ডার এক জায়গায় দেখুন</li>
              <li>✓ দ্রুত চেকআউট করুন</li>
              <li>✓ সংরক্ষিত ঠিকানা ব্যবহার করুন</li>
              <li>✓ বিশেষ অফার পান</li>
            </ul>

            <ShopButton href="/register" variant="primary">
              বিনামূল্যে অ্যাকাউন্ট তৈরি করুন
            </ShopButton>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">অর্ডার বিস্তারিত</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">অর্ডার নম্বর</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">তারিখ</span>
              <span className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">স্ট্যাটাস</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
                {order.orderStatus}
              </span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">পেমেন্ট পদ্ধতি</span>
              <span className="font-semibold">
                {order.paymentMethod === 'COD' ? bn.cod : bn.bkash}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded p-4 mb-6">
            <h3 className="font-bold mb-3">ডেলিভারি তথ্য</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">নাম: </span>
                <span className="font-semibold">{order.customerName}</span>
              </div>
              <div>
                <span className="text-gray-600">ফোন: </span>
                <span className="font-semibold">{order.customerPhone}</span>
              </div>
              <div>
                <span className="text-gray-600">ঠিকানা: </span>
                <span className="font-semibold">{order.customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">পণ্যের তালিকা</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0] || '/placeholder.jpg'}
                      alt={item.product.nameBn}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold">{item.product.nameBn}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          {item.variant.valueBn}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        পরিমাণ: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ৳{order.total.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-sm text-gray-600">
                      ৳{item.price.toLocaleString('bn-BD')} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">সাবটোটাল</span>
              <span>৳{order.subtotal.toLocaleString('bn-BD')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>ছাড়</span>
                <span>-৳{order.discount.toLocaleString('bn-BD')}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>মোট</span>
              <span className="text-primary">
                ৳{order.total.toLocaleString('bn-BD')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <ShopButton href="/" variant="primary">
            হোমপেজে ফিরে যান
          </ShopButton>
          <ShopButton href="/products" variant="outline">
            আরও কেনাকাটা করুন
          </ShopButton>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded text-center text-sm text-blue-800">
          <p>
            কোন সমস্যা হলে আমাদের সাথে যোগাযোগ করুন। আপনার অর্ডার নম্বর:{' '}
            <span className="font-bold">{order.orderNumber}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
