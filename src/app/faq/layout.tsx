import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Frequently asked questions about Housemate ZM",
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
