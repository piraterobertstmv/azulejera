
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

    const pedidos = await db.pedido.findMany({
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
        pedidosTransportista: {
          include: {
            transportista: true,
          },
          orderBy: { orden: 'asc' }
        }
      },
      orderBy: {
        fechaPedido: 'desc'
      }
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error fetching pedidos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs válido" },
        { status: 400 }
      );
    }

    // Eliminar pedidos en una transacción para asegurar consistencia
    const result = await db.$transaction(async (tx) => {
      // Primero eliminar líneas de material relacionadas
      await tx.lineaMaterial.deleteMany({
        where: {
          pedidoId: {
            in: ids
          }
        }
      });

      // Luego eliminar pedidos de transportista relacionados
      await tx.pedidoTransportista.deleteMany({
        where: {
          pedidoId: {
            in: ids
          }
        }
      });

      // Finalmente eliminar los pedidos
      const deletedPedidos = await tx.pedido.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });

      return deletedPedidos;
    });

    return NextResponse.json({ 
      message: `${result.count} pedidos eliminados correctamente`,
      deletedCount: result.count 
    });
  } catch (error) {
    console.error("Error deleting pedidos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Verificar que no existe un pedido con el mismo número
    const existingPedido = await db.pedido.findUnique({
      where: { numeroPedido: data.numeroPedido }
    });

    if (existingPedido) {
      return NextResponse.json(
        { error: "Ya existe un pedido con este número" },
        { status: 400 }
      );
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

    // Obtener las comisiones actuales de la forma de pago (si existe)
    let comisionFija = null;
    let comisionPorcentaje = null;
    let comisionFijaCobradaCliente = null;
    let comisionPorcentajeCobradoCliente = null;
    
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
    }

    const pedidoData = {
      ...cleanData,
      fechaPedido,
      comisionFija,        // Guardar comisión histórica de empresa
      comisionPorcentaje,  // Guardar comisión histórica de empresa
      comisionFijaCobradaCliente,        // Guardar comisión histórica cobrada al cliente
      comisionPorcentajeCobradoCliente,  // Guardar comisión histórica cobrada al cliente
    };

    // Crear el pedido con las líneas de material en una transacción
    const pedido = await db.$transaction(async (tx) => {
      // Crear el pedido principal
      const nuevoPedido = await tx.pedido.create({
        data: pedidoData,
        include: {
          estadoPedido: true,
          incidencia: true,
          formaPago: true,
          proveedor: true,
          formato: true,
        }
      });

      // Crear las líneas de material si existen
      if (lineasMaterial && lineasMaterial.length > 0) {
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
            pedidoId: nuevoPedido.id,
            orden: index + 1,
            proveedorId: linea.proveedorId || null,
            material: linea.material || '',
            formatoId: linea.formatoId || null,
            cajas: parseInt(String(linea.cajas)) || 0,
            piezas: parseInt(String(linea.piezas)) || 0,
            metrosCuadrados: parseFloat(String(linea.metrosCuadrados)) || 0,
            pvpMaterial: parseFloat(String(linea.pvpMaterial)) || 0,
            costeMaterial: parseFloat(String(linea.costeMaterial)) || 0,
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

      // Devolver el pedido completo con las líneas creadas
      return await tx.pedido.findUnique({
        where: { id: nuevoPedido.id },
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

    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error("Error creating pedido:", error);
    
    // Proporcionar mensajes de error más específicos
    let errorMessage = "Error interno del servidor";
    
    if (error instanceof Error) {
      // Log the specific error for debugging
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
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
