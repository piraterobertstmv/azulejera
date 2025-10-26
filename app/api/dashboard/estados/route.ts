
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const estadosPedidos = await prisma.pedido.groupBy({
      by: ['estadoPedidoId'],
      _count: {
        id: true
      },
      where: {
        estadoPedidoId: {
          not: null
        }
      }
    });

    // Obtener los nombres de los estados
    const estadoIds = estadosPedidos.map(e => e.estadoPedidoId).filter(Boolean);
    const estadosInfo = await prisma.estadoPedido.findMany({
      where: {
        id: {
          in: estadoIds as string[]
        }
      }
    });

    const data = estadosPedidos.map((estado) => {
      const estadoInfo = estadosInfo.find(e => e.id === estado.estadoPedidoId);
      return {
        name: estadoInfo?.nombre || 'Sin estado',
        value: estado._count.id
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching estados:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
