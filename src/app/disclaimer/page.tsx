import Link from 'next/link'
import { Home } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Read the disclaimer for Housemate ZM — Zambia\'s Premier Property Marketplace. Learn about the limitations of liability and terms of use for our platform.',
}

export default function DisclaimerPage() {
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
        <h1 className="text-white/80 font-medium text-base">Disclaimer</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden card-elevated">
          {/* Green accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Disclaimer</h2>
          <p className="text-sm text-gray-400 mb-8">Last updated: April 2026</p>

          <div className="space-y-8">
            {/* Section 1: General Disclaimer */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">1. General Disclaimer</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The information provided on Housemate.zm is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the website or the information, products, services, or related graphics contained on the website for any purpose.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Any reliance you place on such information is therefore strictly at your own risk. In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website. This disclaimer is governed by and construed in accordance with the laws of the Republic of Zambia.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Housemate.zm reserves the right to add, modify, or remove any content on the website at any time without prior notice. We are not obligated to update any information on the website and shall not be held responsible for any outdated information.
              </p>
            </section>

            {/* Section 2: Property Information Accuracy */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">2. Property Information Accuracy</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Housemate.zm acts as an intermediary platform connecting property seekers with property owners and agents. We do not verify, endorse, or guarantee the accuracy of any property listing, description, photograph, price, or other information provided by users on our platform. All property information is provided by third parties and is published in good faith.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Users are strongly advised to conduct independent verification of all property information before making any financial commitments. This includes but is not limited to: physically inspecting the property, verifying ownership documents with relevant Zambian authorities such as the Ministry of Lands and Natural Resources, confirming zoning and land use regulations with local councils, and engaging qualified professionals for property valuations and legal assessments.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Prices displayed on the platform are as provided by property owners or agents and may be subject to negotiation. Housemate.zm does not participate in price negotiations and shall not be held responsible for any discrepancies between listed prices and final transaction prices.
              </p>
            </section>

            {/* Section 3: Third-Party Links */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">3. Third-Party Links</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our website may contain links to third-party websites or services that are not owned or controlled by Housemate.zm. These links are provided for convenience and informational purposes only. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                The inclusion of any link does not imply a recommendation, endorsement, or approval of the linked website or its content, products, or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit. Housemate.zm shall not be liable for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any content, goods, or services available on or through any such third-party websites or services.
              </p>
            </section>

            {/* Section 4: Financial Advice Disclaimer */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">4. Financial Advice Disclaimer</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The information provided on Housemate.zm does not constitute financial advice. Any property price estimates, market trends, investment tips, or financial information published on the platform is for general informational purposes only and should not be relied upon as a substitute for professional financial advice.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Before making any property investment decisions, we recommend that you consult with a qualified financial advisor, a licensed estate agent registered with the Estate Agents Council of Zambia, or other relevant professionals who can provide advice based on your specific financial circumstances and objectives. Property values can fluctuate, and past performance is not indicative of future results.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Housemate.zm is not registered as a financial advisor under the Securities and Exchange Commission of Zambia or any other financial regulatory authority. Nothing on this platform should be interpreted as an offer or solicitation to buy, sell, or hold any property or financial instrument.
              </p>
            </section>

            {/* Section 5: Legal Advice Disclaimer */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">5. Legal Advice Disclaimer</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The information contained on Housemate.zm does not constitute legal advice and should not be interpreted as such. Any legal information, references to Zambian laws, regulations, or legal requirements provided on the platform are for general reference purposes only and do not create an attorney-client relationship between Housemate.zm and any user.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                For legal advice concerning property transactions, lease agreements, land disputes, or any other legal matters related to property in Zambia, you should consult a qualified legal practitioner admitted to the bar in Zambia. The Laws of Zambia, including the Land Act, the Lands and Deeds Registry Act, and the Town and Country Planning Act, govern property matters in Zambia, and professional legal guidance is essential for navigating these laws.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Housemate.zm makes no warranties or representations regarding the legal sufficiency, validity, or enforceability of any documents, agreements, or transactions facilitated through the platform.
              </p>
            </section>

            {/* Section 6: Limitation of Liability */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">6. Limitation of Liability</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To the maximum extent permitted by Zambian law, Housemate.zm, its directors, employees, partners, agents, suppliers, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation: loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the platform.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                This includes damages arising from any conduct or content of any third party on the platform, any content obtained from the platform, unauthorised access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                In jurisdictions that do not allow the exclusion or limitation of liability for consequential or incidental damages, our liability shall be limited to the maximum extent permitted by law. This limitation of liability applies to the fullest extent permitted by the Laws of Zambia.
              </p>
            </section>

            {/* Section 7: Changes to Disclaimer */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">7. Changes to This Disclaimer</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Housemate.zm reserves the right to update or modify this Disclaimer at any time without prior notice. Changes will be effective immediately upon posting to the platform. The date of the most recent revision will be indicated at the top of this page.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                We encourage you to review this Disclaimer periodically to stay informed of any updates. Your continued use of the platform following any changes to this Disclaimer constitutes your acceptance of those changes. If you do not agree with the revised Disclaimer, you should discontinue use of the platform immediately.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Significant changes to this Disclaimer may be communicated to registered users via email or platform notification at our discretion. However, the absence of such notification does not invalidate any changes made to this Disclaimer.
              </p>
            </section>

            {/* Section 8: Contact */}
            <section>
              <h3 className="text-[#006633] font-semibold text-lg mb-3">8. Contact Us</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                If you have any questions, concerns, or requests regarding this Disclaimer, please contact us. You can reach us by email at legal@housemate.zm, by phone at +260 211 123 456, or by post at P.O. Box 50000, Lusaka, Zambia.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                For general enquiries and support, please visit our Contact page or email us at info@housemate.zm. We aim to respond to all enquiries within 5 business days.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Housemate.zm is committed to operating transparently and in compliance with all applicable laws and regulations of the Republic of Zambia. We value your feedback and are always working to improve our platform and services.
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
