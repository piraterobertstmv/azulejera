
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

    // Verificar si la incidencia está siendo usada
    const usage = await db.pedido.count({
      where: {
        incidenciaId: params.id
      }
    });

    return NextResponse.json({ 
      inUse: usage > 0,
      usageCount: usage,
      message: usage > 0 ? `Esta incidencia está siendo usada en ${usage} pedido(s)` : "Esta incidencia no está siendo usada"
    });
  } catch (error) {
    console.error('Error checking incidencia usage:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
