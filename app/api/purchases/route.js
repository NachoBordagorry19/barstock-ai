import { NextResponse } from 'next/server';
import { serverStockService } from '@/lib/services/serverStockService';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    // Registrar compra y actualizar stocks a nivel de dominio y persistencia
    const result = await serverStockService.registerPurchase(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const { id } = await request.json();
    const result = await prisma.purchase.update({
      where: { id },
      data: { paymentStatus: 'pagado' }
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
