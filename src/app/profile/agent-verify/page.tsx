'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Home,
  ShieldCheck,
  Loader2,
  Check,
  Building2,
  FileText,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const SPECIALTIES = [
  'Residential',
  'Commercial',
  'Land',
  'Rentals',
  'Property Management',
  'Valuation',
]

interface UserData {
  name: string
  email: string
  avatarUrl?: string | null
  isVerifiedAgent: boolean
}

export default function AgentVerifyPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bio, setBio] = useState('')
  const [company, setCompany] = useState('')
  const [license, setLicense] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (!data.user) {
          router.push('/auth/signin?redirect=/profile/agent-verify')
          return
        }
        setUser(data.user)
        if (data.user.isVerifiedAgent) {
          router.push('/profile')
        }
      } catch {
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [router])

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    )
  }

  const handleSubmit = async () => {
    setError(null)
    if (bio.trim().length < 10) {
      setError('Please provide a bio with at least 10 characters.')
      return
    }
    if (company.trim().length < 2) {
      setError('Please provide your company name.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/agent/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: bio.trim(),
          company: company.trim(),
          license: license.trim(),
          specialties,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="size-6 text-[#006633] animate-spin" />
      </div>
    )
  }

  // Success state with confetti-like animation
  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        {/* Header */}
        <div className="relative bg-[#006633] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          <div className="relative px-4 py-3 flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Home className="size-4 text-white" />
            </Link>
            <Link href="/" className="shrink-0 hover:opacity-80">
              <h1 className="text-white font-bold text-lg">Housemate<span className="text-[#4ade80]">.zm</span></h1>
            </Link>
          </div>
        </div>

        {/* Confetti container */}
        <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full opacity-60"
                  style={{
                    backgroundColor: ['#006633', '#4ade80', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'][i % 6],
                  }}
                />
              </div>
            ))}
          </div>

          <div className="text-center max-w-sm relative z-10">
            {/* Animated checkmark circle */}
            <div className="mx-auto w-24 h-24 rounded-full bg-[#006633] flex items-center justify-center mb-6 shadow-lg shadow-[#006633]/30 animate-pulse">
              <ShieldCheck className="size-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations!
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              You&apos;re now a <span className="font-semibold text-[#006633]">Verified Agent</span>
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Your verified badge will appear on all your listings and messages.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-[#006633]/20 p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006633]/10 flex items-center justify-center">
                  <Building2 className="size-5 text-[#006633]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{company}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 bg-[#006633] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="size-3" />
                  Verified
                </span>
              </div>
            </div>

            <Link href="/profile">
              <Button className="w-full bg-[#006633] hover:bg-[#004d26] rounded-xl h-11 font-semibold">
                Go to Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <div className="relative bg-[#006633] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="relative px-4 py-3 flex items-center gap-3">
          <Link href="/profile" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <ArrowLeft className="size-4 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-white font-bold text-base">Agent Verification</h1>
            <p className="text-white/60 text-[11px]">Become a trusted agent on Housemate ZM</p>
          </div>
          <Link href="/" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <Home className="size-4 text-white" />
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-5 -mt-3">
        {/* Profile preview card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-[#006633] to-[#0d9488]" />
          <div className="px-5 pb-4 -mt-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#006633] border-3 border-white shadow-lg flex items-center justify-center mb-2">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">{user ? getInitials(user.name) : '?'}</span>
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-sm font-bold text-gray-900">{user?.name}</h2>
              <span className="inline-flex items-center gap-1 bg-[#006633] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                <ShieldCheck className="size-2.5" />
                Verified
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">{user?.email}</p>
            {company && (
              <p className="text-[11px] text-[#006633] font-medium mt-1">{company}</p>
            )}
            {specialties.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {specialties.map((s) => (
                  <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-[#006633] text-[10px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="size-4 text-[#006633]" />
              Agent Information
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Tell us about your experience</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Bio */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Agent Bio <span className="text-red-400">*</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your experience in the Zambian property market..."
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633]/30 resize-none transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">{bio.trim().length}/10 min characters</p>
            </div>

            {/* Company Name */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-gray-400" />
                  Company Name <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Zambia Homes Realty"
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633]/30 transition-all"
              />
            </div>

            {/* License Number */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                License Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="e.g. RLA-2024-1234"
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633]/30 transition-all"
              />
            </div>

            {/* Specialties */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-gray-400" />
                  Specialties
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => {
                  const isSelected = specialties.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#006633] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="size-3" />}
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-xl px-4 py-3">
                <span className="text-sm">!</span>
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || bio.trim().length < 10 || company.trim().length < 2}
              className="w-full bg-[#006633] hover:bg-[#004d26] rounded-xl h-11 font-semibold disabled:opacity-40 disabled:cursor-not-allowed gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  Submit Verification
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 pb-4">
          Housemate ZM &middot; Agent Verification
        </p>
      </div>
    </div>
  )
}
