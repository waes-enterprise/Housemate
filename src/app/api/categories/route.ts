import { NextResponse } from 'next/server'

const categories = [
  { name: 'All', icon: 'LayoutGrid' },
  { name: 'Rooms', icon: 'Home' },
  { name: 'Farms', icon: 'Tractor' },
  { name: 'Offices', icon: 'Building2' },
  { name: 'Storage', icon: 'Warehouse' },
  { name: 'Event Spaces', icon: 'PartyPopper' },
  { name: 'Garages', icon: 'Car' },
  { name: 'Warehouses', icon: 'Warehouse' },
  { name: 'Land', icon: 'Mountain' },
  { name: 'Shops', icon: 'Store' },
  { name: 'Parking', icon: 'CircleParking' },
]

export async function GET() {
  return NextResponse.json(categories)
}
