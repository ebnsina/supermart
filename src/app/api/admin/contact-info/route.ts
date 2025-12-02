import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let contactInfo = await prisma.contactInfo.findFirst()

    // Create default contact info if none exists
    if (!contactInfo) {
      contactInfo = await prisma.contactInfo.create({
        data: {
          paymentMethods: [],
        },
      })
    }

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      phone,
      email,
      address,
      addressBn,
      workingHours,
      workingHoursBn,
      logo,
      description,
      descriptionBn,
      trustpilot,
      paymentMethods,
    } = body

    // Get or create contact info
    let contactInfo = await prisma.contactInfo.findFirst()

    if (!contactInfo) {
      contactInfo = await prisma.contactInfo.create({
        data: {
          phone,
          email,
          address,
          addressBn,
          workingHours,
          workingHoursBn,
          logo,
          description,
          descriptionBn,
          trustpilot,
          paymentMethods: paymentMethods || [],
        },
      })
    } else {
      contactInfo = await prisma.contactInfo.update({
        where: { id: contactInfo.id },
        data: {
          phone,
          email,
          address,
          addressBn,
          workingHours,
          workingHoursBn,
          logo,
          description,
          descriptionBn,
          trustpilot,
          paymentMethods: paymentMethods || [],
        },
      })
    }

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to update contact info' },
      { status: 500 }
    )
  }
}
