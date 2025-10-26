
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
import { Formato } from '../../lib/types';

export default function FormatosAdmin() {
  const [formatos, setFormatos] = useState<Formato[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFormato, setEditingFormato] = useState<Formato | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
  });

  useEffect(() => {
    fetchFormatos();
  }, []);

  const fetchFormatos = async () => {
    try {
      const response = await fetch('/api/formatos?limit=100');
      if (response.ok) {
        const data = await response.json();
        setFormatos(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los formatos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingFormato ? `/api/formatos/${editingFormato.id}` : '/api/formatos';
      const method = editingFormato ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingFormato ? "Formato actualizado" : "Formato creado",
        });
        fetchFormatos();
        setDialogOpen(false);
        resetForm();
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el formato",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingFormato(null);
    setFormData({
      nombre: '',
      activo: true,
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando formatos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Gestión de Formatos
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                Nuevo Formato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFormato ? 'Editar Formato' : 'Nuevo Formato'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Formato</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="ej: 60x60, 30x30, etc."
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
                    {editingFormato ? 'Actualizar' : 'Crear'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formatos.map((formato) => (
            <div
              key={formato.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{formato.nombre}</h3>
                <Badge variant={formato.activo ? 'default' : 'secondary'}>
                  {formato.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingFormato(formato);
                    setFormData({
                      nombre: formato.nombre,
                      activo: formato.activo,
                    });
                    setDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
