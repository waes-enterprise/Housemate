import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Calculator",
  description: "Calculate mortgage payments and check property affordability",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
