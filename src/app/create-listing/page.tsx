'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Home, ArrowLeft, Camera, X, Loader2, MapPin, DollarSign, FileText, Tag, ChevronDown, Plus, Check, Sparkles } from 'lucide-react'

const CATEGORIES = [
  { name: 'Rooms', icon: '🏠' },
  { name: 'Farms', icon: '🌾' },
  { name: 'Offices', icon: '🏢' },
  { name: 'Storage', icon: '📦' },
  { name: 'Event Spaces', icon: '🎉' },
  { name: 'Garages', icon: '🔧' },
  { name: 'Warehouses', icon: '🏭' },
  { name: 'Land', icon: '⛰️' },
  { name: 'Shops', icon: '🏪' },
  { name: 'Parking', icon: '🅿️' },
]

const AMENITIES_OPTIONS = [
  'Parking', 'Security Guard', 'CCTV', 'Electric Fence', 'Borehole/Well',
  'Solar Power', 'Generator', 'WiFi', 'Air Conditioning', 'Swimming Pool',
  'Garden', 'DSTV', 'Prepaid Electricity', 'Water Tank', 'Servants Quarters',
  'Wall Fence', 'Tiled Floor', 'Built-in Cupboards', 'Balcony',
]

const PRICE_UNITS = [
  { value: 'month', label: 'Month' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'year', label: 'Year' },
  { value: 'event', label: 'Event' },
]

export default function CreateListingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceUnit: 'month',
    location: '',
    category: '',
    categoryId: '',
    imageUrl: '',
    imageUrls: [] as string[],
    contactPhone: '',
    contactEmail: '',
  })

  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showPriceUnitPicker, setShowPriceUnitPicker] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (!data.user) {
        router.push('/auth/signin')
        return false
      }
      return true
    } catch {
      router.push('/auth/signin')
      return false
    }
  }

  useEffect(() => {
    checkAuth()
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <div className="h-12 bg-[#006633]" />
        <div className="px-4 py-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const maxTotal = 5 // max 5 images total
    const currentTotal = form.imageUrl ? 1 + form.imageUrls.length : form.imageUrls.length
    const slotsLeft = maxTotal - currentTotal
    if (slotsLeft <= 0) {
      setError('Maximum 5 photos allowed')
      return
    }

    const filesToProcess = Array.from(files).slice(0, slotsLeft)
    setUploading(true)
    setError('')

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image file`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is too large (max 10MB)`)
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

        const data = await res.json()
        if (!form.imageUrl) {
          // First image becomes the main imageUrl
          setForm(prev => ({ ...prev, imageUrl: data.fileUrl }))
        } else {
          // Additional images go to imageUrls array
          setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, data.fileUrl] }))
        }
      } catch {
        setError(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    if (form.imageUrls.length > 0 && form.imageUrl) {
      // Move first extra image to main
      const [newMain, ...rest] = form.imageUrls
      setForm(prev => ({ ...prev, imageUrl: newMain, imageUrls: rest }))
    } else {
      setForm(prev => ({ ...prev, imageUrl: '' }))
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeExtraImage = (index: number) => {
    setForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }))
  }

  const selectCategory = (cat: typeof CATEGORIES[0]) => {
    setForm(prev => ({ ...prev, category: cat.name, categoryId: '' }))
    setShowCategoryPicker(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!form.title.trim() || form.title.trim().length < 3) {
      setError('Title must be at least 3 characters')
      return
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError('Please enter a valid price')
      return
    }
    if (!form.location.trim()) {
      setError('Location is required')
      return
    }
    if (!form.category) {
      setError('Please select a category')
      return
    }
    if (!form.imageUrl) {
      setError('Please upload an image')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          priceUnit: form.priceUnit,
          location: form.location,
          category: form.category,
          imageUrl: form.imageUrl,
          imageUrls: JSON.stringify(form.imageUrls),
          contactPhone: form.contactPhone || undefined,
          contactEmail: form.contactEmail || undefined,
          amenities: selectedAmenities,
        }),
      })

      if (res.status === 401) {
        router.push('/auth/signin')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create listing')
        return
      }

      router.push('/my-listings')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = CATEGORIES.find(c => c.name === form.category)
  const selectedPriceUnit = PRICE_UNITS.find(u => u.value === form.priceUnit)

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#006633] gradient-border-bottom">
        <div className="flex items-center px-4 py-3 gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Home className="size-4 text-white" />
          </Link>
          <Link href="/" className="text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
            Housemate<span className="text-green-300">.zm</span>
          </Link>
          <span className="text-white/40 mx-1">|</span>
          <h1 className="text-white/80 font-medium text-base">New Listing</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <X className="size-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Image Upload Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-elevated">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Camera className="size-4 text-[#006633]" />
              Photos
            </label>
            {(form.imageUrl || form.imageUrls.length > 0) && (
              <span className="text-xs text-gray-400">{form.imageUrl ? 1 + form.imageUrls.length : form.imageUrls.length}/5</span>
            )}
          </div>

          {/* Main image */}
          {form.imageUrl ? (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
              <Image
                src={form.imageUrl}
                alt="Main listing photo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
              <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                Main Photo
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 hover:border-[#006633] flex flex-col items-center justify-center gap-2 transition-colors bg-gray-50 hover:bg-green-50/50 disabled:opacity-50 mb-3"
            >
              {uploading ? (
                <Loader2 className="size-8 text-[#006633] animate-spin" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Camera className="size-6 text-[#006633]" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Tap to upload photos</p>
                  <p className="text-xs text-gray-400">JPG, PNG, WebP up to 10MB each (max 5)</p>
                </>
              )}
            </button>
          )}

          {/* Extra images thumbnail grid */}
          {form.imageUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {form.imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  <Image src={url} alt={`Photo ${idx + 2}`} fill className="object-cover" sizes="80px" />
                  <button
                    type="button"
                    onClick={() => removeExtraImage(idx)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {/* Add more button */}
              {(form.imageUrl ? 1 + form.imageUrls.length : form.imageUrls.length) < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#006633] flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                >
                  <Plus className="size-5 text-gray-400" />
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
            multiple
          />
        </div>

        {/* Title */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-elevated">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
            <FileText className="size-4 text-[#006633]" />
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Modern 2-Bedroom Apartment in Makeni"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 transition-all focus-premium"
            maxLength={100}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">{form.title.length}/100 characters</p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-elevated">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
            <FileText className="size-4 text-[#006633]" />
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder="Describe your listing in detail — include features, amenities, nearby landmarks..."
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 transition-all resize-none focus-premium"
            maxLength={2000}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">{form.description.length}/2000 characters</p>
        </div>

        {/* Price & Price Unit */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-elevated">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
            <DollarSign className="size-4 text-[#006633]" />
            Price <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">K</span>
              <input
                type="number"
                placeholder="0"
                value={form.price}
                onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 transition-all focus-premium"
                min="0"
                step="0.01"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPriceUnitPicker(!showPriceUnitPicker)}
                className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white flex items-center gap-1.5 hover:border-[#006633] focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 transition-all min-w-[100px]"
              >
                {selectedPriceUnit?.label || 'Month'}
                <ChevronDown className="size-3.5 text-gray-400" />
              </button>
              {showPriceUnitPicker && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowPriceUnitPicker(false)} />
                  <div className="absolute right-0 top-12 z-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[120px] animate-fade-in">
                    {PRICE_UNITS.map(unit => (
                      <button
                        key={unit.value}
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, priceUnit: unit.value }))
                          setShowPriceUnitPicker(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          form.priceUnit === unit.value
                            ? 'bg-green-50 text-[#006633] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-elevated">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
            <MapPin className="size-4 text-[#006633]" />
            Location <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Makeni, Lusaka"
            value={form.location}
            onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 transition-all focus-premium"
          />
        </div>

        {/* Category Picker */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-elevated">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Tag className="size-4 text-[#006633]" />
            Category <span className="text-red-400">*</span>
          </label>

          {selectedCategory ? (
            <button
              type="button"
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="w-full h-11 px-3 rounded-xl border border-[#006633] bg-green-50/50 text-sm font-medium text-[#006633] flex items-center gap-2"
            >
              <span>{selectedCategory.icon}</span>
              {selectedCategory.name}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCategoryPicker(true)}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-400 flex items-center gap-2 hover:border-[#006633] transition-colors"
            >
              Select a category
              <ChevronDown className="size-3.5 ml-auto" />
            </button>
          )}

          {showCategoryPicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowCategoryPicker(false)} />
              <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 grid grid-cols-2 gap-1 animate-fade-in relative z-40">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => selectCategory(cat)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      form.category === cat.name
                        ? 'bg-green-50 text-[#006633] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-elevated">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
            <Sparkles className="size-4 text-[#006633]" />
            Amenities
            <span className="text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <p className="text-[11px] text-gray-400 mb-3">Select the features available at this property</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_OPTIONS.map(amenity => {
              const isSelected = selectedAmenities.includes(amenity)
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => setSelectedAmenities(prev =>
                    isSelected ? prev.filter(a => a !== amenity) : [...prev, amenity]
                  )}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 border ${
                    isSelected
                      ? 'bg-green-50 text-[#006633] border-[#006633]/30 shadow-sm'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="size-3" />}
                  {amenity}
                </button>
              )
            })}
          </div>
          {selectedAmenities.length > 0 && (
            <p className="text-[11px] text-[#006633] font-medium mt-3">
              {selectedAmenities.length} amenit{selectedAmenities.length === 1 ? 'y' : 'ies'} selected
            </p>
          )}
        </div>

        {/* Contact Info (Optional) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-elevated">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            Contact Info
            <span className="text-xs font-normal text-gray-400">(optional)</span>
          </p>
          <div className="space-y-3">
            <input
              type="tel"
              placeholder="Phone number (e.g. +260977123456)"
              value={form.contactPhone}
              onChange={e => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 transition-all focus-premium"
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.contactEmail}
              onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 transition-all focus-premium"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white font-semibold text-sm shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover-lift flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish Listing'
          )}
        </button>

        <p className="text-[11px] text-gray-400 text-center pb-4">
          By publishing, you agree to Housemate ZM&apos;s listing guidelines. Your listing will be visible immediately.
        </p>
      </form>
    </div>
  )
}
