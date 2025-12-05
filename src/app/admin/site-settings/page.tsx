'use client'

import { useState, useEffect } from 'react'
import ImageUpload from '@/components/ImageUpload'
import { FormActionBar, type FormState } from '@/components/form-action-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Edit, Trash2 } from 'lucide-react'

type Tab = 'basic' | 'menu' | 'footer'

interface MenuItem {
  id: string
  label: string
  labelBn: string
  url: string
  parentId: string | null
  type: 'CUSTOM' | 'CATEGORY' | 'PRODUCT' | 'PAGE'
  targetId: string | null
  icon: string | null
  order: number
  active: boolean
  openInNewTab: boolean
  megaMenu: boolean
  featured: boolean
  children?: MenuItem[]
}

function SortableMenuItem({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'bg-muted/50' : ''}
    >
      <TableCell className="w-12">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-grab active:cursor-grabbing h-8 w-8"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
      </TableCell>
      <TableCell>
        <div className="font-medium">{item.label}</div>
        <div className="text-sm text-muted-foreground">{item.labelBn}</div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {item.url}
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-700/10">
          {item.type}
        </span>
      </TableCell>
      <TableCell>
        <Switch checked={item.active} disabled />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state management
  const [formState, setFormState] = useState<FormState>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [savedBasicData, setSavedBasicData] = useState<any>(null)
  const [savedFooterData, setSavedFooterData] = useState<any>(null)
  const [isBasicDataInitialized, setIsBasicDataInitialized] = useState(false)
  const [isFooterDataInitialized, setIsFooterDataInitialized] = useState(false)

  // Menu Management State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [menuForm, setMenuForm] = useState({
    label: '',
    labelBn: '',
    url: '',
    type: 'CUSTOM' as 'CUSTOM' | 'CATEGORY' | 'PRODUCT' | 'PAGE',
    targetId: '',
    icon: '',
    active: true,
    openInNewTab: false,
    megaMenu: false,
    featured: false,
  })
  const [savedMenuForm, setSavedMenuForm] = useState<typeof menuForm | null>(
    null
  )
  const [menuFormState, setMenuFormState] = useState<FormState>('idle')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Basic Settings State
  const [basicSettings, setBasicSettings] = useState({
    siteName: 'SuperMart',
    siteNameBn: 'সুপারমার্ট',
    siteDescription: '',
    siteDescriptionBn: '',
    logo: '',
    favicon: '',
    promoText: '',
    promoTextBn: '',
    promoActive: false,
    promoLink: '',
    metaTitle: '',
    metaTitleBn: '',
    metaDescription: '',
    metaDescriptionBn: '',
    metaKeywords: '',
    ogImage: '',
    supportEmail: '',
    supportPhone: '',
    currency: 'BDT',
    currencySymbol: '৳',
    timezone: 'Asia/Dhaka',
    enableWishlist: true,
    enableReviews: true,
    enableCoupons: true,
  })

  // Footer Settings State
  const [footerSettings, setFooterSettings] = useState({
    logo: '',
    description: '',
    descriptionBn: '',
    copyrightText: '',
    copyrightTextBn: '',
    phone: '',
    email: '',
    address: '',
    addressBn: '',
    workingHours: '',
    workingHoursBn: '',
    paymentMethods: [] as string[],
    showPaymentMethods: true,
    enableNewsletter: true,
    newsletterTitle: '',
    newsletterTitleBn: '',
    newsletterText: '',
    newsletterTextBn: '',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
  })

  useEffect(() => {
    // Reset initialization flags and form state when switching tabs
    setIsBasicDataInitialized(false)
    setIsFooterDataInitialized(false)
    setFormState('idle')
    fetchSettings()
  }, [activeTab])

  // Track form changes for basic settings
  useEffect(() => {
    if (
      activeTab === 'basic' &&
      savedBasicData &&
      !loading &&
      isBasicDataInitialized
    ) {
      const hasChanges =
        JSON.stringify(basicSettings) !== JSON.stringify(savedBasicData)
      setFormState(hasChanges ? 'dirty' : 'idle')
    }
  }, [
    basicSettings,
    savedBasicData,
    activeTab,
    loading,
    isBasicDataInitialized,
  ])

  // Track form changes for footer settings
  useEffect(() => {
    if (
      activeTab === 'footer' &&
      savedFooterData &&
      !loading &&
      isFooterDataInitialized
    ) {
      const hasChanges =
        JSON.stringify(footerSettings) !== JSON.stringify(savedFooterData)
      setFormState(hasChanges ? 'dirty' : 'idle')
    }
  }, [
    footerSettings,
    savedFooterData,
    activeTab,
    loading,
    isFooterDataInitialized,
  ])

  // Track menu form changes
  useEffect(() => {
    if (showMenuForm && savedMenuForm) {
      const hasChanges =
        JSON.stringify(menuForm) !== JSON.stringify(savedMenuForm)
      setMenuFormState(hasChanges ? 'dirty' : 'idle')
    } else if (!showMenuForm) {
      setMenuFormState('idle')
    }
  }, [menuForm, savedMenuForm, showMenuForm])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      if (activeTab === 'basic') {
        const res = await fetch('/api/admin/site-settings/basic')
        const data = await res.json()
        if (data.id) {
          // Convert null values to empty strings
          const sanitizedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key,
              value === null ? '' : value,
            ])
          )
          setBasicSettings(sanitizedData as any)
          setSavedBasicData({ ...sanitizedData })
          // Set initialization flag after a brief delay to allow state to settle
          setTimeout(() => setIsBasicDataInitialized(true), 100)
        }
      } else if (activeTab === 'menu') {
        const res = await fetch('/api/admin/menu')
        const data = await res.json()
        setMenuItems(data)
      } else if (activeTab === 'footer') {
        const res = await fetch('/api/admin/site-settings/footer')
        const data = await res.json()
        if (data.id) {
          // Convert null values to empty strings
          const sanitizedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key,
              value === null ? '' : value,
            ])
          )
          setFooterSettings(sanitizedData as any)
          setSavedFooterData({ ...sanitizedData })
          // Set initialization flag after a brief delay to allow state to settle
          setTimeout(() => setIsFooterDataInitialized(true), 100)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setStatusMessage('সেটিংস সংরক্ষণ করা হচ্ছে...')

    try {
      const res = await fetch('/api/admin/site-settings/basic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicSettings),
      })

      if (res.ok) {
        const data = await res.json()
        const sanitizedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === null ? '' : value,
          ])
        )
        setSavedBasicData({ ...sanitizedData })
        setStatusMessage('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!')
        setFormState('success')
      } else {
        setStatusMessage('সেটিংস সংরক্ষণে সমস্যা হয়েছে')
        setFormState('error')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setStatusMessage('সেটিংস সংরক্ষণে সমস্যা হয়েছে')
      setFormState('error')
    }
  }

  const handleFooterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setStatusMessage('ফুটার সেটিংস সংরক্ষণ করা হচ্ছে...')

    try {
      const res = await fetch('/api/admin/site-settings/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerSettings),
      })

      if (res.ok) {
        const data = await res.json()
        const sanitizedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === null ? '' : value,
          ])
        )
        setSavedFooterData({ ...sanitizedData })
        setStatusMessage('ফুটার সেটিংস সফলভাবে সংরক্ষিত হয়েছে!')
        setFormState('success')
      } else {
        setStatusMessage('সেটিংস সংরক্ষণে সমস্যা হয়েছে')
        setFormState('error')
      }
    } catch (error) {
      console.error('Error saving footer settings:', error)
      setStatusMessage('সেটিংস সংরক্ষণে সমস্যা হয়েছে')
      setFormState('error')
    }
  }

  // Menu Management Functions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMenuItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update orders
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }))

        // Save to server
        saveMenuOrder(updatedItems)

        return updatedItems
      })
    }
  }

  const saveMenuOrder = async (items: MenuItem[]) => {
    try {
      await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
    } catch (error) {
      console.error('Error saving menu order:', error)
    }
  }

  const handleAddMenuItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setMenuFormState('loading')

    try {
      const order = menuItems.length
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...menuForm, order }),
      })

      if (res.ok) {
        setMenuFormState('success')
        setTimeout(() => {
          setShowMenuForm(false)
          setMenuForm({
            label: '',
            labelBn: '',
            url: '',
            type: 'CUSTOM',
            targetId: '',
            icon: '',
            active: true,
            openInNewTab: false,
            megaMenu: false,
            featured: false,
          })
          setSavedMenuForm(null)
          setMenuFormState('idle')
        }, 1000)
        fetchSettings()
      } else {
        setMenuFormState('error')
      }
    } catch (error) {
      console.error('Error adding menu item:', error)
      setMenuFormState('error')
    }
  }

  const handleEditMenuItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editingMenuItem) return
    setMenuFormState('loading')

    try {
      const res = await fetch(`/api/admin/menu/${editingMenuItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm),
      })

      if (res.ok) {
        setMenuFormState('success')
        setTimeout(() => {
          setEditingMenuItem(null)
          setShowMenuForm(false)
          setSavedMenuForm(null)
          setMenuFormState('idle')
        }, 1000)
        fetchSettings()
      } else {
        setMenuFormState('error')
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      setMenuFormState('error')
    }
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই মেনু আইটেমটি মুছতে চান?')) return

    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchSettings()
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
    }
  }

  const openEditForm = (item: MenuItem) => {
    setEditingMenuItem(item)
    const formData = {
      label: item.label,
      labelBn: item.labelBn,
      url: item.url,
      type: item.type,
      targetId: item.targetId || '',
      icon: item.icon || '',
      active: item.active,
      openInNewTab: item.openInNewTab,
      megaMenu: item.megaMenu,
      featured: item.featured,
    }
    setMenuForm(formData)
    setSavedMenuForm({ ...formData })
    setMenuFormState('idle')
    setShowMenuForm(true)
  }

  const tabs = [
    { id: 'basic' as Tab, label: 'বেসিক সেটিংস' },
    { id: 'menu' as Tab, label: 'মেনু ম্যানেজমেন্ট' },
    { id: 'footer' as Tab, label: 'ফুটার ম্যানেজমেন্ট' },
  ]

  return (
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold mb-8">সাইট সেটিংস</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-6 py-3 font-semibold transition-colors rounded-none',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="p-8">লোড হচ্ছে...</div>
      ) : (
        <>
          {/* Basic Settings Tab */}
          {activeTab === 'basic' && (
            <form
              onSubmit={e => {
                e.preventDefault()
                handleBasicSubmit(e)
              }}
              className="max-w-4xl space-y-8"
            >
              {/* Site Identity */}
              <Card>
                <CardHeader>
                  <CardTitle>সাইট পরিচয়</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">সাইট নাম (EN)</Label>
                      <Input
                        id="siteName"
                        type="text"
                        value={basicSettings.siteName}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            siteName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteNameBn">সাইট নাম (বাংলা)</Label>
                      <Input
                        id="siteNameBn"
                        type="text"
                        value={basicSettings.siteNameBn}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            siteNameBn: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>লোগো</Label>
                    <ImageUpload
                      images={basicSettings.logo ? [basicSettings.logo] : []}
                      onChange={urls =>
                        setBasicSettings({
                          ...basicSettings,
                          logo: urls[0] || '',
                        })
                      }
                      maxImages={1}
                      label="লোগো আপলোড করুন"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <Input
                      id="favicon"
                      type="text"
                      value={basicSettings.favicon}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          favicon: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">বর্ণনা (EN)</Label>
                      <Textarea
                        id="siteDescription"
                        value={basicSettings.siteDescription}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            siteDescription: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescriptionBn">বর্ণনা (বাংলা)</Label>
                      <Textarea
                        id="siteDescriptionBn"
                        value={basicSettings.siteDescriptionBn}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            siteDescriptionBn: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Bar */}
              <Card>
                <CardHeader>
                  <CardTitle>প্রমো বার</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="promoActive"
                      checked={basicSettings.promoActive}
                      onCheckedChange={checked =>
                        setBasicSettings({
                          ...basicSettings,
                          promoActive: checked,
                        })
                      }
                    />
                    <Label htmlFor="promoActive" className="font-semibold">
                      প্রমো বার সক্রিয় করুন
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="promoText">প্রমো টেক্সট (EN)</Label>
                      <Input
                        id="promoText"
                        type="text"
                        value={basicSettings.promoText}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            promoText: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promoTextBn">প্রমো টেক্সট (বাংলা)</Label>
                      <Input
                        id="promoTextBn"
                        type="text"
                        value={basicSettings.promoTextBn}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            promoTextBn: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promoLink">প্রমো লিংক</Label>
                    <Input
                      id="promoLink"
                      type="text"
                      value={basicSettings.promoLink}
                      onChange={e =>
                        setBasicSettings({
                          ...basicSettings,
                          promoLink: e.target.value,
                        })
                      }
                      placeholder="/products"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Business */}
              <Card>
                <CardHeader>
                  <CardTitle>যোগাযোগ ও ব্যবসায়িক</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">সাপোর্ট ইমেইল</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={basicSettings.supportEmail}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            supportEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportPhone">সাপোর্ট ফোন</Label>
                      <Input
                        id="supportPhone"
                        type="text"
                        value={basicSettings.supportPhone}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            supportPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">মুদ্রা</Label>
                      <Input
                        id="currency"
                        type="text"
                        value={basicSettings.currency}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            currency: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">মুদ্রা চিহ্ন</Label>
                      <Input
                        id="currencySymbol"
                        type="text"
                        value={basicSettings.currencySymbol}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            currencySymbol: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">টাইমজোন</Label>
                      <Input
                        id="timezone"
                        type="text"
                        value={basicSettings.timezone}
                        onChange={e =>
                          setBasicSettings({
                            ...basicSettings,
                            timezone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>ফিচার সেটিংস</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableWishlist"
                      checked={basicSettings.enableWishlist}
                      onCheckedChange={checked =>
                        setBasicSettings({
                          ...basicSettings,
                          enableWishlist: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableWishlist">
                      উইশলিস্ট সক্রিয় করুন
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableReviews"
                      checked={basicSettings.enableReviews}
                      onCheckedChange={checked =>
                        setBasicSettings({
                          ...basicSettings,
                          enableReviews: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableReviews">রিভিউ সক্রিয় করুন</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableCoupons"
                      checked={basicSettings.enableCoupons}
                      onCheckedChange={checked =>
                        setBasicSettings({
                          ...basicSettings,
                          enableCoupons: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableCoupons">কুপন সক্রিয় করুন</Label>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {/* Menu Management Tab */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">মেনু ম্যানেজমেন্ট</h2>
                <Button
                  onClick={() => {
                    setEditingMenuItem(null)
                    const initialForm = {
                      label: '',
                      labelBn: '',
                      url: '',
                      type: 'CUSTOM' as
                        | 'CUSTOM'
                        | 'CATEGORY'
                        | 'PRODUCT'
                        | 'PAGE',
                      targetId: '',
                      icon: '',
                      active: true,
                      openInNewTab: false,
                      megaMenu: false,
                      featured: false,
                    }
                    setMenuForm(initialForm)
                    setSavedMenuForm({ ...initialForm })
                    setMenuFormState('idle')
                    setShowMenuForm(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন মেনু যোগ করুন
                </Button>
              </div>

              {/* Menu Form */}
              {showMenuForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingMenuItem
                        ? 'মেনু আইটেম সম্পাদনা'
                        : 'নতুন মেনু আইটেম'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={
                        editingMenuItem ? handleEditMenuItem : handleAddMenuItem
                      }
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="label">লেবেল (EN)</Label>
                          <Input
                            id="label"
                            type="text"
                            value={menuForm.label}
                            onChange={e =>
                              setMenuForm({
                                ...menuForm,
                                label: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="labelBn">লেবেল (বাংলা)</Label>
                          <Input
                            id="labelBn"
                            type="text"
                            value={menuForm.labelBn}
                            onChange={e =>
                              setMenuForm({
                                ...menuForm,
                                labelBn: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          type="text"
                          value={menuForm.url}
                          onChange={e =>
                            setMenuForm({ ...menuForm, url: e.target.value })
                          }
                          placeholder="/products"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">টাইপ</Label>
                          <select
                            id="type"
                            value={menuForm.type}
                            onChange={e =>
                              setMenuForm({
                                ...menuForm,
                                type: e.target.value as any,
                              })
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="CUSTOM">কাস্টম</option>
                            <option value="CATEGORY">ক্যাটাগরি</option>
                            <option value="PRODUCT">পণ্য</option>
                            <option value="PAGE">পেজ</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="icon">আইকন</Label>
                          <Input
                            id="icon"
                            type="text"
                            value={menuForm.icon}
                            onChange={e =>
                              setMenuForm({ ...menuForm, icon: e.target.value })
                            }
                            placeholder="home, shopping-bag, etc."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="active"
                            checked={menuForm.active}
                            onCheckedChange={checked =>
                              setMenuForm({
                                ...menuForm,
                                active: checked,
                              })
                            }
                          />
                          <Label htmlFor="active">সক্রিয়</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="openInNewTab"
                            checked={menuForm.openInNewTab}
                            onCheckedChange={checked =>
                              setMenuForm({
                                ...menuForm,
                                openInNewTab: checked,
                              })
                            }
                          />
                          <Label htmlFor="openInNewTab">
                            নতুন ট্যাবে খুলুন
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="megaMenu"
                            checked={menuForm.megaMenu}
                            onCheckedChange={checked =>
                              setMenuForm({
                                ...menuForm,
                                megaMenu: checked,
                              })
                            }
                          />
                          <Label htmlFor="megaMenu">মেগা মেনু</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="featured"
                            checked={menuForm.featured}
                            onCheckedChange={checked =>
                              setMenuForm({
                                ...menuForm,
                                featured: checked,
                              })
                            }
                          />
                          <Label htmlFor="featured">ফিচারড</Label>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowMenuForm(false)
                            setEditingMenuItem(null)
                            setSavedMenuForm(null)
                            setMenuFormState('idle')
                          }}
                        >
                          বাতিল
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Menu Items List with DnD */}
              <Card>
                <CardHeader>
                  <CardTitle>মেনু আইটেম তালিকা</CardTitle>
                </CardHeader>
                <CardContent>
                  {menuItems.length === 0 ? (
                    <p className="text-muted-foreground">
                      কোনো মেনু আইটেম নেই। নতুন মেনু যোগ করুন।
                    </p>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>লেবেল</TableHead>
                              <TableHead>URL</TableHead>
                              <TableHead>টাইপ</TableHead>
                              <TableHead>স্ট্যাটাস</TableHead>
                              <TableHead className="text-right">
                                অ্যাকশন
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <SortableContext
                              items={menuItems.map(item => item.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {menuItems.map(item => (
                                <SortableMenuItem
                                  key={item.id}
                                  item={item}
                                  onEdit={openEditForm}
                                  onDelete={handleDeleteMenuItem}
                                />
                              ))}
                            </SortableContext>
                          </TableBody>
                        </Table>
                      </div>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer Management Tab */}
          {activeTab === 'footer' && (
            <form onSubmit={handleFooterSubmit} className="max-w-4xl space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>ফুটার তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ফুটার লোগো</Label>
                    <ImageUpload
                      images={footerSettings.logo ? [footerSettings.logo] : []}
                      onChange={urls =>
                        setFooterSettings({
                          ...footerSettings,
                          logo: urls[0] || '',
                        })
                      }
                      maxImages={1}
                      label="ফুটার লোগো আপলোড করুন"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="footerDescription">বর্ণনা (EN)</Label>
                      <Textarea
                        id="footerDescription"
                        value={footerSettings.description}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footerDescriptionBn">
                        বর্ণনা (বাংলা)
                      </Label>
                      <Textarea
                        id="footerDescriptionBn"
                        value={footerSettings.descriptionBn}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            descriptionBn: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="copyrightText">কপিরাইট টেক্সট (EN)</Label>
                      <Input
                        id="copyrightText"
                        type="text"
                        value={footerSettings.copyrightText}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            copyrightText: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="copyrightTextBn">
                        কপিরাইট টেক্সট (বাংলা)
                      </Label>
                      <Input
                        id="copyrightTextBn"
                        type="text"
                        value={footerSettings.copyrightTextBn}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            copyrightTextBn: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="footerPhone">ফোন</Label>
                      <Input
                        id="footerPhone"
                        type="text"
                        value={footerSettings.phone}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footerEmail">ইমেইল</Label>
                      <Input
                        id="footerEmail"
                        type="email"
                        value={footerSettings.email}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="footerAddress">ঠিকানা (EN)</Label>
                      <Input
                        id="footerAddress"
                        type="text"
                        value={footerSettings.address}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footerAddressBn">ঠিকানা (বাংলা)</Label>
                      <Input
                        id="footerAddressBn"
                        type="text"
                        value={footerSettings.addressBn}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            addressBn: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>নিউজলেটার সেটিংস</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableNewsletter"
                      checked={footerSettings.enableNewsletter}
                      onCheckedChange={checked =>
                        setFooterSettings({
                          ...footerSettings,
                          enableNewsletter: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableNewsletter" className="font-semibold">
                      নিউজলেটার সক্রিয় করুন
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newsletterTitle">শিরোনাম (EN)</Label>
                      <Input
                        id="newsletterTitle"
                        type="text"
                        value={footerSettings.newsletterTitle}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            newsletterTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newsletterTitleBn">শিরোনাম (বাংলা)</Label>
                      <Input
                        id="newsletterTitleBn"
                        type="text"
                        value={footerSettings.newsletterTitleBn}
                        onChange={e =>
                          setFooterSettings({
                            ...footerSettings,
                            newsletterTitleBn: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </>
      )}

      {(activeTab === 'basic' || activeTab === 'footer') && (
        <FormActionBar
          state={formState}
          onReset={() => {
            if (activeTab === 'basic' && savedBasicData) {
              setBasicSettings({ ...savedBasicData })
            } else if (activeTab === 'footer' && savedFooterData) {
              setFooterSettings({ ...savedFooterData })
            }
          }}
          onSave={() => {
            if (activeTab === 'basic') {
              handleBasicSubmit(new Event('submit') as any)
            } else if (activeTab === 'footer') {
              handleFooterSubmit(new Event('submit') as any)
            }
          }}
          onAnimationComplete={() => {
            if (formState === 'success' || formState === 'error') {
              setFormState('idle')
            }
          }}
          resetLabel="রিসেট"
          saveLabel="সংরক্ষণ করুন"
          dirtyMessage="সাবধান — আপনার পরিবর্তনগুলি সংরক্ষিত হয়নি!"
          loadingMessage={statusMessage}
          successMessage={statusMessage}
          errorMessage={statusMessage}
        />
      )}

      {activeTab === 'menu' && showMenuForm && (
        <FormActionBar
          state={menuFormState}
          onReset={() => {
            if (savedMenuForm) {
              setMenuForm({ ...savedMenuForm })
            } else {
              setMenuForm({
                label: '',
                labelBn: '',
                url: '',
                type: 'CUSTOM',
                targetId: '',
                icon: '',
                active: true,
                openInNewTab: false,
                megaMenu: false,
                featured: false,
              })
            }
          }}
          onSave={() => {
            if (editingMenuItem) {
              handleEditMenuItem()
            } else {
              handleAddMenuItem()
            }
          }}
          onAnimationComplete={() => {
            if (menuFormState === 'success' || menuFormState === 'error') {
              setTimeout(() => setMenuFormState('idle'), 500)
            }
          }}
          resetLabel="রিসেট"
          saveLabel={editingMenuItem ? 'আপডেট করুন' : 'যোগ করুন'}
          dirtyMessage="সাবধান — আপনার পরিবর্তনগুলি সংরক্ষিত হয়নি!"
          loadingMessage={
            editingMenuItem ? 'আপডেট হচ্ছে...' : 'যোগ করা হচ্ছে...'
          }
          successMessage={
            editingMenuItem
              ? 'মেনু আইটেম আপডেট করা হয়েছে!'
              : 'মেনু আইটেম যোগ করা হয়েছে!'
          }
          errorMessage="সংরক্ষণে সমস্যা হয়েছে"
        />
      )}
    </div>
  )
}
