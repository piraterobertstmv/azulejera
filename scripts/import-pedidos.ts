import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PedidoImport {
  numeroPedido: string;
  fechaPedido: string;
  cliente: string;
  estadoPedido?: string;
  formaPago?: string;
  proveedor?: string;
  material?: string;
  formato?: string;
  cajas?: number;
  piezas?: number;
  metrosCuadrados?: number;
  pvpMaterial?: number;
  costeMaterial?: number;
  pvpTransporte?: number;
  costeTransporte?: number;
  factura?: string;
  observaciones?: string;
}

async function importPedidos(jsonFilePath: string) {
  console.log('📥 Iniciando importación de pedidos...\n');

  // Leer archivo JSON
  const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
  const pedidos: PedidoImport[] = JSON.parse(fileContent);

  console.log(`Total de pedidos a importar: ${pedidos.length}\n`);

  let importados = 0;
  let errores = 0;

  for (const pedido of pedidos) {
    try {
      // Buscar o crear proveedor
      let proveedorId = null;
      if (pedido.proveedor) {
        const proveedor = await prisma.proveedor.upsert({
          where: { nombre: pedido.proveedor },
          update: {},
          create: { nombre: pedido.proveedor, activo: true },
        });
        proveedorId = proveedor.id;
      }

      // Buscar o crear formato
      let formatoId = null;
      if (pedido.formato) {
        const formato = await prisma.formato.upsert({
          where: { nombre: pedido.formato },
          update: {},
          create: { nombre: pedido.formato, activo: true },
        });
        formatoId = formato.id;
      }

      // Buscar estado de pedido
      let estadoPedidoId = null;
      if (pedido.estadoPedido) {
        const estado = await prisma.estadoPedido.findFirst({
          where: { nombre: { contains: pedido.estadoPedido } },
        });
        estadoPedidoId = estado?.id;
      }

      // Buscar forma de pago
      let formaPagoId = null;
      if (pedido.formaPago) {
        const formaPago = await prisma.formaPago.findFirst({
          where: { nombre: { contains: pedido.formaPago } },
        });
        formaPagoId = formaPago?.id;
      }

      // Calcular totales
      const pvpMaterial = pedido.pvpMaterial || 0;
      const costeMaterial = pedido.costeMaterial || 0;
      const pvpTransporte = pedido.pvpTransporte || 0;
      const costeTransporte = pedido.costeTransporte || 0;

      const beneficioProducto = pvpMaterial - costeMaterial;
      const beneficioTransporte = pvpTransporte - costeTransporte;
      const beneficio = beneficioProducto + beneficioTransporte;
      const pvpTotalPedido = pvpMaterial + pvpTransporte;

      const porcentajeBeneficioProducto = pvpMaterial > 0 ? (beneficioProducto / pvpMaterial) * 100 : 0;
      const porcentajeBeneficioTransporte = pvpTransporte > 0 ? (beneficioTransporte / pvpTransporte) * 100 : 0;
      const porcentajeBeneficio = pvpTotalPedido > 0 ? (beneficio / pvpTotalPedido) * 100 : 0;

      // Crear pedido con línea de material (modo detallado)
      const nuevoPedido = await prisma.pedido.create({
        data: {
          numeroPedido: pedido.numeroPedido,
          fechaPedido: new Date(pedido.fechaPedido),
          cliente: pedido.cliente,
          estadoPedidoId,
          formaPagoId,
          factura: pedido.factura,
          observaciones: pedido.observaciones,
          pvpTotalPedido,
          beneficioProducto,
          beneficioTransporte,
          beneficio,
          porcentajeBeneficioProducto,
          porcentajeBeneficioTransporte,
          porcentajeBeneficio,
          modoAgrupado: false, // Modo detallado con líneas de material
          // Crear línea de material
          lineasMaterial: {
            create: {
              material: pedido.material,
              formato: formatoId ? { connect: { id: formatoId } } : undefined,
              proveedor: proveedorId ? { connect: { id: proveedorId } } : undefined,
              cajas: pedido.cajas || 0,
              piezas: pedido.piezas || 0,
              metrosCuadrados: pedido.metrosCuadrados || 0,
              pvpMaterial,
              costeMaterial,
              pvpTransporte,
              costeTransporte,
            }
          }
        },
      });

      importados++;
      console.log(`✅ Importado: ${pedido.numeroPedido}`);
    } catch (error) {
      errores++;
      console.error(`❌ Error en ${pedido.numeroPedido}:`, error);
    }
  }

  console.log(`\n📊 Resumen de importación:`);
  console.log(`   ✅ Importados exitosamente: ${importados}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📦 Total: ${pedidos.length}`);
}

// Ejecutar importación
const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  console.error('❌ Error: Debes proporcionar la ruta del archivo JSON');
  console.log('\nUso: npm run import <ruta-del-archivo.json>');
  console.log('Ejemplo: npm run import ./data/pedidos.json');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ Error: El archivo ${filePath} no existe`);
  process.exit(1);
}

importPedidos(filePath)
  .then(() => {
    console.log('\n✅ Importación completada!');
  })
  .catch((error) => {
    console.error('❌ Error fatal en la importación:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

