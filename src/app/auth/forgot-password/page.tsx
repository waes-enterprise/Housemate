'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

type Step = 'request' | 'verify' | 'success'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [devCode, setDevCode] = useState('')

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      // In development, show the code
      if (data.code) {
        setDevCode(data.code)
      }

      setStep('verify')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setStep('success')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'verify') {
      setStep('request')
      setDevCode('')
      setCode('')
      setError('')
    } else if (step === 'success') {
      setStep('request')
      setEmail('')
      setCode('')
      setNewPassword('')
      setConfirmPassword('')
      setDevCode('')
      setError('')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#006633]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-[#006633]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-[#4ade80]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative bg-[#006633] px-4 py-3 flex items-center gap-3">
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
        <h1 className="text-white/80 font-medium text-base">Reset Password</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full relative z-10">
        {/* Step 1: Request Code */}
        {step === 'request' && (
          <>
            <div className="text-center mb-8 animate-float">
              <h2 className="text-2xl font-bold text-gray-900">
                Housemate<span className="text-[#006633]">.zm</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Enter your email to get a reset code</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />

              <form onSubmit={handleRequestCode} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 pl-4 pr-4 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 focus:border-l-[3px] focus:border-l-[#006633] focus-premium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#006633]/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none hover-lift"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Mail className="size-4" />
                      Send Reset Code
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006633] transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back to Sign In
              </Link>
            </div>
          </>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <>
            <div className="text-center mb-8 animate-float">
              <h2 className="text-2xl font-bold text-gray-900">
                Enter Reset Code
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />

              {/* Dev code display */}
              {devCode && (
                <div className="mb-4 bg-[#006633]/5 border border-[#006633]/15 rounded-xl px-4 py-3">
                  <p className="text-xs text-[#006633]/70 font-medium mb-1">Development Reset Code</p>
                  <p className="text-2xl font-bold text-[#006633] tracking-[0.3em] text-center font-mono">{devCode}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    6-Digit Reset Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full h-11 pl-4 pr-4 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 focus:border-l-[3px] focus:border-l-[#006633] focus-premium tracking-[0.2em] text-center font-mono text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className="w-full h-11 pl-4 pr-11 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 focus:border-l-[3px] focus:border-l-[#006633] focus-premium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full h-11 pl-4 pr-11 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 focus:border-l-[3px] focus:border-l-[#006633] focus-premium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#006633]/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none hover-lift"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 text-center space-y-2">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006633] transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back to email entry
              </button>
            </div>
          </>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <>
            <div className="text-center mb-8 animate-float">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="size-8 text-[#006633]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Password Reset!
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your password has been updated successfully.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  You can now sign in with your new password.
                </p>

                <Link
                  href="/auth/signin"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#006633]/25 flex items-center justify-center gap-2 hover-lift"
                >
                  Sign In Now
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006633] transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back to reset password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
