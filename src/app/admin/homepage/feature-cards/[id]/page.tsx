'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { FormActionBar } from '@/components/form-action-bar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface FeatureCard {
  id: string
  title?: string | null
  titleBn: string
  description?: string | null
  descriptionBn?: string | null
  icon: string
  order: number
  active: boolean
}

export default function FeatureCardEditPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNew = params.id === 'new'

  const [formData, setFormData] = useState({
    title: '',
    titleBn: '',
    description: '',
    descriptionBn: '',
    icon: '🚚',
    order: 0,
    active: true,
  })

  const [initialData, setInitialData] = useState(formData)
  const [formState, setFormState] = useState<
    'idle' | 'dirty' | 'saving' | 'saved'
  >('idle')

  // Fetch existing card for edit
  const { data: card, isLoading } = useQuery<FeatureCard>({
    queryKey: ['feature-card', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/feature-cards/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch feature card')
      return res.json()
    },
    enabled: !isNew,
  })

  // Set form data when card loads
  useEffect(() => {
    if (card) {
      const data = {
        title: card.title || '',
        titleBn: card.titleBn,
        description: card.description || '',
        descriptionBn: card.descriptionBn || '',
        icon: card.icon,
        order: card.order,
        active: card.active,
      }
      setFormData(data)
      setInitialData(data)
    }
  }, [card])

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
        ? '/api/admin/feature-cards'
        : `/api/admin/feature-cards/${params.id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save feature card')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-cards'] })
      queryClient.invalidateQueries({ queryKey: ['feature-card', params.id] })
      setFormState('saved')
      toast.success(
        isNew ? 'ফিচার কার্ড যোগ করা হয়েছে' : 'ফিচার কার্ড আপডেট করা হয়েছে'
      )

      setTimeout(() => {
        router.push('/admin/homepage')
      }, 1000)
    },
    onError: () => {
      setFormState('dirty')
      toast.error('ফিচার কার্ড সেভ করতে সমস্যা হয়েছে')
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

  const commonIcons = ['🚚', '💳', '🔒', '↩️', '⏰', '🎁', '📞', '✨']

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
                  ? 'নতুন ফিচার কার্ড যোগ করুন'
                  : 'ফিচার কার্ড সম্পাদনা করুন'}
              </h1>
              <p className="text-muted-foreground">
                হোমপেজে প্রদর্শিত ফিচার কার্ডের তথ্য পূরণ করুন
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Icon */}
                <div className="space-y-2">
                  <Label htmlFor="icon">
                    আইকন <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={e =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="🚚"
                    className="text-2xl"
                    required
                  />
                  <div className="flex gap-2 flex-wrap">
                    {commonIcons.map(icon => (
                      <Button
                        key={icon}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, icon })}
                        className="text-xl"
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    যেকোনো ইমোজি বা আইকন ব্যবহার করুন
                  </p>
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
                    placeholder="Free Delivery"
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
                    placeholder="ফ্রি ডেলিভারি"
                    required
                  />
                </div>

                {/* Description English */}
                <div className="space-y-2">
                  <Label htmlFor="description">বর্ণনা (English)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Free delivery on orders over 1000 BDT"
                    rows={3}
                  />
                </div>

                {/* Description Bengali */}
                <div className="space-y-2">
                  <Label htmlFor="descriptionBn">বর্ণনা (বাংলা)</Label>
                  <Textarea
                    id="descriptionBn"
                    value={formData.descriptionBn}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        descriptionBn: e.target.value,
                      })
                    }
                    placeholder="১০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি"
                    rows={3}
                  />
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
                    যত কম সংখ্যা, তত আগে প্রদর্শিত হবে
                  </p>
                </div>

                {/* Active */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">সক্রিয় করুন</Label>
                    <p className="text-sm text-muted-foreground">
                      এই কার্ডটি হোমপেজে প্রদর্শিত হবে
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
