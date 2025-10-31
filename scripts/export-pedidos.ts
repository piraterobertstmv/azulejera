import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportPedidos() {
  console.log('📤 Exportando pedidos de SQLite...\n');

  try {
    // Fetch all pedidos with relations
    const pedidos = await prisma.pedido.findMany({
      include: {
        estadoPedido: true,
        formaPago: true,
        proveedor: true,
        formato: true,
        lineasMaterial: {
          include: {
            proveedor: true,
            formato: true,
          }
        }
      },
      orderBy: {
        fechaPedido: 'asc'
      }
    });

    console.log(`Total de pedidos encontrados: ${pedidos.length}\n`);

    // Transform to import format
    const exportData = pedidos.map(pedido => {
      // If has lineasMaterial, export each line as separate pedido
      if (pedido.lineasMaterial && pedido.lineasMaterial.length > 0) {
        return pedido.lineasMaterial.map((linea, index) => ({
          numeroPedido: pedido.lineasMaterial.length > 1 
            ? `${pedido.numeroPedido}-L${index + 1}` 
            : pedido.numeroPedido,
          fechaPedido: pedido.fechaPedido.toISOString(),
          cliente: pedido.cliente,
          estadoPedido: pedido.estadoPedido?.nombre,
          formaPago: pedido.formaPago?.nombre,
          proveedor: linea.proveedor?.nombre,
          material: linea.material,
          formato: linea.formato?.nombre,
          cajas: linea.cajas,
          piezas: linea.piezas,
          metrosCuadrados: linea.metrosCuadrados,
          pvpMaterial: linea.pvpMaterial,
          costeMaterial: linea.costeMaterial,
          pvpTransporte: linea.pvpTransporte,
          costeTransporte: linea.costeTransporte,
          factura: pedido.factura,
        }));
      } else {
        // Single line pedido
        return [{
          numeroPedido: pedido.numeroPedido,
          fechaPedido: pedido.fechaPedido.toISOString(),
          cliente: pedido.cliente,
          estadoPedido: pedido.estadoPedido?.nombre,
          formaPago: pedido.formaPago?.nombre,
          proveedor: pedido.proveedor?.nombre,
          material: pedido.material || undefined,
          formato: pedido.formato?.nombre,
          cajas: pedido.cajas,
          piezas: pedido.piezas,
          metrosCuadrados: pedido.metrosCuadrados,
          pvpMaterial: pedido.pvpMaterial,
          costeMaterial: pedido.costeMaterial,
          pvpTransporte: pedido.pvpTransporte,
          costeTransporte: pedido.costeTransporte,
          factura: pedido.factura,
        }];
      }
    }).flat();

    // Save to file
    const exportDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pedidos-export-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log(`✅ Exportación completada!`);
    console.log(`📁 Archivo guardado en: ${filepath}`);
    console.log(`📊 Total de registros exportados: ${exportData.length}\n`);

  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportPedidos();



