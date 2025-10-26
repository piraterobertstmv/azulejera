
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      // CRÍTICO: Devolver array vacío en lugar de objeto error para mantener consistencia de tipo
      return NextResponse.json([], { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const transportistas = await prisma.transportista.findMany({
      where: {
        activo: true,
        nombre: {
          contains: search,
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Asegurar que siempre devolvamos un array válido
    const safeTransportistas = Array.isArray(transportistas) ? transportistas : [];
    
    return NextResponse.json(safeTransportistas);
  } catch (error) {
    console.error('Error al obtener transportistas:', error);
    // En caso de error, devolver un array vacío en lugar de un objeto error
    // para mantener consistencia en el tipo de respuesta
    return NextResponse.json([]);
  }
}
