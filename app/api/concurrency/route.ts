
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export const dynamic = "force-dynamic";

// Bloquear un pedido para edición
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { pedidoId } = await request.json();

    if (!pedidoId) {
      return NextResponse.json({ error: 'ID de pedido requerido' }, { status: 400 });
    }

    // Verificar si el pedido ya está bloqueado por otro usuario
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Si está bloqueado por otro usuario y el bloqueo es reciente (menos de 30 minutos)
    if (
      pedido.bloqueadoPorUsuario &&
      pedido.bloqueadoPorUsuario !== session.user.email &&
      pedido.fechaBloqueo &&
      new Date().getTime() - new Date(pedido.fechaBloqueo).getTime() < 30 * 60 * 1000
    ) {
      return NextResponse.json({
        error: 'El pedido está siendo editado por otro usuario',
        bloqueadoPor: pedido.bloqueadoPorUsuario,
      }, { status: 409 });
    }

    // Bloquear el pedido para el usuario actual
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        bloqueadoPorUsuario: session.user.email,
        fechaBloqueo: new Date(),
      },
    });

    return NextResponse.json({ message: 'Pedido bloqueado exitosamente' });
  } catch (error) {
    console.error('Error al bloquear pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Desbloquear un pedido
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get('pedidoId');

    if (!pedidoId) {
      return NextResponse.json({ error: 'ID de pedido requerido' }, { status: 400 });
    }

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        bloqueadoPorUsuario: null,
        fechaBloqueo: null,
      },
    });

    return NextResponse.json({ message: 'Pedido desbloqueado exitosamente' });
  } catch (error) {
    console.error('Error al desbloquear pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
