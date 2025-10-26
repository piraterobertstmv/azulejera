
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "../hooks/use-toast";
import { Loader2, Save, Package, Euro, Truck, Calculator, TrendingUp, FileText } from "lucide-react";
import ProductosManager from "./productos-manager";
import { LineaMaterial } from "../lib/types";
import { formateoEspanol, formateoMoneda, formateoPorcentaje, parsearEspanol } from "../lib/utils";

interface PedidoFormProps {
  pedidoId?: string;
}

interface FormData {
  numeroPedido: string;
  estadoPedido: string;
  incidencia: string;
  formaPago: string;
  factura: string;
  fechaPedido: string;
  cliente: string;
  cobradoExtraPaypal: number;
  fechaEntrega: string;
}

interface CatalogOption {
  id: string;
  nombre: string;
}

interface FormaPagoWithComision {
  id: string;
  nombre: string;
  activo: boolean;
  comisionFija: number;
  comisionPorcentaje: number;
  comisionFijaCobradaCliente: number;
  comisionPorcentajeCobradoCliente: number;
}

interface ResumenCalculos {
  totalCajas: number;
  totalPiezas: number;
  totalM2: number;
  totalPvpMaterial: number;
  totalCosteMaterial: number;
  beneficioMaterial: number;
  porcentajeBeneficioMaterial: number;
  beneficioTransporte: number;
  porcentajeBeneficioTransporte: number;
  pvpTotalPedido: number;
  comisionFormaPago: number;
  nombreFormaPago: string;
  beneficioTotal: number;
  porcentajeBeneficioTotal: number;
}

export default function PedidoForm({ pedidoId }: PedidoFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!pedidoId);

  // Estados para catálogos
  const [estadosPedido, setEstadosPedido] = useState<CatalogOption[]>([]);
  const [formasPago, setFormasPago] = useState<FormaPagoWithComision[]>([]);
  const [incidencias, setIncidencias] = useState<CatalogOption[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  
  // Estado para productos múltiples - SIEMPRE inicializar como array válido
  const [productos, setProductos] = useState<LineaMaterial[]>([]);
  
  // Estado para comisiones históricas del pedido (solo cuando se está editando)
  const [comisionesHistoricas, setComisionesHistoricas] = useState<{
    comisionFija: number | null;
    comisionPorcentaje: number | null;
    comisionFijaCobradaCliente: number | null;
    comisionPorcentajeCobradoCliente: number | null;
  } | null>(null);
  
  // Estados para manejo de edición manual del campo cobradoExtraPaypal
  const [isEditingCobradoExtra, setIsEditingCobradoExtra] = useState(false);
  const [cobradoExtraDisplayValue, setCobradoExtraDisplayValue] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    numeroPedido: '',
    estadoPedido: '',
    incidencia: 'none',
    formaPago: '',
    factura: '',
    fechaPedido: new Date().toISOString().split('T')[0],
    cliente: '',
    cobradoExtraPaypal: 0,
    fechaEntrega: '',
  });

  useEffect(() => {
    if (pedidoId) {
      fetchPedido();
    } else {
      // Si es nuevo pedido, crear un producto inicial válido
      const productoInicial: LineaMaterial = {
        id: '',
        pedidoId: '',
        orden: 1,
        material: '',
        cajas: 0,
        piezas: 0,
        metrosCuadrados: 0,
        pvpMaterial: 0,
        costeMaterial: 0,
        pvpTransporte: 0,
        costeTransporte: 0,
        recibidaOC: false,
        beneficioProducto: 0,
        porcentajeBeneficioProducto: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProductos([productoInicial]);
    }
  }, [pedidoId]);

  useEffect(() => {
    loadCatalogs();
  }, []);

  // Sincronizar el valor de display del cobradoExtraPaypal
  useEffect(() => {
    if (!isEditingCobradoExtra) {
      setCobradoExtraDisplayValue(formateoEspanol(formData.cobradoExtraPaypal, 2));
    }
  }, [formData.cobradoExtraPaypal, isEditingCobradoExtra]);

  const loadCatalogs = async () => {
    setCatalogsLoading(true);
    try {
      const [estadosRes, formasRes, incidenciasRes] = await Promise.all([
        fetch('/api/estados-pedido'),
        fetch('/api/formas-pago'),
        fetch('/api/incidencias')
      ]);

      if (estadosRes.ok) {
        const estados = await estadosRes.json();
        const safeEstados = Array.isArray(estados) 
          ? estados.filter((e: any) => e?.id && e.id.trim() !== '' && e?.nombre) 
          : [];
        setEstadosPedido(safeEstados);
      } else {
        setEstadosPedido([]);
      }

      if (formasRes.ok) {
        const formas = await formasRes.json();
        const safeFormas = Array.isArray(formas) 
          ? formas.filter((f: any) => f?.id && f.id.trim() !== '' && f?.nombre) 
          : [];
        setFormasPago(safeFormas);
      } else {
        setFormasPago([]);
      }

      if (incidenciasRes.ok) {
        const incidenciasData = await incidenciasRes.json();
        const safeIncidencias = Array.isArray(incidenciasData) 
          ? incidenciasData.filter((i: any) => i?.id && i.id.trim() !== '' && i?.nombre) 
          : [];
        setIncidencias(safeIncidencias);
      } else {
        setIncidencias([]);
      }
    } catch (error) {
      console.error('Error loading catalogs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los catálogos",
        variant: "destructive",
      });
      // Asegurar arrays vacíos en caso de error
      setEstadosPedido([]);
      setFormasPago([]);
      setIncidencias([]);
    } finally {
      setCatalogsLoading(false);
    }
  };

  const fetchPedido = async () => {
    setInitialLoading(true);
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`);
      if (response.ok) {
        const pedido = await response.json();
        
        // Formatear fechas para inputs
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString().split('T')[0];
        };

        setFormData({
          numeroPedido: pedido?.numeroPedido || '',
          estadoPedido: pedido?.estadoPedidoId || '',
          incidencia: pedido?.incidenciaId || 'none',
          formaPago: pedido?.formaPagoId || '',
          factura: pedido?.factura || '',
          fechaPedido: formatDate(pedido?.fechaPedido),
          cliente: pedido?.cliente || '',
          cobradoExtraPaypal: pedido?.cobradoExtraPaypal || 0,
          fechaEntrega: formatDate(pedido?.fechaEntrega),
        });

        // Capturar comisiones históricas del pedido
        setComisionesHistoricas({
          comisionFija: pedido?.comisionFija ?? null,
          comisionPorcentaje: pedido?.comisionPorcentaje ?? null,
          comisionFijaCobradaCliente: pedido?.comisionFijaCobradaCliente ?? null,
          comisionPorcentajeCobradoCliente: pedido?.comisionPorcentajeCobradoCliente ?? null,
        });

        // Cargar productos/líneas de material - asegurar siempre un array válido
        if (Array.isArray(pedido?.lineasMaterial) && pedido.lineasMaterial.length > 0) {
          // CORRECCIÓN: Verificar si las líneas de material tienen datos de transporte
          // Si no los tienen, distribuir los datos de transporte del nivel de pedido
          const lineasConTransporte = pedido.lineasMaterial.map((linea: any) => {
            // Si la línea no tiene datos de transporte, usar los del pedido principal
            const tieneTransportePropio = linea.pvpTransporte > 0 || linea.costeTransporte > 0;
            const transportePorLinea = pedido.lineasMaterial.length;
            
            return {
              ...linea,
              pvpTransporte: tieneTransportePropio ? linea.pvpTransporte : (pedido?.pvpTransporte || 0) / transportePorLinea,
              costeTransporte: tieneTransportePropio ? linea.costeTransporte : (pedido?.costeTransporte || 0) / transportePorLinea,
            };
          });
          
          setProductos(lineasConTransporte);
        } else if (pedido) {
          // Si no hay líneas de material, crear una línea con los datos del pedido principal
          const productoFromPedido: LineaMaterial = {
            id: '',
            pedidoId: pedido?.id || '',
            orden: 1,
            proveedorId: pedido?.proveedorId,
            material: pedido?.material || '',
            formatoId: pedido?.formatoId,
            cajas: pedido?.cajas || 0,
            piezas: pedido?.piezas || 0,
            metrosCuadrados: pedido?.metrosCuadrados || 0,
            pvpMaterial: pedido?.pvpMaterial || 0,
            costeMaterial: pedido?.costeMaterial || 0,
            pvpTransporte: pedido?.pvpTransporte || 0,
            costeTransporte: pedido?.costeTransporte || 0,
            fechaPedidoFabrica: pedido?.fechaPedidoFabrica,
            recibidaOC: pedido?.recibidaOC || false,
            fechaOC: pedido?.fechaOC,
            seguimiento: pedido?.seguimiento,
            fechaEnvio: pedido?.fechaEnvio,
            beneficioProducto: pedido?.beneficioProducto || 0,
            porcentajeBeneficioProducto: pedido?.porcentajeBeneficioProducto || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setProductos([productoFromPedido]);
        } else {
          // Fallback: crear un producto vacío
          const productoVacio: LineaMaterial = {
            id: '',
            pedidoId: '',
            orden: 1,
            material: '',
            cajas: 0,
            piezas: 0,
            metrosCuadrados: 0,
            pvpMaterial: 0,
            costeMaterial: 0,
            pvpTransporte: 0,
            costeTransporte: 0,
            recibidaOC: false,
            beneficioProducto: 0,
            porcentajeBeneficioProducto: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setProductos([productoVacio]);
        }
      } else {
        throw new Error('Error al cargar el pedido');
      }
    } catch (error) {
      console.error('Error fetching pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el pedido",
        variant: "destructive",
      });
      // Asegurar un producto vacío en caso de error
      const productoVacio: LineaMaterial = {
        id: '',
        pedidoId: '',
        orden: 1,
        material: '',
        cajas: 0,
        piezas: 0,
        metrosCuadrados: 0,
        pvpMaterial: 0,
        costeMaterial: 0,
        pvpTransporte: 0,
        costeTransporte: 0,
        recibidaOC: false,
        beneficioProducto: 0,
        porcentajeBeneficioProducto: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProductos([productoVacio]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Si se cambia la forma de pago, calcular automáticamente el cobradoExtraPaypal
      // SOLO si el usuario no está editando manualmente el campo
      if (field === 'formaPago' && !isEditingCobradoExtra) {
        const formaPagoSeleccionada = formasPago.find(f => f.id === value);
        if (formaPagoSeleccionada) {
          // Calcular PVP total actual de los productos
          const safeProductos = Array.isArray(productos) ? productos : [];
          const totalPvpMaterial = safeProductos.reduce((sum, p) => sum + (p?.pvpMaterial || 0), 0);
          const { totalPvpTransporte } = calcularTotalTransporte();
          const pvpTotalActual = totalPvpMaterial + totalPvpTransporte;
          
          // Calcular cobrado extra usando las comisiones cobradas al cliente
          let comisionFijaCobradaCliente = formaPagoSeleccionada.comisionFijaCobradaCliente;
          let comisionPorcentajeCobradoCliente = formaPagoSeleccionada.comisionPorcentajeCobradoCliente;
          
          // Si estamos editando un pedido y tiene comisiones históricas, usarlas
          if (pedidoId && comisionesHistoricas && 
              comisionesHistoricas.comisionFijaCobradaCliente !== null && 
              comisionesHistoricas.comisionPorcentajeCobradoCliente !== null) {
            comisionFijaCobradaCliente = comisionesHistoricas.comisionFijaCobradaCliente;
            comisionPorcentajeCobradoCliente = comisionesHistoricas.comisionPorcentajeCobradoCliente;
          }
          
          // Calcular el cobrado extra automáticamente
          const cobradoExtraCalculado = comisionFijaCobradaCliente + (pvpTotalActual * comisionPorcentajeCobradoCliente / 100);
          const valorCalculado = Math.max(0, cobradoExtraCalculado);
          newData.cobradoExtraPaypal = valorCalculado;
          
          // Actualizar también el valor de display con el formato correcto
          setCobradoExtraDisplayValue(formateoEspanol(valorCalculado, 2));
        } else {
          // Si no hay forma de pago seleccionada, limpiar el campo
          newData.cobradoExtraPaypal = 0;
          setCobradoExtraDisplayValue('0,00');
        }
      }
      
      return newData;
    });
  };

  // Funciones específicas para manejo manual del campo cobradoExtraPaypal
  const handleCobradoExtraFocus = () => {
    setIsEditingCobradoExtra(true);
    // Usar el valor sin formatear para edición
    setCobradoExtraDisplayValue(formData.cobradoExtraPaypal.toString().replace('.', ','));
  };

  const handleCobradoExtraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir entrada libre mientras se edita
    setCobradoExtraDisplayValue(e.target.value);
  };

  const handleCobradoExtraBlur = () => {
    setIsEditingCobradoExtra(false);
    // Parsear el valor y actualizar el estado
    const valor = parsearEspanol(cobradoExtraDisplayValue) || 0;
    setFormData(prev => ({ ...prev, cobradoExtraPaypal: valor }));
    // Aplicar formateo final
    setCobradoExtraDisplayValue(formateoEspanol(valor, 2));
  };

  const handleCobradoExtraKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegación y edición
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    const isNumber = /^[0-9]$/.test(e.key);
    const isCommaOrDot = e.key === ',' || e.key === '.';
    
    if (!allowedKeys.includes(e.key) && !isNumber && !isCommaOrDot) {
      e.preventDefault();
    }
    
    // Convertir punto a coma para formato español
    if (e.key === '.') {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      const newValue = cobradoExtraDisplayValue.slice(0, start) + ',' + cobradoExtraDisplayValue.slice(end);
      setCobradoExtraDisplayValue(newValue);
      // Mover cursor después de la coma
      setTimeout(() => {
        target.setSelectionRange(start + 1, start + 1);
      }, 0);
    }
  };

  // Función para calcular totales de transporte automáticamente
  const calcularTotalTransporte = () => {
    const safeProductos = Array.isArray(productos) ? productos : [];
    const totalPvpTransporte = safeProductos.reduce((sum, p) => sum + (p?.pvpTransporte || 0), 0);
    const totalCosteTransporte = safeProductos.reduce((sum, p) => sum + (p?.costeTransporte || 0), 0);
    return { totalPvpTransporte, totalCosteTransporte };
  };

  const calcularResumen = (): ResumenCalculos => {
    // Asegurar que productos sea un array válido antes de calcular
    const safeProductos = Array.isArray(productos) ? productos : [];
    
    const totalCajas = safeProductos.reduce((sum, p) => sum + (p?.cajas || 0), 0);
    const totalPiezas = safeProductos.reduce((sum, p) => sum + (p?.piezas || 0), 0);
    const totalM2 = safeProductos.reduce((sum, p) => sum + (p?.metrosCuadrados || 0), 0);
    const totalPvpMaterial = safeProductos.reduce((sum, p) => sum + (p?.pvpMaterial || 0), 0);
    const totalCosteMaterial = safeProductos.reduce((sum, p) => sum + (p?.costeMaterial || 0), 0);
    
    const beneficioMaterial = totalPvpMaterial - totalCosteMaterial;
    const porcentajeBeneficioMaterial = totalPvpMaterial > 0 ? (beneficioMaterial / totalPvpMaterial) * 100 : 0;
    
    // CORRECCIÓN: Usar valores calculados automáticamente de la suma de productos
    const { totalPvpTransporte, totalCosteTransporte } = calcularTotalTransporte();
    const beneficioTransporte = totalPvpTransporte - totalCosteTransporte;
    const porcentajeBeneficioTransporte = totalPvpTransporte > 0 ? (beneficioTransporte / totalPvpTransporte) * 100 : 0;
    
    // CAMBIO IMPORTANTE: El cobradoExtraPaypal se suma al PVP Total
    const pvpTotalSinExtra = totalPvpMaterial + totalPvpTransporte;
    const pvpTotalPedido = pvpTotalSinExtra + formData.cobradoExtraPaypal;
    
    // Calcular comisión de forma de pago (usando el PVP sin el extra para evitar doble comisión)
    const formaPagoSeleccionada = formasPago.find(f => f.id === formData.formaPago);
    const nombreFormaPago = formaPagoSeleccionada?.nombre || '';
    let comisionFormaPago = 0;
    
    if (formaPagoSeleccionada && pvpTotalSinExtra > 0) {
      // Usar comisiones históricas si estamos editando un pedido existente y las tiene
      // Si no, usar comisiones actuales de la forma de pago
      let comisionFija = formaPagoSeleccionada.comisionFija;
      let comisionPorcentaje = formaPagoSeleccionada.comisionPorcentaje;
      
      if (pedidoId && comisionesHistoricas && 
          comisionesHistoricas.comisionFija !== null && 
          comisionesHistoricas.comisionPorcentaje !== null) {
        // Usar comisiones históricas del pedido
        comisionFija = comisionesHistoricas.comisionFija;
        comisionPorcentaje = comisionesHistoricas.comisionPorcentaje;
      }
      
      // Calcular comisión de la empresa: fija + porcentaje del total sin extra
      comisionFormaPago = comisionFija + (pvpTotalSinExtra * comisionPorcentaje / 100);
    }
    
    // Calcular beneficio total
    const costeTotalPedido = totalCosteMaterial + totalCosteTransporte;
    // Beneficio = PVP Total (incluyendo cobrado extra) - Costes - Comisión empresa
    let beneficioTotal = pvpTotalPedido - costeTotalPedido - comisionFormaPago;
    
    const porcentajeBeneficioTotal = pvpTotalPedido > 0 ? (beneficioTotal / pvpTotalPedido) * 100 : 0;

    return {
      totalCajas,
      totalPiezas,
      totalM2,
      totalPvpMaterial,
      totalCosteMaterial,
      beneficioMaterial,
      porcentajeBeneficioMaterial,
      beneficioTransporte,
      porcentajeBeneficioTransporte,
      pvpTotalPedido,
      comisionFormaPago,
      nombreFormaPago,
      beneficioTotal,
      porcentajeBeneficioTotal,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    // Validaciones básicas con arrays seguros
    const safeProductos = Array.isArray(productos) ? productos : [];
    if (!formData.numeroPedido || !formData.cliente || safeProductos.length === 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa los campos obligatorios y añade al menos un producto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const resumen = calcularResumen();
      const { totalPvpTransporte, totalCosteTransporte } = calcularTotalTransporte();
      
      // Corregir el mapeo de campos para que coincidan con el backend
      const payload = {
        numeroPedido: formData.numeroPedido,
        factura: formData.factura,
        fechaPedido: formData.fechaPedido,
        cliente: formData.cliente,
        // CORRECCIÓN: Usar valores calculados automáticamente del transporte
        pvpTransporte: totalPvpTransporte,
        costeTransporte: totalCosteTransporte,
        cobradoExtraPaypal: formData.cobradoExtraPaypal,
        fechaEntrega: formData.fechaEntrega,
        // Mapear correctamente los IDs
        estadoPedidoId: formData.estadoPedido || null,
        incidenciaId: formData.incidencia === 'none' ? null : formData.incidencia || null,
        formaPagoId: formData.formaPago || null,
        // Líneas de material
        lineasMaterial: safeProductos.map((producto, index) => ({
          ...producto,
          orden: index + 1,
        })),
        // Campos calculados
        pvpTotalPedido: resumen.pvpTotalPedido,
        beneficio: resumen.beneficioTotal,
        porcentajeBeneficio: resumen.porcentajeBeneficioTotal,
        beneficioProducto: resumen.beneficioMaterial,
        porcentajeBeneficioProducto: resumen.porcentajeBeneficioMaterial,
        beneficioTransporte: resumen.beneficioTransporte,
        porcentajeBeneficioTransporte: resumen.porcentajeBeneficioTransporte,
      };

      const url = pedidoId ? `/api/pedidos/${pedidoId}` : '/api/pedidos';
      const method = pedidoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: pedidoId ? "Pedido actualizado correctamente" : "Pedido creado correctamente",
        });
        router.push('/pedidos');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.error || errorData?.message || 'Error al guardar el pedido';
        const errorDetails = errorData?.details ? ` (${errorData.details})` : '';
        
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        toast({
          title: "Error al guardar",
          description: `${errorMessage}${errorDetails}`,
          variant: "destructive",
        });
        return; // Exit early to prevent the generic error handling
      }
    } catch (error) {
      console.error('Error saving pedido:', error);
      
      // Proporcionar mensajes de error más específicos
      let errorMessage = "No se pudo guardar el pedido";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet.";
        } else if (error.message.includes('JSON')) {
          errorMessage = "Error en el formato de datos. Contacta al administrador.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "La operación tardó demasiado. Inténtalo de nuevo.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función segura para manejar cambios en productos
  const handleProductosChange = (nuevosProductos: LineaMaterial[]) => {
    // Asegurar que siempre recibamos un array válido
    const safeProductos = Array.isArray(nuevosProductos) ? nuevosProductos : [];
    setProductos(safeProductos);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const resumen = calcularResumen();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto">
      {/* Información General del Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Información General del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="numeroPedido">Número de Pedido *</Label>
            <Input
              id="numeroPedido"
              value={formData.numeroPedido}
              onChange={(e) => handleInputChange('numeroPedido', e.target.value)}
              placeholder="P-2024-001"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="fechaPedido">Fecha Pedido *</Label>
            <Input
              id="fechaPedido"
              type="date"
              value={formData.fechaPedido}
              onChange={(e) => handleInputChange('fechaPedido', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="cliente">Cliente *</Label>
            <Input
              id="cliente"
              value={formData.cliente}
              onChange={(e) => handleInputChange('cliente', e.target.value)}
              placeholder="Nombre del cliente"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="estadoPedido">Estado Pedido</Label>
            <Select 
              value={formData.estadoPedido} 
              onValueChange={(value) => handleInputChange('estadoPedido', value)}
              disabled={loading || catalogsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(estadosPedido) ? estadosPedido : []).map(estado => (
                  <SelectItem key={estado.id} value={estado.id}>{estado.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="formaPago">Forma de Pago</Label>
            <Select 
              value={formData.formaPago} 
              onValueChange={(value) => handleInputChange('formaPago', value)}
              disabled={loading || catalogsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar forma de pago..." />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(formasPago) ? formasPago : []).map(forma => (
                  <SelectItem key={forma.id} value={forma.id}>{forma.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="factura">Factura</Label>
            <Input
              id="factura"
              value={formData.factura}
              onChange={(e) => handleInputChange('factura', e.target.value)}
              placeholder="Número de factura"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="incidencia">Incidencia</Label>
            <Select 
              value={formData.incidencia} 
              onValueChange={(value) => handleInputChange('incidencia', value)}
              disabled={loading || catalogsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar incidencia..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin incidencia</SelectItem>
                {(Array.isArray(incidencias) ? incidencias : []).map(incidencia => (
                  <SelectItem key={incidencia.id} value={incidencia.id}>{incidencia.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cobradoExtraPaypal">
              Cobrado Extra por Paypal (€)
              {(() => {
                const formaPagoSeleccionada = formasPago.find(f => f.id === formData.formaPago);
                const isPaypal = formaPagoSeleccionada?.nombre?.toLowerCase() === 'paypal';
                return !isPaypal ? (
                  <span className="text-sm text-muted-foreground ml-2">(Solo disponible para Paypal)</span>
                ) : null;
              })()}
            </Label>
            <Input
              id="cobradoExtraPaypal"
              type="text"
              value={isEditingCobradoExtra ? cobradoExtraDisplayValue : formateoEspanol(formData.cobradoExtraPaypal, 2)}
              onChange={handleCobradoExtraChange}
              onFocus={handleCobradoExtraFocus}
              onBlur={handleCobradoExtraBlur}
              onKeyDown={handleCobradoExtraKeyDown}
              placeholder="0,00"
              disabled={(() => {
                const formaPagoSeleccionada = formasPago.find(f => f.id === formData.formaPago);
                const isPaypal = formaPagoSeleccionada?.nombre?.toLowerCase() === 'paypal';
                return loading || !isPaypal;
              })()}
              className={(() => {
                const formaPagoSeleccionada = formasPago.find(f => f.id === formData.formaPago);
                const isPaypal = formaPagoSeleccionada?.nombre?.toLowerCase() === 'paypal';
                return !isPaypal ? 'bg-muted text-muted-foreground' : '';
              })()}
            />
          </div>

          <div>
            <Label htmlFor="fechaEntrega">Fecha Entrega</Label>
            <Input
              id="fechaEntrega"
              type="date"
              value={formData.fechaEntrega}
              onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Productos */}
      <ProductosManager
        productos={productos}
        onChange={handleProductosChange}
        disabled={loading}
      />

      {/* Transporte y Logística */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Transporte y Logística
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              <Calculator className="h-4 w-4 inline mr-1" />
              Los valores de transporte se calculan automáticamente como la suma de todos los productos
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pvpTransporteCalculado">PVP Transporte Total (€)</Label>
                <Input
                  id="pvpTransporteCalculado"
                  type="text"
                  value={formateoEspanol(calcularTotalTransporte().totalPvpTransporte, 2)}
                  disabled={true}
                  className="bg-muted font-semibold"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Suma automática de PVP Transporte de todos los productos
                </p>
              </div>
              <div>
                <Label htmlFor="costeTransporteCalculado">Coste Transporte Total (€)</Label>
                <Input
                  id="costeTransporteCalculado"
                  type="text"
                  value={formateoEspanol(calcularTotalTransporte().totalCosteTransporte, 2)}
                  disabled={true}
                  className="bg-muted font-semibold"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Suma automática de Coste Transporte de todos los productos
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-sm">
              Para editar estos valores, modifica los campos de transporte en cada producto individual
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Costes y Beneficios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Resumen de Costes y Beneficios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{resumen.totalCajas}</div>
              <div className="text-sm text-muted-foreground">Total Cajas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{resumen.totalPiezas}</div>
              <div className="text-sm text-muted-foreground">Total Piezas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formateoEspanol(resumen.totalM2, 2)}</div>
              <div className="text-sm text-muted-foreground">Total M²</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{formateoMoneda(resumen.pvpTotalPedido, 2)}</div>
              <div className="text-sm text-muted-foreground">PVP Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{formateoMoneda(resumen.beneficioTotal, 2)}</div>
              <div className="text-sm text-muted-foreground">Beneficio Total</div>
            </div>
            <div className="text-center">
              <Badge variant={resumen.porcentajeBeneficioTotal >= 0 ? 'default' : 'destructive'} className="text-base p-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                {formateoPorcentaje(resumen.porcentajeBeneficioTotal, 1)}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">% Beneficio</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Material
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>PVP:</span>
                  <span>{formateoMoneda(resumen.totalPvpMaterial, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coste:</span>
                  <span>{formateoMoneda(resumen.totalCosteMaterial, 2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Beneficio:</span>
                  <span className={resumen.beneficioMaterial >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formateoMoneda(resumen.beneficioMaterial, 2)} ({formateoPorcentaje(resumen.porcentajeBeneficioMaterial, 1)})
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                Transporte
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>PVP:</span>
                  <span>{formateoMoneda(calcularTotalTransporte().totalPvpTransporte, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coste:</span>
                  <span>{formateoMoneda(calcularTotalTransporte().totalCosteTransporte, 2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Beneficio:</span>
                  <span className={resumen.beneficioTransporte >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formateoMoneda(resumen.beneficioTransporte, 2)} ({formateoPorcentaje(resumen.porcentajeBeneficioTransporte, 1)})
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Euro className="h-4 w-4 mr-2" />
                Costes Adicionales
              </h4>
              <div className="space-y-1">
                {resumen.nombreFormaPago && (
                  <div className="flex justify-between">
                    <span>Comisión {resumen.nombreFormaPago}:</span>
                    <span className="text-red-600">-{formateoMoneda(resumen.comisionFormaPago, 2)}</span>
                  </div>
                )}
                {(() => {
                  const formaPagoSeleccionada = formasPago.find(f => f.id === formData.formaPago);
                  const isPaypal = formaPagoSeleccionada?.nombre?.toLowerCase() === 'paypal';
                  return isPaypal && formData.cobradoExtraPaypal > 0 ? (
                    <div className="flex justify-between">
                      <span>Cobrado Extra Paypal:</span>
                      <span className="text-green-600">+{formateoMoneda(formData.cobradoExtraPaypal, 2)}</span>
                    </div>
                  ) : null;
                })()}
                {!resumen.nombreFormaPago && formData.cobradoExtraPaypal === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No hay costes adicionales aplicados
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/pedidos')}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {pedidoId ? 'Actualizar' : 'Crear'} Pedido
        </Button>
      </div>
    </form>
  );
}
