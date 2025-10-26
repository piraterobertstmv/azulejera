
'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Calendar,
  TrendingUp,
  Euro,
  Package,
  Truck,
  Calculator,
  Save,
  X
} from "lucide-react";
import { Pedido, LineaMaterial } from "../lib/types";
import { useToast } from "../hooks/use-toast";
import { formateoMoneda, formateoPorcentaje } from "../lib/utils";
import MaterialDetailsCompact from "./material-details-compact";

interface ConfiguracionColumna {
  columna: string;
  label: string;
  orden: number;
  visible: boolean;
  tipo: 'texto' | 'numero' | 'fecha' | 'estado' | 'porcentaje';
  sumable?: boolean;
}

interface FiltrosFecha {
  tipo: 'mes-actual' | 'ultimo-mes' | 'ultimos-3-meses' | 'ultimo-año' | 'año-actual' | 'año-anterior' | 'desde-siempre' | 'personalizado';
  fechaInicio?: string;
  fechaFin?: string;
}

const COLUMNAS_DISPONIBLES: ConfiguracionColumna[] = [
  { columna: 'numeroPedido', label: 'Nº Pedido', orden: 1, visible: true, tipo: 'texto' },
  { columna: 'fechaPedido', label: 'Fecha', orden: 2, visible: true, tipo: 'fecha' },
  { columna: 'cliente', label: 'Cliente', orden: 3, visible: true, tipo: 'texto' },
  { columna: 'estadoPedido', label: 'Estado Pedido', orden: 4, visible: true, tipo: 'estado' },
  { columna: 'pvpTotalPedido', label: 'PVP Total', orden: 5, visible: true, tipo: 'numero', sumable: true },
  { columna: 'beneficio', label: 'Beneficio', orden: 6, visible: true, tipo: 'numero', sumable: true },
  { columna: 'beneficioTransporte', label: 'Beneficio Transporte', orden: 7, visible: true, tipo: 'numero', sumable: true },
  { columna: 'beneficioMaterial', label: 'Beneficio Material', orden: 8, visible: true, tipo: 'numero', sumable: true },
  { columna: 'porcentajeBeneficio', label: '% Beneficio Pedido', orden: 9, visible: true, tipo: 'porcentaje' },
  { columna: 'incidencia', label: 'Incidencia', orden: 10, visible: true, tipo: 'texto' },
  { columna: 'formaPago', label: 'Forma Pago', orden: 11, visible: false, tipo: 'texto' },
  { columna: 'factura', label: 'Factura', orden: 12, visible: false, tipo: 'texto' },
];

export default function PedidosListado() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Configuración de columnas
  const [configuracionColumnas, setConfiguracionColumnas] = useState<ConfiguracionColumna[]>(COLUMNAS_DISPONIBLES);
  const [dialogConfigOpen, setDialogConfigOpen] = useState(false);
  
  // Estados para catálogos
  const [estadosPedido, setEstadosPedido] = useState<Array<{id: string, nombre: string}>>([]);
  const [incidencias, setIncidencias] = useState<Array<{id: string, nombre: string}>>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [filtrosFecha, setFiltrosFecha] = useState<FiltrosFecha>({ tipo: 'mes-actual' });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Aumentado para pantalla completa
  
  // Estados para edición inline
  const [editingEstado, setEditingEstado] = useState<{[key: string]: string}>({});
  const [editingIncidencia, setEditingIncidencia] = useState<{[key: string]: string}>({});
  
  // Estados para selección múltiple
  const [selectedPedidos, setSelectedPedidos] = useState<Set<string>>(new Set());
  const [deletingMultiple, setDeletingMultiple] = useState(false);

  // Estados para expansión de filas
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Estados para edición rápida
  const [editingFields, setEditingFields] = useState<{[key: string]: {[field: string]: any}}>({});
  const [savingFields, setSavingFields] = useState<{[key: string]: Set<string>}>({});
  
  // Estados para catálogos adicionales
  const [transportistas, setTransportistas] = useState<Array<{id: string, nombre: string}>>([]);

  useEffect(() => {
    Promise.all([
      fetchPedidos(),
      fetchConfiguracionColumnas(),
      fetchEstadosPedido(),
      fetchIncidencias(),
      fetchTransportistas()
    ]);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pedidos, searchTerm, estadoFilter, filtrosFecha]);

  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos');
      if (response.ok) {
        const data = await response.json();
        // Procesar datos para calcular beneficios de material desde líneas
        const pedidosProcesados = data.map((pedido: Pedido) => ({
          ...pedido,
          beneficioMaterial: calcularBeneficioMaterial(pedido)
        }));
        setPedidos(pedidosProcesados);
      }
    } catch (error) {
      console.error('Error fetching pedidos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConfiguracionColumnas = async () => {
    try {
      const response = await fetch('/api/configuracion-columnas');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Usar configuración del usuario
          const configUsuario = COLUMNAS_DISPONIBLES.map(col => {
            const userConfig = data.find((d: any) => d.columna === col.columna);
            return userConfig ? { ...col, orden: userConfig.orden, visible: userConfig.visible } : col;
          }).sort((a, b) => a.orden - b.orden);
          setConfiguracionColumnas(configUsuario);
        }
      }
    } catch (error) {
      console.error('Error fetching configuracion columnas:', error);
    }
  };

  const fetchEstadosPedido = async () => {
    try {
      const response = await fetch('/api/estados-pedido');
      if (response.ok) {
        const data = await response.json();
        setEstadosPedido(data);
      }
    } catch (error) {
      console.error('Error fetching estados pedido:', error);
    }
  };

  const fetchIncidencias = async () => {
    try {
      const response = await fetch('/api/incidencias');
      if (response.ok) {
        const data = await response.json();
        setIncidencias(data);
      }
    } catch (error) {
      console.error('Error fetching incidencias:', error);
    }
  };

  const fetchTransportistas = async () => {
    try {
      const response = await fetch('/api/transportistas');
      if (response.ok) {
        const data = await response.json();
        setTransportistas(data);
      }
    } catch (error) {
      console.error('Error fetching transportistas:', error);
    }
  };

  // Funciones para expansión de filas
  const toggleRowExpansion = (pedidoId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pedidoId)) {
        newSet.delete(pedidoId);
      } else {
        newSet.add(pedidoId);
      }
      return newSet;
    });
  };

  // Funciones para edición rápida
  const startQuickEdit = (pedidoId: string, field: string, currentValue: any) => {
    setEditingFields(prev => ({
      ...prev,
      [pedidoId]: {
        ...prev[pedidoId],
        [field]: currentValue
      }
    }));
  };

  const updateQuickEditField = (pedidoId: string, field: string, value: any) => {
    setEditingFields(prev => ({
      ...prev,
      [pedidoId]: {
        ...prev[pedidoId],
        [field]: value
      }
    }));
  };

  const cancelQuickEdit = (pedidoId: string, field: string) => {
    setEditingFields(prev => {
      const newFields = { ...prev };
      if (newFields[pedidoId]) {
        delete newFields[pedidoId][field];
        if (Object.keys(newFields[pedidoId]).length === 0) {
          delete newFields[pedidoId];
        }
      }
      return newFields;
    });
  };

  const saveQuickEdit = async (pedidoId: string, field: string) => {
    const value = editingFields[pedidoId]?.[field];
    if (value === undefined) return;

    // Marcar como guardando
    setSavingFields(prev => ({
      ...prev,
      [pedidoId]: new Set([...(prev[pedidoId] || []), field])
    }));

    try {
      const updateData: any = {};
      
      // Mapear el campo a la estructura del backend
      switch (field) {
        case 'estadoPedido':
          updateData.estadoPedidoId = value;
          break;
        default:
          updateData[field] = value;
      }

      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Actualizar el pedido en el estado local
        setPedidos(prev => prev.map(pedido => {
          if (pedido.id === pedidoId) {
            return { ...pedido, ...updateData };
          }
          return pedido;
        }));

        // Limpiar el estado de edición
        cancelQuickEdit(pedidoId, field);
        
        toast({
          title: "Campo actualizado",
          description: "El campo se ha actualizado correctamente.",
        });
      } else {
        throw new Error('Error al actualizar el campo');
      }
    } catch (error) {
      console.error('Error saving quick edit:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el campo.",
        variant: "destructive",
      });
    } finally {
      // Quitar de guardando
      setSavingFields(prev => {
        const newFields = { ...prev };
        if (newFields[pedidoId]) {
          newFields[pedidoId].delete(field);
          if (newFields[pedidoId].size === 0) {
            delete newFields[pedidoId];
          }
        }
        return newFields;
      });
    }
  };

  const calcularBeneficioMaterial = (pedido: Pedido): number => {
    if (pedido?.lineasMaterial && pedido.lineasMaterial.length > 0) {
      return pedido.lineasMaterial.reduce((sum, linea) => 
        sum + ((linea?.pvpMaterial ?? 0) - (linea?.costeMaterial ?? 0)), 0
      );
    }
    return (pedido?.pvpMaterial ?? 0) - (pedido?.costeMaterial ?? 0);
  };

  const aplicarFiltrosFecha = (pedidos: Pedido[]): Pedido[] => {
    const ahora = new Date();
    let fechaInicio: Date | null = null;
    let fechaFin: Date = ahora;

    switch (filtrosFecha.tipo) {
      case 'mes-actual':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        break;
      case 'ultimo-mes':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
        break;
      case 'ultimos-3-meses':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1);
        break;
      case 'ultimo-año':
        fechaInicio = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate());
        break;
      case 'año-actual':
        fechaInicio = new Date(ahora.getFullYear(), 0, 1); // 1 de enero del año actual
        fechaFin = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59, 999); // 31 de diciembre del año actual
        break;
      case 'año-anterior':
        fechaInicio = new Date(ahora.getFullYear() - 1, 0, 1); // 1 de enero del año anterior
        fechaFin = new Date(ahora.getFullYear() - 1, 11, 31, 23, 59, 59, 999); // 31 de diciembre del año anterior
        break;
      case 'desde-siempre':
        return pedidos; // No aplicar filtro de fechas
      case 'personalizado':
        if (!filtrosFecha.fechaInicio || !filtrosFecha.fechaFin) return pedidos;
        fechaInicio = new Date(filtrosFecha.fechaInicio);
        fechaFin = new Date(filtrosFecha.fechaFin);
        fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día
        break;
      default:
        return pedidos;
    }

    if (!fechaInicio) return pedidos;

    return pedidos.filter(pedido => {
      const fechaPedido = new Date(pedido?.fechaPedido ?? '');
      return fechaPedido >= fechaInicio! && fechaPedido <= fechaFin;
    });
  };

  const applyFilters = () => {
    let filtered = pedidos;

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(pedido =>
        (pedido?.numeroPedido ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pedido?.cliente ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pedido?.factura ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (estadoFilter !== "all") {
      filtered = filtered.filter(pedido => pedido?.estadoPedido?.id === estadoFilter);
    }

    // Filtro por fechas
    filtered = aplicarFiltrosFecha(filtered);

    setFilteredPedidos(filtered);
    setCurrentPage(1); // Reset página al filtrar
  };

  const guardarConfiguracionColumnas = async () => {
    try {
      const configuracion = configuracionColumnas.map(col => ({
        columna: col.columna,
        orden: col.orden,
        visible: col.visible
      }));

      const response = await fetch('/api/configuracion-columnas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracion)
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Configuración de columnas guardada",
        });
        setDialogConfigOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
  };

  const actualizarEstadoPedido = async (pedidoId: string, nuevoEstadoId: string) => {
    try {
      const pedido = pedidos.find(p => p.id === pedidoId);
      if (!pedido) return;

      // Enviar solo los campos básicos necesarios para la actualización
      const updateData = {
        numeroPedido: pedido.numeroPedido,
        cliente: pedido.cliente,
        fechaPedido: pedido.fechaPedido,
        pvpTotalPedido: pedido.pvpTotalPedido,
        factura: pedido.factura,
        // Campos de relaciones (solo los IDs)
        estadoPedidoId: nuevoEstadoId,
        incidenciaId: pedido.incidenciaId,
        formaPagoId: pedido.formaPagoId,
        proveedorId: pedido.proveedorId,
        formatoId: pedido.formatoId,
        // Líneas de material simplificadas
        lineasMaterial: pedido.lineasMaterial?.map(linea => ({
          id: linea.id,
          orden: linea.orden,
          proveedorId: linea.proveedorId,
          material: linea.material,
          formatoId: linea.formatoId,
          cajas: linea.cajas,
          piezas: linea.piezas,
          metrosCuadrados: linea.metrosCuadrados,
          pvpMaterial: linea.pvpMaterial,
          costeMaterial: linea.costeMaterial,
          pvpTransporte: linea.pvpTransporte,
          costeTransporte: linea.costeTransporte,
          transportistaId: linea.transportistaId,
          fechaPedidoFabrica: linea.fechaPedidoFabrica,
          recibidaOC: linea.recibidaOC,
          fechaOC: linea.fechaOC,
          seguimiento: linea.seguimiento,
          fechaEnvio: linea.fechaEnvio,
          beneficioProducto: linea.beneficioProducto,
          porcentajeBeneficioProducto: linea.porcentajeBeneficioProducto
        })) || []
      };

      console.log('Enviando actualización de estado:', { pedidoId, nuevoEstadoId, updateData });

      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Actualizar el pedido en el estado local
        const estadoSeleccionado = estadosPedido.find(e => e.id === nuevoEstadoId);
        setPedidos(prev => prev.map(p => 
          p.id === pedidoId 
            ? { 
                ...p, 
                estadoPedidoId: nuevoEstadoId, 
                estadoPedido: estadoSeleccionado ? {
                  id: estadoSeleccionado.id,
                  nombre: estadoSeleccionado.nombre,
                  activo: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                } : undefined
              }
            : p
        ));
        
        toast({
          title: "Éxito",
          description: "Estado del pedido actualizado",
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
    
    setEditingEstado(prev => ({ ...prev, [pedidoId]: '' }));
  };

  const actualizarIncidenciaPedido = async (pedidoId: string, nuevaIncidenciaId: string) => {
    try {
      const pedido = pedidos.find(p => p.id === pedidoId);
      if (!pedido) return;

      // Convertir "sin-incidencia" a undefined para el backend
      const incidenciaIdParaEnviar = nuevaIncidenciaId === "sin-incidencia" ? undefined : nuevaIncidenciaId;

      // Enviar solo los campos básicos necesarios para la actualización
      const updateData = {
        numeroPedido: pedido.numeroPedido,
        cliente: pedido.cliente,
        fechaPedido: pedido.fechaPedido,
        pvpTotalPedido: pedido.pvpTotalPedido,
        factura: pedido.factura,
        // Campos de relaciones (solo los IDs)
        estadoPedidoId: pedido.estadoPedidoId,
        incidenciaId: incidenciaIdParaEnviar,
        formaPagoId: pedido.formaPagoId,
        proveedorId: pedido.proveedorId,
        formatoId: pedido.formatoId,
        // Líneas de material simplificadas
        lineasMaterial: pedido.lineasMaterial?.map(linea => ({
          id: linea.id,
          orden: linea.orden,
          proveedorId: linea.proveedorId,
          material: linea.material,
          formatoId: linea.formatoId,
          cajas: linea.cajas,
          piezas: linea.piezas,
          metrosCuadrados: linea.metrosCuadrados,
          pvpMaterial: linea.pvpMaterial,
          costeMaterial: linea.costeMaterial,
          pvpTransporte: linea.pvpTransporte,
          costeTransporte: linea.costeTransporte,
          transportistaId: linea.transportistaId,
          fechaPedidoFabrica: linea.fechaPedidoFabrica,
          recibidaOC: linea.recibidaOC,
          fechaOC: linea.fechaOC,
          seguimiento: linea.seguimiento,
          fechaEnvio: linea.fechaEnvio,
          beneficioProducto: linea.beneficioProducto,
          porcentajeBeneficioProducto: linea.porcentajeBeneficioProducto
        })) || []
      };

      console.log('Enviando actualización de incidencia:', { pedidoId, nuevaIncidenciaId, incidenciaIdParaEnviar, updateData });

      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Actualizar el pedido en el estado local
        const incidenciaSeleccionada = nuevaIncidenciaId === "sin-incidencia" ? undefined : incidencias.find(i => i.id === nuevaIncidenciaId);
        setPedidos(prev => prev.map(p => 
          p.id === pedidoId 
            ? { 
                ...p, 
                incidenciaId: incidenciaIdParaEnviar, 
                incidencia: incidenciaSeleccionada ? {
                  id: incidenciaSeleccionada.id,
                  nombre: incidenciaSeleccionada.nombre,
                  activo: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                } : undefined
              } as Pedido
            : p
        ));
        
        toast({
          title: "Éxito",
          description: "Incidencia del pedido actualizada",
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error actualizando incidencia:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar la incidencia: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
    
    setEditingIncidencia(prev => ({ ...prev, [pedidoId]: '' }));
  };

  // Funciones para selección múltiple
  const toggleSelectPedido = (pedidoId: string) => {
    setSelectedPedidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pedidoId)) {
        newSet.delete(pedidoId);
      } else {
        newSet.add(pedidoId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPedidos.size === currentPedidos.length) {
      setSelectedPedidos(new Set());
    } else {
      setSelectedPedidos(new Set(currentPedidos.map(p => p.id!)));
    }
  };

  const eliminarPedidosSeleccionados = async () => {
    if (selectedPedidos.size === 0) return;

    setDeletingMultiple(true);
    try {
      const response = await fetch('/api/pedidos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedPedidos)
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar el estado local eliminando los pedidos
        setPedidos(prev => prev.filter(p => !selectedPedidos.has(p.id!)));
        setSelectedPedidos(new Set());
        
        toast({
          title: "Éxito",
          description: data.message || `${selectedPedidos.size} pedidos eliminados correctamente`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar pedidos');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar los pedidos seleccionados",
        variant: "destructive",
      });
    } finally {
      setDeletingMultiple(false);
    }
  };

  const formatearValor = (valor: any, tipo: string): React.ReactNode => {
    if (valor === null || valor === undefined) return '-';

    switch (tipo) {
      case 'numero':
        return formateoMoneda(Number(valor), 2);
      case 'porcentaje':
        return formateoPorcentaje(Number(valor), 1);
      case 'fecha':
        return new Date(valor).toLocaleDateString('es-ES');
      case 'estado':
        // Asegurar que solo renderizamos strings, no objetos
        const estadoTexto = typeof valor === 'object' && valor?.nombre ? valor.nombre : (typeof valor === 'string' ? valor : 'Sin estado');
        return (
          <Badge variant={estadoTexto !== 'Sin estado' ? 'default' : 'secondary'}>
            {estadoTexto}
          </Badge>
        );
      default:
        // Asegurar que siempre convertimos a string
        if (typeof valor === 'object' && valor !== null) {
          return valor?.nombre || valor?.toString?.() || '-';
        }
        return String(valor);
    }
  };

  const obtenerValorCelda = (pedido: Pedido, columna: string): any => {
    switch (columna) {
      case 'estadoPedido':
        return pedido?.estadoPedido?.nombre || 'Sin estado';
      case 'incidencia':
        return pedido?.incidencia?.nombre || 'Sin incidencia';
      case 'formaPago':
        return pedido?.formaPago?.nombre || 'Sin forma de pago';
      case 'beneficioMaterial':
        return calcularBeneficioMaterial(pedido);
      default:
        const valor = (pedido as any)?.[columna];
        // Si es un objeto con nombre, devolver solo el nombre
        if (typeof valor === 'object' && valor !== null && valor.nombre) {
          return valor.nombre;
        }
        return valor;
    }
  };

  const calcularSumatorios = () => {
    const columnasNumericas = configuracionColumnas.filter(col => col.visible && col.sumable);
    return columnasNumericas.reduce((acc, col) => {
      acc[col.columna] = filteredPedidos.reduce((sum, pedido) => {
        const valor = obtenerValorCelda(pedido, col.columna);
        return sum + (Number(valor) || 0);
      }, 0);
      return acc;
    }, {} as {[key: string]: number});
  };

  // Paginación
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPedidos = filteredPedidos.slice(startIndex, endIndex);

  const sumatorios = calcularSumatorios();
  const columnasVisibles = configuracionColumnas.filter(col => col.visible).sort((a, b) => a.orden - b.orden);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Función para renderizar campos editables inline
  const renderEditableField = (pedido: Pedido, field: string) => {
    const pedidoId = pedido.id!;
    const isEditing = editingFields[pedidoId]?.[field] !== undefined;
    const isSaving = savingFields[pedidoId]?.has(field);
    const currentValue = isEditing ? editingFields[pedidoId][field] : obtenerValorCelda(pedido, field);

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
              type={field.includes('fecha') ? 'date' : 'text'}
              value={field.includes('fecha') && currentValue ? 
                new Date(currentValue).toISOString().split('T')[0] : 
                currentValue || ''
              }
              onChange={(e) => updateQuickEditField(pedidoId, field, e.target.value)}
              className="h-8 text-xs"
              disabled={isSaving}
            />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveQuickEdit(pedidoId, field)}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            {isSaving ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cancelQuickEdit(pedidoId, field)}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="cursor-pointer hover:bg-muted/50 p-1 rounded text-xs"
        onClick={() => startQuickEdit(pedidoId, field, currentValue)}
      >
        {formatearValor(currentValue, field.includes('fecha') ? 'fecha' : (field === 'recibidaOC' ? 'estado' : 'texto'))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header con filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Gestión de Pedidos ({filteredPedidos.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Link href="/pedidos/nuevo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </Link>
              {selectedPedidos.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={eliminarPedidosSeleccionados}
                  disabled={deletingMultiple}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deletingMultiple ? 'Eliminando...' : `Eliminar ${selectedPedidos.size} seleccionados`}
                </Button>
              )}
              <Dialog open={dialogConfigOpen} onOpenChange={setDialogConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Columnas
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configurar Columnas</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {configuracionColumnas.map((col, index) => (
                      <div key={col.columna} className="flex items-center space-x-2">
                        <Checkbox
                          id={col.columna}
                          checked={col.visible}
                          onCheckedChange={(checked) => {
                            const newConfig = [...configuracionColumnas];
                            newConfig[index].visible = Boolean(checked);
                            setConfiguracionColumnas(newConfig);
                          }}
                        />
                        <Label htmlFor={col.columna} className="flex-1">
                          {col.label}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={col.orden}
                          onChange={(e) => {
                            const newConfig = [...configuracionColumnas];
                            newConfig[index].orden = parseInt(e.target.value) || 1;
                            setConfiguracionColumnas(newConfig);
                          }}
                          className="w-16"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={guardarConfiguracionColumnas} className="flex-1">
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setDialogConfigOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente, factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por estado */}
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {estadosPedido.map(estado => (
                  <SelectItem key={estado.id} value={estado.id}>{estado.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de fechas */}
            <Select 
              value={filtrosFecha.tipo} 
              onValueChange={(value: any) => setFiltrosFecha({ tipo: value })}
            >
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes-actual">Mes actual</SelectItem>
                <SelectItem value="ultimo-mes">Último mes</SelectItem>
                <SelectItem value="ultimos-3-meses">Últimos 3 meses</SelectItem>
                <SelectItem value="ultimo-año">Último año</SelectItem>
                <SelectItem value="año-actual">Año actual</SelectItem>
                <SelectItem value="año-anterior">Año anterior</SelectItem>
                <SelectItem value="desde-siempre">Desde siempre</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de fechas personalizado */}
            {filtrosFecha.tipo === 'personalizado' && (
              <>
                <Input
                  type="date"
                  value={filtrosFecha.fechaInicio || ''}
                  onChange={(e) => setFiltrosFecha(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  placeholder="Fecha inicio"
                />
                <Input
                  type="date"
                  value={filtrosFecha.fechaFin || ''}
                  onChange={(e) => setFiltrosFecha(prev => ({ ...prev, fechaFin: e.target.value }))}
                  placeholder="Fecha fin"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de totales */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredPedidos.length}</div>
              <div className="text-sm text-muted-foreground">Total Pedidos</div>
            </div>
            {Object.entries(sumatorios).map(([columna, total]) => {
              const colConfig = configuracionColumnas.find(c => c.columna === columna);
              return (
                <div key={columna} className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {colConfig?.tipo === 'numero' ? formateoMoneda(total, 2) : formateoMoneda(total, 2)}
                  </div>
                  <div className="text-sm text-muted-foreground">{colConfig?.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de pedidos */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium w-12">
                    <Checkbox
                      checked={selectedPedidos.size === currentPedidos.length && currentPedidos.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-center p-3 font-medium w-12">
                    <Package className="h-4 w-4 mx-auto" />
                  </th>
                  {columnasVisibles.map(col => (
                    <th key={col.columna} className="text-left p-3 font-medium">
                      <div className="flex items-center gap-2">
                        {col.columna === 'pvpTotalPedido' && <Euro className="h-4 w-4" />}
                        {col.columna === 'beneficio' && <TrendingUp className="h-4 w-4" />}
                        {col.columna === 'beneficioTransporte' && <Truck className="h-4 w-4" />}
                        {col.columna === 'beneficioMaterial' && <Package className="h-4 w-4" />}
                        {col.columna === 'porcentajeBeneficio' && <Calculator className="h-4 w-4" />}
                        {col.label}
                      </div>
                    </th>
                  ))}
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentPedidos.map((pedido, index) => (
                  <>
                    <tr key={pedido.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="p-3">
                        <Checkbox
                          checked={selectedPedidos.has(pedido.id!)}
                          onCheckedChange={() => toggleSelectPedido(pedido.id!)}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(pedido.id!)}
                          className="h-8 w-8 p-0"
                        >
                          {expandedRows.has(pedido.id!) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    {columnasVisibles.map(col => (
                      <td key={col.columna} className="p-3">
                        {col.columna === 'estadoPedido' ? (
                          editingEstado[pedido.id!] ? (
                            <Select
                              value={editingEstado[pedido.id!]}
                              onValueChange={(value) => actualizarEstadoPedido(pedido.id!, value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {estadosPedido.map(estado => (
                                  <SelectItem key={estado.id} value={estado.id}>
                                    {estado.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div 
                              className="cursor-pointer"
                              onClick={() => setEditingEstado(prev => ({ ...prev, [pedido.id!]: pedido?.estadoPedidoId || '' }))}
                            >
                              {formatearValor(obtenerValorCelda(pedido, col.columna), col.tipo)}
                            </div>
                          )
                        ) : col.columna === 'incidencia' ? (
                          editingIncidencia[pedido.id!] ? (
                            <Select
                              value={editingIncidencia[pedido.id!]}
                              onValueChange={(value) => actualizarIncidenciaPedido(pedido.id!, value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sin-incidencia">Sin incidencia</SelectItem>
                                {incidencias.map(incidencia => (
                                  <SelectItem key={incidencia.id} value={incidencia.id}>
                                    {incidencia.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div 
                              className="cursor-pointer"
                              onClick={() => setEditingIncidencia(prev => ({ ...prev, [pedido.id!]: pedido?.incidenciaId || 'sin-incidencia' }))}
                            >
                              {formatearValor(obtenerValorCelda(pedido, col.columna), col.tipo)}
                            </div>
                          )
                        ) : (
                          formatearValor(obtenerValorCelda(pedido, col.columna), col.tipo)
                        )}
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/pedidos/${pedido.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/pedidos/${pedido.id}/editar`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Fila expandida con detalles de materiales usando el nuevo componente */}
                  {expandedRows.has(pedido.id!) && (
                    <tr>
                      <td colSpan={columnasVisibles.length + 3} className="p-0">
                        <div className="bg-white/10 border-t border-purple-500/30 p-6 backdrop-blur-sm">
                          <MaterialDetailsCompact 
                            materiales={pedido.lineasMaterial || []}
                            onMaterialUpdate={(materialId, updatedMaterial) => {
                              // Actualizar el material en el estado local
                              setPedidos(prev => prev.map(p => {
                                if (p.id === pedido.id) {
                                  return {
                                    ...p,
                                    lineasMaterial: p.lineasMaterial?.map(linea => 
                                      linea.id === materialId ? updatedMaterial : linea
                                    ) || []
                                  };
                                }
                                return p;
                              }));
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredPedidos.length)} de {filteredPedidos.length} pedidos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
