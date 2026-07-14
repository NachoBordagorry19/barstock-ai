import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { action, id, data } = await request.json();

    if (action === 'create') {
      const { name, category, barcode, sealed, open, price } = data;
      const cost = Math.round(price / 1.20);
      const stockTotal = Number(sealed || 0) + Number(open || 0);

      // Crear producto
      const product = await prisma.product.create({
        data: {
          id,
          name,
          category,
          barcode,
          stock: stockTotal,
          cost,
          marginPercent: 20,
          price: Number(price || 0),
        }
      });

      // Crear stocks iniciales
      await prisma.stockItem.createMany({
        data: [
          { productId: id, location: 'depósito', quantity: Number(sealed || 0) },
          { productId: id, location: 'barra', quantity: Number(open || 0) },
        ]
      });

      return NextResponse.json({ success: true, product });
    }

    if (action === 'update') {
      const { name, category, barcode, sealed, open, price } = data;
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (category !== undefined) updateData.category = category;
      if (barcode !== undefined) updateData.barcode = barcode;
      if (price !== undefined) {
        updateData.price = Number(price);
        updateData.cost = Math.round(Number(price) / 1.20);
      }

      // Si sealed u open cambian, recalcular stockTotal
      const currentProduct = await prisma.product.findUnique({ where: { id } });
      if (!currentProduct) {
        return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
      }

      const currentDepositStock = await prisma.stockItem.findUnique({
        where: { productId_location: { productId: id, location: 'depósito' } }
      });
      const currentBarStock = await prisma.stockItem.findUnique({
        where: { productId_location: { productId: id, location: 'barra' } }
      });

      const nextSealed = sealed !== undefined ? Number(sealed) : (currentDepositStock?.quantity || 0);
      const nextOpen = open !== undefined ? Number(open) : (currentBarStock?.quantity || 0);
      updateData.stock = nextSealed + nextOpen;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      if (sealed !== undefined) {
        await prisma.stockItem.upsert({
          where: { productId_location: { productId: id, location: 'depósito' } },
          update: { quantity: Number(sealed) },
          create: { productId: id, location: 'depósito', quantity: Number(sealed) }
        });
      }

      if (open !== undefined) {
        await prisma.stockItem.upsert({
          where: { productId_location: { productId: id, location: 'barra' } },
          update: { quantity: Number(open) },
          create: { productId: id, location: 'barra', quantity: Number(open) }
        });
      }

      return NextResponse.json({ success: true, product });
    }

    if (action === 'scan') {
      const { state } = data;
      const location = state === 'cerrada' ? 'depósito' : state === 'abierta' ? 'barra' : null;
      
      if (location) {
        const currentStock = await prisma.stockItem.findUnique({
          where: { productId_location: { productId: id, location } }
        });
        const nextQty = (currentStock?.quantity || 0) + 1;

        await prisma.stockItem.upsert({
          where: { productId_location: { productId: id, location } },
          update: { quantity: nextQty },
          create: { productId: id, location, quantity: nextQty }
        });

        // Actualizar total stock en producto
        const otherLocation = location === 'depósito' ? 'barra' : 'depósito';
        const otherStock = await prisma.stockItem.findUnique({
          where: { productId_location: { productId: id, location: otherLocation } }
        });
        const total = nextQty + (otherStock?.quantity || 0);

        await prisma.product.update({
          where: { id },
          data: { stock: total }
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
