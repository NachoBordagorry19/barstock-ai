import { NextResponse } from 'next/server';
import { serverStockService } from '@/lib/services/serverStockService';

export async function POST(request) {
  try {
    const body = await request.json();
    // Despachar traslado de mercadería
    const result = await serverStockService.dispatchTransfer(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
