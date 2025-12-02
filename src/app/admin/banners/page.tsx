'use client'

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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Loader2, MoreVertical, Plus, Search, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface Banner {
  id: string
  title: string | null
  titleBn: string | null
  subtitle: string | null
  subtitleBn: string | null
  image: string
  link: string | null
  order: number
  active: boolean
}

// API functions
const fetchBanners = async (): Promise<Banner[]> => {
  const res = await fetch('/api/admin/banners')
  if (!res.ok) throw new Error('Failed to fetch banners')
  return res.json()
}

const deleteBanner = async (id: string): Promise<void> => {
  const res = await fetch(`/api/admin/banners/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete banner')
}

export default function BannersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // Fetch banners query
  const {
    data: banners = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['banners'],
    queryFn: fetchBanners,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      toast.success('ব্যানার মুছে ফেলা হয়েছে')
      setDeleteId(null)
    },
    onError: () => {
      toast.error('ব্যানার মুছতে সমস্যা হয়েছে')
      setDeleteId(null)
    },
  })

  const handleDelete = async (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    deleteMutation.mutate(deleteId)
  }

  const filteredBanners = banners.filter(
    banner =>
      (banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      (banner.titleBn?.includes(searchQuery) ?? false) ||
      (banner.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  )

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              ব্যানার ম্যানেজমেন্ট
            </h1>
            <p className="text-muted-foreground">
              ব্যানার তৈরি এবং পরিচালনা করুন
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/banners/new/edit">
              <Plus className="h-4 w-4" />
              নতুন যোগ করুন
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ব্যানার খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Banners Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                ব্যানার লোড করতে সমস্যা হয়েছে
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                কোনো ব্যানার পাওয়া যায়নি
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ছবি</TableHead>
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead>ক্রম</TableHead>
                    <TableHead>অবস্থা</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map(banner => (
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
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {banner.titleBn || banner.title || 'শিরোনাম নেই'}
                          </div>
                          {banner.subtitleBn && (
                            <div className="text-sm text-muted-foreground">
                              {banner.subtitleBn}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{banner.order}</TableCell>
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
                              <Link href={`/admin/banners/${banner.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                সম্পাদনা
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(banner.id)}
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>নিশ্চিত করুন</AlertDialogTitle>
            <AlertDialogDescription>
              আপনি কি নিশ্চিত যে এই ব্যানার মুছে ফেলতে চান? এই কাজটি
              পূর্বাবস্থায় ফেরানো যাবে না।
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
