
'use client';

import { useState, useEffect } from 'react';
// Icons removed as per user request
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { FormaPago } from '../../lib/types';

export default function FormasPagoAdmin() {
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFormaPago, setEditingFormaPago] = useState<FormaPago | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    comisionFija: 0,
    comisionPorcentaje: 0,
    comisionFijaCobradaCliente: 0,
    comisionPorcentajeCobradoCliente: 0,
    activo: true,
  });

  useEffect(() => {
    fetchFormasPago();
  }, []);

  const fetchFormasPago = async () => {
    try {
      const response = await fetch('/api/formas-pago');
      if (response.ok) {
        const data = await response.json();
        setFormasPago(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las formas de pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularComisionEjemplo = (pvp: number) => {
    const comisionEmpresa = (pvp * formData.comisionPorcentaje / 100) + formData.comisionFija;
    const comisionCliente = (pvp * formData.comisionPorcentajeCobradoCliente / 100) + formData.comisionFijaCobradaCliente;
    return { comisionEmpresa, comisionCliente };
  };

  const resetForm = () => {
    setEditingFormaPago(null);
    setFormData({
      nombre: '',
      comisionFija: 0,
      comisionPorcentaje: 0,
      comisionFijaCobradaCliente: 0,
      comisionPorcentajeCobradoCliente: 0,
      activo: true,
    });
  };

  const handleSave = async () => {
    try {
      const url = editingFormaPago 
        ? `/api/formas-pago/${editingFormaPago.id}`
        : '/api/formas-pago';
      
      const method = editingFormaPago ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchFormasPago();
        setDialogOpen(false);
        resetForm();
        toast({
          title: "Éxito",
          description: editingFormaPago ? "Forma de pago actualizada correctamente" : "Forma de pago creada correctamente",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la forma de pago');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la forma de pago",
        variant: "destructive",
      });
    }
  };

  const checkUsageAndDelete = async (formaPagoId: string) => {
    try {
      setDeletingId(formaPagoId);
      
      // Verificar si está siendo usado
      const usageResponse = await fetch(`/api/formas-pago/${formaPagoId}/usage`);
      if (!usageResponse.ok) {
        throw new Error('Error al verificar el uso de la forma de pago');
      }
      
      const usageData = await usageResponse.json();
      
      if (usageData.inUse) {
        toast({
          title: "No se puede eliminar",
          description: usageData.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Si no está siendo usado, proceder con la eliminación
      const deleteResponse = await fetch(`/api/formas-pago/${formaPagoId}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        await fetchFormasPago();
        toast({
          title: "Éxito",
          description: "Forma de pago eliminada correctamente",
        });
        return true;
      } else {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Error al eliminar la forma de pago');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la forma de pago",
        variant: "destructive",
      });
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando formas de pago...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Gestión de Formas de Pago
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                Nueva Forma de Pago
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFormaPago ? 'Editar Forma de Pago' : 'Nueva Forma de Pago'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre de la forma de pago"
                  />
                </div>
                <div>
                  <Label htmlFor="comisionFija">Comisión Fija (€)</Label>
                  <Input
                    id="comisionFija"
                    type="number"
                    step="0.01"
                    value={formData.comisionFija}
                    onChange={(e) => setFormData(prev => ({ ...prev, comisionFija: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="comisionPorcentaje">Comisión Porcentaje que paga la empresa (%)</Label>
                  <Input
                    id="comisionPorcentaje"
                    type="number"
                    step="0.01"
                    value={formData.comisionPorcentaje}
                    onChange={(e) => setFormData(prev => ({ ...prev, comisionPorcentaje: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="comisionFijaCobradaCliente">Comisión Fija cobrada al cliente (€)</Label>
                  <Input
                    id="comisionFijaCobradaCliente"
                    type="number"
                    step="0.01"
                    value={formData.comisionFijaCobradaCliente}
                    onChange={(e) => setFormData(prev => ({ ...prev, comisionFijaCobradaCliente: parseFloat(e.target.value) || 0 }))}
                    placeholder="Ej: 0.50"
                  />
                </div>
                <div>
                  <Label htmlFor="comisionPorcentajeCobradoCliente">Comisión Porcentaje cobrada al cliente (%)</Label>
                  <Input
                    id="comisionPorcentajeCobradoCliente"
                    type="number"
                    step="0.01"
                    value={formData.comisionPorcentajeCobradoCliente}
                    onChange={(e) => setFormData(prev => ({ ...prev, comisionPorcentajeCobradoCliente: parseFloat(e.target.value) || 0 }))}
                    placeholder="Ej: 4.4"
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Ejemplo de comisiones para un pedido de 1000€:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Comisión empresa:</strong> {calcularComisionEjemplo(1000).comisionEmpresa.toFixed(2)}€</p>
                    <p><strong>Comisión cobrada al cliente:</strong> {calcularComisionEjemplo(1000).comisionCliente.toFixed(2)}€</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
                  />
                  <Label htmlFor="activo">Activo</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    {editingFormaPago ? 'Actualizar' : 'Crear'} Forma de Pago
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {formasPago.map((formaPago) => (
            <div
              key={formaPago.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{formaPago.nombre}</h3>
                  <Badge variant={formaPago.activo ? 'default' : 'secondary'}>
                    {formaPago.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <div>Empresa - Fijo: {formaPago.comisionFija}€ | Porcentaje: {formaPago.comisionPorcentaje}%</div>
                  <div>Cliente - Fijo: {formaPago.comisionFijaCobradaCliente}€ | Porcentaje: {formaPago.comisionPorcentajeCobradoCliente}%</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingFormaPago(formaPago);
                    setFormData({
                      nombre: formaPago.nombre,
                      comisionFija: formaPago.comisionFija,
                      comisionPorcentaje: formaPago.comisionPorcentaje,
                      comisionFijaCobradaCliente: formaPago.comisionFijaCobradaCliente,
                      comisionPorcentajeCobradoCliente: formaPago.comisionPorcentajeCobradoCliente,
                      activo: formaPago.activo,
                    });
                    setDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === formaPago.id}
                    >
                      {deletingId === formaPago.id ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirmar eliminación
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que quieres eliminar la forma de pago "<strong>{formaPago.nombre}</strong>"?
                        <br /><br />
                        <span className="text-sm text-muted-foreground">
                          Nota: Solo se pueden eliminar formas de pago que no estén siendo utilizadas en ningún pedido.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => checkUsageAndDelete(formaPago.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
