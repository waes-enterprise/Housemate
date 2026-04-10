'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Mail, Phone, MapPin, MessageCircle, Clock, Loader2 } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSuccess(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@housemate.zm',
      subtext: 'We reply within 24 hours',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+260 211 123 456',
      subtext: 'Mon–Fri, 8:00 AM – 5:00 PM',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'Stand 4524, Longacres',
      subtext: 'Lusaka, Zambia',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: '+260 977 654 321',
      subtext: 'Quick chat support',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Mon–Fri: 8 AM – 5 PM',
      subtext: 'Sat: 9 AM – 1 PM (Closed Sun)',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#006633]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-[#006633]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#4ade80]/5 blur-3xl pointer-events-none" />

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
        <h1 className="text-white/80 font-medium text-base">Contact Us</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full relative z-10 space-y-8">
        {/* Intro */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Have a question, feedback, or need help? We&apos;d love to hear from you. Fill out the form or reach out through any of the channels below.
          </p>
        </div>

        {/* Two column: Form + Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />

            <h3 className="text-lg font-semibold text-gray-900 mb-5">Send us a Message</h3>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
                Thank you! Your message has been sent successfully. We&apos;ll get back to you within 24 hours.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full h-11 pl-4 pr-4 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-4 pr-4 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full h-11 pl-4 pr-4 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 text-gray-700"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Enquiry</option>
                  <option value="listing">Listing Support</option>
                  <option value="account">Account Issues</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="report">Report a Problem</option>
                  <option value="partnership">Partnership Enquiry</option>
                  <option value="feedback">Feedback & Suggestions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  required
                  rows={4}
                  className="w-full pl-4 pr-4 pt-3 pb-3 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#006633]/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Info Cards */}
          <div className="space-y-3">
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 relative overflow-hidden card-elevated flex items-start gap-4"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
                <div className="h-10 w-10 rounded-xl bg-[#006633]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <info.icon className="size-5 text-[#006633]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{info.title}</h4>
                  <p className="text-[#006633] text-sm font-medium mt-0.5">{info.details}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{info.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordions */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden card-elevated">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h3>

          <div className="space-y-3">
            <details className="group rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                How quickly do you respond to enquiries?
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                We aim to respond to all enquiries within 24 hours during business days. For urgent matters, WhatsApp and phone calls receive faster responses, often within a few hours during operating hours.
              </div>
            </details>

            <details className="group rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                Can I visit your office in person?
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                Yes, absolutely! Our office is located at Stand 4524 in Longacres, Lusaka. We welcome visitors during our business hours, Monday to Friday from 8 AM to 5 PM, and Saturdays from 9 AM to 1 PM. We recommend scheduling an appointment in advance for faster assistance.
              </div>
            </details>

            <details className="group rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                Do you offer support in local languages?
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                Yes! Our support team can assist you in English, Nyanja, and Bemba. If you prefer to communicate in another Zambian language, let us know and we will do our best to accommodate you.
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center pb-10">
        <p className="text-sm text-gray-400">&copy; 2026 Housemate ZM. All rights reserved.</p>
      </div>
    </div>
  )
}
