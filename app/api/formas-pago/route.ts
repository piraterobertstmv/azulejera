
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formasPago = await prisma.formaPago.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(formasPago);
  } catch (error) {
    console.error('Error al obtener formas de pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      nombre, 
      comisionFija, 
      comisionPorcentaje, 
      comisionFijaCobradaCliente, 
      comisionPorcentajeCobradoCliente, 
      activo 
    } = data;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    if (comisionFija < 0) {
      return NextResponse.json({ error: 'La comisión fija de empresa no puede ser negativa' }, { status: 400 });
    }

    if (comisionPorcentaje < 0 || comisionPorcentaje > 100) {
      return NextResponse.json({ error: 'La comisión en porcentaje de empresa debe estar entre 0 y 100' }, { status: 400 });
    }

    if (comisionFijaCobradaCliente < 0) {
      return NextResponse.json({ error: 'La comisión fija cobrada al cliente no puede ser negativa' }, { status: 400 });
    }

    if (comisionPorcentajeCobradoCliente < 0 || comisionPorcentajeCobradoCliente > 100) {
      return NextResponse.json({ error: 'La comisión en porcentaje cobrada al cliente debe estar entre 0 y 100' }, { status: 400 });
    }

    // Verificar si ya existe una forma de pago con el mismo nombre
    const existingFormaPago = await prisma.formaPago.findFirst({
      where: { nombre: nombre.trim() }
    });

    if (existingFormaPago) {
      return NextResponse.json({ error: 'Ya existe una forma de pago con ese nombre' }, { status: 400 });
    }

    // Crear la nueva forma de pago
    const newFormaPago = await prisma.formaPago.create({
      data: {
        nombre: nombre.trim(),
        comisionFija: parseFloat(comisionFija?.toString() || '0'),
        comisionPorcentaje: parseFloat(comisionPorcentaje?.toString() || '0'),
        comisionFijaCobradaCliente: parseFloat(comisionFijaCobradaCliente?.toString() || '0'),
        comisionPorcentajeCobradoCliente: parseFloat(comisionPorcentajeCobradoCliente?.toString() || '0'),
        activo: activo ?? true
      }
    });

    return NextResponse.json(newFormaPago, { status: 201 });
  } catch (error) {
    console.error('Error al crear forma de pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
