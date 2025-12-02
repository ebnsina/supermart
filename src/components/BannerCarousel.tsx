'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Banner {
  id: string
  title?: string | null
  titleBn?: string | null
  subtitle?: string | null
  subtitleBn?: string | null
  image: string
  link?: string | null
}

interface BannerCarouselProps {
  banners: Banner[]
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length)
    }, 5000) // Auto-play every 5 seconds

    return () => clearInterval(interval)
  }, [banners.length])

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(prev => (prev + 1) % banners.length)
  }

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]
  const content = (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-lg bg-gray-200">
      <Image
        src={currentBanner.image}
        alt={currentBanner.titleBn || 'Banner'}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />

      {/* Text Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-16 md:px-20 lg:px-24">
          <div className="max-w-2xl text-white">
            {currentBanner.titleBn && (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                {currentBanner.titleBn}
              </h2>
            )}
            {currentBanner.subtitleBn && (
              <p className="text-lg md:text-xl lg:text-2xl mb-6 drop-shadow-md">
                {currentBanner.subtitleBn}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </Button>
          <Button
            onClick={goToNext}
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )

  return currentBanner.link ? (
    <Link href={currentBanner.link}>{content}</Link>
  ) : (
    content
  )
}
