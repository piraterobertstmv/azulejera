import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Function to escape single quotes in SQL strings
function escapeSql(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  return String(value);
}

async function exportToSql() {
  console.log('🚀 Starting SQL export...\n');
  
  const sqlLines: string[] = [];
  
  // Add header
  sqlLines.push('-- ========================================');
  sqlLines.push('-- Cursor Business Manager - Complete Database Export');
  sqlLines.push(`-- Generated: ${new Date().toISOString()}`);
  sqlLines.push('-- ========================================\n');
  
  sqlLines.push('-- Disable triggers and constraints during import');
  sqlLines.push('SET session_replication_role = replica;\n');
  
  try {
    // Export Users
    console.log('📦 Exporting Users...');
    const users = await prisma.user.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Users (${users.length} records)`);
    sqlLines.push('-- ========================================');
    for (const user of users) {
      sqlLines.push(
        `INSERT INTO "User" (id, name, email, password, role, "emailVerified", image, "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(user.id)}, ${escapeSql(user.name)}, ${escapeSql(user.email)}, ` +
        `${escapeSql(user.password)}, ${escapeSql(user.role)}, ${escapeSql(user.emailVerified)}, ` +
        `${escapeSql(user.image)}, ${escapeSql(user.createdAt)}, ${escapeSql(user.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export Proveedores
    console.log('📦 Exporting Proveedores...');
    const proveedores = await prisma.proveedor.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Proveedores (${proveedores.length} records)`);
    sqlLines.push('-- ========================================');
    for (const proveedor of proveedores) {
      sqlLines.push(
        `INSERT INTO "Proveedor" (id, nombre, activo, "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(proveedor.id)}, ${escapeSql(proveedor.nombre)}, ` +
        `${escapeSql(proveedor.activo)}, ${escapeSql(proveedor.createdAt)}, ${escapeSql(proveedor.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export Formatos
    console.log('📦 Exporting Formatos...');
    const formatos = await prisma.formato.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Formatos (${formatos.length} records)`);
    sqlLines.push('-- ========================================');
    for (const formato of formatos) {
      sqlLines.push(
        `INSERT INTO "Formato" (id, nombre, activo, "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(formato.id)}, ${escapeSql(formato.nombre)}, ` +
        `${escapeSql(formato.activo)}, ${escapeSql(formato.createdAt)}, ${escapeSql(formato.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export FormasPago
    console.log('📦 Exporting Formas de Pago...');
    const formasPago = await prisma.formaPago.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Formas de Pago (${formasPago.length} records)`);
    sqlLines.push('-- ========================================');
    for (const formaPago of formasPago) {
      sqlLines.push(
        `INSERT INTO "FormaPago" (id, nombre, activo, "comisionFija", "comisionPorcentaje", "comisionFijaCobradaCliente", "comisionPorcentajeCobradoCliente", "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(formaPago.id)}, ${escapeSql(formaPago.nombre)}, ${escapeSql(formaPago.activo)}, ` +
        `${escapeSql(formaPago.comisionFija)}, ${escapeSql(formaPago.comisionPorcentaje)}, ` +
        `${escapeSql(formaPago.comisionFijaCobradaCliente)}, ${escapeSql(formaPago.comisionPorcentajeCobradoCliente)}, ` +
        `${escapeSql(formaPago.createdAt)}, ${escapeSql(formaPago.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export EstadosPedido
    console.log('📦 Exporting Estados de Pedido...');
    const estados = await prisma.estadoPedido.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Estados de Pedido (${estados.length} records)`);
    sqlLines.push('-- ========================================');
    for (const estado of estados) {
      sqlLines.push(
        `INSERT INTO "EstadoPedido" (id, nombre, activo, "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(estado.id)}, ${escapeSql(estado.nombre)}, ` +
        `${escapeSql(estado.activo)}, ${escapeSql(estado.createdAt)}, ${escapeSql(estado.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export Incidencias
    console.log('📦 Exporting Incidencias...');
    const incidencias = await prisma.incidencia.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Incidencias (${incidencias.length} records)`);
    sqlLines.push('-- ========================================');
    for (const incidencia of incidencias) {
      sqlLines.push(
        `INSERT INTO "Incidencia" (id, nombre, activo, "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(incidencia.id)}, ${escapeSql(incidencia.nombre)}, ` +
        `${escapeSql(incidencia.activo)}, ${escapeSql(incidencia.createdAt)}, ${escapeSql(incidencia.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export Transportistas
    console.log('📦 Exporting Transportistas...');
    const transportistas = await prisma.transportista.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Transportistas (${transportistas.length} records)`);
    sqlLines.push('-- ========================================');
    for (const transportista of transportistas) {
      sqlLines.push(
        `INSERT INTO "Transportista" (id, nombre, activo, "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(transportista.id)}, ${escapeSql(transportista.nombre)}, ` +
        `${escapeSql(transportista.activo)}, ${escapeSql(transportista.createdAt)}, ${escapeSql(transportista.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export Pedidos
    console.log('📦 Exporting Pedidos...');
    const pedidos = await prisma.pedido.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Pedidos (${pedidos.length} records)`);
    sqlLines.push('-- ========================================');
    for (const pedido of pedidos) {
      sqlLines.push(
        `INSERT INTO "Pedido" (id, "numeroPedido", "estadoPedidoId", "incidenciaId", "formaPagoId", factura, "fechaPedido", cliente, ` +
        `"comisionFija", "comisionPorcentaje", "comisionFijaCobradaCliente", "comisionPorcentajeCobradoCliente", ` +
        `"proveedorId", material, "formatoId", cajas, piezas, "metrosCuadrados", "pvpMaterial", "costeMaterial", ` +
        `"pvpTotalPedido", "beneficioProducto", "porcentajeBeneficioProducto", "cobradoExtraPaypal", "fechaEntrega", ` +
        `"pvpTransporte", "costeTransporte", "beneficioTransporte", "porcentajeBeneficioTransporte", beneficio, "porcentajeBeneficio", ` +
        `"bloqueadoPorUsuario", "fechaBloqueo", "modoAgrupado", "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(pedido.id)}, ${escapeSql(pedido.numeroPedido)}, ${escapeSql(pedido.estadoPedidoId)}, ` +
        `${escapeSql(pedido.incidenciaId)}, ${escapeSql(pedido.formaPagoId)}, ${escapeSql(pedido.factura)}, ` +
        `${escapeSql(pedido.fechaPedido)}, ${escapeSql(pedido.cliente)}, ${escapeSql(pedido.comisionFija)}, ` +
        `${escapeSql(pedido.comisionPorcentaje)}, ${escapeSql(pedido.comisionFijaCobradaCliente)}, ` +
        `${escapeSql(pedido.comisionPorcentajeCobradoCliente)}, ${escapeSql(pedido.proveedorId)}, ` +
        `${escapeSql(pedido.material)}, ${escapeSql(pedido.formatoId)}, ${escapeSql(pedido.cajas)}, ` +
        `${escapeSql(pedido.piezas)}, ${escapeSql(pedido.metrosCuadrados)}, ${escapeSql(pedido.pvpMaterial)}, ` +
        `${escapeSql(pedido.costeMaterial)}, ${escapeSql(pedido.pvpTotalPedido)}, ${escapeSql(pedido.beneficioProducto)}, ` +
        `${escapeSql(pedido.porcentajeBeneficioProducto)}, ${escapeSql(pedido.cobradoExtraPaypal)}, ` +
        `${escapeSql(pedido.fechaEntrega)}, ${escapeSql(pedido.pvpTransporte)}, ${escapeSql(pedido.costeTransporte)}, ` +
        `${escapeSql(pedido.beneficioTransporte)}, ${escapeSql(pedido.porcentajeBeneficioTransporte)}, ` +
        `${escapeSql(pedido.beneficio)}, ${escapeSql(pedido.porcentajeBeneficio)}, ${escapeSql(pedido.bloqueadoPorUsuario)}, ` +
        `${escapeSql(pedido.fechaBloqueo)}, ${escapeSql(pedido.modoAgrupado)}, ${escapeSql(pedido.createdAt)}, ` +
        `${escapeSql(pedido.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export LineasMaterial
    console.log('📦 Exporting Líneas de Material...');
    const lineasMaterial = await prisma.lineaMaterial.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Líneas de Material (${lineasMaterial.length} records)`);
    sqlLines.push('-- ========================================');
    for (const linea of lineasMaterial) {
      sqlLines.push(
        `INSERT INTO "LineaMaterial" (id, "pedidoId", orden, "proveedorId", material, "formatoId", cajas, piezas, ` +
        `"metrosCuadrados", "pvpMaterial", "costeMaterial", "pvpTransporte", "costeTransporte", "estadoPedidoId", ` +
        `"pedidoFabrica", "transportistaId", "fechaPedidoFabrica", "recibidaOC", "fechaOC", seguimiento, "fechaEnvio", ` +
        `"fechaEntrega", "beneficioProducto", "porcentajeBeneficioProducto", "createdAt", "updatedAt") ` +
        `VALUES (${escapeSql(linea.id)}, ${escapeSql(linea.pedidoId)}, ${escapeSql(linea.orden)}, ` +
        `${escapeSql(linea.proveedorId)}, ${escapeSql(linea.material)}, ${escapeSql(linea.formatoId)}, ` +
        `${escapeSql(linea.cajas)}, ${escapeSql(linea.piezas)}, ${escapeSql(linea.metrosCuadrados)}, ` +
        `${escapeSql(linea.pvpMaterial)}, ${escapeSql(linea.costeMaterial)}, ${escapeSql(linea.pvpTransporte)}, ` +
        `${escapeSql(linea.costeTransporte)}, ${escapeSql(linea.estadoPedidoId)}, ${escapeSql(linea.pedidoFabrica)}, ` +
        `${escapeSql(linea.transportistaId)}, ${escapeSql(linea.fechaPedidoFabrica)}, ${escapeSql(linea.recibidaOC)}, ` +
        `${escapeSql(linea.fechaOC)}, ${escapeSql(linea.seguimiento)}, ${escapeSql(linea.fechaEnvio)}, ` +
        `${escapeSql(linea.fechaEntrega)}, ${escapeSql(linea.beneficioProducto)}, ${escapeSql(linea.porcentajeBeneficioProducto)}, ` +
        `${escapeSql(linea.createdAt)}, ${escapeSql(linea.updatedAt)});`
      );
    }
    sqlLines.push('');
    
    // Export PedidoTransportista
    console.log('📦 Exporting Pedido-Transportista relationships...');
    const pedidoTransportistas = await prisma.pedidoTransportista.findMany();
    sqlLines.push('-- ========================================');
    sqlLines.push(`-- Pedido-Transportista (${pedidoTransportistas.length} records)`);
    sqlLines.push('-- ========================================');
    for (const pt of pedidoTransportistas) {
      sqlLines.push(
        `INSERT INTO "PedidoTransportista" (id, "pedidoId", "transportistaId", orden) ` +
        `VALUES (${escapeSql(pt.id)}, ${escapeSql(pt.pedidoId)}, ${escapeSql(pt.transportistaId)}, ${escapeSql(pt.orden)});`
      );
    }
    sqlLines.push('');
    
    // Re-enable triggers
    sqlLines.push('-- Re-enable triggers and constraints');
    sqlLines.push('SET session_replication_role = DEFAULT;\n');
    
    sqlLines.push('-- ========================================');
    sqlLines.push('-- Export completed successfully!');
    sqlLines.push('-- ========================================');
    
    // Write to file
    const outputPath = path.join(process.cwd(), 'database-complete-export.sql');
    fs.writeFileSync(outputPath, sqlLines.join('\n'), 'utf-8');
    
    console.log('\n✅ Export completed successfully!');
    console.log(`📁 File saved to: ${outputPath}`);
    console.log(`📊 Total SQL statements: ${sqlLines.length}`);
    
  } catch (error) {
    console.error('❌ Error during export:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportToSql();

