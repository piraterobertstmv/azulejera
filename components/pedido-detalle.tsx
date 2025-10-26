
'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Edit, 
  Trash2, 
  ArrowLeft,
  Package,
  Euro,
  Truck,
  Calendar,
  User,
  FileText,
  Save,
  X
} from "lucide-react";
import { Pedido } from "../lib/types";
import { useToast } from "../hooks/use-toast";

interface PedidoDetalleProps {
  pedidoId: string;
}

export default function PedidoDetalle({ pedidoId }: PedidoDetalleProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedido();
  }, [pedidoId]);

  const fetchPedido = async () => {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`);
      if (response.ok) {
        const data = await response.json();
        setPedido(data);
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar el pedido",
          variant: "destructive",
        });
        router.push('/pedidos');
      }
    } catch (error) {
      console.error('Error fetching pedido:', error);
      toast({
        title: "Error",
        description: "Error al cargar el pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePedido = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pedido?")) {
      return;
    }

    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Pedido eliminado correctamente",
        });
        router.push('/pedidos');
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pedido",
        variant: "destructive",
      });
    }
  };

  const getEstadoBadge = (estadoPedido: any) => {
    const estado = estadoPedido?.nombre || 'Sin estado';
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Pendiente": "outline",
      "En proceso": "secondary",
      "Enviado": "secondary",
      "Entregado": "default",
      "Cancelado": "destructive"
    };
    
    return (
      <Badge variant={variants[estado] || "outline"} className="text-sm">
        {estado}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No asignada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando pedido...</div>;
  }

  if (!pedido) {
    return <div className="text-center py-8">Pedido no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/pedidos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Pedido #{pedido.numeroPedido}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              {getEstadoBadge(pedido.estadoPedido)}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Creado el {formatDate(pedido.fechaPedido.toString())}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/pedidos/${pedido.id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          {session?.user?.role === "admin" && (
            <Button variant="destructive" onClick={deletePedido}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Información del Cliente y Producto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Cliente y Producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                <p className="text-lg font-semibold">{pedido.cliente}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Proveedor</label>
                <p className="text-lg">{pedido.proveedor?.nombre || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material</label>
                <p className="text-lg">{pedido.material}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Formato</label>
                <p className="text-lg">{pedido.formato?.nombre || 'No especificado'}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cajas</label>
                  <p className="text-lg font-semibold">{pedido.cajas}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Piezas</label>
                  <p className="text-lg font-semibold">{pedido.piezas}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">M²</label>
                  <p className="text-lg font-semibold">{pedido.metrosCuadrados}</p>
                </div>
              </div>
            </div>
          </div>
          
          {pedido.incidencia && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="text-sm font-medium text-yellow-800">Incidencia</label>
              <p className="text-yellow-700 mt-1">{pedido.incidencia?.nombre || 'Incidencia registrada'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen Financiero */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Euro className="h-5 w-5 mr-2" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Material</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PVP Material:</span>
                  <span className="font-medium">{formatCurrency(pedido.pvpMaterial)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coste Material:</span>
                  <span className="font-medium">{formatCurrency(pedido.costeMaterial)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Beneficio:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(pedido.beneficioProducto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">% Beneficio:</span>
                  <span className="text-sm font-medium">
                    {pedido.porcentajeBeneficioProducto.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Transporte</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PVP Transporte:</span>
                  <span className="font-medium">{formatCurrency(pedido.pvpTransporte)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coste Transporte:</span>
                  <span className="font-medium">{formatCurrency(pedido.costeTransporte)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Beneficio:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(pedido.beneficioTransporte)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">% Beneficio:</span>
                  <span className="text-sm font-medium">
                    {pedido.porcentajeBeneficioTransporte.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Total</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PVP Total:</span>
                  <span className="font-medium">{formatCurrency(pedido.pvpTotalPedido)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cobrado Extra PayPal:</span>
                  <span className="font-medium">
                    {formatCurrency(pedido.cobradoExtraPaypal)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-bold">Beneficio Total:</span>
                  <span className="text-lg font-bold text-purple-500">
                    {formatCurrency(pedido.beneficio)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">% Beneficio Total:</span>
                  <span className="text-sm font-medium">
                    {pedido.porcentajeBeneficio.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logística y Transporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Logística y Transporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Transportistas</label>
                <p className="text-lg">
                  {pedido.pedidosTransportista && pedido.pedidosTransportista.length > 0 
                    ? `${pedido.pedidosTransportista.length} transportista(s) asignado(s)`
                    : 'No asignado'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Forma de Pago</label>
                <p className="text-lg">{pedido.formaPago?.nombre || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Factura</label>
                <p className="text-lg">{pedido.factura || 'No asignada'}</p>
              </div>
            </div>

          </div>


        </CardContent>
      </Card>

      {/* Estado y Fechas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Estado y Fechas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha Pedido</label>
              <p className="text-lg font-semibold">{formatDate(pedido.fechaPedido.toString())}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado Actual</label>
              <div className="mt-1">{getEstadoBadge(pedido.estadoPedido)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Materiales por Línea */}
      {pedido.lineasMaterial && pedido.lineasMaterial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Detalle de Materiales por Línea ({pedido.lineasMaterial.length} líneas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pedido.lineasMaterial.map((linea, index) => (
                <LineaMaterialDetalle 
                  key={linea.id || index}
                  linea={linea}
                  onUpdate={(updatedLinea) => {
                    // Actualizar la línea en el estado local
                    setPedido(prev => prev ? {
                      ...prev,
                      lineasMaterial: prev.lineasMaterial?.map(l => 
                        l.id === updatedLinea.id ? updatedLinea : l
                      ) || []
                    } : prev);
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente para mostrar y editar una línea de material individual
function LineaMaterialDetalle({ 
  linea, 
  onUpdate 
}: { 
  linea: any; 
  onUpdate: (updatedLinea: any) => void;
}) {
  const [editing, setEditing] = useState<{[key: string]: boolean}>({});
  const [values, setValues] = useState<{[key: string]: any}>({});
  const [saving, setSaving] = useState<{[key: string]: boolean}>({});
  const [estadosPedido, setEstadosPedido] = useState<Array<{id: string, nombre: string}>>([]);
  const [transportistas, setTransportistas] = useState<Array<{id: string, nombre: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCatalogos();
  }, []);

  const fetchCatalogos = async () => {
    try {
      const [estadosResponse, transportistasResponse] = await Promise.all([
        fetch('/api/estados-pedido'),
        fetch('/api/transportistas')
      ]);

      if (estadosResponse.ok) {
        const estados = await estadosResponse.json();
        setEstadosPedido(estados);
      }

      if (transportistasResponse.ok) {
        const transportistasData = await transportistasResponse.json();
        setTransportistas(transportistasData);
      }
    } catch (error) {
      console.error('Error fetching catálogos:', error);
    }
  };

  const startEdit = (field: string, currentValue: any) => {
    setEditing(prev => ({ ...prev, [field]: true }));
    setValues(prev => ({ ...prev, [field]: currentValue }));
  };

  const cancelEdit = (field: string) => {
    setEditing(prev => ({ ...prev, [field]: false }));
    setValues(prev => {
      const newValues = { ...prev };
      delete newValues[field];
      return newValues;
    });
  };

  const saveField = async (field: string) => {
    setSaving(prev => ({ ...prev, [field]: true }));
    
    try {
      const updateData = { [field]: values[field] };
      
      const response = await fetch(`/api/lineas-material/${linea.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedLinea = await response.json();
        onUpdate(updatedLinea);
        setEditing(prev => ({ ...prev, [field]: false }));
        setValues(prev => {
          const newValues = { ...prev };
          delete newValues[field];
          return newValues;
        });
        
        toast({
          title: "Éxito",
          description: "Campo actualizado correctamente",
        });
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error saving field:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el campo",
        variant: "destructive",
      });
    } finally {
      setSaving(prev => ({ ...prev, [field]: false }));
    }
  };

  const formatDate = (date: any): string => {
    if (!date) return 'No establecida';
    return new Date(date).toLocaleDateString('es-ES');
  };

  const formatDateForInput = (date: any): string => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const renderEditableField = (field: string, label: string, currentValue: any, type: 'text' | 'date' | 'select' | 'boolean' = 'text', options?: Array<{id: string, nombre: string}>) => {
    const isEditing = editing[field];
    const isSaving = saving[field];
    const displayValue = isEditing ? values[field] : currentValue;

    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {isEditing ? (
          <div className="flex items-center gap-2">
            {type === 'select' ? (
              <Select 
                value={displayValue || ""} 
                onValueChange={(value) => setValues(prev => ({ ...prev, [field]: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={`Seleccionar ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin especificar</SelectItem>
                  {options?.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'boolean' ? (
              <Select 
                value={String(displayValue)} 
                onValueChange={(value) => setValues(prev => ({ ...prev, [field]: value === 'true' }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={type}
                value={type === 'date' ? formatDateForInput(displayValue) : (displayValue || '')}
                onChange={(e) => setValues(prev => ({ 
                  ...prev, 
                  [field]: type === 'date' ? e.target.value : e.target.value 
                }))}
                className="h-8 text-xs"
                disabled={isSaving}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveField(field)}
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
              onClick={() => cancelEdit(field)}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div 
            className="cursor-pointer p-2 rounded border border-transparent hover:border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={() => startEdit(field, currentValue)}
          >
            {type === 'date' ? formatDate(displayValue) :
             type === 'boolean' ? (displayValue ? 'Sí' : 'No') :
             type === 'select' ? (
               displayValue ? 
                 (options?.find(o => o.id === displayValue)?.nombre || 'No especificado') : 
                 'No especificado'
             ) : 
             (displayValue || 'No especificado')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-lg">Línea {linea.orden}: {linea.material}</h4>
        <Badge variant="outline">
          {linea.estadoPedido?.nombre || 'Sin estado'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {renderEditableField(
          'estadoPedidoId', 
          'Estado del Pedido', 
          linea.estadoPedidoId, 
          'select', 
          estadosPedido
        )}
        
        {renderEditableField(
          'pedidoFabrica', 
          'Pedido Fábrica', 
          linea.pedidoFabrica, 
          'text'
        )}
        
        {renderEditableField(
          'transportistaId', 
          'Transportista', 
          linea.transportistaId, 
          'select', 
          transportistas
        )}
        
        {renderEditableField(
          'fechaPedidoFabrica', 
          'Fecha Pedido Fábrica', 
          linea.fechaPedidoFabrica, 
          'date'
        )}
        
        {renderEditableField(
          'recibidaOC', 
          'Recibida OC', 
          linea.recibidaOC, 
          'boolean'
        )}
        
        {renderEditableField(
          'fechaOC', 
          'Fecha OC', 
          linea.fechaOC, 
          'date'
        )}
        
        {renderEditableField(
          'seguimiento', 
          'Seguimiento', 
          linea.seguimiento, 
          'text'
        )}
        
        {renderEditableField(
          'fechaEnvio', 
          'Fecha Envío', 
          linea.fechaEnvio, 
          'date'
        )}
        
        {renderEditableField(
          'fechaEntrega', 
          'Fecha Entrega', 
          linea.fechaEntrega, 
          'date'
        )}
      </div>
      
      {/* Información adicional del material */}
      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Cantidad</Label>
          <p className="text-sm">{linea.cajas} cajas • {linea.piezas} piezas • {linea.metrosCuadrados} m²</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">PVP Material</Label>
          <p className="text-sm font-medium text-green-600">€{linea.pvpMaterial?.toFixed(2) || '0.00'}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Coste Material</Label>
          <p className="text-sm font-medium text-red-600">€{linea.costeMaterial?.toFixed(2) || '0.00'}</p>
        </div>
      </div>
    </div>
  );
}
