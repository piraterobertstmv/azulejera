import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { prisma } from '../../../lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Database schema context for the AI
const DATABASE_SCHEMA = `
Eres un asistente AI que ayuda a consultar una base de datos de gestión de pedidos e inventario.
SIEMPRE responde en ESPAÑOL. Si no puedes realizar una consulta, di: "No puedo acceder a esa información"

ESQUEMA COMPLETO DE BASE DE DATOS:

1. Pedido (Pedidos):
   - Campos: id, numeroPedido, fechaPedido, cliente, factura, observaciones, pvpTotalPedido, beneficio, beneficioProducto, beneficioTransporte, porcentajeBeneficio
   - Relaciones: estadoPedido, formaPago, proveedor, incidencia, lineasMaterial[], pedidosTransportista[]
   
2. LineaMaterial (Líneas de Material de cada pedido):
   - Campos: id, material, cajas, piezas, metrosCuadrados, pvpMaterial, costeMaterial, pvpTransporte, costeTransporte, beneficioProducto, beneficioTransporte
   - Relaciones: pedido, proveedor, formato, estadoPedido, transportista
   
3. Proveedor (Proveedores/Suppliers):
   - Campos: id, nombre, activo
   - Relaciones: pedidos[], lineasMaterial[]
   
4. Formato (Formatos de productos - variantes):
   - Campos: id, nombre (ej: "10×20", "30×60"), activo
   - Relaciones: pedidos[], lineasMaterial[]
   
5. EstadoPedido (Estados de pedido):
   - Campos: id, nombre (ej: "Pendiente", "Entregado", "Cancelado"), activo
   - Relaciones: pedidos[], lineasMaterial[]
   
6. FormaPago (Formas de pago):
   - Campos: id, nombre (ej: "Contado", "Transferencia", "Tarjeta"), activo
   - Relaciones: pedidos[]
   
7. Incidencia (Incidencias/Problemas):
   - Campos: id, nombre, activo
   - Relaciones: pedidos[]
   
8. Transportista (Empresas de transporte):
   - Campos: id, nombre, activo
   - Relaciones: pedidosTransportista[], lineasMaterial[]
   
9. User (Usuarios del sistema):
   - Campos: id, name, email, role (admin/empleado/superadmin)
   - NO CONSULTAR datos sensibles como passwords

REGLAS CRÍTICAS DE PRISMA:
1. NUNCA uses 'include' con 'groupBy' - NO ES COMPATIBLE
2. Para agrupar datos, usa SOLO groupBy sin include, luego haz una segunda consulta si necesitas nombres
3. Para contar relaciones, usa findMany con include: { _count: { select: { relacion: true } } }
4. Para filtros de fecha: { fechaPedido: { gte: new Date('2025-01-01'), lte: new Date('2025-12-31') } }
5. Para búsqueda de texto: { cliente: { contains: 'términoBúsqueda' } }
6. Si una consulta falla, devuelve SIEMPRE: return { result: 'No puedo acceder a esa información' };
7. NUNCA muestres mensajes de error técnicos como error.message
8. Formatea resultados en ESPAÑOL con texto claro
9. Usa try-catch SIEMPRE y en el catch devuelve: return { result: 'No puedo acceder a esa información' };

Ejemplos CORRECTOS:
Q: "¿Cuántos pedidos tenemos?"
A: try {
  const count = await prisma.pedido.count();
  return { result: \`Tenemos \${count} pedidos\` };
} catch (error) {
  return { result: 'No puedo acceder a esa información' };
}

Q: "¿Cuál es el ingreso total?"
A: try {
  const orders = await prisma.pedido.findMany();
  const total = orders.reduce((sum, o) => sum + o.pvpTotalPedido, 0);
  return { result: \`Ingresos totales: €\${total.toFixed(2)}\` };
} catch (error) {
  return { result: 'No puedo acceder a esa información' };
}

Q: "¿Qué proveedores tenemos?"
A: try {
  const proveedores = await prisma.proveedor.findMany({ where: { activo: true } });
  return { result: \`Tenemos \${proveedores.length} proveedores:\\n\` + proveedores.map((p, i) => \`\${i+1}. \${p.nombre}\`).join('\\n') };
} catch (error) {
  return { result: 'No puedo acceder a esa información' };
}

Q: "¿Qué formatos vendemos?"
A: try {
  const formatos = await prisma.formato.findMany({ where: { activo: true } });
  return { result: \`Tenemos \${formatos.length} formatos:\\n\` + formatos.map((f, i) => \`\${i+1}. \${f.nombre}\`).join('\\n') };
} catch (error) {
  return { result: 'No puedo acceder a esa información' };
}

Q: "¿Formato más vendido?"
A: try {
  const result = await prisma.lineaMaterial.groupBy({
    by: ['formatoId'],
    _count: true,
    _sum: { metrosCuadrados: true },
    orderBy: { _sum: { metrosCuadrados: 'desc' } },
    take: 1
  });
  if (!result[0]) return { result: 'No hay datos disponibles' };
  const formato = await prisma.formato.findUnique({ where: { id: result[0].formatoId } });
  return { result: \`El formato más vendido es \${formato?.nombre || 'desconocido'} con \${result[0]._sum.metrosCuadrados.toFixed(2)} m²\` };
} catch (error) {
  return { result: 'No puedo acceder a esa información' };
}
`;

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Se requiere un mensaje' }, { status: 400 });
    }

    // Step 1: Use OpenAI to generate Prisma query code
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: DATABASE_SCHEMA,
        },
        ...history.slice(-6), // Keep last 3 exchanges for context
        {
          role: 'user',
          content: `Pregunta del usuario: "${message}"

INSTRUCCIONES:
1. Genera SOLO código Prisma válido y probado
2. Envuelve TODO en try-catch
3. En el catch, devuelve: return { result: 'No puedo acceder a esa información' };
4. NUNCA uses error.message ni muestres errores técnicos
5. Para contar: usa prisma.modelo.count() - es simple y siempre funciona
6. NUNCA uses include con groupBy
7. Respuesta en ESPAÑOL con texto claro y amigable
8. Retorna: { result: 'texto aquí' }`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const generatedCode = completion.choices[0]?.message?.content || '';
    
    // Extract code from markdown if present
    const codeMatch = generatedCode.match(/```(?:typescript|javascript)?\n([\s\S]+?)\n```/);
    const code = codeMatch ? codeMatch[1] : generatedCode;

    console.log('Generated code:', code);

    // Step 2: Execute the generated query safely
    try {
      // Create a safe execution context - NO technical errors allowed
      const executeQuery = new Function(
        'prisma',
        `
        return (async () => {
          try {
            ${code}
          } catch (error) {
            // Never expose error.message to users
            console.error('Query execution error:', error);
            return { result: 'No puedo acceder a esa información' };
          }
        })();
        `
      );

      const queryResult = await executeQuery(prisma);

      // Make sure we only return the user-friendly result
      return NextResponse.json({
        message: queryResult.result || 'No puedo acceder a esa información',
        // Don't return code or data to keep responses clean
      });

    } catch (executionError: any) {
      console.error('Execution error:', executionError);
      
      // Return generic friendly error message without technical details
      return NextResponse.json({
        message: 'No puedo acceder a esa información',
        error: true,
      });
    }

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { message: 'No puedo acceder a esa información', error: true },
      { status: 200 } // Return 200 to show friendly message instead of error page
    );
  }
}

