
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar si existe otra forma de pago con el mismo nombre
    const existingFormaPago = await prisma.formaPago.findFirst({
      where: {
        nombre: nombre.trim(),
        NOT: { id: params.id }
      }
    });

    if (existingFormaPago) {
      return NextResponse.json({ error: 'Ya existe una forma de pago con ese nombre' }, { status: 400 });
    }

    // Verificar si la forma de pago existe
    const formaPago = await prisma.formaPago.findUnique({
      where: { id: params.id }
    });

    if (!formaPago) {
      return NextResponse.json({ error: 'Forma de pago no encontrada' }, { status: 404 });
    }

    // Actualizar la forma de pago
    const updatedFormaPago = await prisma.formaPago.update({
      where: { id: params.id },
      data: {
        nombre: nombre.trim(),
        comisionFija: parseFloat(comisionFija?.toString() || '0'),
        comisionPorcentaje: parseFloat(comisionPorcentaje?.toString() || '0'),
        comisionFijaCobradaCliente: parseFloat(comisionFijaCobradaCliente?.toString() || '0'),
        comisionPorcentajeCobradoCliente: parseFloat(comisionPorcentajeCobradoCliente?.toString() || '0'),
        activo: activo,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedFormaPago);
  } catch (error) {
    console.error('Error al actualizar forma de pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si la forma de pago existe
    const formaPago = await prisma.formaPago.findUnique({
      where: { id: params.id }
    });

    if (!formaPago) {
      return NextResponse.json({ error: 'Forma de pago no encontrada' }, { status: 404 });
    }

    // Verificar si está siendo usada en pedidos
    const pedidosCount = await prisma.pedido.count({
      where: { formaPagoId: params.id }
    });

    if (pedidosCount > 0) {
      return NextResponse.json({ 
        error: `No se puede eliminar la forma de pago porque está siendo utilizada en ${pedidosCount} pedido(s)` 
      }, { status: 400 });
    }

    // Eliminar la forma de pago
    await prisma.formaPago.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Forma de pago eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar forma de pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
