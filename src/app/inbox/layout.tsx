import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Chat with property owners and agents",
};

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
