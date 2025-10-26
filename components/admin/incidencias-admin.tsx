
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
import { Incidencia } from '../../lib/types';

export default function IncidenciasAdmin() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIncidencia, setEditingIncidencia] = useState<Incidencia | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
  });

  useEffect(() => {
    fetchIncidencias();
  }, []);

  const fetchIncidencias = async () => {
    try {
      const response = await fetch('/api/incidencias');
      if (response.ok) {
        const data = await response.json();
        setIncidencias(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las incidencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingIncidencia(null);
    setFormData({
      nombre: '',
      activo: true,
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando incidencias...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Gestión de Incidencias
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                Nueva Incidencia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIncidencia ? 'Editar Incidencia' : 'Nueva Incidencia'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Incidencia</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="ej: Material defectuoso, Retraso en entrega"
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
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidencias.map((incidencia) => (
            <div
              key={incidencia.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{incidencia.nombre}</h3>
                <Badge variant={incidencia.activo ? 'default' : 'secondary'}>
                  {incidencia.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingIncidencia(incidencia);
                    setFormData({
                      nombre: incidencia.nombre,
                      activo: incidencia.activo,
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
