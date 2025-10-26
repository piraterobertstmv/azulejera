
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { LineaMaterial, Transportista } from '../lib/types';
import { useToast } from '../hooks/use-toast';
import { formateoMoneda } from '../lib/utils';

interface MaterialDetailsCompactProps {
  materiales: LineaMaterial[];
  onMaterialUpdate: (materialId: string, updatedMaterial: LineaMaterial) => void;
}

interface SavingState {
  [materialId: string]: Set<string>;
}

interface EditingState {
  [materialId: string]: {
    [field: string]: any;
  };
}

interface CatalogData {
  transportistas: Transportista[];
}

export default function MaterialDetailsCompact({
  materiales,
  onMaterialUpdate
}: MaterialDetailsCompactProps) {
  const { toast } = useToast();
  
  const [catalogData, setCatalogData] = useState<CatalogData>({
    transportistas: []
  });
  const [editing, setEditing] = useState<EditingState>({});
  const [saving, setSaving] = useState<SavingState>({});
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      const transportistasRes = await fetch('/api/transportistas');
      const transportistas = transportistasRes.ok ? await transportistasRes.json() : [];
      
      setCatalogData({
        transportistas: Array.isArray(transportistas) ? transportistas : []
      });
    } catch (error) {
      console.error('Error loading catalogs:', error);
      setCatalogData({ transportistas: [] });
    } finally {
      setLoadingCatalogs(false);
    }
  };

  const startEdit = (materialId: string, field: string, currentValue: any) => {
    // Para campos de tipo select, si el valor es null/undefined, usar 'sin-asignar'
    const editValue = (currentValue === null || currentValue === undefined) ? 'sin-asignar' : currentValue;
    
    setEditing(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [field]: editValue
      }
    }));
  };

  const updateEdit = (materialId: string, field: string, value: any) => {
    setEditing(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [field]: value
      }
    }));
  };

  const cancelEdit = (materialId: string, field: string) => {
    setEditing(prev => {
      const newEditing = { ...prev };
      if (newEditing[materialId]) {
        delete newEditing[materialId][field];
        if (Object.keys(newEditing[materialId]).length === 0) {
          delete newEditing[materialId];
        }
      }
      return newEditing;
    });
  };

  const saveField = async (materialId: string, field: string) => {
    const value = editing[materialId]?.[field];
    if (value === undefined) return;

    setSaving(prev => ({
      ...prev,
      [materialId]: new Set([...(prev[materialId] || []), field])
    }));

    try {
      let processedValue = value;
      if (field === 'recibidaOC') {
        processedValue = value === 'true';
      } else if (field === 'fechaPedidoFabrica' || field === 'fechaOC' || field === 'fechaEnvio' || field === 'fechaEntrega') {
        processedValue = value ? new Date(value).toISOString() : null;
      } else if (value === 'sin-asignar') {
        processedValue = null;
      }

      const response = await fetch(`/api/lineas-material/${materialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: processedValue })
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
      setSaving(prev => {
        const newSaving = { ...prev };
        if (newSaving[materialId]) {
          newSaving[materialId].delete(field);
          if (newSaving[materialId].size === 0) {
            delete newSaving[materialId];
          }
        }
        return newSaving;
      });
    }
  };

  const renderEditableField = (
    material: LineaMaterial,
    field: string,
    label: string,
    type: 'text' | 'date' | 'select' = 'text',
    options?: Array<{id: string, nombre: string}>
  ) => {
    const materialId = material.id;
    const isEditing = editing[materialId]?.[field] !== undefined;
    const isSaving = saving[materialId]?.has(field) || false;
    
    let currentValue: any;
    if (isEditing) {
      currentValue = editing[materialId][field];
    } else {
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
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}:</span>
          {type === 'select' ? (
            <Select 
              value={currentValue || 'sin-asignar'} 
              onValueChange={(value) => updateEdit(materialId, field, value)}
              disabled={isSaving}
            >
              <SelectTrigger className="h-6 text-xs border-white/20">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                {(options || []).map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={type}
              value={currentValue || ''}
              onChange={(e) => updateEdit(materialId, field, e.target.value)}
              className="h-6 text-xs border-white/20"
              disabled={isSaving}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveField(materialId, field)}
            disabled={isSaving}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cancelEdit(materialId, field)}
            disabled={isSaving}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    let displayValue: React.ReactNode;
    if (type === 'select' && currentValue) {
      const option = options?.find(opt => opt.id === currentValue);
      displayValue = option?.nombre || 'Sin asignar';
    } else if (type === 'date' && currentValue) {
      displayValue = new Date(currentValue).toLocaleDateString('es-ES');
    } else if (field === 'recibidaOC') {
      displayValue = currentValue ? 'Sí' : 'No';
    } else {
      displayValue = currentValue || 'Sin especificar';
    }

    return (
      <div className="text-xs">
        <span className="text-muted-foreground">{label}:</span> 
        <span 
          className="cursor-pointer hover:bg-white/10 px-1 rounded text-foreground"
          onClick={() => startEdit(materialId, field, currentValue)}
        >
          {displayValue}
        </span>
      </div>
    );
  };

  const renderReadOnlyField = (label: string, value: any) => (
    <div className="text-xs">
      <span className="text-muted-foreground">{label}:</span> 
      <span className="text-foreground">{value || 'N/A'}</span>
    </div>
  );

  if (!materiales || materiales.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No hay líneas de material para este pedido</p>
      </div>
    );
  }

  if (loadingCatalogs) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm">Cargando detalles de materiales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Detalles de Materiales ({materiales.length} líneas)</h3>

      {materiales.map((material, index) => {
        const beneficioMaterial = (material.pvpMaterial || 0) - (material.costeMaterial || 0);
        const beneficioTransporte = (material.pvpTransporte || 0) - (material.costeTransporte || 0);
        const porcentajeBeneficioMaterial = (material.pvpMaterial || 0) > 0 ? (beneficioMaterial / (material.pvpMaterial || 1)) * 100 : 0;

        return (
          <div key={material.id} className="border-b border-white/10 pb-3 mb-3">
            {/* Primera línea: Material, Formato, Proveedor, Cajas, Piezas, M2 */}
            <div className="grid grid-cols-6 gap-4 mb-2">
              {renderReadOnlyField('Material', material.material)}
              {renderReadOnlyField('Formato', material.formato?.nombre)}
              {renderReadOnlyField('Proveedor', material.proveedor?.nombre)}
              {renderReadOnlyField('Cajas', material.cajas)}
              {renderReadOnlyField('Piezas', material.piezas)}
              {renderReadOnlyField('M²', (material.metrosCuadrados || 0).toFixed(2))}
            </div>

            {/* Segunda línea: 4 columnas */}
            <div className="grid grid-cols-4 gap-4">
              {/* Columna 1: Pedido a fábrica, Recibida OC, Fecha OC */}
              <div className="space-y-1">
                {renderEditableField(material, 'fechaPedidoFabrica', 'Pedido fábrica', 'date')}
                {renderEditableField(material, 'recibidaOC', 'Recibida OC', 'select', [
                  { id: 'true', nombre: 'Sí' },
                  { id: 'false', nombre: 'No' }
                ])}
                {renderEditableField(material, 'fechaOC', 'Fecha OC', 'date')}
              </div>

              {/* Columna 2: Transportista, Seguimiento, Fecha Envío, Fecha Entrega */}
              <div className="space-y-1">
                {renderEditableField(material, 'transportistaId', 'Transportista', 'select', catalogData.transportistas)}
                {renderEditableField(material, 'seguimiento', 'Seguimiento', 'text')}
                {renderEditableField(material, 'fechaEnvio', 'Fecha envío', 'date')}
                {renderEditableField(material, 'fechaEntrega', 'Fecha entrega', 'date')}
              </div>

              {/* Columna 3: PVP Material, Coste Material, Beneficio Material, % Beneficio Material */}
              <div className="space-y-1">
                {renderReadOnlyField('PVP Material', formateoMoneda(material.pvpMaterial || 0, 2))}
                {renderReadOnlyField('Coste Material', formateoMoneda(material.costeMaterial || 0, 2))}
                {renderReadOnlyField('Beneficio Material', formateoMoneda(beneficioMaterial, 2))}
                {renderReadOnlyField('% Beneficio Material', `${porcentajeBeneficioMaterial.toFixed(1)}%`)}
              </div>

              {/* Columna 4: PVP Transporte, Coste Transporte, Beneficio Transporte */}
              <div className="space-y-1">
                {renderReadOnlyField('PVP Transporte', formateoMoneda(material.pvpTransporte || 0, 2))}
                {renderReadOnlyField('Coste Transporte', formateoMoneda(material.costeTransporte || 0, 2))}
                {renderReadOnlyField('Beneficio Transporte', formateoMoneda(beneficioTransporte, 2))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
