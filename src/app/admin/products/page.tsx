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

interface Product {
  id: string
  name: string
  nameBn: string
  slug: string
  price: number
  stock: number
  images: string[]
  featured: boolean
  active: boolean
  category: { id: string; nameBn: string }
  variants: Array<{ id: string }>
}

// API functions
const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch('/api/admin/products')
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

const deleteProduct = async (id: string): Promise<void> => {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete product')
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // Fetch products query
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('পণ্য মুছে ফেলা হয়েছে')
      setDeleteId(null)
    },
    onError: () => {
      toast.error('পণ্য মুছতে সমস্যা হয়েছে')
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

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameBn.includes(searchQuery) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.nameBn.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              পণ্য ম্যানেজমেন্ট
            </h1>
            <p className="text-muted-foreground">পণ্য তৈরি এবং পরিচালনা করুন</p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new/edit">
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
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                পণ্য লোড করতে সমস্যা হয়েছে
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                কোনো পণ্য পাওয়া যায়নি
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ছবি</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>ক্যাটাগরি</TableHead>
                    <TableHead>মূল্য</TableHead>
                    <TableHead>স্টক</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead>অবস্থা</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.nameBn}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              ছবি নেই
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{product.nameBn}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category.nameBn}</TableCell>
                      <TableCell>৳{product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        {product.variants.length > 0 ? (
                          <span className="text-sm text-muted-foreground">
                            ভ্যারিয়েন্ট সহ
                          </span>
                        ) : (
                          product.stock
                        )}
                      </TableCell>
                      <TableCell>
                        {product.variants.length > 0 ? (
                          <span className="text-xs text-muted-foreground">
                            ভ্যারিয়েন্ট ({product.variants.length})
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            সিঙ্গেল
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {product.active ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              সক্রিয়
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              নিষ্ক্রিয়
                            </span>
                          )}
                          {product.featured && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                              ফিচার্ড
                            </span>
                          )}
                        </div>
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
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                সম্পাদনা
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(product.id)}
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
              আপনি কি নিশ্চিত যে এই পণ্য মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায়
              ফেরানো যাবে না।
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
