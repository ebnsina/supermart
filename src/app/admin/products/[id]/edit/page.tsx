'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ArrowLeft, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import ImageUpload from '@/components/ImageUpload'
import { FormActionBar, type FormState } from '@/components/form-action-bar'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'ভ্যারিয়েন্ট নাম দিতে হবে'),
  nameBn: z.string().min(1, 'ভ্যারিয়েন্ট বাংলা নাম দিতে হবে'),
  value: z.string().min(1, 'মান দিতে হবে'),
  valueBn: z.string().min(1, 'বাংলা মান দিতে হবে'),
  price: z.number().nullable(),
  stock: z.number().min(0, 'স্টক ০ বা তার বেশি হতে হবে'),
  sku: z.string().optional(),
})

const productSchema = z.object({
  name: z.string().min(1, 'নাম দিতে হবে'),
  nameBn: z.string().min(1, 'বাংলা নাম দিতে হবে'),
  slug: z.string().min(1, 'Slug দিতে হবে'),
  description: z.string().min(1, 'বর্ণনা দিতে হবে'),
  descriptionBn: z.string().min(1, 'বাংলা বর্ণনা দিতে হবে'),
  price: z.number().min(0, 'মূল্য ০ বা তার বেশি হতে হবে'),
  comparePrice: z.number().nullable(),
  stock: z.number().min(0, 'স্টক ০ বা তার বেশি হতে হবে'),
  categoryId: z.string().min(1, 'ক্যাটাগরি নির্বাচন করতে হবে'),
  subcategoryId: z.string().optional().nullable(),
  images: z.array(z.string()).min(1, 'কমপক্ষে একটি ছবি আপলোড করতে হবে'),
  featured: z.boolean(),
  active: z.boolean(),
  productType: z.enum(['single', 'variant']),
  variants: z.array(productVariantSchema).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Product {
  id: string
  name: string
  nameBn: string
  slug: string
  description: string
  descriptionBn: string
  price: number
  comparePrice: number | null
  stock: number
  images: string[]
  featured: boolean
  active: boolean
  category: { id: string; name: string; nameBn: string }
  subcategory?: { id: string; name: string; nameBn: string } | null
  variants: Array<{
    id: string
    name: string
    nameBn: string
    value: string
    valueBn: string
    price: number | null
    stock: number
    sku?: string
  }>
}

interface Category {
  id: string
  name: string
  nameBn: string
  subcategories?: Array<{
    id: string
    name: string
    nameBn: string
  }>
}

// API functions
const fetchProduct = async (id: string): Promise<Product> => {
  const res = await fetch(`/api/admin/products/${id}`)
  if (!res.ok) throw new Error('Failed to fetch product')
  return res.json()
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch('/api/admin/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

const createProduct = async (data: any): Promise<Product> => {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

const updateProduct = async ({
  id,
  data,
}: {
  id: string
  data: any
}): Promise<Product> => {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update product')
  return res.json()
}

export default function ProductFormPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const isEdit = params.id !== 'new'
  const productId = isEdit ? (params.id as string) : null

  const [formState, setFormState] = useState<FormState>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [savedFormData, setSavedFormData] = useState<ProductFormValues | null>(
    null
  )

  // Fetch product if editing
  const { data: product, isLoading: isFetchingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId!),
    enabled: isEdit && !!productId,
  })

  // Fetch categories
  const { data: categories = [], isLoading: isFetchingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      nameBn: '',
      slug: '',
      description: '',
      descriptionBn: '',
      price: 0,
      comparePrice: null,
      stock: 0,
      categoryId: '',
      subcategoryId: null,
      images: [],
      featured: false,
      active: true,
      productType: 'single',
      variants: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const productType = form.watch('productType')
  const categoryId = form.watch('categoryId')
  const selectedCategory = categories.find(c => c.id === categoryId)

  // Initialize savedFormData for new products
  useEffect(() => {
    if (!isEdit && !savedFormData) {
      setSavedFormData({
        name: '',
        nameBn: '',
        slug: '',
        description: '',
        descriptionBn: '',
        price: 0,
        comparePrice: null,
        stock: 0,
        categoryId: '',
        subcategoryId: null,
        images: [],
        featured: false,
        active: true,
        productType: 'single',
        variants: [],
      })
    }
  }, [isEdit, savedFormData])

  // Update form when product data is loaded
  useEffect(() => {
    if (product) {
      const formData: ProductFormValues = {
        name: product.name,
        nameBn: product.nameBn,
        slug: product.slug,
        description: product.description,
        descriptionBn: product.descriptionBn,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        categoryId: product.category.id,
        subcategoryId: product.subcategory?.id || null,
        images: product.images,
        featured: product.featured,
        active: product.active,
        productType: product.variants.length > 0 ? 'variant' : 'single',
        variants: product.variants,
      }
      form.reset(formData)
      setSavedFormData(formData)
      setFormState('idle')
    }
  }, [product, form])

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (savedFormData) {
        const currentData = form.getValues()
        const hasChanges =
          JSON.stringify(currentData) !== JSON.stringify(savedFormData)
        setFormState(hasChanges ? 'dirty' : 'idle')
      }
    })
    return () => subscription.unsubscribe()
  }, [form, savedFormData])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('পণ্য সংরক্ষণ করা হচ্ছে...')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setStatusMessage('পণ্য সফলভাবে যোগ করা হয়েছে!')
      setFormState('success')
      setTimeout(() => {
        router.push('/admin/products')
      }, 1500)
    },
    onError: () => {
      setStatusMessage('পণ্য সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setFormState('error')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('পণ্য আপডেট করা হচ্ছে...')
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      setStatusMessage('পণ্য সফলভাবে আপডেট হয়েছে!')
      const newFormData: ProductFormValues = {
        name: data.name,
        nameBn: data.nameBn,
        slug: data.slug,
        description: data.description,
        descriptionBn: data.descriptionBn,
        price: data.price,
        comparePrice: data.comparePrice,
        stock: data.stock,
        categoryId: data.category.id,
        subcategoryId: data.subcategory?.id || null,
        images: data.images,
        featured: data.featured,
        active: data.active,
        productType: data.variants.length > 0 ? 'variant' : 'single',
        variants: data.variants,
      }
      setSavedFormData(newFormData)
      setFormState('success')
    },
    onError: () => {
      setStatusMessage('পণ্য আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setFormState('error')
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    form.setValue('name', value, { shouldDirty: true })
    if (!isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
      form.setValue('slug', slug, { shouldDirty: true })
    }
  }

  const onSave = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      setStatusMessage('ফর্মে ত্রুটি রয়েছে। দয়া করে সংশোধন করুন।')
      setFormState('error')
      return
    }

    const data = form.getValues()
    if (isEdit && productId) {
      updateMutation.mutate({ id: productId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleReset = () => {
    if (savedFormData) {
      form.reset(savedFormData)
      setFormState('idle')
    }
  }

  const handleAnimationComplete = () => {
    if (formState === 'success') {
      setFormState('idle')
    } else if (formState === 'error') {
      setFormState('dirty')
    }
  }

  if (isFetchingProduct || isFetchingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-32">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ করুন'}
            </h1>
            <p className="text-muted-foreground">পণ্যের তথ্য পূরণ করুন</p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>মৌলিক তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>নাম (English)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => handleNameChange(e.target.value)}
                          placeholder="Smartphone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>নাম (বাংলা)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="স্মার্টফোন" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="smartphone" />
                      </FormControl>
                      <FormDescription>
                        URL-friendly নাম (স্বয়ংক্রিয়ভাবে তৈরি হয়)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>বর্ণনা (English)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Product description..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>বর্ণনা (বাংলা)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="পণ্যের বর্ণনা..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>ক্যাটাগরি</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্যাটাগরি</FormLabel>
                      <Select
                        onValueChange={(value: string) => {
                          field.onChange(value)
                          form.setValue('subcategoryId', null)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.nameBn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategory?.subcategories &&
                  selectedCategory.subcategories.length > 0 && (
                    <FormField
                      control={form.control}
                      name="subcategoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>সাব-ক্যাটাগরি (ঐচ্ছিক)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="সাব-ক্যাটাগরি নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedCategory.subcategories?.map(subcat => (
                                <SelectItem key={subcat.id} value={subcat.id}>
                                  {subcat.nameBn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
              </CardContent>
            </Card>

            {/* Product Type */}
            <Card>
              <CardHeader>
                <CardTitle>পণ্যের ধরন</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পণ্যের ধরন নির্বাচন করুন</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">
                            সিঙ্গেল পণ্য (কোন ভ্যারিয়েন্ট নেই)
                          </SelectItem>
                          <SelectItem value="variant">
                            ভ্যারিয়েন্ট সহ পণ্য
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing & Stock (for single products) */}
            {productType === 'single' && (
              <Card>
                <CardHeader>
                  <CardTitle>মূল্য এবং স্টক</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>মূল্য (৳)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              onChange={e =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="comparePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>তুলনা মূল্য (৳)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              value={field.value || ''}
                              onChange={e =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : null
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>ঐচ্ছিক - আগের মূল্য</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>স্টক পরিমাণ</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={e =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Variants (for variant products) */}
            {productType === 'variant' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>ভ্যারিয়েন্টসমূহ</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          name: '',
                          nameBn: '',
                          value: '',
                          valueBn: '',
                          price: null,
                          stock: 0,
                          sku: '',
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      ভ্যারিয়েন্ট যোগ করুন
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            ভ্যারিয়েন্ট #{index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>নাম (English)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Color" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.nameBn`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="রঙ" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>মান (English)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Red" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.valueBn`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>মান (বাংলা)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="লাল" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>মূল্য (৳)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    value={field.value || ''}
                                    onChange={e =>
                                      field.onChange(
                                        e.target.value
                                          ? parseFloat(e.target.value)
                                          : null
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormDescription>ঐচ্ছিক</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>স্টক</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    onChange={e =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.sku`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="SKU-001" />
                                </FormControl>
                                <FormDescription>ঐচ্ছিক</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {fields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      কোনো ভ্যারিয়েন্ট যোগ করা হয়নি
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>পণ্যের ছবি</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ছবিসমূহ</FormLabel>
                      <FormControl>
                        <ImageUpload
                          images={field.value || []}
                          onChange={field.onChange}
                          maxImages={5}
                          label="পণ্যের ছবি আপলোড করুন (সর্বোচ্চ ৫টি)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>সেটিংস</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          ফিচার্ড পণ্য
                        </FormLabel>
                        <FormDescription>
                          হোমপেজে ফিচার্ড সেকশনে দেখাবেন?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">সক্রিয়</FormLabel>
                        <FormDescription>
                          এই পণ্য সাইটে প্রদর্শন করবেন?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      <FormActionBar
        state={formState}
        onReset={handleReset}
        onSave={onSave}
        onAnimationComplete={handleAnimationComplete}
        resetLabel="রিসেট"
        saveLabel="সংরক্ষণ করুন"
        dirtyMessage="সাবধান — আপনার পরিবর্তনগুলি সংরক্ষিত হয়নি!"
        loadingMessage={statusMessage}
        successMessage={statusMessage}
        errorMessage={statusMessage}
      />
    </div>
  )
}
