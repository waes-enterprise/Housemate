import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Listings",
  description: "View your favorite property listings",
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
