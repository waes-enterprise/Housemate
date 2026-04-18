import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() {
  try {
    await prisma.lodge.deleteMany();
    await prisma.lodge.createMany({
      data: [
        { name: "Tongabezi Lodge", location: "Livingstone", price: 850, rating: 4.9, reviewCount: 124, availableRooms: 8, featured: true, description: "Luxury lodge on the Zambezi River", images: ["https://images.unsplash.com/photo-1549366021-9f761d450615"], tags: ["luxury","river","safari"] },
        { name: "Sussi & Chuma", location: "Livingstone", price: 620, rating: 4.8, reviewCount: 89, availableRooms: 5, featured: true, description: "Treehouse lodge near Victoria Falls", images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d"], tags: ["treehouse","falls","romantic"] },
        { name: "Chiawa Camp", location: "Lower Zambezi", price: 980, rating: 4.9, reviewCount: 201, availableRooms: 6, featured: true, description: "Premier safari camp in Lower Zambezi", images: ["https://images.unsplash.com/photo-1493246507139-91e8fad9978e"], tags: ["safari","luxury","wildlife"] },
        { name: "Royal Chundu", location: "Livingstone", price: 540, rating: 4.7, reviewCount: 76, availableRooms: 10, featured: false, description: "Island and river lodge experience", images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"], tags: ["island","river","family"] },
        { name: "Potato Bush Camp", location: "Lower Zambezi", price: 430, rating: 4.6, reviewCount: 55, availableRooms: 4, featured: false, description: "Intimate bush camp experience", images: ["https://images.unsplash.com/photo-1510798831971-661eb04b3739"], tags: ["bush","intimate","affordable"] }
      ]
    });
    return NextResponse.json({ success: true, message: "Seeded!" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
