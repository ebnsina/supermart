'use client'

import Link from 'next/link'
import { useCart } from '@/lib/store'
import { bn } from '@/lib/translations'
import { ShoppingBag, ShoppingCart } from 'lucide-react'
import { ShopButton } from './ShopButton'
import { Badge } from './ui/badge'

interface ProductCardProps {
  product: {
    id: string
    name: string
    nameBn: string
    slug: string
    price: number
    comparePrice: number | null
    images: string[]
    stock: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      nameBn: product.nameBn,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '/placeholder.jpg',
    })
  }

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.nameBn}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 right-2">-{discount}%</Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-black/60 rounded-md px-4 py-2 text-white font-semibold">
                {bn.outOfStock}
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold mb-2 line-clamp-2 h-12 hover:text-primary transition">
            {product.nameBn}
          </h3>
        </Link>
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-primary">
              ৳{product.price.toLocaleString('bn-BD')}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 line-through">
                ৳{product.comparePrice.toLocaleString('bn-BD')}
              </span>
            )}
          </div>
        </div>
        <div className="space-y-2 gap-1">
          <ShopButton
            href={`/products/${product.slug}`}
            variant="primary"
            disabled={product.stock === 0}
            className="flex space-x-2 items-center justify-center w-full"
          >
            <ShoppingBag className="size-4" />
            <span>{bn.buyNow}</span>
          </ShopButton>
          <ShopButton
            variant="outline"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full"
          >
            {bn.addToCart}
          </ShopButton>
        </div>
      </div>
    </div>
  )
}
