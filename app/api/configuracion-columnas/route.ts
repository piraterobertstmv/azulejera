
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const configuracion = await db.configuracionColumnas.findMany({
      where: { userId: session.user.id },
      orderBy: { orden: 'asc' }
    });

    return NextResponse.json(configuracion);
  } catch (error) {
    console.error("Error fetching configuracion columnas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const configuraciones = await request.json();

    // Eliminar configuración existente del usuario
    await db.configuracionColumnas.deleteMany({
      where: { userId: session.user.id }
    });

    // Crear nueva configuración
    if (configuraciones && configuraciones.length > 0) {
      await db.configuracionColumnas.createMany({
        data: configuraciones.map((config: any) => ({
          userId: session.user.id,
          columna: config.columna,
          orden: config.orden,
          visible: config.visible
        }))
      });
    }

    return NextResponse.json({ message: "Configuración guardada" });
  } catch (error) {
    console.error("Error saving configuracion columnas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
