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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/ImageUpload'
import { FormActionBar, type FormState } from '@/components/form-action-bar'
import Link from 'next/link'

const bannerSchema = z.object({
  title: z.string().optional(),
  titleBn: z.string().optional(),
  subtitle: z.string().optional(),
  subtitleBn: z.string().optional(),
  image: z.string().min(1, 'ছবি আপলোড করুন'),
  link: z.string().optional(),
  order: z.number().default(0),
  active: z.boolean().default(true),
})

type BannerFormValues = z.infer<typeof bannerSchema>

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
const fetchBanner = async (id: string): Promise<Banner> => {
  const res = await fetch(`/api/admin/banners/${id}`)
  if (!res.ok) throw new Error('Failed to fetch banner')
  return res.json()
}

const createBanner = async (data: BannerFormValues): Promise<Banner> => {
  const res = await fetch('/api/admin/banners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create banner')
  return res.json()
}

const updateBanner = async ({
  id,
  data,
}: {
  id: string
  data: BannerFormValues
}): Promise<Banner> => {
  const res = await fetch(`/api/admin/banners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update banner')
  return res.json()
}

export default function BannerFormPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const isEdit = params.id !== 'new'
  const bannerId = isEdit ? (params.id as string) : null

  const [formState, setFormState] = useState<FormState>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [savedFormData, setSavedFormData] = useState<BannerFormValues | null>(
    null
  )

  // Fetch banner if editing
  const { data: banner, isLoading: isFetching } = useQuery({
    queryKey: ['banner', bannerId],
    queryFn: () => fetchBanner(bannerId!),
    enabled: isEdit && !!bannerId,
  })

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      titleBn: '',
      subtitle: '',
      subtitleBn: '',
      image: '',
      link: '',
      order: 0,
      active: true,
    },
  })

  // Initialize savedFormData for new banners
  useEffect(() => {
    if (!isEdit && !savedFormData) {
      setSavedFormData({
        title: '',
        titleBn: '',
        subtitle: '',
        subtitleBn: '',
        image: '',
        link: '',
        order: 0,
        active: true,
      })
    }
  }, [isEdit, savedFormData])

  // Update form when banner data is loaded
  useEffect(() => {
    if (banner) {
      const formData = {
        title: banner.title || '',
        titleBn: banner.titleBn || '',
        subtitle: banner.subtitle || '',
        subtitleBn: banner.subtitleBn || '',
        image: banner.image,
        link: banner.link || '',
        order: banner.order,
        active: banner.active,
      }
      form.reset(formData)
      setSavedFormData(formData)
      setFormState('idle')
    }
  }, [banner, form])

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
    mutationFn: createBanner,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('ব্যানার সংরক্ষণ করা হচ্ছে...')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      setStatusMessage('ব্যানার সফলভাবে যোগ করা হয়েছে!')
      setFormState('success')
      setTimeout(() => {
        router.push('/admin/banners')
      }, 1500)
    },
    onError: () => {
      setStatusMessage('ব্যানার সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setFormState('error')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateBanner,
    onMutate: () => {
      setFormState('loading')
      setStatusMessage('ব্যানার আপডেট করা হচ্ছে...')
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      queryClient.invalidateQueries({ queryKey: ['banner', bannerId] })
      setStatusMessage('ব্যানার সফলভাবে আপডেট হয়েছে!')
      const newFormData = {
        title: data.title || '',
        titleBn: data.titleBn || '',
        subtitle: data.subtitle || '',
        subtitleBn: data.subtitleBn || '',
        image: data.image,
        link: data.link || '',
        order: data.order,
        active: data.active,
      }
      setSavedFormData(newFormData)
      setFormState('success')
    },
    onError: () => {
      setStatusMessage('ব্যানার আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setFormState('error')
    },
  })

  const onSave = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      setStatusMessage('ফর্মে ত্রুটি রয়েছে। দয়া করে সংশোধন করুন।')
      setFormState('error')
      return
    }

    const data = form.getValues()
    if (isEdit && bannerId) {
      updateMutation.mutate({ id: bannerId, data })
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/banners">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? 'ব্যানার সম্পাদনা' : 'নতুন ব্যানার'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'ব্যানার তথ্য আপডেট করুন' : 'নতুন ব্যানার তৈরি করুন'}
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ব্যানার তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ব্যানার ছবি *</FormLabel>
                      <FormControl>
                        <ImageUpload
                          images={field.value ? [field.value] : []}
                          onChange={urls => field.onChange(urls[0] || '')}
                          maxImages={1}
                          label="ব্যানার ছবি আপলোড করুন"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title Fields */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>শিরোনাম (EN)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Banner Title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titleBn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>শিরোনাম (বাংলা)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ব্যানার শিরোনাম" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Subtitle Fields */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>সাবটাইটেল (EN)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Banner Subtitle" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitleBn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>সাবটাইটেল (বাংলা)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ব্যানার সাবটাইটেল" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Link and Order */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>লিঙ্ক</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="/products" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>অর্ডার</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Active Switch */}
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="mt-0!">সক্রিয়</FormLabel>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>

        <FormActionBar
          state={formState}
          onReset={handleReset}
          onSave={onSave}
          onAnimationComplete={handleAnimationComplete}
          resetLabel="রিসেট"
          saveLabel={isEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          dirtyMessage="সাবধান — আপনার পরিবর্তনগুলি সংরক্ষিত হয়নি!"
          loadingMessage={statusMessage}
          successMessage={statusMessage}
          errorMessage={statusMessage}
        />
      </div>
    </div>
  )
}
