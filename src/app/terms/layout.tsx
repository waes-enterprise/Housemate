import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Housemate ZM terms and conditions",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
