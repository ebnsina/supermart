'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FormActionBar } from '@/components/form-action-bar'
import ImageUpload from '@/components/ImageUpload'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface MidBanner {
  id: string
  title?: string | null
  titleBn?: string | null
  subtitle?: string | null
  subtitleBn?: string | null
  image: string
  link?: string | null
  position: number
  active: boolean
}

export default function MidBannerEditPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNew = params.id === 'new'

  const [formData, setFormData] = useState({
    title: '',
    titleBn: '',
    subtitle: '',
    subtitleBn: '',
    image: '',
    link: '',
    position: 1,
    active: true,
  })

  const [initialData, setInitialData] = useState(formData)
  const [formState, setFormState] = useState<
    'idle' | 'dirty' | 'saving' | 'saved'
  >('idle')

  // Fetch existing banner for edit
  const { data: banner, isLoading } = useQuery<MidBanner>({
    queryKey: ['mid-banner', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/mid-banners/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch banner')
      return res.json()
    },
    enabled: !isNew,
  })

  // Set form data when banner loads
  useEffect(() => {
    if (banner) {
      const data = {
        title: banner.title || '',
        titleBn: banner.titleBn || '',
        subtitle: banner.subtitle || '',
        subtitleBn: banner.subtitleBn || '',
        image: banner.image,
        link: banner.link || '',
        position: banner.position,
        active: banner.active,
      }
      setFormData(data)
      setInitialData(data)
    }
  }, [banner])

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
        ? '/api/admin/mid-banners'
        : `/api/admin/mid-banners/${params.id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save banner')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mid-banners'] })
      queryClient.invalidateQueries({ queryKey: ['mid-banner', params.id] })
      setFormState('saved')
      toast.success(
        isNew ? 'ব্যানার যোগ করা হয়েছে' : 'ব্যানার আপডেট করা হয়েছে'
      )

      setTimeout(() => {
        router.push('/admin/homepage')
      }, 1000)
    },
    onError: () => {
      setFormState('dirty')
      toast.error('ব্যানার সেভ করতে সমস্যা হয়েছে')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.image) {
      toast.error('দয়া করে একটি ছবি আপলোড করুন')
      return
    }
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
                  ? 'নতুন মিড ব্যানার যোগ করুন'
                  : 'মিড ব্যানার সম্পাদনা করুন'}
              </h1>
              <p className="text-muted-foreground">
                হোমপেজের মাঝখানে প্রদর্শিত ব্যানারের তথ্য পূরণ করুন
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Image */}
                <div className="space-y-2">
                  <Label>
                    ব্যানার ছবি <span className="text-destructive">*</span>
                  </Label>
                  <ImageUpload
                    images={formData.image ? [formData.image] : []}
                    onChange={(images: string[]) =>
                      setFormData({ ...formData, image: images[0] || '' })
                    }
                    maxImages={1}
                  />
                </div>

                {/* Title English */}
                <div className="space-y-2">
                  <Label htmlFor="title">শিরোনাম (English)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Summer Sale"
                  />
                </div>

                {/* Title Bengali */}
                <div className="space-y-2">
                  <Label htmlFor="titleBn">শিরোনাম (বাংলা)</Label>
                  <Input
                    id="titleBn"
                    value={formData.titleBn}
                    onChange={e =>
                      setFormData({ ...formData, titleBn: e.target.value })
                    }
                    placeholder="গ্রীষ্মকালীন বিক্রয়"
                  />
                </div>

                {/* Subtitle English */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">সাবটাইটেল (English)</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={e =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Up to 50% off"
                  />
                </div>

                {/* Subtitle Bengali */}
                <div className="space-y-2">
                  <Label htmlFor="subtitleBn">সাবটাইটেল (বাংলা)</Label>
                  <Input
                    id="subtitleBn"
                    value={formData.subtitleBn}
                    onChange={e =>
                      setFormData({ ...formData, subtitleBn: e.target.value })
                    }
                    placeholder="৫০% পর্যন্ত ছাড়"
                  />
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="link">লিংক</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={e =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="/products?category=summer-sale"
                  />
                  <p className="text-sm text-muted-foreground">
                    ব্যানারে ক্লিক করলে যে পেজে যাবে
                  </p>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position">পজিশন</Label>
                  <Input
                    id="position"
                    type="number"
                    value={formData.position}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        position: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                  />
                  <p className="text-sm text-muted-foreground">
                    যত কম সংখ্যা, তত উপরে প্রদর্শিত হবে
                  </p>
                </div>

                {/* Active */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">সক্রিয় করুন</Label>
                    <p className="text-sm text-muted-foreground">
                      এই ব্যানারটি হোমপেজে প্রদর্শিত হবে
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
