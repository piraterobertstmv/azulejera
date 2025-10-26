
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const pedido = await db.pedido.findUnique({
      where: { id: params.id },
      include: {
        estadoPedido: true,
        incidencia: true,
        formaPago: true,
        proveedor: true,
        formato: true,
        lineasMaterial: {
          include: {
            proveedor: true,
            formato: true,
            estadoPedido: true,
            transportista: true,
          },
          orderBy: { orden: 'asc' }
        },
        pedidosTransportista: {
          include: {
            transportista: true,
          },
          orderBy: { orden: 'asc' }
        }
      }
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Error fetching pedido:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Verificar que el pedido existe
    const existingPedido = await db.pedido.findUnique({
      where: { id: params.id }
    });

    if (!existingPedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Verificar que no existe otro pedido con el mismo número
    if (data.numeroPedido !== existingPedido.numeroPedido) {
      const pedidoWithSameNumber = await db.pedido.findUnique({
        where: { numeroPedido: data.numeroPedido }
      });

      if (pedidoWithSameNumber) {
        return NextResponse.json(
          { error: "Ya existe un pedido con este número" },
          { status: 400 }
        );
      }
    }

    // Extraer líneas de material y campos que no pertenecen al modelo Pedido
    const { lineasMaterial, fechaEntrega, ...pedidoDataBase } = data;

    // Convertir IDs vacíos a null para las relaciones
    const cleanData = {
      ...pedidoDataBase,
      estadoPedidoId: pedidoDataBase.estadoPedidoId || null,
      incidenciaId: pedidoDataBase.incidenciaId || null,
      formaPagoId: pedidoDataBase.formaPagoId || null,
    };

    // Validar datos requeridos
    if (!cleanData.numeroPedido || !cleanData.cliente) {
      return NextResponse.json(
        { error: "Número de pedido y cliente son campos obligatorios" },
        { status: 400 }
      );
    }

    // Validar y convertir fechas a Date objects
    let fechaPedido: Date;
    try {
      fechaPedido = cleanData.fechaPedido ? new Date(cleanData.fechaPedido) : new Date();
      if (isNaN(fechaPedido.getTime())) {
        throw new Error("Fecha de pedido inválida");
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Fecha de pedido inválida" },
        { status: 400 }
      );
    }

    // Nota: fechaEntrega no es parte del modelo Pedido, solo de LineaMaterial
    // Si se necesita fechaEntrega, debe ser manejada en las líneas de material

    // Verificar si se está cambiando la forma de pago para capturar comisiones históricas
    let comisionFija = existingPedido.comisionFija; // Mantener comisiones existentes por defecto
    let comisionPorcentaje = existingPedido.comisionPorcentaje;
    let comisionFijaCobradaCliente = existingPedido.comisionFijaCobradaCliente;
    let comisionPorcentajeCobradoCliente = existingPedido.comisionPorcentajeCobradoCliente;
    
    // Si se está cambiando la forma de pago, obtener las comisiones actuales
    if (cleanData.formaPagoId !== existingPedido.formaPagoId) {
      if (cleanData.formaPagoId) {
        const formaPago = await db.formaPago.findUnique({
          where: { id: cleanData.formaPagoId }
        });
        
        if (formaPago) {
          comisionFija = formaPago.comisionFija;
          comisionPorcentaje = formaPago.comisionPorcentaje;
          comisionFijaCobradaCliente = formaPago.comisionFijaCobradaCliente;
          comisionPorcentajeCobradoCliente = formaPago.comisionPorcentajeCobradoCliente;
        }
      } else {
        // Si se está quitando la forma de pago, limpiar las comisiones
        comisionFija = null;
        comisionPorcentaje = null;
        comisionFijaCobradaCliente = null;
        comisionPorcentajeCobradoCliente = null;
      }
    }

    const pedidoData = {
      ...cleanData,
      fechaPedido,
      comisionFija,        // Actualizar comisión histórica de empresa si es necesario
      comisionPorcentaje,  // Actualizar comisión histórica de empresa si es necesario
      comisionFijaCobradaCliente,        // Actualizar comisión histórica cobrada al cliente si es necesario
      comisionPorcentajeCobradoCliente,  // Actualizar comisión histórica cobrada al cliente si es necesario
    };

    // Actualizar el pedido con las líneas de material en una transacción
    const pedido = await db.$transaction(async (tx) => {
      // Actualizar el pedido principal
      const pedidoActualizado = await tx.pedido.update({
        where: { id: params.id },
        data: pedidoData,
      });

      // Manejar líneas de material
      if (lineasMaterial && lineasMaterial.length > 0) {
        // Eliminar todas las líneas existentes
        await tx.lineaMaterial.deleteMany({
          where: { pedidoId: params.id }
        });

        // Crear las nuevas líneas de material con validación
        const lineasData = lineasMaterial.map((linea: any, index: number) => {
          // Validar y parsear fechas de línea de material
          const parseFecha = (fecha: any) => {
            if (!fecha) return null;
            try {
              const parsedDate = new Date(fecha);
              return isNaN(parsedDate.getTime()) ? null : parsedDate;
            } catch {
              return null;
            }
          };

          return {
            pedidoId: params.id,
            orden: index + 1,
            proveedorId: linea.proveedorId || null,
            material: linea.material || '',
            formatoId: linea.formatoId || null,
            cajas: parseInt(String(linea.cajas)) || 0,
            piezas: parseInt(String(linea.piezas)) || 0,
            metrosCuadrados: parseFloat(String(linea.metrosCuadrados)) || 0,
            pvpMaterial: parseFloat(String(linea.pvpMaterial)) || 0,
            costeMaterial: parseFloat(String(linea.costeMaterial)) || 0,
            // CORRECCIÓN: Incluir campos de transporte
            pvpTransporte: parseFloat(String(linea.pvpTransporte)) || 0,
            costeTransporte: parseFloat(String(linea.costeTransporte)) || 0,
            transportistaId: linea.transportistaId || null,
            fechaPedidoFabrica: parseFecha(linea.fechaPedidoFabrica),
            recibidaOC: Boolean(linea.recibidaOC),
            fechaOC: parseFecha(linea.fechaOC),
            seguimiento: linea.seguimiento || null,
            fechaEnvio: parseFecha(linea.fechaEnvio),
            beneficioProducto: parseFloat(String(linea.beneficioProducto)) || 0,
            porcentajeBeneficioProducto: parseFloat(String(linea.porcentajeBeneficioProducto)) || 0,
          };
        });

        await tx.lineaMaterial.createMany({
          data: lineasData
        });
      }

      // Devolver el pedido completo con las líneas actualizadas
      return await tx.pedido.findUnique({
        where: { id: params.id },
        include: {
          estadoPedido: true,
          incidencia: true,
          formaPago: true,
          proveedor: true,
          formato: true,
          lineasMaterial: {
            include: {
              proveedor: true,
              formato: true,
              transportista: true,
            },
            orderBy: { orden: 'asc' }
          },
        }
      });
    });

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Error updating pedido:", error);
    
    // Proporcionar mensajes de error más específicos
    let errorMessage = "Error interno del servidor";
    
    if (error instanceof Error) {
      // Log the specific error for debugging
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        pedidoId: params.id
      });
      
      // Provide more specific error messages based on error type
      if (error.message.includes('Unique constraint')) {
        errorMessage = "Ya existe un pedido con este número";
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = "Error en las relaciones de datos. Verifica los IDs de proveedor, estado, etc.";
      } else if (error.message.includes('Required')) {
        errorMessage = "Faltan campos obligatorios";
      } else if (error.message.includes('Date')) {
        errorMessage = "Error en el formato de fecha";
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo administradores pueden eliminar pedidos
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const pedido = await db.pedido.findUnique({
      where: { id: params.id }
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    await db.pedido.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting pedido:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
