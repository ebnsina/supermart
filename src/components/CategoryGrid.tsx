'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  nameBn: string
  slug: string
  image?: string | null
}

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (categories.length === 0) {
    return null
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            ক্যাটাগরি
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => scroll('left')}
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-6" />
            </Button>
            <Button
              onClick={() => scroll('right')}
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-6" />
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll Layout */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map(category => {
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group shrink-0 flex flex-col items-center"
              >
                {/* Circular Image Container */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-100 mb-3 duration-300">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.nameBn}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/7183/7183999.png "
                        alt=""
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <h3 className="text-sm md:text-base font-semibold text-gray-800 text-center max-w-[140px] line-clamp-2">
                  {category.nameBn}
                </h3>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
