
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const prisma = new PrismaClient()

async function checkTransportData() {
  try {
    console.log('🔍 Verificando datos de transporte en LineaMaterial...')
    
    // Obtener todas las líneas de material
    const lineasMaterial = await prisma.lineaMaterial.findMany({
      include: {
        pedido: {
          select: {
            numeroPedido: true,
            cliente: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n📊 Total de líneas de material: ${lineasMaterial.length}`)
    
    if (lineasMaterial.length > 0) {
      console.log('\n🔍 Datos de transporte por línea:')
      lineasMaterial.forEach((linea, index) => {
        console.log(`\n--- Línea ${index + 1} ---`)
        console.log(`Pedido: ${linea.pedido.numeroPedido} - Cliente: ${linea.pedido.cliente}`)
        console.log(`Material: ${linea.material}`)
        console.log(`PVP Transporte: ${linea.pvpTransporte}`)
        console.log(`Coste Transporte: ${linea.costeTransporte}`)
        console.log(`Orden: ${linea.orden}`)
      })
      
      // Estadísticas
      const conTransporte = lineasMaterial.filter(l => l.pvpTransporte > 0 || l.costeTransporte > 0)
      console.log(`\n📈 Estadísticas:`)
      console.log(`- Líneas con transporte > 0: ${conTransporte.length}`)
      console.log(`- Líneas con transporte = 0: ${lineasMaterial.length - conTransporte.length}`)
    }
    
    // También verificar pedidos
    console.log('\n🔍 Verificando pedidos:')
    const pedidos = await prisma.pedido.findMany({
      select: {
        numeroPedido: true,
        cliente: true,
        pvpTransporte: true,
        costeTransporte: true,
        _count: {
          select: {
            lineasMaterial: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n📊 Total de pedidos: ${pedidos.length}`)
    pedidos.forEach((pedido, index) => {
      console.log(`\n--- Pedido ${index + 1} ---`)
      console.log(`Número: ${pedido.numeroPedido} - Cliente: ${pedido.cliente}`)
      console.log(`PVP Transporte (pedido): ${pedido.pvpTransporte}`)
      console.log(`Coste Transporte (pedido): ${pedido.costeTransporte}`)
      console.log(`Líneas de material: ${pedido._count.lineasMaterial}`)
    })
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTransportData()
