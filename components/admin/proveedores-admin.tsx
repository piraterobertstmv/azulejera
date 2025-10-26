
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
import { Proveedor } from '../../lib/types';

export default function ProveedoresAdmin() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
  });

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
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingProveedor ? `/api/proveedores/${editingProveedor.id}` : '/api/proveedores';
      const method = editingProveedor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingProveedor ? "Proveedor actualizado" : "Proveedor creado",
        });
        fetchProveedores();
        setDialogOpen(false);
        resetForm();
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el proveedor",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proveedor?')) return;

    try {
      const response = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Proveedor eliminado",
        });
        fetchProveedores();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      activo: proveedor.activo,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProveedor(null);
    setFormData({
      nombre: '',
      activo: true,
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando proveedores...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Gestión de Proveedores
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre del proveedor"
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
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    {editingProveedor ? 'Actualizar' : 'Crear'}
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
          {proveedores.map((proveedor) => (
            <div
              key={proveedor.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{proveedor.nombre}</h3>
                  <Badge variant={proveedor.activo ? 'default' : 'secondary'}>
                    {proveedor.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(proveedor)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(proveedor.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
