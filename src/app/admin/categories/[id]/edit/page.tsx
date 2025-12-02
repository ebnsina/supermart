'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { bn } from '@/lib/translations'
import { Loader2, ArrowLeft } from 'lucide-react'
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
import ImageUpload from '@/components/ImageUpload'
import { FormActionBar, type FormState } from '@/components/form-action-bar'
import Link from 'next/link'

const categorySchema = z.object({
  name: z.string().min(1, 'নাম দিতে হবে'),
  nameBn: z.string().min(1, 'বাংলা নাম দিতে হবে'),
  slug: z.string().min(1, 'Slug দিতে হবে'),
  description: z.string().optional(),
  descriptionBn: z.string().optional(),
  image: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
  id: string
  name: string
  nameBn: string
  slug: string
  description: string | null
  descriptionBn: string | null
  image: string | null
}

// API functions
const fetchCategory = async (id: string): Promise<Category> => {
  const res = await fetch(`/api/admin/categories/${id}`)
  if (!res.ok) throw new Error('Failed to fetch category')
  return res.json()
}

const createCategory = async (data: CategoryFormValues): Promise<Category> => {
  const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

const updateCategory = async ({
  id,
  data,
}: {
  id: string
  data: CategoryFormValues
}): Promise<Category> => {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update category')
  return res.json()
}

export default function CategoryFormPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const isEdit = params.id !== 'new'
  const categoryId = isEdit ? (params.id as string) : null

  const [formState, setFormState] = useState<FormState>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [savedFormData, setSavedFormData] = useState<CategoryFormValues | null>(
    null
  )

  // Fetch category if editing
  const { data: category, isLoading: isFetching } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => fetchCategory(categoryId!),
    enabled: isEdit && !!categoryId,
  })

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      nameBn: '',
      slug: '',
      description: '',
      descriptionBn: '',
      image: '',
    },
  })

  // Initialize savedFormData for new categories
  useEffect(() => {
    if (!isEdit && !savedFormData) {
      setSavedFormData({
        name: '',
        nameBn: '',
        slug: '',
        description: '',
        descriptionBn: '',
        image: '',
      })
    }
  }, [isEdit, savedFormData])

  // Update form when category data is loaded
  useEffect(() => {
    if (category) {
      const formData = {
        name: category.name,
        nameBn: category.nameBn,
        slug: category.slug,
        description: category.description || '',
        descriptionBn: category.descriptionBn || '',
        image: category.image || '',
      }
      form.reset(formData)
      setSavedFormData(formData)
      setFormState('idle')
    }
  }, [category, form])

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
    mutationFn: createCategory,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('ক্যাটাগরি সংরক্ষণ করা হচ্ছে...')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setStatusMessage('ক্যাটাগরি সফলভাবে যোগ করা হয়েছে!')
      setFormState('success')
      setTimeout(() => {
        router.push('/admin/categories')
      }, 1500)
    },
    onError: () => {
      setStatusMessage('ক্যাটাগরি সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setFormState('error')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('ক্যাটাগরি আপডেট করা হচ্ছে...')
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', categoryId] })
      setStatusMessage('ক্যাটাগরি সফলভাবে আপডেট হয়েছে!')
      const newFormData = {
        name: data.name,
        nameBn: data.nameBn,
        slug: data.slug,
        description: data.description || '',
        descriptionBn: data.descriptionBn || '',
        image: data.image || '',
      }
      setSavedFormData(newFormData)
      setFormState('success')
    },
    onError: () => {
      setStatusMessage('ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
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
    if (isEdit && categoryId) {
      updateMutation.mutate({ id: categoryId, data })
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

  if (isFetching) {
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
            <Link href="/admin/categories">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যোগ করুন'}
            </h1>
            <p className="text-muted-foreground">ক্যাটাগরির তথ্য পূরণ করুন</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>ক্যাটাগরি তথ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
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
                          placeholder="Electronics"
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
                        <Input {...field} placeholder="ইলেকট্রনিক্স" />
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
                        <Input {...field} placeholder="electronics" />
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
                          placeholder="Category description..."
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
                          placeholder="ক্যাটাগরির বর্ণনা..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্যাটাগরি ছবি</FormLabel>
                      <FormControl>
                        <ImageUpload
                          images={field.value ? [field.value] : []}
                          onChange={urls => field.onChange(urls[0] || '')}
                          maxImages={1}
                          label="ক্যাটাগরি ছবি আপলোড করুন"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
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
