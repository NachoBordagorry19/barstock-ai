import { NextResponse } from 'next/server';
import { serverStockService } from '@/lib/services/serverStockService';

export async function POST(request) {
  try {
    const { transferId, userId } = await request.json();
    // Confirmar la recepción del traslado
    const result = await serverStockService.confirmTransfer(transferId, userId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
