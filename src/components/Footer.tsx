'use client'

import Link from 'next/link'
import { Facebook, Twitter, Linkedin, Youtube, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FooterLink {
  id: string
  label: string
  labelBn: string
  url: string
  order: number
}

interface FooterSection {
  id: string
  title: string
  titleBn: string
  order: number
  links: FooterLink[]
}

interface SocialLink {
  id: string
  platform: string
  url: string
  icon?: string | null
  order: number
}

interface ContactInfo {
  phone?: string | null
  email?: string | null
  address?: string | null
  addressBn?: string | null
  workingHours?: string | null
  workingHoursBn?: string | null
  logo?: string | null
  description?: string | null
  descriptionBn?: string | null
  trustpilot?: string | null
  paymentMethods: string[]
}

interface FooterData {
  sections: FooterSection[]
  socialLinks: SocialLink[]
  contactInfo: ContactInfo | null
}

const socialIcons: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
}

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData>({
    sections: [],
    socialLinks: [],
    contactInfo: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/footer')
      .then(res => res.json())
      .then(data => {
        setFooterData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching footer data:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          Loading...
        </div>
      </footer>
    )
  }

  const { sections, socialLinks, contactInfo } = footerData

  return (
    <footer className="bg-gray-50 border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info Column */}
          <div>
            {contactInfo?.logo ? (
              <img
                src={contactInfo.logo}
                alt="Logo"
                className="h-12 w-auto mb-4"
              />
            ) : (
              <h3 className="text-xl font-bold text-primary mb-4">
                সুপারমার্ট
              </h3>
            )}

            {contactInfo?.descriptionBn && (
              <p className="text-gray-600 text-sm mb-4">
                {contactInfo.descriptionBn}
              </p>
            )}

            {contactInfo?.workingHoursBn && (
              <p className="text-gray-700 text-sm mb-2">
                <span className="font-semibold">সময়সূচী:</span>{' '}
                {contactInfo.workingHoursBn}
              </p>
            )}

            {contactInfo?.phone && (
              <p className="text-gray-900 text-lg font-bold mb-4">
                {contactInfo.phone}
              </p>
            )}

            {/* Social Links */}
            {socialLinks?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">আমাদের অনুসরণ করুন</p>
                <div className="flex space-x-2">
                  {socialLinks?.map(link => {
                    const IconComponent =
                      socialIcons[link.platform.toLowerCase()]
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition"
                      >
                        {IconComponent && <IconComponent className="w-5 h-5" />}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Trustpilot */}
            {contactInfo?.trustpilot && (
              <a
                href={contactInfo.trustpilot}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                আমাদের রিভিউ দেখুন{' '}
                <Star className="w-4 h-4 ml-1 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold ml-1">Trustpilot</span>
              </a>
            )}
          </div>

          {/* Dynamic Footer Sections */}
          {sections?.map(section => (
            <div key={section.id}>
              <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">
                {section.titleBn}
              </h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      className="text-gray-600 hover:text-primary text-sm"
                    >
                      {link.labelBn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar - Copyright & Payment Methods */}
      <div className="border-t bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} সুপারমার্ট. সর্বস্বত্ব সংরক্ষিত.
            </div>

            {/* Payment Methods */}
            {contactInfo?.paymentMethods &&
              contactInfo.paymentMethods.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 mr-2">
                    নিরাপদ পেমেন্ট:
                  </span>
                  {contactInfo.paymentMethods.map((method, index) => (
                    <img
                      key={index}
                      src={method}
                      alt="Payment method"
                      className="h-8 object-contain"
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </footer>
  )
}
