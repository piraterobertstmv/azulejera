
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
    const limit = parseInt(searchParams.get('limit') || '20');

    const formatos = await prisma.formato.findMany({
      where: {
        activo: true,
        nombre: {
          contains: search,
        },
      },
      orderBy: {
        nombre: 'asc',
      },
      take: limit,
    });

    // Asegurar que siempre devolvamos un array válido
    const safeFormatos = Array.isArray(formatos) ? formatos : [];
    
    return NextResponse.json(safeFormatos);
  } catch (error) {
    console.error('Error al obtener formatos:', error);
    // En caso de error, devolver un array vacío en lugar de un objeto error
    // para mantener consistencia en el tipo de respuesta
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const data = await request.json();
    const { nombre } = data;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const formato = await prisma.formato.create({
      data: { nombre },
    });

    return NextResponse.json(formato, { status: 201 });
  } catch (error) {
    console.error('Error al crear formato:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
