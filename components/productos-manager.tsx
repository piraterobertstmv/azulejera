
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import SearchableSelect from './searchable-select';
import { LineaMaterial, Proveedor, Formato, Transportista } from '../lib/types';
import { formateoEspanol, formateoMoneda, formateoPorcentaje, parsearEspanol } from '../lib/utils';

interface ProductosManagerProps {
  productos: LineaMaterial[];
  onChange: (productos: LineaMaterial[]) => void;
  disabled?: boolean;
}

interface ProductoFormData {
  id?: string;
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
  transportistaId?: string;
  fechaPedidoFabrica?: string;
  recibidaOC: boolean;
  fechaOC?: string;
  seguimiento?: string;
  fechaEnvio?: string;
  fechaEntrega?: string;
}

interface CatalogOption {
  id: string;
  nombre: string;
}

export default function ProductosManager({ productos, onChange, disabled }: ProductosManagerProps) {
  // Estados para catálogos - MISMO PATRÓN que pedido-form.tsx
  const [proveedores, setProveedores] = useState<CatalogOption[]>([]);
  const [formatos, setFormatos] = useState<CatalogOption[]>([]);
  const [transportistas, setTransportistas] = useState<CatalogOption[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    loadCatalogs();
  }, []);

  // Función unificada para cargar catálogos - MISMO PATRÓN que pedido-form.tsx
  const loadCatalogs = async () => {
    setCatalogsLoading(true);
    try {
      const [proveedoresRes, formatosRes, transportistasRes] = await Promise.all([
        fetch('/api/proveedores?limit=200'),
        fetch('/api/formatos?limit=200'),
        fetch('/api/transportistas?limit=200')
      ]);

      // Manejo de proveedores
      if (proveedoresRes.ok) {
        const proveedoresData = await proveedoresRes.json();
        const safeProveedores = Array.isArray(proveedoresData) 
          ? proveedoresData.filter((p: any) => p?.id && p.id.trim() !== '' && p?.nombre) 
          : [];
        setProveedores(safeProveedores);
      } else {
        setProveedores([]);
      }

      // Manejo de formatos
      if (formatosRes.ok) {
        const formatosData = await formatosRes.json();
        const safeFormatos = Array.isArray(formatosData) 
          ? formatosData.filter((f: any) => f?.id && f.id.trim() !== '' && f?.nombre) 
          : [];
        setFormatos(safeFormatos);
      } else {
        setFormatos([]);
      }

      // Manejo de transportistas
      if (transportistasRes.ok) {
        const transportistasData = await transportistasRes.json();
        const safeTransportistas = Array.isArray(transportistasData) 
          ? transportistasData.filter((t: any) => t?.id && t.id.trim() !== '' && t?.nombre) 
          : [];
        setTransportistas(safeTransportistas);
      } else {
        setTransportistas([]);
      }
    } catch (error) {
      console.error('Error loading catalogs:', error);
      // Asegurar arrays vacíos en caso de error
      setProveedores([]);
      setFormatos([]);
      setTransportistas([]);
    } finally {
      setCatalogsLoading(false);
    }
  };

  const crearNuevoProducto = (): ProductoFormData => {
    // Asegurar que productos sea un array válido antes de calcular el nuevo orden
    const safeProductos = Array.isArray(productos) ? productos : [];
    const maxOrden = safeProductos.length > 0 
      ? Math.max(...safeProductos.map(p => p?.orden || 0)) 
      : 0;
      
    return {
      orden: maxOrden + 1,
      material: '',
      cajas: 0,
      piezas: 0,
      metrosCuadrados: 0,
      pvpMaterial: 0,
      costeMaterial: 0,
      pvpTransporte: 0,
      costeTransporte: 0,
      recibidaOC: false,
      seguimiento: ''
    };
  };

  const añadirProducto = () => {
    const nuevoProducto = crearNuevoProducto();
    const safeProductos = Array.isArray(productos) ? productos : [];
    
    // Crear un objeto LineaMaterial válido
    const nuevoLineaMaterial: LineaMaterial = {
      id: '',
      pedidoId: '',
      orden: nuevoProducto.orden,
      proveedorId: nuevoProducto.proveedorId,
      material: nuevoProducto.material,
      formatoId: nuevoProducto.formatoId,
      cajas: nuevoProducto.cajas,
      piezas: nuevoProducto.piezas,
      metrosCuadrados: nuevoProducto.metrosCuadrados,
      pvpMaterial: nuevoProducto.pvpMaterial,
      costeMaterial: nuevoProducto.costeMaterial,
      pvpTransporte: nuevoProducto.pvpTransporte,
      costeTransporte: nuevoProducto.costeTransporte,
      transportistaId: nuevoProducto.transportistaId,
      fechaPedidoFabrica: nuevoProducto.fechaPedidoFabrica ? new Date(nuevoProducto.fechaPedidoFabrica) : undefined,
      recibidaOC: nuevoProducto.recibidaOC,
      fechaOC: nuevoProducto.fechaOC ? new Date(nuevoProducto.fechaOC) : undefined,
      seguimiento: nuevoProducto.seguimiento,
      fechaEnvio: nuevoProducto.fechaEnvio ? new Date(nuevoProducto.fechaEnvio) : undefined,
      fechaEntrega: nuevoProducto.fechaEntrega ? new Date(nuevoProducto.fechaEntrega) : undefined,
      beneficioProducto: 0,
      porcentajeBeneficioProducto: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const nuevosProductos = [...safeProductos, nuevoLineaMaterial];
    onChange(nuevosProductos);
    setExpandedProducts(prev => new Set([...prev, nuevoProducto.orden]));
  };

  const eliminarProducto = (orden: number) => {
    const safeProductos = Array.isArray(productos) ? productos : [];
    const nuevosProductos = safeProductos.filter(p => p?.orden !== orden);
    onChange(nuevosProductos);
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(orden);
      return newSet;
    });
  };

  const actualizarProducto = (orden: number, campo: string, valor: any) => {
    const safeProductos = Array.isArray(productos) ? productos : [];
    const nuevosProductos = safeProductos.map(producto => {
      if (producto?.orden === orden) {
        return { ...producto, [campo]: valor };
      }
      return producto;
    });
    onChange(nuevosProductos);
  };

  const toggleExpandProduct = (orden: number) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orden)) {
        newSet.delete(orden);
      } else {
        newSet.add(orden);
      }
      return newSet;
    });
  };

  const calcularBeneficios = (producto: LineaMaterial) => {
    const beneficioMaterial = (producto?.pvpMaterial || 0) - (producto?.costeMaterial || 0);
    const beneficioTransporte = (producto?.pvpTransporte || 0) - (producto?.costeTransporte || 0);
    const beneficioTotal = beneficioMaterial + beneficioTransporte;
    const pvpTotal = (producto?.pvpMaterial || 0) + (producto?.pvpTransporte || 0);
    const porcentaje = pvpTotal > 0 ? (beneficioTotal / pvpTotal) * 100 : 0;
    return { beneficio: beneficioTotal, porcentaje };
  };

  // Asegurar que productos sea un array válido
  const safeProductos = Array.isArray(productos) ? productos : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Productos del Pedido ({safeProductos.length})
        </h3>
        <Button
          type="button"
          onClick={añadirProducto}
          disabled={disabled}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Producto
        </Button>
      </div>

      <div className="space-y-3">
        {safeProductos.map((producto, index) => {
          // Validación adicional para cada producto
          if (!producto) {
            return null;
          }
          
          const isExpanded = expandedProducts.has(producto?.orden || index);
          const { beneficio, porcentaje } = calcularBeneficios(producto);
          
          return (
            <Card key={`${producto?.id || ''}-${producto?.orden || index}`} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpandProduct(producto?.orden || index)}
                      className="p-1"
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle className="text-base">
                        Producto {producto?.orden || index + 1}
                        {producto?.material && `: ${producto.material}`}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {producto?.cajas || 0} cajas • {producto?.piezas || 0} piezas • {formateoEspanol(producto?.metrosCuadrados || 0, 2)} m²
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={beneficio >= 0 ? 'default' : 'destructive'}>
                      {beneficio >= 0 ? '+' : ''}{formateoMoneda(beneficio, 2)} ({formateoPorcentaje(porcentaje, 1)})
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpandProduct(producto?.orden || index)}
                    >
                      {isExpanded ? 'Contraer' : 'Expandir'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarProducto(producto?.orden || index)}
                      disabled={disabled || safeProductos.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Información del Material */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Información del Material</h4>
                      
                      <div>
                        <Label>Proveedor</Label>
                        <SearchableSelect
                          endpoint="/api/proveedores"
                          value={producto?.proveedorId || ''}
                          onValueChange={(value) => actualizarProducto(producto?.orden || index, 'proveedorId', value)}
                          placeholder="Buscar proveedor..."
                          emptyMessage="No se encontraron proveedores"
                          disabled={disabled}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`material-${producto?.orden || index}`}>Material</Label>
                        <Input
                          id={`material-${producto?.orden || index}`}
                          value={producto?.material || ''}
                          onChange={(e) => actualizarProducto(producto?.orden || index, 'material', e.target.value)}
                          placeholder="Tipo de material"
                          disabled={disabled}
                        />
                      </div>

                      <div>
                        <Label>Formato</Label>
                        <SearchableSelect
                          endpoint="/api/formatos"
                          value={producto?.formatoId || ''}
                          onValueChange={(value) => actualizarProducto(producto?.orden || index, 'formatoId', value)}
                          placeholder="Buscar formato..."
                          emptyMessage="No se encontraron formatos"
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    {/* Cantidades y Precios */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Cantidades y Precios</h4>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor={`cajas-${producto?.orden || index}`}>Cajas</Label>
                          <Input
                            id={`cajas-${producto?.orden || index}`}
                            type="number"
                            min="0"
                            value={producto?.cajas || 0}
                            onChange={(e) => actualizarProducto(producto?.orden || index, 'cajas', parseInt(e.target.value) || 0)}
                            disabled={disabled}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`piezas-${producto?.orden || index}`}>Piezas</Label>
                          <Input
                            id={`piezas-${producto?.orden || index}`}
                            type="number"
                            min="0"
                            value={producto?.piezas || 0}
                            onChange={(e) => actualizarProducto(producto?.orden || index, 'piezas', parseInt(e.target.value) || 0)}
                            disabled={disabled}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`metros-${producto?.orden || index}`}>M²</Label>
                          <Input
                            id={`metros-${producto?.orden || index}`}
                            type="text"
                            value={formateoEspanol(producto?.metrosCuadrados || 0, 2)}
                            onChange={(e) => {
                              const valor = parsearEspanol(e.target.value) || 0;
                              actualizarProducto(producto?.orden || index, 'metrosCuadrados', valor);
                            }}
                            placeholder="0,00"
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`pvp-${producto?.orden || index}`}>PVP Material (€)</Label>
                          <Input
                            id={`pvp-${producto?.orden || index}`}
                            type="text"
                            value={formateoEspanol(producto?.pvpMaterial || 0, 2)}
                            onChange={(e) => {
                              const valor = parsearEspanol(e.target.value) || 0;
                              actualizarProducto(producto?.orden || index, 'pvpMaterial', valor);
                            }}
                            placeholder="0,00"
                            disabled={disabled}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`coste-${producto?.orden || index}`}>Coste Material (€)</Label>
                          <Input
                            id={`coste-${producto?.orden || index}`}
                            type="text"
                            value={formateoEspanol(producto?.costeMaterial || 0, 2)}
                            onChange={(e) => {
                              const valor = parsearEspanol(e.target.value) || 0;
                              actualizarProducto(producto?.orden || index, 'costeMaterial', valor);
                            }}
                            placeholder="0,00"
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`pvp-transporte-${producto?.orden || index}`}>PVP Transporte (€)</Label>
                          <Input
                            id={`pvp-transporte-${producto?.orden || index}`}
                            type="text"
                            value={formateoEspanol(producto?.pvpTransporte || 0, 2)}
                            onChange={(e) => {
                              const valor = parsearEspanol(e.target.value) || 0;
                              actualizarProducto(producto?.orden || index, 'pvpTransporte', valor);
                            }}
                            placeholder="0,00"
                            disabled={disabled}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`coste-transporte-${producto?.orden || index}`}>Coste Transporte (€)</Label>
                          <Input
                            id={`coste-transporte-${producto?.orden || index}`}
                            type="text"
                            value={formateoEspanol(producto?.costeTransporte || 0, 2)}
                            onChange={(e) => {
                              const valor = parsearEspanol(e.target.value) || 0;
                              actualizarProducto(producto?.orden || index, 'costeTransporte', valor);
                            }}
                            placeholder="0,00"
                            disabled={disabled}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logística y Seguimiento */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Logística y Seguimiento</h4>
                      
                      <div>
                        <Label>Transportista</Label>
                        <Select 
                          value={producto?.transportistaId || ''} 
                          onValueChange={(value) => actualizarProducto(producto?.orden || index, 'transportistaId', value)}
                          disabled={disabled || catalogsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar transportista..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(Array.isArray(transportistas) ? transportistas : []).map(transportista => (
                              <SelectItem key={transportista.id} value={transportista.id}>{transportista.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`fecha-pedido-${producto?.orden || index}`}>Pedido Fábrica</Label>
                          <Input
                            id={`fecha-pedido-${producto?.orden || index}`}
                            type="date"
                            value={producto?.fechaPedidoFabrica ? new Date(producto.fechaPedidoFabrica).toISOString().split('T')[0] : ''}
                            onChange={(e) => actualizarProducto(producto?.orden || index, 'fechaPedidoFabrica', e.target.value ? new Date(e.target.value) : null)}
                            disabled={disabled}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`fecha-oc-${producto?.orden || index}`}>Fecha OC</Label>
                          <Input
                            id={`fecha-oc-${producto?.orden || index}`}
                            type="date"
                            value={producto?.fechaOC ? new Date(producto.fechaOC).toISOString().split('T')[0] : ''}
                            onChange={(e) => actualizarProducto(producto?.orden || index, 'fechaOC', e.target.value ? new Date(e.target.value) : null)}
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`fecha-envio-${producto?.orden || index}`}>Fecha Envío</Label>
                          <Input
                            id={`fecha-envio-${producto?.orden || index}`}
                            type="date"
                            value={producto?.fechaEnvio ? new Date(producto.fechaEnvio).toISOString().split('T')[0] : ''}
                            onChange={(e) => actualizarProducto(producto?.orden || index, 'fechaEnvio', e.target.value ? new Date(e.target.value) : null)}
                            disabled={disabled}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`fecha-entrega-${producto?.orden || index}`}>Fecha Entrega</Label>
                          <Input
                            id={`fecha-entrega-${producto?.orden || index}`}
                            type="date"
                            value={producto?.fechaEntrega ? new Date(producto.fechaEntrega).toISOString().split('T')[0] : ''}
                            onChange={(e) => actualizarProducto(producto?.orden || index, 'fechaEntrega', e.target.value ? new Date(e.target.value) : null)}
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`recibida-oc-${producto?.orden || index}`}
                          checked={producto?.recibidaOC || false}
                          onCheckedChange={(checked) => actualizarProducto(producto?.orden || index, 'recibidaOC', checked)}
                          disabled={disabled}
                        />
                        <Label htmlFor={`recibida-oc-${producto?.orden || index}`}>Recibida OC</Label>
                      </div>

                      <div>
                        <Label htmlFor={`seguimiento-${producto?.orden || index}`}>Seguimiento</Label>
                        <Input
                          id={`seguimiento-${producto?.orden || index}`}
                          value={producto?.seguimiento || ''}
                          onChange={(e) => actualizarProducto(producto?.orden || index, 'seguimiento', e.target.value)}
                          placeholder="Estado del seguimiento"
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {safeProductos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
            <p className="text-muted-foreground text-center mb-4">
              Añade productos para completar el pedido
            </p>
            <Button onClick={añadirProducto} disabled={disabled}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Primer Producto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
