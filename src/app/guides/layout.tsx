import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Area Guides — Housemate ZM',
  description:
    'Explore neighbourhood guides for Zambian cities and towns. Discover the best areas to live, work, and invest across Lusaka, Copperbelt, Southern Province, and more.',
}

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
