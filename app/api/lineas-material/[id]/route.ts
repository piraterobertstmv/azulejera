
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { calcularEstadoAutomaticoPedido, debeActualizarEstadoPedido } from '../../../../lib/types';

export const dynamic = "force-dynamic";

// PATCH: Actualizar una línea de material específica
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Validar que la línea de material existe
    const lineaExistente = await prisma.lineaMaterial.findUnique({
      where: { id },
      include: { pedido: true }
    });

    if (!lineaExistente) {
      return NextResponse.json({ error: 'Línea de material no encontrada' }, { status: 404 });
    }

    // Preparar datos para actualización
    const updateData: any = {};

    // Mapear campos permitidos
    if (data.estadoPedidoId !== undefined) updateData.estadoPedidoId = data.estadoPedidoId;
    if (data.pedidoFabrica !== undefined) updateData.pedidoFabrica = data.pedidoFabrica;
    if (data.transportistaId !== undefined) updateData.transportistaId = data.transportistaId;
    if (data.fechaPedidoFabrica !== undefined) {
      updateData.fechaPedidoFabrica = data.fechaPedidoFabrica ? new Date(data.fechaPedidoFabrica) : null;
    }
    if (data.recibidaOC !== undefined) updateData.recibidaOC = data.recibidaOC;
    if (data.fechaOC !== undefined) {
      updateData.fechaOC = data.fechaOC ? new Date(data.fechaOC) : null;
    }
    if (data.seguimiento !== undefined) updateData.seguimiento = data.seguimiento;
    if (data.fechaEnvio !== undefined) {
      updateData.fechaEnvio = data.fechaEnvio ? new Date(data.fechaEnvio) : null;
    }
    if (data.fechaEntrega !== undefined) {
      updateData.fechaEntrega = data.fechaEntrega ? new Date(data.fechaEntrega) : null;
    }
    
    // Campos adicionales de precios y relaciones
    if (data.proveedorId !== undefined) updateData.proveedorId = data.proveedorId;
    if (data.formatoId !== undefined) updateData.formatoId = data.formatoId;
    if (data.pvpMaterial !== undefined) updateData.pvpMaterial = parseFloat(data.pvpMaterial) || 0;
    if (data.costeMaterial !== undefined) updateData.costeMaterial = parseFloat(data.costeMaterial) || 0;
    if (data.pvpTransporte !== undefined) updateData.pvpTransporte = parseFloat(data.pvpTransporte) || 0;
    if (data.costeTransporte !== undefined) updateData.costeTransporte = parseFloat(data.costeTransporte) || 0;
    
    // Calcular beneficios automáticamente si se actualizan los precios
    if (data.pvpMaterial !== undefined || data.costeMaterial !== undefined) {
      const pvp = data.pvpMaterial !== undefined ? parseFloat(data.pvpMaterial) : lineaExistente.pvpMaterial;
      const coste = data.costeMaterial !== undefined ? parseFloat(data.costeMaterial) : lineaExistente.costeMaterial;
      updateData.beneficioProducto = pvp - coste;
      updateData.porcentajeBeneficioProducto = pvp > 0 ? ((pvp - coste) / pvp) * 100 : 0;
    }

    // Actualizar la línea de material
    const lineaActualizada = await prisma.lineaMaterial.update({
      where: { id },
      data: updateData,
      include: {
        proveedor: true,
        formato: true,
        estadoPedido: true,
        transportista: true
      }
    });

    // Implementar lógica automática de estado del pedido
    const todasLasLineas = await prisma.lineaMaterial.findMany({
      where: { pedidoId: lineaExistente.pedidoId },
      include: { estadoPedido: true }
    });

    if (debeActualizarEstadoPedido(todasLasLineas as any)) {
      const estadoAutomatico = calcularEstadoAutomaticoPedido(todasLasLineas as any);
      
      if (estadoAutomatico) {
        // Buscar el ID del estado por nombre
        const estadoPedido = await prisma.estadoPedido.findFirst({
          where: { nombre: estadoAutomatico }
        });

        if (estadoPedido) {
          await prisma.pedido.update({
            where: { id: lineaExistente.pedidoId },
            data: { estadoPedidoId: estadoPedido.id }
          });
        }
      } else {
        // Si hay estados mixtos, quitar el estado del pedido
        await prisma.pedido.update({
          where: { id: lineaExistente.pedidoId },
          data: { estadoPedidoId: null }
        });
      }
    }

    return NextResponse.json(lineaActualizada);
  } catch (error) {
    console.error('Error actualizando línea de material:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET: Obtener una línea de material específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    const linea = await prisma.lineaMaterial.findUnique({
      where: { id },
      include: {
        proveedor: true,
        formato: true,
        estadoPedido: true,
        transportista: true,
        pedido: {
          include: {
            estadoPedido: true,
            incidencia: true,
            formaPago: true
          }
        }
      }
    });

    if (!linea) {
      return NextResponse.json({ error: 'Línea de material no encontrada' }, { status: 404 });
    }

    return NextResponse.json(linea);
  } catch (error) {
    console.error('Error obteniendo línea de material:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
