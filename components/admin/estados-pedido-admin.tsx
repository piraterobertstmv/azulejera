
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
import { EstadoPedido } from '../../lib/types';

export default function EstadosPedidoAdmin() {
  const [estadosPedido, setEstadosPedido] = useState<EstadoPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEstado, setEditingEstado] = useState<EstadoPedido | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
  });

  useEffect(() => {
    fetchEstadosPedido();
  }, []);

  const fetchEstadosPedido = async () => {
    try {
      const response = await fetch('/api/estados-pedido');
      if (response.ok) {
        const data = await response.json();
        setEstadosPedido(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los estados de pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingEstado(null);
    setFormData({
      nombre: '',
      activo: true,
    });
  };

  const handleSave = async () => {
    try {
      const url = editingEstado 
        ? `/api/estados-pedido/${editingEstado.id}`
        : '/api/estados-pedido';
      
      const method = editingEstado ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchEstadosPedido();
        setDialogOpen(false);
        resetForm();
        toast({
          title: "Éxito",
          description: editingEstado ? "Estado actualizado correctamente" : "Estado creado correctamente",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el estado');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el estado",
        variant: "destructive",
      });
    }
  };

  const checkUsageAndDelete = async (estadoId: string) => {
    try {
      setDeletingId(estadoId);
      
      // Verificar si está siendo usado
      const usageResponse = await fetch(`/api/estados-pedido/${estadoId}/usage`);
      if (!usageResponse.ok) {
        throw new Error('Error al verificar el uso del estado');
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
      const deleteResponse = await fetch(`/api/estados-pedido/${estadoId}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        await fetchEstadosPedido();
        toast({
          title: "Éxito",
          description: "Estado eliminado correctamente",
        });
        return true;
      } else {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Error al eliminar el estado');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el estado",
        variant: "destructive",
      });
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando estados de pedido...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Gestión de Estados de Pedido
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                Nuevo Estado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Estado</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="ej: En producción, Listo para envío"
                  />
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
                    {editingEstado ? 'Actualizar' : 'Crear'} Estado
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {estadosPedido.map((estado) => (
            <div
              key={estado.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{estado.nombre}</h3>
                <Badge variant={estado.activo ? 'default' : 'secondary'}>
                  {estado.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingEstado(estado);
                    setFormData({
                      nombre: estado.nombre,
                      activo: estado.activo,
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
                      disabled={deletingId === estado.id}
                    >
                      {deletingId === estado.id ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirmar eliminación
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que quieres eliminar el estado "<strong>{estado.nombre}</strong>"?
                        <br /><br />
                        <span className="text-sm text-muted-foreground">
                          Nota: Solo se pueden eliminar estados que no estén siendo utilizados en ningún pedido.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => checkUsageAndDelete(estado.id)}
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
