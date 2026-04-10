'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Camera, Loader2, Eye, EyeOff } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  role: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (!data.user) {
          router.push('/auth/signin')
          return
        }
        const u = data.user as UserProfile
        setUser(u)
        setName(u.name)
        setEmail(u.email)
        setPhone(u.phone || '')
      } catch {
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [router])

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    if (password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    if (password && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setSaving(true)
    try {
      const body: Record<string, string> = { name: name.trim(), phone }
      if (password) body.password = password

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update profile')
        return
      }

      router.push('/profile')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="size-6 text-[#006633] animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <div className="bg-[#006633] px-4 py-3 flex items-center gap-3 gradient-border-bottom">
        <Link
          href="/"
          className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <Home className="size-4 text-white" />
        </Link>
        <Link href="/" className="text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
          Housemate<span className="text-green-300">.zm</span>
        </Link>
        <span className="text-white/40 mx-1">|</span>
        <h1 className="text-white/80 font-medium text-base">Edit Profile</h1>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
        {/* Avatar Section */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 card-elevated">
          <div className="mx-auto w-24 h-24 rounded-full bg-[#006633] border-4 border-[#006633]/10 flex items-center justify-center mb-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          <button
            onClick={() => alert('Photo upload coming soon')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Camera className="size-4" />
            Change Photo
          </button>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 card-elevated">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-10 px-3 text-sm rounded-lg border outline-none transition-colors focus-premium ${
                fieldErrors.name ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10'
              }`}
              placeholder="Full name"
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
            />
            <p className="text-xs text-gray-400">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 transition-colors focus-premium"
              placeholder="Phone number"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-10 px-3 pr-10 text-sm rounded-lg border outline-none transition-colors focus-premium ${
                  fieldErrors.password ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10'
                }`}
                placeholder="Leave blank to keep current"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full h-10 px-3 pr-10 text-sm rounded-lg border outline-none transition-colors focus-premium ${
                  fieldErrors.confirmPassword ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors hover-lift"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-10 rounded-lg bg-[#006633] text-white text-sm font-medium hover:bg-[#005528] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 hover-lift"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
