import { Metadata } from 'next'
import { areaGuides, getGuideBySlug } from '@/lib/area-guides'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) {
    return { title: 'Area Guide Not Found — Housemate ZM' }
  }
  return {
    title: `${guide.name} Area Guide — Housemate ZM`,
    description: guide.description,
  }
}

export function generateStaticParams() {
  return areaGuides.map((guide) => ({ slug: guide.slug }))
}

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
