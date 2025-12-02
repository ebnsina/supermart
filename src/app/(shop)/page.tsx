import { prisma } from '@/lib/prisma'
import BannerCarousel from '@/components/BannerCarousel'
import CategoryGrid from '@/components/CategoryGrid'
import ProductCarousel from '@/components/ProductCarousel'
import MidBanner from '@/components/MidBanner'
import FeatureCards from '@/components/FeatureCards'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch all homepage data
  const [
    settings,
    banners,
    productSections,
    midBanners,
    featureCards,
    categories,
  ] = await Promise.all([
    prisma.basicSettings.findFirst(),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
    prisma.productSection.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
    prisma.midBanner.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
    }),
    prisma.featureCard.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
    prisma.category.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Fetch products for each section
  const sectionsWithProducts = await Promise.all(
    productSections.map(async section => {
      let products: any[] = []

      switch (section.type) {
        case 'FEATURED':
          products = await prisma.product.findMany({
            where: { featured: true, active: true, stock: { gt: 0 } },
            take: section.limit,
            orderBy: { createdAt: 'desc' },
          })
          break
        case 'NEW_ARRIVAL':
          products = await prisma.product.findMany({
            where: { active: true, stock: { gt: 0 } },
            take: section.limit,
            orderBy: { createdAt: 'desc' },
          })
          break
        case 'HOT_DEALS':
          products = await prisma.product.findMany({
            where: {
              active: true,
              stock: { gt: 0 },
              comparePrice: { not: null },
            },
            take: section.limit,
            orderBy: { createdAt: 'desc' },
          })
          break
        case 'BEST_SELLING':
          products = await prisma.product.findMany({
            where: { active: true, stock: { gt: 0 } },
            take: section.limit,
            orderBy: { createdAt: 'desc' },
          })
          break
        default:
          products = []
      }

      return {
        ...section,
        products,
      }
    })
  )

  return (
    <div className="bg-gray-50">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="container mx-auto px-4 pt-6">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && <CategoryGrid categories={categories} />}

      {/* Product Sections with Mid Banners */}
      {sectionsWithProducts.map((section, index) => (
        <div key={section.id}>
          <ProductCarousel
            title={section.title}
            titleBn={section.titleBn}
            products={section.products}
          />

          {/* Insert mid banner after specific sections */}
          {midBanners
            .filter(banner => banner.position === index + 1)
            .map(banner => (
              <MidBanner
                key={banner.id}
                title={banner.title}
                titleBn={banner.titleBn}
                subtitle={banner.subtitle}
                subtitleBn={banner.subtitleBn}
                image={banner.image}
                link={banner.link}
              />
            ))}
        </div>
      ))}

      {/* Feature Cards */}
      {featureCards.length > 0 && <FeatureCards cards={featureCards} />}
    </div>
  )
}
