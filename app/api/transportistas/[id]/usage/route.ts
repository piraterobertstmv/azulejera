
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

    // Verificar si el transportista está siendo usado en líneas de material o pedidos de transportista
    const usageInLineas = await db.lineaMaterial.count({
      where: {
        transportistaId: params.id
      }
    });

    const usageInPedidosTransportista = await db.pedidoTransportista.count({
      where: {
        transportistaId: params.id
      }
    });

    const totalUsage = usageInLineas + usageInPedidosTransportista;

    return NextResponse.json({ 
      inUse: totalUsage > 0,
      usageCount: totalUsage,
      usageDetails: {
        lineasMaterial: usageInLineas,
        pedidosTransportista: usageInPedidosTransportista
      },
      message: totalUsage > 0 ? `Este transportista está siendo usado en ${usageInLineas} línea(s) de material y ${usageInPedidosTransportista} pedido(s) de transportista` : "Este transportista no está siendo usado"
    });
  } catch (error) {
    console.error('Error checking transportista usage:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
