
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { field, value, excludeId } = await request.json();

    if (!field || !value) {
      return NextResponse.json({ error: 'Campo y valor requeridos' }, { status: 400 });
    }

    let isValid = true;
    let message = '';

    if (field === 'numeroPedido') {
      const existing = await prisma.pedido.findFirst({
        where: {
          numeroPedido: value,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      if (existing) {
        isValid = false;
        message = 'Este número de pedido ya existe';
      }
    } else if (field === 'factura') {
      const existing = await prisma.pedido.findFirst({
        where: {
          factura: value,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      if (existing) {
        isValid = false;
        message = 'Este número de factura ya existe';
      }
    }

    return NextResponse.json({ isValid, message });
  } catch (error) {
    console.error('Error en validación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
