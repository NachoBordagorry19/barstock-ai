import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { action, id, data } = await request.json();

    if (action === 'create') {
      const { name, role, active } = data;
      const user = await prisma.user.create({
        data: {
          id,
          name,
          role,
          active: active !== undefined ? active : true,
        }
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === 'update') {
      const { name, role, active } = data;
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (active !== undefined) updateData.active = active;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
