
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener beneficios por mes de los últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const pedidos = await db.pedido.findMany({
      where: {
        fechaPedido: {
          gte: sixMonthsAgo
        }
      },
      select: {
        fechaPedido: true,
        beneficio: true
      }
    });

    // Agrupar por mes
    const beneficiosPorMes = pedidos.reduce((acc: Record<string, number>, pedido) => {
      const mes = pedido.fechaPedido.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[mes]) {
        acc[mes] = 0;
      }
      acc[mes] += Number(pedido.beneficio);
      return acc;
    }, {});

    const data = Object.entries(beneficiosPorMes).map(([name, value]) => ({
      name,
      value: Number(value)
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching beneficios:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
