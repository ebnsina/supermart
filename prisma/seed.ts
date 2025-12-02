import 'dotenv/config'
import { PrismaClient } from '@/generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Delete all existing data
  console.log('🗑️  Deleting existing data...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.review.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.subCategory.deleteMany()
  await prisma.category.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.user.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.productSection.deleteMany()
  await prisma.midBanner.deleteMany()
  await prisma.featureCard.deleteMany()
  await prisma.footerLink.deleteMany()
  await prisma.footerSection.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.contactInfo.deleteMany()
  await prisma.basicSettings.deleteMany()
  await prisma.footerSettings.deleteMany()
  await prisma.menuItem.deleteMany()
  console.log('✅ Existing data deleted')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@supermart.com' },
    update: {},
    create: {
      email: 'admin@supermart.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create categories
  const categories = [
    {
      name: 'Electronics',
      nameBn: 'ইলেকট্রনিক্স',
      slug: 'electronics',
      description: 'Electronic gadgets and devices',
      descriptionBn: 'ইলেকট্রনিক পণ্য এবং যন্ত্রপাতি',
    },
    {
      name: 'Fashion',
      nameBn: 'ফ্যাশন',
      slug: 'fashion',
      description: 'Clothing and accessories',
      descriptionBn: 'পোশাক এবং এক্সেসরিজ',
    },
    {
      name: 'Home & Living',
      nameBn: 'হোম এন্ড লিভিং',
      slug: 'home-living',
      description: 'Home decor and living essentials',
      descriptionBn: 'ঘর সাজানো এবং জীবনযাপনের প্রয়োজনীয় জিনিস',
    },
    {
      name: 'Beauty',
      nameBn: 'সৌন্দর্য',
      slug: 'beauty',
      description: 'Beauty and personal care',
      descriptionBn: 'সৌন্দর্য এবং ব্যক্তিগত যত্ন',
    },
    {
      name: 'Groceries',
      nameBn: 'মুদি সামগ্রী',
      slug: 'groceries',
      description: 'Daily grocery and essentials',
      descriptionBn: 'দৈনন্দিন মুদি ও প্রয়োজনীয় পণ্য',
    },
    {
      name: 'Baby Care',
      nameBn: 'বেবি কেয়ার',
      slug: 'baby-care',
      description: 'Baby food and care products',
      descriptionBn: 'শিশু খাবার এবং যত্নের পণ্য',
    },
    {
      name: 'Sports & Outdoors',
      nameBn: 'স্পোর্টস ও আউটডোর',
      slug: 'sports-outdoors',
      description: 'Sports gear and outdoor items',
      descriptionBn: 'ক্রীড়া সামগ্রী এবং আউটডোর আইটেম',
    },
    {
      name: 'Automotive',
      nameBn: 'অটোমোটিভ',
      slug: 'automotive',
      description: 'Vehicle parts and accessories',
      descriptionBn: 'গাড়ির যন্ত্রাংশ এবং এক্সেসরিজ',
    },
    {
      name: 'Books',
      nameBn: 'বই',
      slug: 'books',
      description: 'Books and educational materials',
      descriptionBn: 'বই এবং শিক্ষা উপকরণ',
    },
    {
      name: 'Furniture',
      nameBn: 'ফার্নিচার',
      slug: 'furniture',
      description: 'Furniture and home essentials',
      descriptionBn: 'ফার্নিচার এবং ঘরের প্রয়োজনীয় সামগ্রী',
    },
    {
      name: 'Kitchen Appliances',
      nameBn: 'কিচেন অ্যাপ্লায়েন্স',
      slug: 'kitchen-appliances',
      description: 'Kitchen tools and appliances',
      descriptionBn: 'রান্নাঘরের সরঞ্জাম ও যন্ত্রপাতি',
    },
    {
      name: 'Health & Wellness',
      nameBn: 'স্বাস্থ্য ও সুস্থতা',
      slug: 'health-wellness',
      description: 'Health supplements and wellness items',
      descriptionBn: 'স্বাস্থ্য সাপ্লিমেন্ট ও সুস্থতার পণ্য',
    },
    {
      name: 'Pet Supplies',
      nameBn: 'পোষা প্রাণীর সরঞ্জাম',
      slug: 'pet-supplies',
      description: 'Pet food and accessories',
      descriptionBn: 'পোষা প্রাণীর খাবার এবং সরঞ্জাম',
    },
    {
      name: 'Jewelry',
      nameBn: 'গয়না',
      slug: 'jewelry',
      description: 'Jewelry and ornaments',
      descriptionBn: 'গয়না এবং অলঙ্কার',
    },
    {
      name: 'Footwear',
      nameBn: 'জুতা',
      slug: 'footwear',
      description: 'Shoes and sandals',
      descriptionBn: 'জুতা এবং স্যান্ডেল',
    },
    {
      name: 'Mobile Accessories',
      nameBn: 'মোবাইল এক্সেসরিজ',
      slug: 'mobile-accessories',
      description: 'Phone accessories and gadgets',
      descriptionBn: 'মোবাইল এক্সেসরিজ এবং গ্যাজেট',
    },
    {
      name: 'Computer & Gaming',
      nameBn: 'কম্পিউটার ও গেমিং',
      slug: 'computer-gaming',
      description: 'Computers, gaming gear and accessories',
      descriptionBn: 'কম্পিউটার, গেমিং সামগ্রী এবং এক্সেসরিজ',
    },
    {
      name: 'Travel & Luggage',
      nameBn: 'ট্রাভেল ও লাগেজ',
      slug: 'travel-luggage',
      description: 'Travel bags and accessories',
      descriptionBn: 'ভ্রমণের ব্যাগ ও এক্সেসরিজ',
    },
    {
      name: 'Stationery',
      nameBn: 'স্টেশনারি',
      slug: 'stationery',
      description: 'Office and school supplies',
      descriptionBn: 'অফিস এবং স্কুলের স্টেশনারি সামগ্রী',
    },
    {
      name: 'Tools & Hardware',
      nameBn: 'টুলস ও হার্ডওয়্যার',
      slug: 'tools-hardware',
      description: 'Hardware and repair tools',
      descriptionBn: 'হার্ডওয়্যার এবং মেরামতের সরঞ্জাম',
    },
    {
      name: 'Home Cleaning',
      nameBn: 'বাড়ি পরিষ্কার',
      slug: 'home-cleaning',
      description: 'Cleaning products and essentials',
      descriptionBn: 'বাড়ি পরিষ্কার করার পণ্য এবং প্রয়োজনীয় সামগ্রী',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Get all categories for product creation
  const electronicsCategory = await prisma.category.findUnique({
    where: { slug: 'electronics' },
  })

  const fashionCategory = await prisma.category.findUnique({
    where: { slug: 'fashion' },
  })

  const homeCategory = await prisma.category.findUnique({
    where: { slug: 'home-living' },
  })

  const beautyCategory = await prisma.category.findUnique({
    where: { slug: 'beauty' },
  })

  // Product templates for variety
  const productTemplates = {
    electronics: [
      {
        name: 'Wireless Headphones',
        nameBn: 'ওয়্যারলেস হেডফোন',
        basePrice: 2500,
        image:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      },
      {
        name: 'Smart Watch',
        nameBn: 'স্মার্ট ওয়াচ',
        basePrice: 4500,
        image:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      },
      {
        name: 'Bluetooth Speaker',
        nameBn: 'ব্লুটুথ স্পিকার',
        basePrice: 1800,
        image:
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
      },
      {
        name: 'Laptop',
        nameBn: 'ল্যাপটপ',
        basePrice: 45000,
        image:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      },
      {
        name: 'Smartphone',
        nameBn: 'স্মার্টফোন',
        basePrice: 25000,
        image:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      },
      {
        name: 'Power Bank',
        nameBn: 'পাওয়ার ব্যাংক',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
      },
      {
        name: 'USB Cable',
        nameBn: 'ইউএসবি ক্যাবল',
        basePrice: 250,
        image:
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
      },
      {
        name: 'Keyboard',
        nameBn: 'কীবোর্ড',
        basePrice: 1500,
        image:
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      },
      {
        name: 'Mouse',
        nameBn: 'মাউস',
        basePrice: 800,
        image:
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      },
      {
        name: 'Webcam',
        nameBn: 'ওয়েবক্যাম',
        basePrice: 2200,
        image:
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
      },
    ],
    fashion: [
      {
        name: 'Cotton T-Shirt',
        nameBn: 'কটন টি-শার্ট',
        basePrice: 500,
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      },
      {
        name: 'Jeans Pant',
        nameBn: 'জিন্স প্যান্ট',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      },
      {
        name: 'Formal Shirt',
        nameBn: 'ফরমাল শার্ট',
        basePrice: 1500,
        image:
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
      },
      {
        name: 'Polo Shirt',
        nameBn: 'পোলো শার্ট',
        basePrice: 800,
        image:
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
      },
      {
        name: 'Hoodie',
        nameBn: 'হুডি',
        basePrice: 1800,
        image:
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
      },
      {
        name: 'Sneakers',
        nameBn: 'স্নিকার্স',
        basePrice: 2500,
        image:
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      },
      {
        name: 'Watch',
        nameBn: 'ঘড়ি',
        basePrice: 3000,
        image:
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500',
      },
      {
        name: 'Sunglasses',
        nameBn: 'সানগ্লাস',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      },
      {
        name: 'Belt',
        nameBn: 'বেল্ট',
        basePrice: 600,
        image:
          'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=500',
      },
      {
        name: 'Backpack',
        nameBn: 'ব্যাকপ্যাক',
        basePrice: 1500,
        image:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      },
    ],
    home: [
      {
        name: 'Bed Sheet',
        nameBn: 'বেড শীট',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
      },
      {
        name: 'Pillow',
        nameBn: 'বালিশ',
        basePrice: 450,
        image:
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500',
      },
      {
        name: 'Table Lamp',
        nameBn: 'টেবিল ল্যাম্প',
        basePrice: 800,
        image:
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500',
      },
      {
        name: 'Wall Clock',
        nameBn: 'দেয়াল ঘড়ি',
        basePrice: 650,
        image:
          'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500',
      },
      {
        name: 'Curtain',
        nameBn: 'পর্দা',
        basePrice: 1500,
        image:
          'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500',
      },
      {
        name: 'Vase',
        nameBn: 'ফুলদানি',
        basePrice: 400,
        image:
          'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500',
      },
      {
        name: 'Photo Frame',
        nameBn: 'ফটো ফ্রেম',
        basePrice: 350,
        image:
          'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500',
      },
      {
        name: 'Carpet',
        nameBn: 'কার্পেট',
        basePrice: 2500,
        image:
          'https://images.unsplash.com/photo-1600166898405-da9535204843?w=500',
      },
      {
        name: 'Cushion',
        nameBn: 'কুশন',
        basePrice: 350,
        image:
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
      },
      {
        name: 'Storage Box',
        nameBn: 'স্টোরেজ বক্স',
        basePrice: 600,
        image:
          'https://images.unsplash.com/photo-1603794067602-9feaa4f70e0c?w=500',
      },
    ],
    beauty: [
      {
        name: 'Face Cream',
        nameBn: 'ফেস ক্রিম',
        basePrice: 450,
        image:
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      },
      {
        name: 'Shampoo',
        nameBn: 'শ্যাম্পু',
        basePrice: 350,
        image:
          'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500',
      },
      {
        name: 'Body Lotion',
        nameBn: 'বডি লোশন',
        basePrice: 550,
        image:
          'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=500',
      },
      {
        name: 'Lipstick',
        nameBn: 'লিপস্টিক',
        basePrice: 400,
        image:
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500',
      },
      {
        name: 'Perfume',
        nameBn: 'পারফিউম',
        basePrice: 1200,
        image:
          'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500',
      },
      {
        name: 'Face Mask',
        nameBn: 'ফেস মাস্ক',
        basePrice: 250,
        image:
          'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500',
      },
      {
        name: 'Hair Oil',
        nameBn: 'চুলের তেল',
        basePrice: 300,
        image:
          'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500',
      },
      {
        name: 'Sunscreen',
        nameBn: 'সানস্ক্রিন',
        basePrice: 650,
        image:
          'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=500',
      },
      {
        name: 'Nail Polish',
        nameBn: 'নেইল পলিশ',
        basePrice: 200,
        image:
          'https://images.unsplash.com/photo-1519862170344-6cd5e49cb996?w=500',
      },
      {
        name: 'Makeup Kit',
        nameBn: 'মেকআপ কিট',
        basePrice: 2500,
        image:
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500',
      },
    ],
  }

  let productCount = 0

  // Create products for Electronics
  if (electronicsCategory) {
    for (let i = 0; i < 25; i++) {
      const template =
        productTemplates.electronics[i % productTemplates.electronics.length]
      const variant = Math.floor(i / productTemplates.electronics.length)
      const variantName =
        variant > 0
          ? ` ${
              ['Pro', 'Plus', 'Max', 'Ultra', 'Lite'][variant - 1] ||
              `V${variant}`
            }`
          : ''

      const product = {
        name: `${template.name}${variantName}`,
        nameBn: `${template.nameBn}${variantName}`,
        slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}${variantName
          .toLowerCase()
          .replace(/\s+/g, '-')}-${i}`,
        description: `High-quality ${template.name}${variantName} with amazing features`,
        descriptionBn: `অসাধারণ ফিচার সহ উচ্চমানের ${template.nameBn}${variantName}`,
        price: Math.round(
          template.basePrice * (1 + (Math.random() * 0.4 - 0.2))
        ),
        comparePrice: Math.round(
          template.basePrice * (1.3 + Math.random() * 0.3)
        ),
        stock: Math.floor(Math.random() * 80) + 20,
        images: [template.image],
        categoryId: electronicsCategory.id,
        featured: i < 8,
        active: true,
      }

      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })
      productCount++
    }
  }

  // Create products for Fashion
  if (fashionCategory) {
    for (let i = 0; i < 25; i++) {
      const template =
        productTemplates.fashion[i % productTemplates.fashion.length]
      const variant = Math.floor(i / productTemplates.fashion.length)
      const colors = [
        'Black',
        'Blue',
        'Red',
        'White',
        'Green',
        'Yellow',
        'Navy',
        'Grey',
      ]
      const colorsBn = [
        'কালো',
        'নীল',
        'লাল',
        'সাদা',
        'সবুজ',
        'হলুদ',
        'নেভি',
        'ধূসর',
      ]
      const colorIndex = variant % colors.length
      const colorName = variant > 0 ? ` - ${colors[colorIndex]}` : ''
      const colorNameBn = variant > 0 ? ` - ${colorsBn[colorIndex]}` : ''

      const product = {
        name: `${template.name}${colorName}`,
        nameBn: `${template.nameBn}${colorNameBn}`,
        slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}${colorName
          .toLowerCase()
          .replace(/\s+/g, '-')}-${i}`,
        description: `Stylish ${template.name}${colorName} for everyday wear`,
        descriptionBn: `দৈনন্দিন পরিধানের জন্য স্টাইলিশ ${template.nameBn}${colorNameBn}`,
        price: Math.round(
          template.basePrice * (1 + (Math.random() * 0.3 - 0.15))
        ),
        comparePrice: Math.round(
          template.basePrice * (1.4 + Math.random() * 0.3)
        ),
        stock: Math.floor(Math.random() * 100) + 30,
        images: [template.image],
        categoryId: fashionCategory.id,
        featured: i < 8,
        active: true,
      }

      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })
      productCount++
    }
  }

  // Create products for Home & Living
  if (homeCategory) {
    for (let i = 0; i < 25; i++) {
      const template = productTemplates.home[i % productTemplates.home.length]
      const variant = Math.floor(i / productTemplates.home.length)
      const sizes = ['Small', 'Medium', 'Large', 'XL', 'Set of 2', 'Set of 4']
      const sizesBn = ['ছোট', 'মাঝারি', 'বড়', 'এক্সএল', '২টি সেট', '৪টি সেট']
      const sizeIndex = variant % sizes.length
      const sizeName = variant > 0 ? ` - ${sizes[sizeIndex]}` : ''
      const sizeNameBn = variant > 0 ? ` - ${sizesBn[sizeIndex]}` : ''

      const product = {
        name: `${template.name}${sizeName}`,
        nameBn: `${template.nameBn}${sizeNameBn}`,
        slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}${sizeName
          .toLowerCase()
          .replace(/\s+/g, '-')}-${i}`,
        description: `Premium quality ${template.name}${sizeName} for your home`,
        descriptionBn: `আপনার ঘরের জন্য প্রিমিয়াম মানের ${template.nameBn}${sizeNameBn}`,
        price: Math.round(
          template.basePrice * (1 + (Math.random() * 0.35 - 0.15))
        ),
        comparePrice: Math.round(
          template.basePrice * (1.35 + Math.random() * 0.25)
        ),
        stock: Math.floor(Math.random() * 60) + 20,
        images: [template.image],
        categoryId: homeCategory.id,
        featured: i < 8,
        active: true,
      }

      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })
      productCount++
    }
  }

  // Create products for Beauty
  if (beautyCategory) {
    for (let i = 0; i < 25; i++) {
      const template =
        productTemplates.beauty[i % productTemplates.beauty.length]
      const variant = Math.floor(i / productTemplates.beauty.length)
      const brands = ['Premium', 'Natural', 'Organic', 'Luxury', 'Professional']
      const brandsBn = [
        'প্রিমিয়াম',
        'ন্যাচারাল',
        'অর্গানিক',
        'লাক্সারি',
        'প্রফেশনাল',
      ]
      const brandIndex = variant % brands.length
      const brandName = variant > 0 ? `${brands[brandIndex]} ` : ''
      const brandNameBn = variant > 0 ? `${brandsBn[brandIndex]} ` : ''

      const product = {
        name: `${brandName}${template.name}`,
        nameBn: `${brandNameBn}${template.nameBn}`,
        slug: `${brandName.toLowerCase().replace(/\s+/g, '-')}${template.name
          .toLowerCase()
          .replace(/\s+/g, '-')}-${i}`,
        description: `${brandName}${template.name} for beautiful skin and hair`,
        descriptionBn: `সুন্দর ত্বক এবং চুলের জন্য ${brandNameBn}${template.nameBn}`,
        price: Math.round(
          template.basePrice * (1 + (Math.random() * 0.4 - 0.2))
        ),
        comparePrice: Math.round(
          template.basePrice * (1.5 + Math.random() * 0.3)
        ),
        stock: Math.floor(Math.random() * 70) + 25,
        images: [template.image],
        categoryId: beautyCategory.id,
        featured: i < 8,
        active: true,
      }

      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })
      productCount++
    }
  }

  console.log(`✅ ${productCount} products created`)

  // Create sample coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off on first order',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 1000,
      maxDiscount: 500,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      usageLimit: 100,
      active: true,
    },
  })

  console.log('✅ Sample coupon created')

  // Seed Basic Settings
  const settings = await prisma.basicSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'SuperMart',
      siteNameBn: 'সুপারমার্ট',
      promoText: 'Free shipping on orders over 500 Taka',
      promoTextBn: '৫০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি',
      promoActive: true,
    },
  })
  console.log('✅ Basic settings created')

  // Create banners
  await prisma.banner.createMany({
    data: [
      {
        titleBn: 'বাংলাদেশের সেরা অনলাইন শপিং',
        subtitleBn: 'সকল ধরনের পণ্য পাবেন এক জায়গায়',
        image:
          'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=500&fit=crop',
        link: '/products',
        order: 1,
        active: true,
      },
      {
        titleBn: 'বিশেষ ছাড় ৫০% পর্যন্ত',
        subtitleBn: 'নির্বাচিত পণ্যে',
        image:
          'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=500&fit=crop',
        link: '/products',
        order: 2,
        active: true,
      },
    ],
  })
  console.log('✅ Banners created')

  // Create product sections
  await prisma.productSection.createMany({
    data: [
      {
        title: 'Featured Products',
        titleBn: 'ফিচারড পণ্য',
        type: 'FEATURED',
        order: 1,
        limit: 12,
        active: true,
      },
      {
        title: 'New Arrivals',
        titleBn: 'নতুন পণ্য',
        type: 'NEW_ARRIVAL',
        order: 2,
        limit: 12,
        active: true,
      },
      {
        title: 'Hot Deals',
        titleBn: 'হট ডিল',
        type: 'HOT_DEALS',
        order: 3,
        limit: 12,
        active: true,
      },
    ],
  })
  console.log('✅ Product sections created')

  // Create mid banner
  await prisma.midBanner.create({
    data: {
      titleBn: 'শীতের বিশেষ অফার',
      subtitleBn: 'সকল শীতের পোশাকে ৩০% ছাড়',
      image:
        'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200&h=300&fit=crop',
      link: '/products',
      position: 2,
      active: true,
    },
  })
  console.log('✅ Mid banner created')

  // Create feature cards
  await prisma.featureCard.createMany({
    data: [
      {
        title: 'Free Shipping',
        titleBn: 'ফ্রি ডেলিভারি',
        description: 'On orders over 500 Taka',
        descriptionBn: '৫০০ টাকার উপরে অর্ডারে',
        icon: 'truck',
        order: 1,
        active: true,
      },
      {
        title: '24/7 Support',
        titleBn: '২৪/৭ সাপোর্ট',
        description: 'Always here to help',
        descriptionBn: 'সবসময় সাহায্যের জন্য প্রস্তুত',
        icon: 'headphones',
        order: 2,
        active: true,
      },
      {
        title: 'Secure Payment',
        titleBn: 'নিরাপদ পেমেন্ট',
        description: 'COD & bKash available',
        descriptionBn: 'ক্যাশ অন ডেলিভারি ও বিকাশ',
        icon: 'shield',
        order: 3,
        active: true,
      },
      {
        title: 'Easy Returns',
        titleBn: 'সহজ রিটার্ন',
        description: '7 days return policy',
        descriptionBn: '৭ দিনের রিটার্ন পলিসি',
        icon: 'credit-card',
        order: 4,
        active: true,
      },
    ],
  })
  console.log('✅ Feature cards created')

  // Create Contact Info
  await prisma.contactInfo.create({
    data: {
      phone: '09613-800800',
      email: 'support@supermart.com',
      addressBn: 'ঢাকা, বাংলাদেশ',
      workingHoursBn: 'সকাল ৯টা - রাত ১০টা',
      descriptionBn: 'বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম',
    },
  })
  console.log('✅ Contact Info created')

  // Create Footer Settings
  await prisma.footerSettings.create({
    data: {
      descriptionBn: 'বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম',
      copyrightTextBn: '© ২০২৫ সুপারমার্ট। সর্বস্বত্ব সংরক্ষিত।',
      phone: '09613-800800',
      email: 'support@supermart.com',
      addressBn: 'ঢাকা, বাংলাদেশ',
      workingHoursBn: 'সকাল ৯টা - রাত ১০টা',
      trustpilotUrl: 'https://www.trustpilot.com',
      showTrustpilot: true,
      paymentMethods: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Nagad_logo.svg/1200px-Nagad_logo.svg.png',
        'https://seeklogo.com/images/V/visa-logo-6F4057663D-seeklogo.com.png',
        'https://seeklogo.com/images/M/mastercard-logo-6C29F0B667-seeklogo.com.png',
        'https://www.logo.wine/a/logo/American_Express/American_Express-Logo.wine.svg',
        'https://seeklogo.com/images/B/bkash-logo-835789094B-seeklogo.com.png',
      ],
      showPaymentMethods: true,
      enableNewsletter: true,
      newsletterTitleBn: 'নিউজলেটার সাবস্ক্রাইব করুন',
      newsletterTextBn: 'সর্বশেষ অফার এবং আপডেট পান',
    },
  })
  console.log('✅ Footer settings created')

  // Create Footer Sections
  const companySection = await prisma.footerSection.create({
    data: {
      title: 'COMPANY',
      titleBn: 'কোম্পানি',
      order: 1,
    },
  })

  const accountSection = await prisma.footerSection.create({
    data: {
      title: 'MY ACCOUNT',
      titleBn: 'আমার অ্যাকাউন্ট',
      order: 2,
    },
  })

  const serviceSection = await prisma.footerSection.create({
    data: {
      title: 'CUSTOMER SERVICE',
      titleBn: 'কাস্টমার সার্ভিস',
      order: 3,
    },
  })

  console.log('✅ Footer Sections created')

  // Create Footer Links
  await prisma.footerLink.createMany({
    data: [
      // Company Section
      {
        sectionId: companySection.id,
        label: 'About Us',
        labelBn: 'আমাদের সম্পর্কে',
        url: '/about',
        order: 1,
      },
      {
        sectionId: companySection.id,
        label: 'Career',
        labelBn: 'ক্যারিয়ার',
        url: '/career',
        order: 2,
      },
      {
        sectionId: companySection.id,
        label: 'Contact Us',
        labelBn: 'যোগাযোগ করুন',
        url: '/contact',
        order: 3,
      },
      {
        sectionId: companySection.id,
        label: 'Privacy Policy',
        labelBn: 'গোপনীয়তা নীতি',
        url: '/privacy',
        order: 4,
      },
      {
        sectionId: companySection.id,
        label: 'Terms & Condition',
        labelBn: 'শর্তাবলী',
        url: '/terms',
        order: 5,
      },
      // Account Section
      {
        sectionId: accountSection.id,
        label: 'Sign In',
        labelBn: 'সাইন ইন',
        url: '/login',
        order: 1,
      },
      {
        sectionId: accountSection.id,
        label: 'Orders',
        labelBn: 'অর্ডার',
        url: '/orders',
        order: 2,
      },
      {
        sectionId: accountSection.id,
        label: 'Addresses',
        labelBn: 'ঠিকানা',
        url: '/addresses',
        order: 3,
      },
      {
        sectionId: accountSection.id,
        label: 'My Wishlist',
        labelBn: 'উইশলিস্ট',
        url: '/wishlist',
        order: 4,
      },
      {
        sectionId: accountSection.id,
        label: 'Order History',
        labelBn: 'অর্ডার ইতিহাস',
        url: '/order-history',
        order: 5,
      },
      {
        sectionId: accountSection.id,
        label: 'Track My Order',
        labelBn: 'অর্ডার ট্র্যাক করুন',
        url: '/track-order',
        order: 6,
      },
      // Service Section
      {
        sectionId: serviceSection.id,
        label: 'Payment Methods',
        labelBn: 'পেমেন্ট মেথড',
        url: '/payment-methods',
        order: 1,
      },
      {
        sectionId: serviceSection.id,
        label: 'Support Center',
        labelBn: 'সাপোর্ট সেন্টার',
        url: '/support',
        order: 2,
      },
      {
        sectionId: serviceSection.id,
        label: 'How To Shop',
        labelBn: 'কীভাবে কিনবেন',
        url: '/how-to-shop',
        order: 3,
      },
      {
        sectionId: serviceSection.id,
        label: 'Featured Recommendation',
        labelBn: 'ফিচারড পণ্য',
        url: '/featured',
        order: 4,
      },
      {
        sectionId: serviceSection.id,
        label: 'Cancellation, Return & Refund',
        labelBn: 'বাতিল, রিটার্ন ও রিফান্ড',
        url: '/returns',
        order: 5,
      },
    ],
  })

  console.log('✅ Footer Links created')

  // Create Social Links
  await prisma.socialLink.createMany({
    data: [
      {
        platform: 'facebook',
        url: 'https://facebook.com/supermart',
        icon: 'facebook',
        order: 1,
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/supermart',
        icon: 'twitter',
        order: 2,
      },
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/company/supermart',
        icon: 'linkedin',
        order: 3,
      },
      {
        platform: 'youtube',
        url: 'https://youtube.com/@supermart',
        icon: 'youtube',
        order: 4,
      },
    ],
  })

  console.log('✅ Social Links created')
  console.log('🎉 Seed completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
