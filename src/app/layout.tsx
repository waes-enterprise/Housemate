import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#006633",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Housemate ZM",
    default: "Housemate ZM — Zambia's Premier Property Marketplace",
  },
  description:
    "Find houses, apartments, land, and commercial properties for rent and sale across Zambia. Browse 10,000+ listings on Zambia's trusted property marketplace.",
  keywords: [
    "Zambia property",
    "houses for rent Zambia",
    "apartments Lusaka",
    "land for sale Zambia",
    "commercial property Zambia",
    "Housemate ZM",
  ],
  authors: [{ name: "Housemate ZM" }],
  creator: "Housemate ZM",
  openGraph: {
    title: "Housemate ZM — Zambia's Premier Property Marketplace",
    description:
      "Find houses, apartments, land, and commercial properties for rent and sale across Zambia. Browse 10,000+ listings on Zambia's trusted property marketplace.",
    url: "https://housemate.zm",
    siteName: "Housemate ZM",
    locale: "en_ZM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Housemate ZM — Zambia's Premier Property Marketplace",
    description:
      "Find houses, apartments, land, and commercial properties for rent and sale across Zambia. Browse 10,000+ listings on Zambia's trusted property marketplace.",
    creator: "@housematezm",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Housemate ZM",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Housemate ZM",
  url: "https://housemate.zm",
  logo: "https://housemate.zm/logo.png",
  description: "Zambia's Premier Property Marketplace",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lusaka",
    addressCountry: "ZM",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+260-977-000-000",
    contactType: "customer service",
  },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Housemate ZM",
  url: "https://housemate.zm",
  description: "Zambia's Premier Property Marketplace",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://housemate.zm/explore?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const realEstateAgentJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Housemate ZM",
  url: "https://housemate.zm",
  logo: "https://housemate.zm/logo.png",
  description: "Zambia's Premier Property Marketplace — connecting property seekers with owners across Zambia",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lusaka",
    addressCountry: "ZM",
  },
  areaServed: {
    "@type": "Country",
    name: "Zambia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(realEstateAgentJsonLd),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
