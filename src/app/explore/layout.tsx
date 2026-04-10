import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Properties",
  description:
    "Search and browse houses, apartments, land, and commercial properties across Zambia",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
