import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Listing",
  description: "List your property on Housemate ZM",
};

export default function CreateListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
