
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

    // Obtener el ID del estado "Pendiente"
    const estadoPendiente = await prisma.estadoPedido.findFirst({
      where: { nombre: "Pendiente" }
    });

    const [totalPedidos, beneficioTotal, pedidosConIncidencia, pedidosPendientes] = await Promise.all([
      prisma.pedido.count(),
      prisma.pedido.aggregate({
        _sum: {
          beneficio: true
        }
      }),
      prisma.pedido.count({
        where: {
          incidenciaId: {
            not: null
          }
        }
      }),
      prisma.pedido.count({
        where: {
          estadoPedidoId: estadoPendiente?.id
        }
      })
    ]);

    return NextResponse.json({
      totalPedidos,
      beneficioTotal: Number(beneficioTotal._sum.beneficio) || 0,
      pedidosConIncidencia,
      pedidosPendientes
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
