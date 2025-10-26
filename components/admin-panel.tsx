
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
// Icons removed as per user request
import ProveedoresAdmin from './admin/proveedores-admin';
import FormatosAdmin from './admin/formatos-admin';
import FormasPagoAdmin from './admin/formas-pago-admin';
import EstadosPedidoAdmin from './admin/estados-pedido-admin';
import IncidenciasAdmin from './admin/incidencias-admin';
import TransportistasAdmin from './admin/transportistas-admin';

const adminSections = [
  {
    id: 'proveedores',
    label: 'Proveedores',
    description: 'Gestionar proveedores y configurar descuentos',
    color: 'bg-blue-500',
  },
  {
    id: 'formatos',
    label: 'Formatos',
    description: 'Administrar formatos de productos disponibles',
    color: 'bg-green-500',
  },
  {
    id: 'formas-pago',
    label: 'Formas de Pago',
    description: 'Configurar métodos de pago y comisiones',
    color: 'bg-purple-500',
  },
  {
    id: 'estados-pedido',
    label: 'Estados de Pedido',
    description: 'Gestionar estados del ciclo de vida de pedidos',
    color: 'bg-orange-500',
  },
  {
    id: 'incidencias',
    label: 'Incidencias',
    description: 'Administrar tipos de incidencias',
    color: 'bg-red-500',
  },
  {
    id: 'transportistas',
    label: 'Transportistas',
    description: 'Gestionar empresas de transporte',
    color: 'bg-indigo-500',
  },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('proveedores');

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminSections.map((section) => {
          return (
            <Card
              key={section.id}
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setActiveTab(section.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={activeTab === section.id ? 'default' : 'secondary'}>
                    {activeTab === section.id ? 'Activo' : 'Disponible'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-1">{section.label}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-6">
        <TabsList className="flex flex-col h-fit w-64 space-y-1 bg-card/50 backdrop-blur-sm rounded-3xl p-2">
          {adminSections.map((section) => {
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="w-full justify-start px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-2xl"
              >
                <span>{section.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        <div className="flex-1">

        <TabsContent value="proveedores" className="mt-0">
          <ProveedoresAdmin />
        </TabsContent>

        <TabsContent value="formatos" className="mt-0">
          <FormatosAdmin />
        </TabsContent>

        <TabsContent value="formas-pago" className="mt-0">
          <FormasPagoAdmin />
        </TabsContent>

        <TabsContent value="estados-pedido" className="mt-0">
          <EstadosPedidoAdmin />
        </TabsContent>

        <TabsContent value="incidencias" className="mt-0">
          <IncidenciasAdmin />
        </TabsContent>

        <TabsContent value="transportistas" className="mt-0">
          <TransportistasAdmin />
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
