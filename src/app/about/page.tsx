'use client'

import Link from 'next/link'
import { Home, Building2, Users, MapPin, Search, MessageSquare, Star, ShieldCheck, Smartphone, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { icon: Building2, value: '10,000+', label: 'Property Listings' },
    { icon: Users, value: '5,000+', label: 'Active Users' },
    { icon: MapPin, value: 'All 10', label: 'Provinces Covered' },
  ]

  const features = [
    {
      icon: Building2,
      title: 'Rental Listings',
      description: 'Browse thousands of verified rental properties across Lusaka, Copperbelt, and all Zambian provinces.',
    },
    {
      icon: Search,
      title: 'Map Search',
      description: 'Find properties by location with our interactive map. Explore neighbourhoods before you visit.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Messaging',
      description: 'Chat directly with property owners and agents. No middlemen, no hidden fees.',
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'Read honest reviews from verified tenants. Make informed decisions based on real experiences.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Listings',
      description: 'All listings are verified by our team to ensure authenticity and reduce fraud risk.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Access Housemate.zm on any device. Our platform is fully responsive and works on all smartphones.',
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
        <h1 className="text-white/80 font-medium text-base">About Us</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full relative z-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center py-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#006633] leading-tight">
            Zambia&apos;s Premier<br />Property Marketplace
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Connecting Zambians with their perfect homes since 2024. Whether you&apos;re searching for a rental in Lusaka, a family house in Ndola, or a commercial space in Kitwe, Housemate.zm makes finding property simple, safe, and transparent.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 text-center relative overflow-hidden card-elevated"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
              <stat.icon className="size-8 text-[#006633] mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Our Mission */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden card-elevated">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
          <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Our mission is to transform the way Zambians find, rent, and manage properties. For too long, the Zambian property market has been fragmented, opaque, and difficult to navigate. Housemate.zm was built to change that by creating a trusted, centralised platform where property seekers and property owners can connect directly, with transparency and confidence at the heart of every interaction.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mt-3">
            We believe that everyone deserves access to a safe, affordable home. By leveraging technology and local expertise, we are breaking down barriers to property access across all 10 provinces of Zambia. From major cities like Lusaka, Kitwe, and Ndola to growing towns in Southern, Eastern, and North-Western provinces, we are making property search accessible to all Zambians regardless of their location.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mt-3">
            We are committed to reducing fraud in the property market through rigorous verification processes, empowering users with honest reviews and ratings, and providing tools that make the entire rental journey from search to move-in as smooth as possible.
          </p>
        </div>

        {/* What We Offer */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">What We Offer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#006633]/10 flex items-center justify-center shrink-0">
                    <feature.icon className="size-5 text-[#006633]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Team */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden card-elevated">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
          <h3 className="text-xl font-bold text-gray-900 mb-4">Our Team</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Housemate.zm is built and maintained by a passionate team of Zambian developers, designers, and property enthusiasts based right here in Lusaka. Our team combines deep local knowledge of the Zambian property market with modern technology skills to deliver a platform that truly serves the needs of Zambian home seekers and property owners.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mt-3">
            From software engineers to customer support specialists, every member of our team is dedicated to making Housemate.zm the most trusted and user-friendly property platform in Zambia. We understand the unique challenges of the Zambian property market because we live and work here ourselves, and we are constantly improving our platform based on feedback from our growing community of users.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#006633] to-[#004d26] rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-3">Ready to find your next home?</h3>
            <p className="text-green-200 text-sm mb-6 max-w-md mx-auto">
              Join thousands of Zambians who have already found their perfect home through Housemate.zm. Start your search today.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white text-[#006633] font-semibold text-sm hover:bg-green-50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              Start Searching
              <ArrowRight className="size-4" />
            </Link>
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
