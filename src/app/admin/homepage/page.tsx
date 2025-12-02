'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  LayoutGrid,
  ImageIcon,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProductSection {
  id: string
  title: string
  titleBn: string
  type: 'FEATURED' | 'NEW_ARRIVAL' | 'HOT_DEALS' | 'BEST_SELLING'
  order: number
  limit: number
  active: boolean
}

interface MidBanner {
  id: string
  titleBn?: string | null
  image: string
  link?: string | null
  position: number
  active: boolean
}

interface FeatureCard {
  id: string
  titleBn: string
  descriptionBn?: string | null
  icon: string
  order: number
  active: boolean
}

export default function HomepageManagementPage() {
  // API functions for Product Sections
  const fetchSections = async (): Promise<ProductSection[]> => {
    const res = await fetch('/api/admin/product-sections')
    if (!res.ok) throw new Error('Failed to fetch sections')
    return res.json()
  }

  const deleteSection = async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/product-sections/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete section')
  }

  // API functions for Mid Banners
  const fetchMidBanners = async (): Promise<MidBanner[]> => {
    const res = await fetch('/api/admin/mid-banners')
    if (!res.ok) throw new Error('Failed to fetch mid banners')
    return res.json()
  }

  const deleteMidBanner = async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/mid-banners/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete mid banner')
  }

  // API functions for Feature Cards
  const fetchFeatureCards = async (): Promise<FeatureCard[]> => {
    const res = await fetch('/api/admin/feature-cards')
    if (!res.ok) throw new Error('Failed to fetch feature cards')
    return res.json()
  }

  const deleteFeatureCard = async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/feature-cards/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete feature card')
  }

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<
    'section' | 'banner' | 'feature' | null
  >(null)

  const queryClient = useQueryClient()

  // Fetch queries
  const {
    data: sections = [],
    isLoading: loadingSections,
    isError: errorSections,
  } = useQuery({
    queryKey: ['product-sections'],
    queryFn: fetchSections,
  })

  const {
    data: midBanners = [],
    isLoading: loadingBanners,
    isError: errorBanners,
  } = useQuery({
    queryKey: ['mid-banners'],
    queryFn: fetchMidBanners,
  })

  const {
    data: featureCards = [],
    isLoading: loadingFeatures,
    isError: errorFeatures,
  } = useQuery({
    queryKey: ['feature-cards'],
    queryFn: fetchFeatureCards,
  })

  // Delete mutations
  const deleteSectionMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sections'] })
      toast.success('সেকশন মুছে ফেলা হয়েছে')
      setDeleteId(null)
      setDeleteType(null)
    },
    onError: () => {
      toast.error('সেকশন মুছতে সমস্যা হয়েছে')
      setDeleteId(null)
      setDeleteType(null)
    },
  })

  const deleteBannerMutation = useMutation({
    mutationFn: deleteMidBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mid-banners'] })
      toast.success('ব্যানার মুছে ফেলা হয়েছে')
      setDeleteId(null)
      setDeleteType(null)
    },
    onError: () => {
      toast.error('ব্যানার মুছতে সমস্যা হয়েছে')
      setDeleteId(null)
      setDeleteType(null)
    },
  })

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeatureCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-cards'] })
      toast.success('ফিচার কার্ড মুছে ফেলা হয়েছে')
      setDeleteId(null)
      setDeleteType(null)
    },
    onError: () => {
      toast.error('ফিচার কার্ড মুছতে সমস্যা হয়েছে')
      setDeleteId(null)
      setDeleteType(null)
    },
  })

  const handleDelete = (id: string, type: 'section' | 'banner' | 'feature') => {
    setDeleteId(id)
    setDeleteType(type)
  }

  const confirmDelete = () => {
    if (!deleteId || !deleteType) return

    if (deleteType === 'section') {
      deleteSectionMutation.mutate(deleteId)
    } else if (deleteType === 'banner') {
      deleteBannerMutation.mutate(deleteId)
    } else if (deleteType === 'feature') {
      deleteFeatureMutation.mutate(deleteId)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FEATURED: 'ফিচারড',
      NEW_ARRIVAL: 'নতুন আগমন',
      HOT_DEALS: 'হট ডিল',
      BEST_SELLING: 'বেস্ট সেলিং',
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            হোমপেজ ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground">
            হোমপেজের বিভিন্ন সেকশন পরিচালনা করুন
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sections" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sections">
              <LayoutGrid className="h-4 w-4 mr-2" />
              পণ্য সেকশন
            </TabsTrigger>
            <TabsTrigger value="midBanners">
              <ImageIcon className="h-4 w-4 mr-2" />
              মিড ব্যানার
            </TabsTrigger>
            <TabsTrigger value="features">
              <Star className="h-4 w-4 mr-2" />
              ফিচার কার্ড
            </TabsTrigger>
          </TabsList>

          {/* Product Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">পণ্য সেকশন</h2>
                <p className="text-sm text-muted-foreground">
                  হোমপেজে পণ্য সেকশন পরিচালনা করুন
                </p>
              </div>
              <Button asChild>
                <Link href="/admin/homepage/sections/new">
                  <Plus className="h-4 w-4" />
                  নতুন যোগ করুন
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {loadingSections ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : errorSections ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    সেকশন লোড করতে সমস্যা হয়েছে
                  </div>
                ) : sections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <LayoutGrid className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">
                      কোনো সেকশন পাওয়া যায়নি
                    </p>
                    <p className="text-sm mt-1">একটি নতুন সেকশন যোগ করুন</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>শিরোনাম</TableHead>
                        <TableHead>টাইপ</TableHead>
                        <TableHead>ক্রম</TableHead>
                        <TableHead>সীমা</TableHead>
                        <TableHead>অবস্থা</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sections.map(section => (
                        <TableRow key={section.id}>
                          <TableCell className="font-medium">
                            {section.titleBn}
                          </TableCell>
                          <TableCell>{getTypeLabel(section.type)}</TableCell>
                          <TableCell>{section.order}</TableCell>
                          <TableCell>{section.limit}</TableCell>
                          <TableCell>
                            {section.active ? (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                সক্রিয়
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                নিষ্ক্রিয়
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/homepage/sections/${section.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                    সম্পাদনা
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDelete(section.id, 'section')
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  মুছে ফেলুন
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mid Banners Tab */}
          <TabsContent value="midBanners" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">মিড ব্যানার</h2>
                <p className="text-sm text-muted-foreground">
                  হোমপেজে মাঝখানে ব্যানার পরিচালনা করুন
                </p>
              </div>
              <Button asChild>
                <Link href="/admin/homepage/mid-banners/new">
                  <Plus className="h-4 w-4" />
                  নতুন যোগ করুন
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {loadingBanners ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : errorBanners ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    ব্যানার লোড করতে সমস্যা হয়েছে
                  </div>
                ) : midBanners.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <ImageIcon className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">
                      কোনো ব্যানার পাওয়া যায়নি
                    </p>
                    <p className="text-sm mt-1">একটি নতুন ব্যানার যোগ করুন</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ছবি</TableHead>
                        <TableHead>শিরোনাম</TableHead>
                        <TableHead>পজিশন</TableHead>
                        <TableHead>অবস্থা</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {midBanners.map(banner => (
                        <TableRow key={banner.id}>
                          <TableCell>
                            <div className="relative h-16 w-24 overflow-hidden rounded-md">
                              <Image
                                src={banner.image}
                                alt={banner.titleBn || 'Banner'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {banner.titleBn || 'শিরোনাম নেই'}
                          </TableCell>
                          <TableCell>{banner.position}</TableCell>
                          <TableCell>
                            {banner.active ? (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                সক্রিয়
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                নিষ্ক্রিয়
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/homepage/mid-banners/${banner.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                    সম্পাদনা
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDelete(banner.id, 'banner')
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  মুছে ফেলুন
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Cards Tab */}
          <TabsContent value="features" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">ফিচার কার্ড</h2>
                <p className="text-sm text-muted-foreground">
                  হোমপেজে ফিচার কার্ড পরিচালনা করুন
                </p>
              </div>
              <Button asChild>
                <Link href="/admin/homepage/feature-cards/new">
                  <Plus className="h-4 w-4" />
                  নতুন যোগ করুন
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {loadingFeatures ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : errorFeatures ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    ফিচার কার্ড লোড করতে সমস্যা হয়েছে
                  </div>
                ) : featureCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Star className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">
                      কোনো ফিচার কার্ড পাওয়া যায়নি
                    </p>
                    <p className="text-sm mt-1">
                      একটি নতুন ফিচার কার্ড যোগ করুন
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>আইকন</TableHead>
                        <TableHead>শিরোনাম</TableHead>
                        <TableHead>বর্ণনা</TableHead>
                        <TableHead>ক্রম</TableHead>
                        <TableHead>অবস্থা</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {featureCards.map(card => (
                        <TableRow key={card.id}>
                          <TableCell>
                            <div className="text-2xl">{card.icon}</div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {card.titleBn}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {card.descriptionBn || '-'}
                          </TableCell>
                          <TableCell>{card.order}</TableCell>
                          <TableCell>
                            {card.active ? (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                সক্রিয়
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                নিষ্ক্রিয়
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/homepage/feature-cards/${card.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                    সম্পাদনা
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDelete(card.id, 'feature')
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  মুছে ফেলুন
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId && !!deleteType}
        onOpenChange={() => {
          setDeleteId(null)
          setDeleteType(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>নিশ্চিত করুন</AlertDialogTitle>
            <AlertDialogDescription>
              আপনি কি নিশ্চিত যে এই{' '}
              {deleteType === 'section'
                ? 'সেকশন'
                : deleteType === 'banner'
                ? 'ব্যানার'
                : 'ফিচার কার্ড'}{' '}
              মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
