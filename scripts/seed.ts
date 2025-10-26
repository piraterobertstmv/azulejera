
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // 1. Crear usuarios de prueba con nuevos roles
  const hashedPasswordAdmin = await bcrypt.hash('johndoe123', 12);
  const hashedPasswordEmpleado = await bcrypt.hash('empleado123', 12);
  const hashedPasswordSuperAdmin = await bcrypt.hash('superadmin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPasswordAdmin,
      role: 'admin',
    },
  });

  const empleado = await prisma.user.upsert({
    where: { email: 'empleado@cursor.manager' },
    update: {},
    create: {
      email: 'empleado@cursor.manager',
      name: 'Empleado',
      password: hashedPasswordEmpleado,
      role: 'empleado',
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@cursor.manager' },
    update: {},
    create: {
      email: 'superadmin@cursor.manager',
      name: 'Super Administrador',
      password: hashedPasswordSuperAdmin,
      role: 'superadmin',
    },
  });

  console.log('Usuarios creados:', { admin, empleado, superAdmin });

  // 2. Crear proveedores (valores reales específicos)
  const proveedores = [
    { nombre: 'Amadis Fine Tiles' },
    { nombre: 'Asistencia Cdc Facility Management (Offertiles)' },
    { nombre: 'Azulejos Benadresa' },
    { nombre: 'Ceracasa' },
    { nombre: 'Ceramicas Vilar Álbaro' },
    { nombre: 'Cevica' },
    { nombre: 'Cifre Cerámicas' },
    { nombre: 'Codicer 95' },
    { nombre: 'Distribuciones Cerygres' },
    { nombre: 'East Coast Spc' },
    { nombre: 'Ecoceramic Sociedad Limitada' },
    { nombre: 'Exagres' },
    { nombre: 'Flexolaser' },
    { nombre: 'Gres De Andorra' },
    { nombre: 'Gres De La Mancha' },
    { nombre: 'Grupo Distriplus 2010' },
    { nombre: 'Halcon Cerámicas' },
    { nombre: 'Ifesa Tiles' },
    { nombre: 'Intermatex' },
    { nombre: 'Monopole Lab' },
    { nombre: 'Mosavit Alcalaten' },
    { nombre: 'Nueva Alaplana' },
    { nombre: 'Pamesa Cerámica Compacto' },
    { nombre: 'Pasicos' },
    { nombre: 'Peronda Group' },
    { nombre: 'Prissmacer Ceramica' },
    { nombre: 'Ricardo Peris Materiales' },
    { nombre: 'Spanish Tile From Nules' },
    { nombre: 'Squamers Mosaic' },
    { nombre: 'Vitacer Cerámicas' },
    { nombre: 'Zm Logistics & Services' },
  ];

  const proveedoresCreados = [];
  for (const prov of proveedores) {
    const proveedor = await prisma.proveedor.upsert({
      where: { nombre: prov.nombre },
      update: {},
      create: prov,
    });
    proveedoresCreados.push(proveedor);
  }
  console.log('Proveedores creados:', proveedoresCreados.length);

  // 3. Crear formatos (más de 100 valores diferentes)
  const formatos = [
    // Formatos cuadrados pequeños
    { nombre: '10x10' },
    { nombre: '12x12' },
    { nombre: '15x15' },
    { nombre: '20x20' },
    { nombre: '25x25' },
    { nombre: '30x30' },
    { nombre: '33x33' },
    { nombre: '40x40' },
    { nombre: '45x45' },
    { nombre: '50x50' },
    { nombre: '60x60' },
    { nombre: '75x75' },
    { nombre: '80x80' },
    { nombre: '90x90' },
    { nombre: '100x100' },
    { nombre: '120x120' },
    
    // Formatos rectangulares estándar
    { nombre: '10x20' },
    { nombre: '10x30' },
    { nombre: '15x30' },
    { nombre: '15x60' },
    { nombre: '20x40' },
    { nombre: '20x60' },
    { nombre: '25x50' },
    { nombre: '30x60' },
    { nombre: '30x90' },
    { nombre: '40x80' },
    { nombre: '45x90' },
    { nombre: '60x120' },
    { nombre: '75x150' },
    { nombre: '100x200' },
    
    // Formatos rectangulares especiales
    { nombre: '7.5x15' },
    { nombre: '7.5x30' },
    { nombre: '7.5x60' },
    { nombre: '11x22' },
    { nombre: '13x26' },
    { nombre: '17x35' },
    { nombre: '22x45' },
    { nombre: '30x120' },
    { nombre: '40x120' },
    { nombre: '50x100' },
    
    // Formatos tipo metro/subway
    { nombre: '6x25' },
    { nombre: '7.5x23' },
    { nombre: '7.5x25' },
    { nombre: '10x25' },
    { nombre: '12.5x25' },
    { nombre: '15x45' },
    { nombre: '20x50' },
    
    // Formatos tipo listón/plank
    { nombre: '15x90' },
    { nombre: '20x80' },
    { nombre: '20x100' },
    { nombre: '20x120' },
    { nombre: '23x120' },
    { nombre: '25x100' },
    { nombre: '25x150' },
    { nombre: '30x180' },
    
    // Formatos hexagonales
    { nombre: 'Hex 10' },
    { nombre: 'Hex 12' },
    { nombre: 'Hex 15' },
    { nombre: 'Hex 17.5' },
    { nombre: 'Hex 20' },
    { nombre: 'Hex 23' },
    { nombre: 'Hex 25' },
    { nombre: 'Hex 30' },
    { nombre: 'Hex 35' },
    { nombre: 'Hex 40' },
    
    // Formatos romboidales y especiales
    { nombre: 'Rombo 14x24' },
    { nombre: 'Rombo 18x31' },
    { nombre: 'Rombo 20x35' },
    { nombre: 'Arabesco 15' },
    { nombre: 'Arabesco 20' },
    { nombre: 'Chevron 6x24' },
    { nombre: 'Chevron 8x32' },
    { nombre: 'Chevron 10x40' },
    
    // Formatos modulares
    { nombre: 'Modular 5x5+10x10' },
    { nombre: 'Modular 10x10+20x20' },
    { nombre: 'Modular 15x15+30x30' },
    { nombre: 'Modular Mix 20x20+20x40' },
    { nombre: 'Modular Mix 30x30+30x60' },
    { nombre: 'Modular 40x40+40x80' },
    
    // Formatos tipo mosaico
    { nombre: 'Mosaico 2.5x2.5' },
    { nombre: 'Mosaico 5x5' },
    { nombre: 'Mosaico 2.3x4.8' },
    { nombre: 'Mosaico 1.2x1.2' },
    { nombre: 'Mosaico Hex 2.3' },
    { nombre: 'Mosaico Brick 1.2x2.4' },
    
    // Formatos tipo brick/ladrillo
    { nombre: 'Brick 6x12' },
    { nombre: 'Brick 7.5x15' },
    { nombre: 'Brick 10x20' },
    { nombre: 'Brick 12x24' },
    { nombre: 'Brick 15x30' },
    { nombre: 'Brick 20x40' },
    
    // Formatos tipo scale/escama
    { nombre: 'Scale 10x20' },
    { nombre: 'Scale 15x30' },
    { nombre: 'Scale 20x40' },
    
    // Formatos tipo fishbone/espiga
    { nombre: 'Fishbone 6x24' },
    { nombre: 'Fishbone 8x32' },
    { nombre: 'Fishbone 10x40' },
    { nombre: 'Fishbone 15x60' },
    
    // Formatos irregulares y artesanales
    { nombre: 'Zellige 5x5' },
    { nombre: 'Zellige 10x10' },
    { nombre: 'Artesanal 13x13' },
    { nombre: 'Artesanal 15x15' },
    { nombre: 'Irregular 10-15' },
    { nombre: 'Irregular 15-20' },
    
    // Formatos decorativos especiales
    { nombre: 'Cenefa 5x30' },
    { nombre: 'Cenefa 8x33' },
    { nombre: 'Cenefa 10x30' },
    { nombre: 'Listello 2x30' },
    { nombre: 'Listello 3x30' },
    { nombre: 'Listello 5x60' },
    
    // Formatos XXL
    { nombre: '160x320' },
    { nombre: '120x280' },
    { nombre: '100x300' },
    { nombre: '80x240' },
    { nombre: '75x300' },
  ];

  const formatosCreados = [];
  for (const fmt of formatos) {
    const formato = await prisma.formato.upsert({
      where: { nombre: fmt.nombre },
      update: {},
      create: fmt,
    });
    formatosCreados.push(formato);
  }
  console.log('Formatos creados:', formatosCreados.length);

  // 4. Crear formas de pago con comisiones automáticas
  const formasPago = [
    { nombre: 'PayPal', comisionFija: 0.35, comisionPorcentaje: 2.9 },
    { nombre: 'Bizum', comisionFija: 0.0, comisionPorcentaje: 0.6 },
    { nombre: 'Redsys', comisionFija: 0.0, comisionPorcentaje: 0.25 },
    { nombre: 'Paygold', comisionFija: 0.0, comisionPorcentaje: 0.25 },
    { nombre: 'Transferencia', comisionFija: 0.0, comisionPorcentaje: 0.0 },
    { nombre: 'Contado', comisionFija: 0.0, comisionPorcentaje: 0.0 },
    { nombre: 'Financiado', comisionFija: 0.0, comisionPorcentaje: 1.5 },
  ];

  const formasPagoCreadas = [];
  for (const fp of formasPago) {
    const formaPago = await prisma.formaPago.upsert({
      where: { nombre: fp.nombre },
      update: {},
      create: fp,
    });
    formasPagoCreadas.push(formaPago);
  }
  console.log('Formas de pago creadas:', formasPagoCreadas.length);

  // 5. Crear estados de pedido (valores reales específicos)
  const estadosPedido = [
    { nombre: 'Pendiente Pago' },
    { nombre: 'Pedido a Fábrica' },
    { nombre: 'Pendiente OC' },
    { nombre: 'Pendiente Recogida' },
    { nombre: 'En Tránsito' },
    { nombre: 'Entregado' },
    { nombre: 'Con Incidencia' },
  ];

  const estadosPedidoCreados = [];
  for (const ep of estadosPedido) {
    const estadoPedido = await prisma.estadoPedido.upsert({
      where: { nombre: ep.nombre },
      update: {},
      create: ep,
    });
    estadosPedidoCreados.push(estadoPedido);
  }
  console.log('Estados de pedido creados:', estadosPedidoCreados.length);

  // 6. Crear incidencias (valores reales específicos)
  const incidencias = [
    { nombre: 'Cruce' },
    { nombre: 'Rotura' },
    { nombre: 'Sin stock' },
  ];

  const incidenciasCreadas = [];
  for (const inc of incidencias) {
    const incidencia = await prisma.incidencia.upsert({
      where: { nombre: inc.nombre },
      update: {},
      create: inc,
    });
    incidenciasCreadas.push(incidencia);
  }
  console.log('Incidencias creadas:', incidenciasCreadas.length);

  // 7. Crear transportistas (valores reales específicos)
  const transportistas = [
    { nombre: 'Schenker Logistics' },
    { nombre: 'Raminatrans Castellón' },
    { nombre: 'Palletway - Transportes Campillo' },
    { nombre: 'Megías - Transporte Integral Terrestre' },
    { nombre: 'Punkytrans' },
    { nombre: 'Viaxpress - Miguel Balfagón Pérez' },
    { nombre: 'Dhl Parcel Iberia' },
    { nombre: 'Dachser Spain' },
    { nombre: 'Offertiles - Asistencia Cdc Facility Management' },
  ];

  const transportistasCreados = [];
  for (const trans of transportistas) {
    const transportista = await prisma.transportista.upsert({
      where: { nombre: trans.nombre },
      update: {},
      create: trans,
    });
    transportistasCreados.push(transportista);
  }
  console.log('Transportistas creados:', transportistasCreados.length);

  // 8. Crear pedidos de prueba con nuevas relaciones
  const pedidosData = [
    {
      numeroPedido: 'PED-001',
      estadoPedidoId: estadosPedidoCreados[0].id, // Pendiente Pago
      formaPagoId: formasPagoCreadas[4].id, // Transferencia
      fechaPedido: new Date('2024-01-15'),
      cliente: 'Cliente A - Empresa Construcción',
      proveedorId: proveedoresCreados[0].id, // Amadis Fine Tiles
      material: 'Gres Porcelánico Rectificado',
      formatoId: formatosCreados[10].id, // 60x60
      cajas: 10,
      piezas: 40,
      metrosCuadrados: 14.4,
      pvpMaterial: 1200.00,
      costeMaterial: 800.00,
      pvpTransporte: 150.00,
      costeTransporte: 100.00,
      factura: 'FAC-001',
    },
    {
      numeroPedido: 'PED-002',
      estadoPedidoId: estadosPedidoCreados[6].id, // Con Incidencia
      incidenciaId: incidenciasCreadas[0].id, // Cruce
      formaPagoId: formasPagoCreadas[5].id, // Contado
      fechaPedido: new Date('2024-01-20'),
      cliente: 'Cliente B - Reformas Integrales',
      proveedorId: proveedoresCreados[1].id, // Asistencia Cdc Facility Management (Offertiles)
      material: 'Cerámica Esmaltada Premium',
      formatoId: formatosCreados[5].id, // 30x30
      cajas: 20,
      piezas: 160,
      metrosCuadrados: 28.8,
      pvpMaterial: 800.00,
      costeMaterial: 600.00,
      pvpTransporte: 100.00,
      costeTransporte: 75.00,
    },
    {
      numeroPedido: 'PED-003',
      estadoPedidoId: estadosPedidoCreados[5].id, // Entregado
      formaPagoId: formasPagoCreadas[0].id, // PayPal
      fechaPedido: new Date('2024-02-01'),
      cliente: 'Cliente C - Diseño de Interiores',
      proveedorId: proveedoresCreados[2].id, // Azulejos Benadresa
      material: 'Mármol Travertino',
      formatoId: formatosCreados[7].id, // 40x40
      cajas: 8,
      piezas: 32,
      metrosCuadrados: 5.12,
      pvpMaterial: 2500.00,
      costeMaterial: 1800.00,
      pvpTransporte: 200.00,
      costeTransporte: 150.00,
      cobradoExtraPaypal: 25.00, // Coste extra por usar PayPal
    },
    {
      numeroPedido: 'PED-004',
      estadoPedidoId: estadosPedidoCreados[5].id, // Entregado
      formaPagoId: formasPagoCreadas[6].id, // Financiado
      fechaPedido: new Date('2024-02-10'),
      cliente: 'Cliente D - Hotel Boutique',
      proveedorId: proveedoresCreados[3].id, // Ceracasa
      material: 'Azulejo Hidráulico Artesanal',
      formatoId: formatosCreados[3].id, // 20x20
      cajas: 25,
      piezas: 400,
      metrosCuadrados: 16.0,
      pvpMaterial: 1800.00,
      costeMaterial: 1200.00,
      pvpTransporte: 120.00,
      costeTransporte: 80.00,
    },
    {
      numeroPedido: 'PED-005',
      estadoPedidoId: estadosPedidoCreados[6].id, // Con Incidencia
      incidenciaId: incidenciasCreadas[2].id, // Sin stock
      formaPagoId: formasPagoCreadas[1].id, // Bizum
      fechaPedido: new Date('2024-02-20'),
      cliente: 'Cliente E - Residencial Premium',
      proveedorId: proveedoresCreados[4].id, // Ceramicas Vilar Álbaro
      material: 'Piedra Natural Pizarra',
      formatoId: formatosCreados[9].id, // 50x50
      cajas: 15,
      piezas: 60,
      metrosCuadrados: 15.0,
      pvpMaterial: 3000.00,
      costeMaterial: 2200.00,
      pvpTransporte: 250.00,
      costeTransporte: 180.00,
    },
  ];

  // 9. Función para calcular beneficios (sin costes de forma de pago)
  function calcularBeneficios(data: any) {
    const pvpTotal = data.pvpMaterial + (data.pvpTransporte || 0);
    
    const beneficioProducto = data.pvpMaterial - data.costeMaterial;
    const porcentajeBeneficioProducto = data.pvpMaterial > 0 ? (beneficioProducto / data.pvpMaterial) * 100 : 0;
    
    const beneficioTransporte = (data.pvpTransporte || 0) - (data.costeTransporte || 0);
    const porcentajeBeneficioTransporte = data.pvpTransporte > 0 ? (beneficioTransporte / data.pvpTransporte) * 100 : 0;
    
    const beneficioTotal = beneficioProducto + beneficioTransporte;
    const porcentajeBeneficioTotal = pvpTotal > 0 ? (beneficioTotal / pvpTotal) * 100 : 0;

    return {
      ...data,
      beneficioProducto,
      porcentajeBeneficioProducto,
      beneficioTransporte,
      porcentajeBeneficioTransporte,
      beneficio: beneficioTotal,
      porcentajeBeneficio: porcentajeBeneficioTotal,
      pvpTotalPedido: pvpTotal,
    };
  }

  // 10. Crear pedidos con cálculos automáticos
  const pedidosCreados = [];
  for (const pedidoData of pedidosData) {
    const pedidoConBeneficios = calcularBeneficios(pedidoData);
    
    const pedido = await prisma.pedido.upsert({
      where: { numeroPedido: pedidoData.numeroPedido },
      update: {},
      create: pedidoConBeneficios,
    });
    pedidosCreados.push(pedido);
  }
  console.log('Pedidos creados:', pedidosCreados.length);

  // 11. Crear transportistas para algunos pedidos (ejemplo de múltiples transportistas)
  const pedidoConMultiplesTransportistas = pedidosCreados[0]; // PED-001
  await prisma.pedidoTransportista.createMany({
    data: [
      {
        pedidoId: pedidoConMultiplesTransportistas.id,
        transportistaId: transportistasCreados[0].id, // Schenker Logistics
        orden: 1,
      },
      {
        pedidoId: pedidoConMultiplesTransportistas.id,
        transportistaId: transportistasCreados[1].id, // Raminatrans Castellón  
        orden: 2,
      },
    ],
    skipDuplicates: true,
  });

  // 12. Crear líneas de material de ejemplo (para pedidos complejos)
  const pedidoComplejo = pedidosCreados[1]; // PED-002
  await prisma.lineaMaterial.createMany({
    data: [
      {
        pedidoId: pedidoComplejo.id,
        orden: 1,
        proveedorId: proveedoresCreados[1].id, // Asistencia Cdc Facility Management (Offertiles)
        material: 'Cerámica Esmaltada Premium - Blanco',
        formatoId: formatosCreados[0].id, // 10x10
        cajas: 10,
        piezas: 80,
        metrosCuadrados: 14.4,
        pvpMaterial: 400.00,
        costeMaterial: 300.00,
        pvpTransporte: 50.00,
        costeTransporte: 35.00,
        // Nuevos campos por línea
        estadoPedidoId: estadosPedidoCreados[2].id, // En Producción
        pedidoFabrica: 'PF-001-L1',
        transportistaId: transportistasCreados[0].id, // Schenker Logistics
        fechaPedidoFabrica: new Date('2024-01-21'),
        recibidaOC: true,
        fechaOC: new Date('2024-01-22'),
        seguimiento: 'EN001-LOTE-001',
        fechaEnvio: new Date('2024-01-25'),
        fechaEntrega: new Date('2024-01-28'),
        beneficioProducto: 100.00,
        porcentajeBeneficioProducto: 25.0,
      },
      {
        pedidoId: pedidoComplejo.id,
        orden: 2,
        proveedorId: proveedoresCreados[1].id, // Asistencia Cdc Facility Management (Offertiles)
        material: 'Cerámica Esmaltada Premium - Gris',
        formatoId: formatosCreados[0].id, // 10x10
        cajas: 10,
        piezas: 80,
        metrosCuadrados: 14.4,
        pvpMaterial: 400.00,
        costeMaterial: 300.00,
        pvpTransporte: 50.00,
        costeTransporte: 40.00,
        // Nuevos campos por línea
        estadoPedidoId: estadosPedidoCreados[1].id, // Pedido Fábrica
        pedidoFabrica: 'PF-001-L2',
        transportistaId: transportistasCreados[1].id, // Raminatrans Castellón
        fechaPedidoFabrica: new Date('2024-01-21'),
        recibidaOC: false,
        seguimiento: 'Pendiente de OC',
        beneficioProducto: 100.00,
        porcentajeBeneficioProducto: 25.0,
      },
    ],
    skipDuplicates: true,
  });

  // 13. Crear más líneas de material para otro pedido (estados mixtos)
  const pedidoConEstadosMixtos = pedidosCreados[2]; // PED-003
  await prisma.lineaMaterial.createMany({
    data: [
      {
        pedidoId: pedidoConEstadosMixtos.id,
        orden: 1,
        proveedorId: proveedoresCreados[2].id, // Azulejos Benadresa
        material: 'Mármol Travertino - Formato A',
        formatoId: formatosCreados[7].id, // 40x40
        cajas: 4,
        piezas: 16,
        metrosCuadrados: 2.56,
        pvpMaterial: 1250.00,
        costeMaterial: 900.00,
        pvpTransporte: 100.00,
        costeTransporte: 75.00,
        // Material enviado
        estadoPedidoId: estadosPedidoCreados[4].id, // Enviado
        pedidoFabrica: 'PF-003-L1',
        transportistaId: transportistasCreados[2].id, // DHL Express
        fechaPedidoFabrica: new Date('2024-02-02'),
        recibidaOC: true,
        fechaOC: new Date('2024-02-03'),
        seguimiento: 'DHL123456789',
        fechaEnvio: new Date('2024-02-05'),
        fechaEntrega: new Date('2024-02-07'),
        beneficioProducto: 350.00,
        porcentajeBeneficioProducto: 28.0,
      },
      {
        pedidoId: pedidoConEstadosMixtos.id,
        orden: 2,
        proveedorId: proveedoresCreados[2].id, // Azulejos Benadresa
        material: 'Mármol Travertino - Formato B',
        formatoId: formatosCreados[7].id, // 40x40
        cajas: 4,
        piezas: 16,
        metrosCuadrados: 2.56,
        pvpMaterial: 1250.00,
        costeMaterial: 900.00,
        pvpTransporte: 100.00,
        costeTransporte: 75.00,
        // Material en producción
        estadoPedidoId: estadosPedidoCreados[2].id, // En Producción
        pedidoFabrica: 'PF-003-L2',
        transportistaId: transportistasCreados[2].id, // DHL Express
        fechaPedidoFabrica: new Date('2024-02-02'),
        recibidaOC: true,
        fechaOC: new Date('2024-02-03'),
        seguimiento: 'EN-PRODUCCION-L2',
        beneficioProducto: 350.00,
        porcentajeBeneficioProducto: 28.0,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completado exitosamente');
  console.log('Usuarios de prueba:');
  console.log('- Administrador: john@doe.com / johndoe123');
  console.log('- Empleado: empleado@cursor.manager / empleado123');
  console.log('- Super Admin: superadmin@cursor.manager / superadmin123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
