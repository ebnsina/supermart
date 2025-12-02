import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [sections, socialLinks, contactInfo] = await Promise.all([
      prisma.footerSection.findMany({
        where: { active: true },
        include: {
          links: {
            where: { active: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      }),
      prisma.socialLink.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      }),
      prisma.contactInfo.findFirst(),
    ])

    return NextResponse.json({
      sections,
      socialLinks,
      contactInfo,
    })
  } catch (error) {
    console.error('Error fetching footer data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    )
  }
}
