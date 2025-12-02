'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { FormActionBar } from '@/components/form-action-bar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

export default function ProductSectionEditPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNew = params.id === 'new'

  const [formData, setFormData] = useState<{
    title: string
    titleBn: string
    type: 'FEATURED' | 'NEW_ARRIVAL' | 'HOT_DEALS' | 'BEST_SELLING'
    order: number
    limit: number
    active: boolean
  }>({
    title: '',
    titleBn: '',
    type: 'FEATURED',
    order: 0,
    limit: 10,
    active: true,
  })

  const [initialData, setInitialData] = useState(formData)
  const [formState, setFormState] = useState<
    'idle' | 'dirty' | 'saving' | 'saved'
  >('idle')

  // Fetch existing section for edit
  const { data: section, isLoading } = useQuery<ProductSection>({
    queryKey: ['product-section', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/product-sections/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch section')
      return res.json()
    },
    enabled: !isNew,
  })

  // Set form data when section loads
  useEffect(() => {
    if (section) {
      const data = {
        title: section.title,
        titleBn: section.titleBn,
        type: section.type,
        order: section.order,
        limit: section.limit,
        active: section.active,
      }
      setFormData(data)
      setInitialData(data)
    }
  }, [section])

  // Track form changes
  useEffect(() => {
    if (formState === 'saving' || formState === 'saved') return
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)
    setFormState(hasChanges ? 'dirty' : 'idle')
  }, [formData, initialData, formState])

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = isNew
        ? '/api/admin/product-sections'
        : `/api/admin/product-sections/${params.id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save section')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sections'] })
      queryClient.invalidateQueries({
        queryKey: ['product-section', params.id],
      })
      setFormState('saved')
      toast.success(isNew ? 'সেকশন যোগ করা হয়েছে' : 'সেকশন আপডেট করা হয়েছে')

      setTimeout(() => {
        router.push('/admin/homepage')
      }, 1000)
    },
    onError: () => {
      setFormState('dirty')
      toast.error('সেকশন সেভ করতে সমস্যা হয়েছে')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('saving')
    saveMutation.mutate(formData)
  }

  const handleCancel = () => {
    router.push('/admin/homepage')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <FormActionBar
        state={
          formState === 'saving'
            ? 'loading'
            : formState === 'saved'
            ? 'success'
            : formState === 'dirty'
            ? 'dirty'
            : 'idle'
        }
        onSave={() => handleSubmit(new Event('submit') as any)}
        onReset={handleCancel}
      />

      <div className="p-4 md:p-8 pt-20">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/homepage">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {isNew
                  ? 'নতুন পণ্য সেকশন যোগ করুন'
                  : 'পণ্য সেকশন সম্পাদনা করুন'}
              </h1>
              <p className="text-muted-foreground">
                হোমপেজে প্রদর্শিত পণ্য সেকশনের তথ্য পূরণ করুন
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Title English */}
                <div className="space-y-2">
                  <Label htmlFor="title">শিরোনাম (English)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Featured Products"
                  />
                </div>

                {/* Title Bengali */}
                <div className="space-y-2">
                  <Label htmlFor="titleBn">
                    শিরোনাম (বাংলা) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="titleBn"
                    value={formData.titleBn}
                    onChange={e =>
                      setFormData({ ...formData, titleBn: e.target.value })
                    }
                    placeholder="ফিচারড পণ্য"
                    required
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    সেকশন টাইপ <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: typeof formData.type) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FEATURED">ফিচারড</SelectItem>
                      <SelectItem value="NEW_ARRIVAL">নতুন আগমন</SelectItem>
                      <SelectItem value="HOT_DEALS">হট ডিল</SelectItem>
                      <SelectItem value="BEST_SELLING">বেস্ট সেলিং</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order */}
                <div className="space-y-2">
                  <Label htmlFor="order">ক্রম</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-sm text-muted-foreground">
                    যত কম সংখ্যা, তত উপরে প্রদর্শিত হবে
                  </p>
                </div>

                {/* Limit */}
                <div className="space-y-2">
                  <Label htmlFor="limit">পণ্য সীমা</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={formData.limit}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        limit: parseInt(e.target.value) || 10,
                      })
                    }
                    placeholder="10"
                  />
                  <p className="text-sm text-muted-foreground">
                    এই সেকশনে সর্বোচ্চ কতটি পণ্য দেখাবে
                  </p>
                </div>

                {/* Active */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">সক্রিয় করুন</Label>
                    <p className="text-sm text-muted-foreground">
                      এই সেকশনটি হোমপেজে প্রদর্শিত হবে
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
