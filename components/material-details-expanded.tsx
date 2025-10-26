
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Package,
  Save,
  X,
  Euro,
  Calendar,
  Truck,
  Factory,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calculator,
  Edit3,
  Eye
} from 'lucide-react';
import { LineaMaterial, Proveedor, Formato, Transportista, EstadoPedido } from '../lib/types';
import { useToast } from '../hooks/use-toast';
import { formateoMoneda, formateoPorcentaje } from '../lib/utils';

interface MaterialDetailsExpandedProps {
  materiales: LineaMaterial[];
  onMaterialUpdate: (materialId: string, updatedMaterial: LineaMaterial) => void;
}

interface EditingStates {
  [materialId: string]: {
    [field: string]: any;
  };
}

interface SavingStates {
  [materialId: string]: Set<string>;
}

export default function MaterialDetailsExpanded({
  materiales,
  onMaterialUpdate
}: MaterialDetailsExpandedProps) {
  const { toast } = useToast();
  
  // Estados para edición
  const [editingFields, setEditingFields] = useState<EditingStates>({});
  const [savingFields, setSavingFields] = useState<SavingStates>({});
  
  // Estados para catálogos
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [formatos, setFormatos] = useState<Formato[]>([]);
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [estadosPedido, setEstadosPedido] = useState<EstadoPedido[]>([]);
  
  // Estados para valores calculados
  const [calculatedValues, setCalculatedValues] = useState<{[materialId: string]: any}>({});

  useEffect(() => {
    Promise.all([
      fetchProveedores(),
      fetchFormatos(),
      fetchTransportistas(),
      fetchEstadosPedido()
    ]);
  }, []);

  useEffect(() => {
    // Calcular valores iniciales para todos los materiales
    const newCalculatedValues: {[materialId: string]: any} = {};
    materiales.forEach(material => {
      newCalculatedValues[material.id] = calculateBeneficios(material);
    });
    setCalculatedValues(newCalculatedValues);
  }, [materiales]);

  const fetchProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores');
      if (response.ok) {
        const data = await response.json();
        setProveedores(data || []);
      }
    } catch (error) {
      console.error('Error fetching proveedores:', error);
    }
  };

  const fetchFormatos = async () => {
    try {
      const response = await fetch('/api/formatos');
      if (response.ok) {
        const data = await response.json();
        setFormatos(data || []);
      }
    } catch (error) {
      console.error('Error fetching formatos:', error);
    }
  };

  const fetchTransportistas = async () => {
    try {
      const response = await fetch('/api/transportistas');
      if (response.ok) {
        const data = await response.json();
        setTransportistas(data || []);
      }
    } catch (error) {
      console.error('Error fetching transportistas:', error);
    }
  };

  const fetchEstadosPedido = async () => {
    try {
      const response = await fetch('/api/estados-pedido');
      if (response.ok) {
        const data = await response.json();
        setEstadosPedido(data || []);
      }
    } catch (error) {
      console.error('Error fetching estados pedido:', error);
    }
  };

  const calculateBeneficios = (material: LineaMaterial, editedValues?: any) => {
    const pvpMaterial = editedValues?.pvpMaterial !== undefined ? 
      parseFloat(editedValues.pvpMaterial) || 0 : material.pvpMaterial;
    const costeMaterial = editedValues?.costeMaterial !== undefined ? 
      parseFloat(editedValues.costeMaterial) || 0 : material.costeMaterial;
    const pvpTransporte = editedValues?.pvpTransporte !== undefined ? 
      parseFloat(editedValues.pvpTransporte) || 0 : material.pvpTransporte;
    const costeTransporte = editedValues?.costeTransporte !== undefined ? 
      parseFloat(editedValues.costeTransporte) || 0 : material.costeTransporte;

    const beneficioMaterial = pvpMaterial - costeMaterial;
    const beneficioTransporte = pvpTransporte - costeTransporte;
    const porcentajeBeneficioMaterial = pvpMaterial > 0 ? (beneficioMaterial / pvpMaterial) * 100 : 0;
    const porcentajeBeneficioTransporte = pvpTransporte > 0 ? (beneficioTransporte / pvpTransporte) * 100 : 0;

    return {
      beneficioMaterial,
      beneficioTransporte,
      porcentajeBeneficioMaterial,
      porcentajeBeneficioTransporte
    };
  };

  const startEdit = (materialId: string, field: string, currentValue: any) => {
    setEditingFields(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [field]: currentValue
      }
    }));
  };

  const updateEditValue = (materialId: string, field: string, value: any) => {
    setEditingFields(prev => {
      const newFields = {
        ...prev,
        [materialId]: {
          ...prev[materialId],
          [field]: value
        }
      };

      // Si es un campo de precio, recalcular beneficios en tiempo real
      if (['pvpMaterial', 'costeMaterial', 'pvpTransporte', 'costeTransporte'].includes(field)) {
        const material = materiales.find(m => m.id === materialId);
        if (material) {
          const newCalculated = calculateBeneficios(material, newFields[materialId]);
          setCalculatedValues(prev => ({
            ...prev,
            [materialId]: newCalculated
          }));
        }
      }

      return newFields;
    });
  };

  const cancelEdit = (materialId: string, field: string) => {
    setEditingFields(prev => {
      const newFields = { ...prev };
      if (newFields[materialId]) {
        delete newFields[materialId][field];
        if (Object.keys(newFields[materialId]).length === 0) {
          delete newFields[materialId];
        }
      }
      return newFields;
    });

    // Restaurar valores calculados originales
    const material = materiales.find(m => m.id === materialId);
    if (material) {
      setCalculatedValues(prev => ({
        ...prev,
        [materialId]: calculateBeneficios(material)
      }));
    }
  };

  const saveField = async (materialId: string, field: string) => {
    const value = editingFields[materialId]?.[field];
    if (value === undefined) return;

    setSavingFields(prev => ({
      ...prev,
      [materialId]: new Set([...(prev[materialId] || []), field])
    }));

    try {
      const updateData: any = { [field]: value };

      const response = await fetch(`/api/lineas-material/${materialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedMaterial = await response.json();
        onMaterialUpdate(materialId, updatedMaterial);
        cancelEdit(materialId, field);
        
        toast({
          title: "Campo actualizado",
          description: "El campo se ha guardado correctamente.",
        });
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error saving field:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el campo.",
        variant: "destructive",
      });
    } finally {
      setSavingFields(prev => {
        const newFields = { ...prev };
        if (newFields[materialId]) {
          newFields[materialId].delete(field);
          if (newFields[materialId].size === 0) {
            delete newFields[materialId];
          }
        }
        return newFields;
      });
    }
  };

  const renderEditableField = (
    material: LineaMaterial,
    field: string,
    label: string,
    type: 'text' | 'number' | 'date' | 'select' = 'text',
    options?: Array<{id: string, nombre: string}>,
    formatValue?: (value: any) => string,
    icon?: React.ReactNode
  ) => {
    const materialId = material.id;
    const isEditing = editingFields[materialId]?.[field] !== undefined;
    const isSaving = savingFields[materialId]?.has(field);
    
    let currentValue: any;
    if (isEditing) {
      currentValue = editingFields[materialId][field];
    } else {
      // Obtener el valor actual del material
      const materialValue = (material as any)[field];
      if (type === 'select' && typeof materialValue === 'object' && materialValue?.id) {
        currentValue = materialValue.id;
      } else if (type === 'date' && materialValue) {
        currentValue = new Date(materialValue).toISOString().split('T')[0];
      } else {
        currentValue = materialValue;
      }
    }

    if (isEditing) {
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            {icon}
            {label}
          </Label>
          <div className="flex items-center gap-2">
            {type === 'select' ? (
              <Select 
                value={currentValue || ''} 
                onValueChange={(value) => updateEditValue(materialId, field, value)}
                disabled={isSaving}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {(options || []).map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'date' ? (
              <Input
                type="date"
                value={currentValue || ''}
                onChange={(e) => updateEditValue(materialId, field, e.target.value)}
                className="h-9"
                disabled={isSaving}
              />
            ) : (
              <Input
                type={type}
                value={currentValue || ''}
                onChange={(e) => updateEditValue(materialId, field, e.target.value)}
                className="h-9"
                disabled={isSaving}
                step={type === 'number' ? "0.01" : undefined}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveField(materialId, field)}
              disabled={isSaving}
              className="h-9 w-9 p-0 bg-green-50 hover:bg-green-100"
            >
              {isSaving ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save className="h-3 w-3 text-green-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelEdit(materialId, field)}
              disabled={isSaving}
              className="h-9 w-9 p-0 bg-red-50 hover:bg-red-100"
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        </div>
      );
    }

    // Vista de solo lectura con click para editar
    let displayValue: React.ReactNode;
    if (type === 'select' && currentValue) {
      const option = options?.find(opt => opt.id === currentValue);
      displayValue = option?.nombre || 'Sin asignar';
    } else if (type === 'date' && currentValue) {
      displayValue = new Date(currentValue).toLocaleDateString('es-ES');
    } else if (type === 'number' && currentValue !== null && currentValue !== undefined) {
      displayValue = formatValue ? formatValue(currentValue) : currentValue;
    } else {
      displayValue = currentValue || 'Sin especificar';
    }

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          {icon}
          {label}
        </Label>
        <div 
          className="cursor-pointer hover:bg-muted/50 p-2 rounded-md border border-transparent hover:border-border transition-colors min-h-[36px] flex items-center justify-between group"
          onClick={() => startEdit(materialId, field, currentValue)}
        >
          <span className="text-sm">{displayValue}</span>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  const renderCalculatedField = (
    label: string,
    value: number,
    isPercentage: boolean = false,
    icon?: React.ReactNode,
    colorClass: string = "text-foreground"
  ) => (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </Label>
      <div className={`p-2 rounded-md bg-muted/30 min-h-[36px] flex items-center font-medium ${colorClass}`}>
        {isPercentage ? formateoPorcentaje(value, 1) : formateoMoneda(value, 2)}
      </div>
    </div>
  );

  if (!materiales || materiales.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay líneas de material para este pedido</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Detalles de Materiales ({materiales.length} líneas)
        </h4>
        <Badge variant="outline" className="text-xs">
          Interfaz Expandida - Aprovecha todo el ancho de pantalla
        </Badge>
      </div>

      {materiales.map((material, index) => (
        <Card key={material.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  Línea {index + 1}
                </Badge>
                <h5 className="font-medium text-sm">
                  {material.material || 'Material no especificado'}
                </h5>
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {material.id}
              </div>
            </div>

            {/* Grid principal - 6 columnas para pantalla completa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
              
              {/* Columna 1: Información básica */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-blue-600 mb-3 border-b border-blue-200 pb-1">
                  📋 Información Básica
                </div>
                
                {renderEditableField(
                  material, 'proveedorId', 'Proveedor', 'select', 
                  proveedores, undefined, <Factory className="h-3 w-3" />
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Material
                  </Label>
                  <div className="p-2 rounded-md bg-muted/20 border text-sm flex items-center gap-2">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    {material.material || 'No especificado'}
                  </div>
                </div>

                {renderEditableField(
                  material, 'formatoId', 'Formato', 'select', 
                  formatos, undefined, <Package className="h-3 w-3" />
                )}
              </div>

              {/* Columna 2: Cantidades */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-purple-600 mb-3 border-b border-purple-200 pb-1">
                  📦 Cantidades
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Cajas</Label>
                  <div className="p-2 rounded-md bg-muted/20 border text-sm font-medium">
                    {material.cajas || 0}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Piezas</Label>
                  <div className="p-2 rounded-md bg-muted/20 border text-sm font-medium">
                    {material.piezas || 0}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Metros²</Label>
                  <div className="p-2 rounded-md bg-muted/20 border text-sm font-medium">
                    {(material.metrosCuadrados || 0).toLocaleString('es-ES', {
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2
                    })}
                  </div>
                </div>
              </div>

              {/* Columna 3: Precios Material */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-green-600 mb-3 border-b border-green-200 pb-1">
                  💰 Precios Material
                </div>
                
                {renderEditableField(
                  material, 'pvpMaterial', 'PVP Material', 'number', 
                  undefined, (v) => formateoMoneda(v, 2), <Euro className="h-3 w-3" />
                )}

                {renderEditableField(
                  material, 'costeMaterial', 'Coste Material', 'number', 
                  undefined, (v) => formateoMoneda(v, 2), <Euro className="h-3 w-3" />
                )}

                {renderCalculatedField(
                  'Beneficio Material',
                  calculatedValues[material.id]?.beneficioMaterial || 0,
                  false,
                  <TrendingUp className="h-3 w-3" />,
                  calculatedValues[material.id]?.beneficioMaterial >= 0 ? "text-green-600" : "text-red-600"
                )}
              </div>

              {/* Columna 4: Precios Transporte */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-orange-600 mb-3 border-b border-orange-200 pb-1">
                  🚛 Precios Transporte
                </div>
                
                {renderEditableField(
                  material, 'pvpTransporte', 'PVP Transporte', 'number', 
                  undefined, (v) => formateoMoneda(v, 2), <Euro className="h-3 w-3" />
                )}

                {renderEditableField(
                  material, 'transportistaId', 'Transportista', 'select', 
                  transportistas, undefined, <Truck className="h-3 w-3" />
                )}

                {renderCalculatedField(
                  'Beneficio Transporte',
                  calculatedValues[material.id]?.beneficioTransporte || 0,
                  false,
                  <TrendingUp className="h-3 w-3" />,
                  calculatedValues[material.id]?.beneficioTransporte >= 0 ? "text-green-600" : "text-red-600"
                )}
              </div>

              {/* Columna 5: Fechas y Estado */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-blue-600 mb-3 border-b border-blue-200 pb-1">
                  📅 Fechas y Estado
                </div>
                
                {renderEditableField(
                  material, 'fechaPedidoFabrica', 'Pedido a Fábrica', 'date', 
                  undefined, undefined, <Calendar className="h-3 w-3" />
                )}

                {renderEditableField(
                  material, 'fechaOC', 'Fecha OC', 'date', 
                  undefined, undefined, <Calendar className="h-3 w-3" />
                )}

                {renderEditableField(
                  material, 'recibidaOC', 'Recibida OC', 'select', 
                  [
                    { id: 'true', nombre: 'Sí' },
                    { id: 'false', nombre: 'No' }
                  ], 
                  undefined, 
                  <CheckCircle className="h-3 w-3" />
                )}
              </div>

              {/* Columna 6: Logística y Beneficios */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-red-600 mb-3 border-b border-red-200 pb-1">
                  📊 Logística y Beneficios
                </div>
                
                {renderEditableField(
                  material, 'fechaEnvio', 'Fecha Envío', 'date', 
                  undefined, undefined, <Calendar className="h-3 w-3" />
                )}

                {renderEditableField(
                  material, 'seguimiento', 'Seguimiento', 'text', 
                  undefined, undefined, <AlertCircle className="h-3 w-3" />
                )}

                <div className="grid grid-cols-1 gap-2">
                  {renderCalculatedField(
                    '% Benef. Material',
                    calculatedValues[material.id]?.porcentajeBeneficioMaterial || 0,
                    true,
                    <Calculator className="h-3 w-3" />,
                    calculatedValues[material.id]?.porcentajeBeneficioMaterial >= 0 ? "text-green-600" : "text-red-600"
                  )}
                  
                  {renderCalculatedField(
                    '% Benef. Transporte',
                    calculatedValues[material.id]?.porcentajeBeneficioTransporte || 0,
                    true,
                    <Calculator className="h-3 w-3" />,
                    calculatedValues[material.id]?.porcentajeBeneficioTransporte >= 0 ? "text-green-600" : "text-red-600"
                  )}
                </div>
              </div>
            </div>

            {/* Resumen inferior con totales */}
            <div className="mt-6 pt-4 border-t bg-muted/20 -mx-6 px-6 -mb-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-purple-500">
                    {formateoMoneda((material.pvpMaterial || 0) + (material.pvpTransporte || 0), 2)}
                  </div>
                  <div className="text-xs text-muted-foreground">PVP Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">
                    {formateoMoneda((material.costeMaterial || 0) + (material.costeTransporte || 0), 2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Coste Total</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${
                    (calculatedValues[material.id]?.beneficioMaterial || 0) + 
                    (calculatedValues[material.id]?.beneficioTransporte || 0) >= 0 
                      ? 'text-purple-500' : 'text-red-600'
                  }`}>
                    {formateoMoneda(
                      (calculatedValues[material.id]?.beneficioMaterial || 0) + 
                      (calculatedValues[material.id]?.beneficioTransporte || 0), 
                      2
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Beneficio Total</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${
                    material.estadoPedido ? 'text-blue-600' : 'text-muted-foreground'
                  }`}>
                    {material.estadoPedido?.nombre || 'Sin estado'}
                  </div>
                  <div className="text-xs text-muted-foreground">Estado</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
