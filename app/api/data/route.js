import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    const stocks = await prisma.stockItem.findMany();
    const users = await prisma.user.findMany();
    const purchases = await prisma.purchase.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    const transfers = await prisma.transfer.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    const movements = await prisma.movement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      products,
      stocks,
      users,
      purchases,
      transfers,
      movements
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
