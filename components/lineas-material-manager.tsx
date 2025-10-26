
'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Package2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import SearchableSelect from './searchable-select';
import { useToast } from '../hooks/use-toast';
import { LineaMaterial, PedidoTransportista, Proveedor } from '../lib/types';

interface LineasMaterialManagerProps {
  lineasMaterial: LineaMaterial[];
  transportistas: PedidoTransportista[];
  modoAgrupado: boolean;
  onLineasMaterialChange: (lineas: LineaMaterial[]) => void;
  onModoAgrupadoChange: (agrupado: boolean) => void;
  disabled?: boolean;
}

export default function LineasMaterialManager({
  lineasMaterial,
  transportistas,
  modoAgrupado,
  onLineasMaterialChange,
  onModoAgrupadoChange,
  disabled = false,
}: LineasMaterialManagerProps) {
  const { toast } = useToast();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores?limit=100');
      if (response.ok) {
        const data = await response.json();
        setProveedores(data);
      }
    } catch (error) {
      console.error('Error fetching proveedores:', error);
    }
  };

  const addLineaMaterial = () => {
    const newLinea: LineaMaterial = {
      id: `temp-${Date.now()}`,
      pedidoId: '',
      orden: lineasMaterial.length + 1,
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

    onLineasMaterialChange([...lineasMaterial, newLinea]);
  };

  const removeLineaMaterial = (index: number) => {
    const updated = lineasMaterial.filter((_, i) => i !== index);
    // Reordenar
    const reordered = updated.map((linea, i) => ({ ...linea, orden: i + 1 }));
    onLineasMaterialChange(reordered);
  };

  const updateLineaMaterial = (index: number, field: keyof LineaMaterial, value: any) => {
    const updated = [...lineasMaterial];
    updated[index] = { ...updated[index], [field]: value };



    // Recalcular beneficios si cambió precio o coste
    if (field === 'pvpMaterial' || field === 'costeMaterial') {
      const linea = updated[index];
      const beneficio = linea.pvpMaterial - linea.costeMaterial;
      const porcentaje = linea.pvpMaterial > 0 ? (beneficio / linea.pvpMaterial) * 100 : 0;
      updated[index].beneficioProducto = beneficio;
      updated[index].porcentajeBeneficioProducto = porcentaje;
    }

    onLineasMaterialChange(updated);
  };

  const detectProveedoresIguales = () => {
    const proveedoresUnicos = new Set(
      lineasMaterial
        .filter(linea => linea.proveedorId)
        .map(linea => linea.proveedorId)
    );
    return proveedoresUnicos.size <= 1;
  };

  const proveedoresIguales = detectProveedoresIguales();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Líneas de Material
            <Badge variant="outline">{lineasMaterial.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="modoAgrupado"
                checked={modoAgrupado}
                onCheckedChange={onModoAgrupadoChange}
                disabled={disabled}
              />
              <Label htmlFor="modoAgrupado" className="text-sm">Modo Agrupado</Label>
            </div>
            <Button
              onClick={addLineaMaterial}
              disabled={disabled}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Línea
            </Button>
          </div>
        </div>
        
        {/* Información sobre agrupación */}
        <div className="text-sm text-muted-foreground">
          {modoAgrupado ? (
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>
                {proveedoresIguales 
                  ? "Campos agrupados: mismo proveedor detectado" 
                  : "Campos agrupados: un campo por proveedor"
                }
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Campos personalizados: configuración individual por línea</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {lineasMaterial.map((linea, index) => (
          <div key={linea.id || index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Línea {linea.orden}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeLineaMaterial(index)}
                disabled={disabled}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            {/* Información básica del material */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Proveedor</Label>
                <SearchableSelect
                  endpoint="/api/proveedores"
                  value={linea.proveedorId || ''}
                  onValueChange={(value) => updateLineaMaterial(index, 'proveedorId', value)}
                  placeholder="Seleccionar proveedor..."
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>Formato</Label>
                <SearchableSelect
                  endpoint="/api/formatos"
                  value={linea.formatoId || ''}
                  onValueChange={(value) => updateLineaMaterial(index, 'formatoId', value)}
                  placeholder="Seleccionar formato..."
                  disabled={disabled}
                />
              </div>
            </div>

            <div>
              <Label>Material</Label>
              <Input
                value={linea.material}
                onChange={(e) => updateLineaMaterial(index, 'material', e.target.value)}
                placeholder="Descripción del material"
                disabled={disabled}
              />
            </div>

            {/* Cantidades */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Cajas</Label>
                <Input
                  type="number"
                  value={linea.cajas}
                  onChange={(e) => updateLineaMaterial(index, 'cajas', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>Piezas</Label>
                <Input
                  type="number"
                  value={linea.piezas}
                  onChange={(e) => updateLineaMaterial(index, 'piezas', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>m²</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={linea.metrosCuadrados}
                  onChange={(e) => updateLineaMaterial(index, 'metrosCuadrados', parseFloat(e.target.value) || 0)}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Precios y descuentos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>PVP Material (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={linea.pvpMaterial}
                  onChange={(e) => updateLineaMaterial(index, 'pvpMaterial', parseFloat(e.target.value) || 0)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>Coste Material (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={linea.costeMaterial}
                  onChange={(e) => updateLineaMaterial(index, 'costeMaterial', parseFloat(e.target.value) || 0)}
                  disabled={disabled}
                />
              </div>

            </div>

            {/* Transportista asignado */}
            {transportistas.length > 1 && (
              <div>
                <Label>Transportista Asignado</Label>
                <SearchableSelect
                  endpoint="/api/transportistas"
                  value={linea.transportistaId || ''}
                  onValueChange={(value) => updateLineaMaterial(index, 'transportistaId', value)}
                  placeholder="Seleccionar transportista..."
                  disabled={disabled}
                />
              </div>
            )}

            {/* Campos personalizables por línea */}
            {!modoAgrupado && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-sm">Campos Personalizados</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha Pedido Fábrica</Label>
                    <Input
                      type="date"
                      value={linea.fechaPedidoFabrica ? new Date(linea.fechaPedidoFabrica).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateLineaMaterial(index, 'fechaPedidoFabrica', e.target.value ? new Date(e.target.value) : null)}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label>Fecha OC</Label>
                    <Input
                      type="date"
                      value={linea.fechaOC ? new Date(linea.fechaOC).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateLineaMaterial(index, 'fechaOC', e.target.value ? new Date(e.target.value) : null)}
                      disabled={disabled}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`recibidaOC-${index}`}
                    checked={linea.recibidaOC}
                    onCheckedChange={(checked) => updateLineaMaterial(index, 'recibidaOC', checked)}
                    disabled={disabled}
                  />
                  <Label htmlFor={`recibidaOC-${index}`}>Recibida OC</Label>
                </div>

                <div>
                  <Label>Seguimiento</Label>
                  <Textarea
                    value={linea.seguimiento || ''}
                    onChange={(e) => updateLineaMaterial(index, 'seguimiento', e.target.value)}
                    placeholder="Información de seguimiento..."
                    disabled={disabled}
                  />
                </div>
              </div>
            )}

            {/* Beneficios calculados */}
            <div className="grid grid-cols-2 gap-4 bg-muted p-3 rounded">
              <div>
                <Label className="text-sm">Beneficio (€)</Label>
                <p className="font-medium">{linea.beneficioProducto.toFixed(2)}€</p>
              </div>
              <div>
                <Label className="text-sm">% Beneficio</Label>
                <p className="font-medium">{linea.porcentajeBeneficioProducto.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        ))}

        {lineasMaterial.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay líneas de material añadidas</p>
            <p className="text-sm">Añade líneas de material para gestión detallada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
