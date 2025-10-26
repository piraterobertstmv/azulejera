
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { formaPago, pvpTotal } = await request.json();

    if (!formaPago || typeof pvpTotal !== 'number') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    let comision = 0;

    // Cálculos automáticos según la forma de pago
    switch (formaPago.toLowerCase()) {
      case 'paypal':
        comision = (pvpTotal * 0.029) + 0.35;
        break;
      case 'bizum':
        comision = pvpTotal * 0.006;
        break;
      case 'redsys':
      case 'paygold':
        comision = pvpTotal * 0.0025;
        break;
      default:
        comision = 0;
        break;
    }

    return NextResponse.json({
      comision: Math.round(comision * 100) / 100, // Redondear a 2 decimales
      porcentaje: pvpTotal > 0 ? (comision / pvpTotal) * 100 : 0,
    });
  } catch (error) {
    console.error('Error al calcular comisiones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
