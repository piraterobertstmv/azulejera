
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

async function migrateHistoricalCommissions() {
  console.log('🚀 Iniciando migración de comisiones históricas...');

  try {
    // Obtener todos los pedidos que no tienen comisiones históricas asignadas
    const pedidosSinComisiones = await prisma.pedido.findMany({
      where: {
        OR: [
          { comisionFija: null },
          { comisionPorcentaje: null }
        ],
        formaPagoId: {
          not: null // Solo pedidos que tienen forma de pago asignada
        }
      },
      include: {
        formaPago: true
      }
    });

    console.log(`📊 Encontrados ${pedidosSinComisiones.length} pedidos sin comisiones históricas`);

    if (pedidosSinComisiones.length === 0) {
      console.log('✅ No hay pedidos que requieran migración');
      return;
    }

    let actualizados = 0;
    let errores = 0;

    // Actualizar cada pedido con las comisiones de su forma de pago
    for (const pedido of pedidosSinComisiones) {
      try {
        if (!pedido.formaPago) {
          console.log(`⚠️  Pedido ${pedido.numeroPedido} no tiene forma de pago válida, omitiendo`);
          continue;
        }

        await prisma.pedido.update({
          where: { id: pedido.id },
          data: {
            comisionFija: pedido.formaPago.comisionFija,
            comisionPorcentaje: pedido.formaPago.comisionPorcentaje
          }
        });

        console.log(`✅ Pedido ${pedido.numeroPedido}: Comisiones asignadas (${pedido.formaPago.comisionFija}€ + ${pedido.formaPago.comisionPorcentaje}%)`);
        actualizados++;

      } catch (error) {
        console.error(`❌ Error al actualizar pedido ${pedido.numeroPedido}:`, error);
        errores++;
      }
    }

    console.log('\n📈 Resumen de la migración:');
    console.log(`✅ Pedidos actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📊 Total procesados: ${pedidosSinComisiones.length}`);

    // Verificar resultados
    const pedidosConComisiones = await prisma.pedido.count({
      where: {
        comisionFija: { not: null },
        comisionPorcentaje: { not: null },
        formaPagoId: { not: null }
      }
    });

    console.log(`\n🎯 Pedidos con comisiones históricas después de la migración: ${pedidosConComisiones}`);

  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración si el script se llama directamente
if (require.main === module) {
  migrateHistoricalCommissions()
    .then(() => {
      console.log('🎉 Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 La migración falló:', error);
      process.exit(1);
    });
}

export default migrateHistoricalCommissions;
