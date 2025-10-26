
export interface User {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "empleado" | "superadmin";
}

// Modelos de gestión avanzada
export interface Proveedor {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Formato {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormaPago {
  id: string;
  nombre: string;
  activo: boolean;
  comisionFija: number;
  comisionPorcentaje: number;
  comisionFijaCobradaCliente: number;
  comisionPorcentajeCobradoCliente: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstadoPedido {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Incidencia {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transportista {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfiguracionColumnas {
  id: string;
  userId: string;
  columna: string;
  orden: number;
  visible: boolean;
}

export interface PedidoTransportista {
  id: string;
  pedidoId: string;
  transportistaId: string;
  orden: number;
  transportista?: Transportista;
}

export interface LineaMaterial {
  id: string;
  pedidoId: string;
  orden: number;
  proveedorId?: string;
  material: string;
  formatoId?: string;
  cajas: number;
  piezas: number;
  metrosCuadrados: number;
  pvpMaterial: number;
  costeMaterial: number;
  pvpTransporte: number;
  costeTransporte: number;
  // Campos de estado y logística por línea (movidos desde Pedido)
  estadoPedidoId?: string;
  pedidoFabrica?: string;
  transportistaId?: string;
  fechaPedidoFabrica?: Date;
  recibidaOC: boolean;
  fechaOC?: Date;
  seguimiento?: string;
  fechaEnvio?: Date;
  fechaEntrega?: Date;
  beneficioProducto: number;
  porcentajeBeneficioProducto: number;
  // Relaciones opcionales
  proveedor?: Proveedor;
  formato?: Formato;
  estadoPedido?: EstadoPedido;
  transportista?: Transportista;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pedido {
  id: string;
  numeroPedido: string;
  estadoPedidoId?: string;
  incidenciaId?: string;
  formaPagoId?: string;
  factura?: string;
  fechaPedido: Date;
  cliente: string;
  
  // Comisiones históricas (guardadas al momento de crear el pedido)
  comisionFija?: number;
  comisionPorcentaje?: number;
  comisionFijaCobradaCliente?: number;
  comisionPorcentajeCobradoCliente?: number;
  
  proveedorId?: string;
  material?: string;
  formatoId?: string;
  cajas: number;
  piezas: number;
  metrosCuadrados: number;
  pvpMaterial: number;
  costeMaterial: number;
  pvpTotalPedido: number;
  beneficioProducto: number;
  porcentajeBeneficioProducto: number;
  pvpTransporte: number;
  costeTransporte: number;
  cobradoExtraPaypal: number;
  beneficioTransporte: number;
  porcentajeBeneficioTransporte: number;
  beneficio: number;
  porcentajeBeneficio: number;
  bloqueadoPorUsuario?: string;
  fechaBloqueo?: Date;
  modoAgrupado: boolean;
  
  // Relaciones opcionales
  estadoPedido?: EstadoPedido;
  incidencia?: Incidencia;
  formaPago?: FormaPago;
  proveedor?: Proveedor;
  formato?: Formato;
  pedidosTransportista?: PedidoTransportista[];
  lineasMaterial?: LineaMaterial[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces adicionales para la aplicación
export interface SearchableOption {
  id: string;
  nombre: string;
  activo?: boolean;
}

export interface ComisionFormaPago {
  paypal: (pvp: number) => number;
  bizum: (pvp: number) => number;
  redsys: (pvp: number) => number;
  paygold: (pvp: number) => number;
}

export interface ColumnConfiguration {
  field: string;
  label: string;
  orden: number;
  visible: boolean;
  draggable?: boolean;
}

export interface DashboardStats {
  totalPedidos: number;
  beneficioTotal: number;
  pedidosConIncidencia: number;
  pedidosPendientes: number;
}

export interface ChartData {
  name: string;
  value: number;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
    };
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}

// Funciones utilitarias para la lógica automática de estado
export function calcularEstadoAutomaticoPedido(lineasMaterial: LineaMaterial[]): string | null {
  if (!lineasMaterial || lineasMaterial.length === 0) {
    return null;
  }

  // Obtener todos los estados únicos de las líneas de material
  const estadosUnicos = new Set(
    lineasMaterial
      .map(linea => linea.estadoPedido?.nombre)
      .filter(estado => estado !== undefined && estado !== null)
  );

  // Si no hay estados definidos, retornar null
  if (estadosUnicos.size === 0) {
    return null;
  }

  // Si todos los materiales tienen el mismo estado, usar ese estado
  if (estadosUnicos.size === 1) {
    return Array.from(estadosUnicos)[0] as string;
  }

  // Si hay estados mixtos, retornar null (sin estado específico)
  return null;
}

export function debeActualizarEstadoPedido(lineasMaterial: LineaMaterial[]): boolean {
  if (!lineasMaterial || lineasMaterial.length === 0) {
    return false;
  }

  // Verificar si todos los materiales tienen estado definido
  const materialesConEstado = lineasMaterial.filter(linea => linea.estadoPedidoId);
  
  // Solo actualizar si al menos hay algunos materiales con estado
  return materialesConEstado.length > 0;
}
