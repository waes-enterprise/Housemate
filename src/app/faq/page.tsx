'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Search } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
  category: string
}

const faqItems: FaqItem[] = [
  {
    category: 'Getting Started',
    question: 'What is Housemate.zm?',
    answer: 'Housemate.zm is Zambia\'s premier online property marketplace. We connect property seekers with property owners and agents across all 10 provinces. Whether you\'re looking for a rental apartment in Lusaka, a family house in Ndola, or a commercial space in Kitwe, our platform makes it easy to search, compare, and connect with verified listings.',
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Creating an account is free and takes less than 2 minutes. Click the "Sign Up" button on the homepage, enter your name, email address, phone number, and create a password. You\'ll receive a verification email or SMS — once confirmed, you can start browsing listings, saving favourites, and contacting property owners immediately.',
  },
  {
    category: 'Getting Started',
    question: 'Is Housemate.zm free to use?',
    answer: 'Yes! Searching, browsing, and enquiring about properties is completely free. Property owners can post basic listings at no cost. We offer optional premium features such as featured listing placement, priority visibility, and enhanced listing tools for a small fee. There are no hidden charges or mandatory subscriptions.',
  },
  {
    category: 'Getting Started',
    question: 'How do I search for properties?',
    answer: 'Use the search bar on the homepage to enter a location, property type, or price range. You can also browse by province using the map view. Filters allow you to narrow results by number of bedrooms, price range, property type, amenities, and more. Save your searches to receive alerts when new matching properties are listed.',
  },
  {
    category: 'Listings',
    question: 'How do I list my property?',
    answer: 'Log in to your account, click "Post Listing," and fill in the property details including location, price, number of rooms, available amenities, and upload clear photographs. Our system will guide you through each step. Once submitted, your listing will be reviewed by our team and typically published within 24 hours.',
  },
  {
    category: 'Listings',
    question: 'What types of properties can I list?',
    answer: 'You can list a wide variety of properties including apartments, houses, townhouses, flats, bed-sitters, guest houses, commercial spaces, offices, land plots, and warehouses. Whether you\'re a private landlord, estate agent, or property developer, Housemate.zm supports all property types across Zambia.',
  },
  {
    category: 'Listings',
    question: 'How are listings verified?',
    answer: 'Our verification team reviews every listing before it goes live. We verify the property owner\'s identity using NRC information, confirm the property exists through photographs and location data, and may conduct follow-up checks for high-value listings. Verified listings display a green badge to assure potential tenants of their authenticity.',
  },
  {
    category: 'Listings',
    question: 'Can I edit or delete my listing?',
    answer: 'Yes, you can edit or delete your listing at any time from your account dashboard. Simply go to "My Listings," select the listing you want to modify, and make your changes. Edits are reviewed and published within a few hours. Deleting a listing removes it from the platform immediately. Please note that active premium listings may not be refundable if deleted.',
  },
  {
    category: 'Safety',
    question: 'How do I avoid scams on Housemate.zm?',
    answer: 'Always look for the green verified badge on listings, never send money before viewing a property in person, and communicate through our in-app messaging system. Be wary of listings with unusually low prices, landlords who pressure you to pay quickly, or anyone who refuses to meet in person. Report any suspicious activity to our support team immediately.',
  },
  {
    category: 'Safety',
    question: 'What should I do before signing a lease?',
    answer: 'We recommend viewing the property in person, verifying the landlord\'s identity and ownership documents, reading the lease agreement thoroughly before signing, and taking photos of the property condition at move-in. If possible, have a trusted friend or family member accompany you. Consider having a legal professional review the lease before committing.',
  },
  {
    category: 'Safety',
    question: 'How do I report a suspicious listing or user?',
    answer: 'Every listing and user profile has a "Report" button. Click it and select the reason for your report, such as suspected fraud, misleading information, or inappropriate content. Our trust and safety team reviews all reports within 48 hours and takes appropriate action. You can also email security@housemate.zm for urgent concerns.',
  },
  {
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the sign-in page and enter the email address associated with your account. We\'ll send you a password reset link that expires in 30 minutes. Click the link and set a new password. If you don\'t receive the email, check your spam folder or contact our support team for assistance.',
  },
  {
    category: 'Account',
    question: 'How do I delete my account?',
    answer: 'You can request account deletion through your account settings under "Privacy & Security," or by contacting our support team at support@housemate.zm. Account deletion is permanent and will remove your personal information, saved searches, and message history. Active listings will be unpublished. Please note that some data may be retained for legal and security purposes as outlined in our Privacy Policy.',
  },
]

const categories = ['Getting Started', 'Listings', 'Safety', 'Account']

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 className="text-white/80 font-medium text-base">FAQ</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full relative z-10 space-y-8">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Find answers to the most common questions about Housemate.zm. Can&apos;t find what you&apos;re looking for? Feel free to contact us.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            className="w-full h-12 pl-11 pr-4 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10 shadow-sm"
          />
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="text-center text-sm text-gray-400">
            {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} found for &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {/* FAQ by Category */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryItems = filteredItems.filter((item) => item.category === category)
            if (categoryItems.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-[#006633] font-semibold text-base mb-3">{category}</h3>
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <details
                      key={item.question}
                      className="group bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden card-elevated"
                    >
                      <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                        <span className="pr-4">{item.question}</span>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200 shrink-0">
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* No results */}
        {filteredItems.length === 0 && searchQuery && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No matching questions found. Try a different search term.</p>
          </div>
        )}

        {/* Still need help */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center relative overflow-hidden card-elevated">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
            Couldn&apos;t find the answer you were looking for? Our support team is here to assist you with any questions or concerns.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#006633]/25 transition-all duration-200"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center pb-10">
        <p className="text-sm text-gray-400">&copy; 2026 Housemate ZM. All rights reserved.</p>
      </div>
    </div>
  )
}
