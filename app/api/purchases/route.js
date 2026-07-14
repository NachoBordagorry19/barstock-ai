import { NextResponse } from 'next/server';
import { serverStockService } from '@/lib/services/serverStockService';

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
