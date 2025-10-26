
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const anio = searchParams.get('anio');

    if (!anio) {
      return NextResponse.json({ error: "Se requiere el parámetro 'anio'" }, { status: 400 });
    }

    const year = parseInt(anio);
    if (isNaN(year)) {
      return NextResponse.json({ error: "El año debe ser un número válido" }, { status: 400 });
    }

    // Obtener beneficios por mes del año especificado
    const fechaInicio = new Date(year, 0, 1); // 1 de enero
    const fechaFin = new Date(year + 1, 0, 1); // 1 de enero del año siguiente

    const pedidos = await db.pedido.findMany({
      where: {
        fechaPedido: {
          gte: fechaInicio,
          lt: fechaFin
        }
      },
      select: {
        fechaPedido: true,
        beneficio: true
      }
    });

    // Crear un objeto con todos los meses del año inicializados en 0
    const beneficiosPorMes: Record<string, number> = {};
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    // Inicializar todos los meses en 0
    meses.forEach((mes, index) => {
      const key = `${mes} ${year}`;
      beneficiosPorMes[key] = 0;
    });

    // Agrupar beneficios por mes
    pedidos.forEach(pedido => {
      const fecha = new Date(pedido.fechaPedido);
      const mesIndex = fecha.getMonth();
      const key = `${meses[mesIndex]} ${year}`;
      beneficiosPorMes[key] += Number(pedido.beneficio || 0);
    });

    // Convertir a formato para el gráfico
    const data = Object.entries(beneficiosPorMes).map(([name, value]) => ({
      name,
      value: Number(value)
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching beneficios por año:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
