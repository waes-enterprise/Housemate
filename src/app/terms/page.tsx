'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

export default function TermsPage() {
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
        <h1 className="text-white/80 font-medium text-base">Terms of Service</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden card-elevated">
          {/* Green accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Terms of Service</h2>
          <p className="text-sm text-gray-400 mb-8">Last updated: April 2026</p>

          <div className="space-y-8">
            {/* Section 1: Acceptance */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                By accessing or using Housemate.zm, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our platform. Your continued use of the website following the posting of changes constitutes your acceptance of those changes.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                These terms apply to all visitors, users, and others who access or use Housemate.zm. We reserve the right to update or modify these terms at any time without prior notice. It is your responsibility to review these terms periodically for changes.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                By creating an account or using any of our services, you confirm that you are at least 18 years of age and have the legal capacity to enter into a binding agreement under Zambian law.
              </p>
            </section>

            {/* Section 2: User Accounts */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">2. User Accounts</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                When you create an account with Housemate.zm, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms. You are responsible for safeguarding the password that you use to access the service and for any activities under your account.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. Housemate.zm cannot and will not be liable for any loss or damage arising from your failure to comply with this section.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Each individual is permitted to maintain only one active account. Accounts created under false pretences or duplicate accounts may be suspended or terminated at our sole discretion.
              </p>
            </section>

            {/* Section 3: Listing Guidelines */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">3. Listing Guidelines</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                All property listings submitted to Housemate.zm must be accurate and truthful. Listings must include genuine property descriptions, correct pricing in Zambian Kwacha, real photographs of the property, and truthful location information. Misleading or deceptive listings are strictly prohibited and will be removed.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Property owners and agents are responsible for ensuring they have the legal right to list a property. This includes proper ownership documentation, landlord consent where applicable, and compliance with Zambian property laws and local authority regulations.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Housemate.zm reserves the right to edit, remove, or reject any listing that does not meet our quality standards or violates these guidelines. We may also require additional verification for high-value listings or properties in certain areas.
              </p>
            </section>

            {/* Section 4: Prohibited Content */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">4. Prohibited Content</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Users may not post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. This includes content that infringes upon the intellectual property rights of any party, including copyrighted images, text, or trademarks.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Fraudulent listings, phishing attempts, spam, and any form of scam are strictly forbidden. Users who engage in fraudulent activity will have their accounts permanently terminated and may be reported to Zambian law enforcement authorities.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Content that promotes discrimination based on race, gender, religion, tribe, or disability is prohibited. Housemate.zm is committed to providing an inclusive platform for all Zambians.
              </p>
            </section>

            {/* Section 5: Fees */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">5. Fees and Payments</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Certain services on Housemate.zm may require payment of fees, including featured listings, premium placements, and subscription plans. All fees are quoted in Zambian Kwacha (ZMW) and are inclusive of applicable taxes unless otherwise stated.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Payment for premium services must be made through our approved payment methods, including mobile money (Airtel Money, MTN Mobile Money), bank transfer, or other methods as specified on the platform. Refunds are handled on a case-by-case basis and are subject to our refund policy.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Housemate.zm reserves the right to change its pricing structure at any time. Existing subscribers will be notified of price changes at least 30 days before they take effect.
              </p>
            </section>

            {/* Section 6: Intellectual Property */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">6. Intellectual Property</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The Housemate.zm platform, including its design, logo, graphics, code, and content, is the exclusive property of Housemate ZM and is protected by Zambian and international intellectual property laws. Users may not reproduce, distribute, or create derivative works from any part of the platform without prior written consent.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                When you submit content to Housemate.zm, including property descriptions and photographs, you grant us a non-exclusive, royalty-free, worldwide licence to use, display, and distribute that content solely for the purpose of operating and promoting the platform.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                You retain ownership of your original content and may remove it from the platform at any time, subject to the terms of any active listing agreements or subscriptions.
              </p>
            </section>

            {/* Section 7: Liability */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">7. Limitation of Liability</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Housemate.zm acts as an intermediary platform and does not participate in transactions between users. We are not a party to any rental or sale agreement and shall not be held liable for the quality, legality, or accuracy of any listings, nor for the conduct of any user on the platform.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                To the fullest extent permitted by Zambian law, Housemate.zm shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, resulting from your use of or inability to use the service.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Users are encouraged to conduct their own due diligence, including property inspections and verification of documents, before entering into any rental or purchase agreements with other users of the platform.
              </p>
            </section>

            {/* Section 8: Termination */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">8. Termination</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                You may delete your account at any time by contacting our support team or through your account settings. Upon deletion, your personal information will be handled in accordance with our Privacy Policy, and active listings will be removed from the platform.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Accounts that have been inactive for more than 24 months may be considered dormant and may be deactivated, with appropriate notice sent to the registered email address.
              </p>
            </section>

            {/* Section 9: Changes */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">9. Changes to Terms</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Housemate.zm reserves the right to revise and update these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. We will make reasonable efforts to notify users of significant changes via email or platform notifications.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Your continued use of the platform after any such changes constitutes your acceptance of the new Terms. If you do not agree to the modified terms, you should discontinue use of the service and request account deletion.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                For any questions or concerns regarding these Terms of Service, please contact us at legal@housemate.zm or through our Contact page. We are committed to ensuring our terms remain fair, transparent, and compliant with Zambian law.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">&copy; 2026 Housemate ZM. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
