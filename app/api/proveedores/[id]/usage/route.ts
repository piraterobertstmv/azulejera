
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

    // Verificar si el proveedor está siendo usado en pedidos o líneas de material
    const usageInPedidos = await db.pedido.count({
      where: {
        proveedorId: params.id
      }
    });

    const usageInLineas = await db.lineaMaterial.count({
      where: {
        proveedorId: params.id
      }
    });

    const totalUsage = usageInPedidos + usageInLineas;

    return NextResponse.json({ 
      inUse: totalUsage > 0,
      usageCount: totalUsage,
      usageDetails: {
        pedidos: usageInPedidos,
        lineasMaterial: usageInLineas
      },
      message: totalUsage > 0 ? `Este proveedor está siendo usado en ${usageInPedidos} pedido(s) y ${usageInLineas} línea(s) de material` : "Este proveedor no está siendo usado"
    });
  } catch (error) {
    console.error('Error checking proveedor usage:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
