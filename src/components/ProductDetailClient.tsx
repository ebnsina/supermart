'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart, useWishlist } from '@/lib/store'
import { bn } from '@/lib/translations'
import { ShopButton } from './ShopButton'
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Facebook,
  Twitter,
  Copy,
  Check,
} from 'lucide-react'
import ProductCard from './ProductCard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ProductReviews } from './ProductReviews'
import { ProductQuestions } from './ProductQuestions'

interface Product {
  id: string
  name: string
  nameBn: string
  slug: string
  description: string
  descriptionBn: string
  price: number
  comparePrice: number | null
  stock: number
  images: string[]
  featured: boolean
  category: {
    id: string
    nameBn: string
    slug: string
  }
  subcategory?: {
    id: string
    nameBn: string
    slug: string
  } | null
  variants: Array<{
    id: string
    name: string
    nameBn: string
    value: string
    valueBn: string
    price: number | null
    stock: number
  }>
}

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Array<{
    id: string
    name: string
    nameBn: string
    slug: string
    price: number
    comparePrice: number | null
    images: string[]
    stock: number
  }>
  reviewStats: {
    count: number
    average: number
  }
  featureCards: Array<{
    id: string
    title: string
    titleBn: string
    description: string | null
    descriptionBn: string | null
    icon: string
    order: number
  }>
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  reviewStats,
  featureCards,
}: ProductDetailClientProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const {
    items: wishlistItems,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlist()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'description'>('description')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({ isOpen: false, title: '', message: '', type: 'success' })

  const isWishlisted = isInWishlist(product.id)

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false)
      }
    }

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareMenu])

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      nameBn: product.nameBn,
      price: product.price,
      quantity,
      image: product.images[0] || '/placeholder.jpg',
    })
    setDialogState({
      isOpen: true,
      title: 'সফল!',
      message: 'পণ্যটি কার্টে যোগ করা হয়েছে!',
      type: 'success',
    })
  }

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      nameBn: product.nameBn,
      price: product.price,
      quantity,
      image: product.images[0] || '/placeholder.jpg',
    })
    router.push('/checkout')
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        nameBn: product.nameBn,
        price: product.price,
        image: product.images[0] || '/placeholder.jpg',
        slug: product.slug,
      })
    }
  }

  const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `${product.nameBn} - ৳${product.price}`

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          '_blank',
          'width=600,height=400'
        )
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(text)}`,
          '_blank',
          'width=600,height=400'
        )
        break
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
            setShowShareMenu(false)
          }, 2000)
        })
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-600">
              {bn.home}
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-orange-600">
              {bn.products}
            </Link>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-primary"
            >
              {product.category.nameBn}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.nameBn}</span>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-sm p-6">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  -{discount}%
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                  <span className="text-white text-2xl font-bold">
                    {bn.outOfStock}
                  </span>
                </div>
              )}
              <img
                src={product.images[selectedImage] || '/placeholder.jpg'}
                alt={product.nameBn}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 p-0 ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.nameBn} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {product.nameBn}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(reviewStats.average)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  (
                  {reviewStats.average > 0
                    ? reviewStats.average.toFixed(1)
                    : 'No reviews'}
                  ){reviewStats.count > 0 && ` - ${reviewStats.count} টি রিভিউ`}
                </span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                স্টক:{' '}
                <span className="text-green-600 font-semibold">
                  {product.stock} টি
                </span>
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  ৳{product.price.toLocaleString('bn-BD')}
                </span>
                {product.comparePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ৳{product.comparePrice.toLocaleString('bn-BD')}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  আপনি সাশ্রয় করছেন: ৳
                  {(product.comparePrice! - product.price).toLocaleString(
                    'bn-BD'
                  )}
                </p>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  ভেরিয়েন্ট নির্বাচন করুন:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => (
                    <Button
                      key={variant.id}
                      variant="outline"
                      onClick={() => setSelectedVariant(variant.id)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        selectedVariant === variant.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : variant.stock === 0
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {variant.valueBn}
                      </div>
                      {variant.price && (
                        <div className="text-xs text-gray-500">
                          +৳{variant.price}
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                পরিমাণ:
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  সর্বোচ্চ: {product.stock} টি
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <ShopButton
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                variant="primary"
                className="py-3 font-semibold text-lg"
              >
                এখনই কিনুন
              </ShopButton>
              <ShopButton
                variant="outline"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="py-3 font-semibold text-lg gap-2 flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5" />
                কার্টে যোগ করুন
              </ShopButton>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className={`flex-1 border gap-2 ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-gray-200 text-gray-700 hover:border-primary/50 hover:text-primary'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-red-600' : ''}`}
                />
                {isWishlisted ? 'উইশলিস্টে আছে' : 'উইশলিস্ট'}
              </Button>
              <div className="flex-1 relative" ref={shareMenuRef}>
                <Button
                  variant="outline"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full border border-gray-200 text-gray-700 hover:border-primary/50 hover:text-primary gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  শেয়ার করুন
                </Button>{' '}
                {/* Share Menu Dropdown */}
                {showShareMenu && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleShare('facebook')}
                      className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-none"
                    >
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Facebook</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleShare('twitter')}
                      className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-none"
                    >
                      <Twitter className="w-5 h-5 text-sky-500" />
                      <span className="text-gray-700">Twitter</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleShare('copy')}
                      className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-b-lg rounded-t-none"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-green-600">কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">লিংক কপি করুন</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {featureCards.length > 0 && (
              <div className="border-t pt-6 space-y-3">
                {featureCards.map(feature => {
                  // Map icon names to actual icon components
                  const getIcon = (iconName: string) => {
                    switch (iconName.toLowerCase()) {
                      case 'truck':
                        return <Truck className="w-5 h-5 text-primary" />
                      case 'shield':
                        return <Shield className="w-5 h-5 text-primary" />
                      case 'rotateccw':
                      case 'rotate-ccw':
                        return <RotateCcw className="w-5 h-5 text-primary" />
                      default:
                        return <Shield className="w-5 h-5 text-primary" />
                    }
                  }

                  return (
                    <div
                      key={feature.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      {getIcon(feature.icon)}
                      <span className="text-gray-700">
                        {feature.descriptionBn || feature.titleBn}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            পণ্যের বিবরণ
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.descriptionBn}
            </p>
          </div>
        </div>

        {/* New Reviews & Q&A Components */}
        <div className="mt-12 space-y-8">
          <ProductReviews productId={product.id} />
          <ProductQuestions productId={product.id} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                সম্পর্কিত পণ্য
              </h2>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-primary hover:text-primary/90 font-medium text-sm flex items-center gap-1"
              >
                আরো দেখুন
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
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
    </div>
  )
}
