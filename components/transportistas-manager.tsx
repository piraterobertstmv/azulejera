
'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import SearchableSelect from './searchable-select';
import { useToast } from '../hooks/use-toast';
import { PedidoTransportista, Transportista } from '../lib/types';

interface TransportistasManagerProps {
  transportistas: PedidoTransportista[];
  onTransportistasChange: (transportistas: PedidoTransportista[]) => void;
  disabled?: boolean;
}

export default function TransportistasManager({
  transportistas,
  onTransportistasChange,
  disabled = false,
}: TransportistasManagerProps) {
  const { toast } = useToast();

  const addTransportista = () => {
    if (transportistas.length >= 4) {
      toast({
        title: "Límite alcanzado",
        description: "Solo se pueden añadir hasta 4 transportistas por pedido",
        variant: "destructive",
      });
      return;
    }

    const newTransportista: PedidoTransportista = {
      id: `temp-${Date.now()}`,
      pedidoId: '',
      transportistaId: '',
      orden: transportistas.length + 1,
    };

    onTransportistasChange([...transportistas, newTransportista]);
  };

  const removeTransportista = (index: number) => {
    if (transportistas.length <= 1) {
      toast({
        title: "No se puede eliminar",
        description: "Debe haber al menos un transportista",
        variant: "destructive",
      });
      return;
    }

    const updated = transportistas.filter((_, i) => i !== index);
    // Reordenar
    const reordered = updated.map((t, i) => ({ ...t, orden: i + 1 }));
    onTransportistasChange(reordered);
  };

  const updateTransportista = (index: number, transportistaId: string) => {
    const updated = [...transportistas];
    updated[index] = { ...updated[index], transportistaId };
    onTransportistasChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Transportistas
            <Badge variant="outline">{transportistas.length}/4</Badge>
          </CardTitle>
          <Button
            onClick={addTransportista}
            disabled={disabled || transportistas.length >= 4}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {transportistas.map((transportista, index) => (
          <div key={transportista.id || index} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {transportista.orden}
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">Transportista {transportista.orden}</Label>
              <SearchableSelect
                endpoint="/api/transportistas"
                value={transportista.transportistaId}
                onValueChange={(value) => updateTransportista(index, value)}
                placeholder="Seleccionar transportista..."
                className="mt-1"
                disabled={disabled}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeTransportista(index)}
              disabled={disabled || transportistas.length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {transportistas.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay transportistas añadidos</p>
            <p className="text-sm">Añade al menos un transportista para el pedido</p>
          </div>
        )}

        {transportistas.length === 1 && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Un solo transportista:</strong> Todo el material será asignado automáticamente
            </p>
          </div>
        )}

        {transportistas.length > 1 && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">
              <strong>Múltiples transportistas:</strong> Podrás asignar materiales específicos a cada transportista
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
