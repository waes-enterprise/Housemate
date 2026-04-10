import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Verification - Housemate ZM',
  description: 'Become a verified real estate agent on Housemate ZM',
}

export default function AgentVerifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
