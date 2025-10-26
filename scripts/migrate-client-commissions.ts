
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateClientCommissions() {
  console.log('🔄 Iniciando migración de comisiones cobradas al cliente...');

  try {
    // Obtener todos los pedidos que no tienen comisiones cobradas al cliente
    const pedidosSinComisiones = await prisma.pedido.findMany({
      where: {
        OR: [
          { comisionFijaCobradaCliente: null },
          { comisionPorcentajeCobradoCliente: null },
        ]
      },
      include: {
        formaPago: true
      }
    });

    console.log(`📊 Encontrados ${pedidosSinComisiones.length} pedidos sin comisiones cobradas al cliente.`);

    let pedidosActualizados = 0;

    for (const pedido of pedidosSinComisiones) {
      try {
        let comisionFijaCobradaCliente = 0;
        let comisionPorcentajeCobradoCliente = 0;

        if (pedido.formaPago) {
          // Usar las comisiones actuales de la forma de pago
          comisionFijaCobradaCliente = pedido.formaPago.comisionFijaCobradaCliente || 0;
          comisionPorcentajeCobradoCliente = pedido.formaPago.comisionPorcentajeCobradoCliente || 0;
        }

        // Actualizar el pedido
        await prisma.pedido.update({
          where: { id: pedido.id },
          data: {
            comisionFijaCobradaCliente,
            comisionPorcentajeCobradoCliente,
          }
        });

        pedidosActualizados++;
        console.log(`✅ Pedido ${pedido.numeroPedido} actualizado con comisiones cobradas al cliente.`);
      } catch (error) {
        console.error(`❌ Error actualizando pedido ${pedido.numeroPedido}:`, error);
      }
    }

    console.log(`🎉 Migración completada. ${pedidosActualizados} pedidos actualizados.`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
migrateClientCommissions()
  .then(() => {
    console.log('✨ Migración de comisiones cobradas al cliente completada exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });
