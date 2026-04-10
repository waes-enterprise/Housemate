'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Trash2, ImageIcon, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminEditListingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [listingTitle, setListingTitle] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceUnit: 'month',
    location: '',
    category: '',
    categoryId: '',
    imageUrl: '',
    tier: 'standard',
    contactPhone: '',
    contactEmail: '',
    isFeatured: false,
    status: 'active',
    ownerId: '',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [listingRes, catRes] = await Promise.all([
          fetch(`/api/admin/listings/${id}`),
          fetch('/api/admin/categories'),
        ])

        if (listingRes.ok) {
          const data = await listingRes.json()
          const listing = data.listing || data
          setListingTitle(listing.title)
          setForm({
            title: listing.title,
            description: listing.description || '',
            price: String(listing.price),
            priceUnit: listing.priceUnit || 'month',
            location: listing.location,
            category: listing.category || '',
            categoryId: listing.categoryId || '',
            imageUrl: listing.imageUrl || '',
            tier: listing.tier || 'standard',
            contactPhone: listing.contactPhone || '',
            contactEmail: listing.contactEmail || '',
            isFeatured: listing.isFeatured || false,
            status: listing.status || 'active',
            ownerId: listing.ownerId || '',
          })
        } else {
          toast.error('Listing not found')
          router.push('/admin/listings')
          return
        }

        if (catRes.ok) {
          const data = await catRes.json()
          const cats = data.categories || data
          setCategories(Array.isArray(cats) ? cats : [])
        }
      } catch {
        toast.error('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  function generatePlaceholder() {
    const seed = Math.random().toString(36).slice(2, 8)
    const url = `https://picsum.photos/seed/${seed}/600/400`
    setForm((f) => ({ ...f, imageUrl: url }))
  }

  function updateForm(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (key === 'categoryId') {
      const cat = categories.find((c) => c.id === value)
      if (cat) setForm((prev) => ({ ...prev, category: cat.name }))
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Valid price is required'
    if (!form.location.trim()) newErrors.location = 'Location is required'
    if (!form.categoryId) newErrors.categoryId = 'Category is required'
    if (!form.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success('Listing updated successfully')
        router.push('/admin/listings')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update listing')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Listing deleted successfully')
        router.push('/admin/listings')
      } else {
        toast.error('Failed to delete listing')
      }
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/listings')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title="Edit Listing"
          description={`Editing: ${listingTitle}`}
          icon={ImageIcon}
          action={
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          }
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="e.g., 3-Bedroom Apartment in Lusaka"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Describe the property in detail..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Price & Price Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (ZMW) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateForm('price', e.target.value)}
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label>Price Unit</Label>
                <Select value={form.priceUnit} onValueChange={(v) => updateForm('priceUnit', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Per Month</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                    <SelectItem value="week">Per Week</SelectItem>
                    <SelectItem value="event">Per Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="e.g., Makeni, Lusaka"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
            </div>

            {/* Category & Tier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={form.categoryId} onValueChange={(v) => updateForm('categoryId', v)}>
                  <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
              </div>

              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={(v) => updateForm('tier', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="spotlight">Spotlight</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media & Contact */}
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-gray-900">Media & Contact</h3>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">
                Image URL <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => updateForm('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={errors.imageUrl ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePlaceholder}
                  className="shrink-0 whitespace-nowrap"
                  title="Generate a random placeholder image"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Placeholder
                </Button>
              </div>
              {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl}</p>}
              {form.imageUrl && (
                <div className="mt-2 relative w-full max-w-sm">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Contact Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={form.contactPhone}
                  onChange={(e) => updateForm('contactPhone', e.target.value)}
                  placeholder="+260977123456"
                />
                <p className="text-xs text-gray-400">Optional</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => updateForm('contactEmail', e.target.value)}
                  placeholder="contact@example.com"
                />
                <p className="text-xs text-gray-400">Optional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-gray-900">Settings</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label>Featured Listing</Label>
                <p className="text-xs text-gray-400">Show this listing as featured on the homepage</p>
              </div>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(v) => updateForm('isFeatured', v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateForm('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pb-6">
          <Button
            type="submit"
            className="bg-[#006633] hover:bg-[#004d26] text-white min-w-[160px]"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/listings')}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Listing"
        description={`Are you sure you want to delete "${listingTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
