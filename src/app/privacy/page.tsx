'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

export default function PrivacyPage() {
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
        <h1 className="text-white/80 font-medium text-base">Privacy Policy</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden card-elevated">
          {/* Green accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Privacy Policy</h2>
          <p className="text-sm text-gray-400 mb-8">Last updated: April 2026</p>

          <div className="space-y-8">
            {/* Section 1: Information We Collect */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">1. Information We Collect</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                When you create an account or use Housemate.zm, we collect personal information that you voluntarily provide, including your full name, email address, phone number, profile photograph, and National Registration Card (NRC) number for verification purposes. We also collect information about your property preferences and search activity.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Automatically, we collect device information such as your IP address, browser type, operating system, and access times. We use cookies and similar technologies to track browsing patterns and interactions with our platform to improve your experience.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                When you communicate with other users through our messaging system, we may store the content of those messages for the purpose of resolving disputes and maintaining platform safety. Messages are encrypted in transit but are stored on our secure servers.
              </p>
            </section>

            {/* Section 2: How We Use Your Information */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">2. How We Use Your Information</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We use the information we collect to provide, maintain, and improve the Housemate.zm platform. This includes personalising your search results, displaying relevant property listings, and facilitating communication between property seekers and property owners or agents.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Your information is also used to verify your identity, prevent fraud, enforce our Terms of Service, and ensure the safety of all users. We may use your contact details to send important notifications about your account, listings, or platform updates.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                With your explicit consent, we may use your information to send promotional communications about new features, special offers, or partner services. You can opt out of promotional communications at any time through your account settings or by contacting us directly.
              </p>
            </section>

            {/* Section 3: Information Sharing */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">3. Information Sharing</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Housemate.zm does not sell your personal information to third parties. We may share your information with other users of the platform in connection with property transactions, such as sharing your name and verified status with a property owner when you enquire about a listing.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                We may share aggregated, non-personally identifiable information with our partners and advertisers to help them understand usage trends and improve their services. This data cannot be used to identify any individual user.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                We may disclose your information if required to do so by law, in response to a valid legal request from a Zambian court or regulatory authority, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.
              </p>
            </section>

            {/* Section 4: Data Security */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">4. Data Security</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We implement industry-standard security measures to protect your personal information, including SSL/TLS encryption for all data in transit, secure server infrastructure with firewall protection, and regular security audits. Your NRC number and other sensitive data are encrypted at rest using AES-256 encryption.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Despite our best efforts, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security and encourage you to use strong passwords and to contact us immediately if you suspect unauthorised access to your account.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Our team receives regular training on data protection best practices and information security. Access to personal data is strictly limited to authorised personnel on a need-to-know basis, and all access is logged and monitored.
              </p>
            </section>

            {/* Section 5: Cookies and Tracking */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">5. Cookies and Tracking Technologies</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Housemate.zm uses cookies and similar tracking technologies to enhance your browsing experience. Essential cookies are required for the platform to function properly, including session management, authentication, and security features. These cannot be disabled.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Analytics cookies help us understand how visitors interact with our platform by collecting information about pages visited, time spent, and navigation patterns. We use this data to improve the user experience and platform performance. We may also use third-party analytics services that set their own cookies.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                You can control cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of the platform and limit your ability to use some features.
              </p>
            </section>

            {/* Section 6: Your Rights */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">6. Your Rights</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Under the Data Protection Act of Zambia, you have the right to access the personal information we hold about you, request corrections to inaccurate data, and request deletion of your data. You can exercise these rights by contacting our Data Protection Officer at privacy@housemate.zm.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                You have the right to withdraw consent for any data processing based on your consent at any time. You also have the right to request a copy of your data in a structured, commonly used, and machine-readable format.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                If you believe that your personal information has been processed in a manner that violates these rights, you have the right to lodge a complaint with the Office of the Data Protection Commissioner in Zambia.
              </p>
            </section>

            {/* Section 7: Data Retention */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">7. Data Retention</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you with our services. If you request account deletion, we will remove your personal data within 30 days, except where retention is required by Zambian law or for legitimate business purposes.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Transaction records, including messages related to property deals and payment history, are retained for a minimum of 5 years after the transaction is completed, in compliance with Zambian financial regulations and tax requirements.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Anonymised data that cannot be linked to an individual may be retained indefinitely for analytical and research purposes. This data is used solely to improve our platform and does not impact your privacy.
              </p>
            </section>

            {/* Section 8: Children&apos;s Privacy */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">8. Children&apos;s Privacy</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Housemate.zm is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately and we will take steps to remove that information.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                During the account registration process, we require users to confirm that they are at least 18 years old. If we discover that an account belongs to a minor, we will terminate that account and delete all associated data in accordance with this Privacy Policy.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                We are committed to protecting the privacy of minors online and will cooperate with parents, guardians, and relevant authorities to ensure compliance with applicable child protection laws in Zambia.
              </p>
            </section>

            {/* Section 9: Contact Us */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">9. Contact Us</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer. You can reach us by email at privacy@housemate.zm, by phone at +260 211 123 456, or by post at P.O. Box 50000, Lusaka, Zambia.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                We aim to respond to all privacy-related enquiries within 15 business days. If your request is complex or requires further investigation, we will acknowledge receipt within 5 business days and provide a full response as soon as reasonably practicable.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                For urgent security concerns or data breach notifications, please contact our security team directly at security@housemate.zm. We take all data protection matters seriously and are committed to addressing your concerns promptly and thoroughly.
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
