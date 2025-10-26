
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { db } from '../../../../../lib/db';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar si el estado de pedido está siendo usado
    const usage = await db.pedido.count({
      where: {
        estadoPedidoId: params.id
      }
    });

    return NextResponse.json({ 
      inUse: usage > 0,
      usageCount: usage,
      message: usage > 0 ? `Este estado está siendo usado en ${usage} pedido(s)` : "Este estado no está siendo usado"
    });
  } catch (error) {
    console.error('Error checking estado usage:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
