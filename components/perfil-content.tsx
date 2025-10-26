
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Users } from "lucide-react";
import CambiarPasswordForm from "@/components/cambiar-password-form";
import GestionUsuarios from "@/components/gestion-usuarios";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface PerfilContentProps {
  user: User;
}

export default function PerfilContent({ user }: PerfilContentProps) {
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <div className="space-y-6">
      {/* Información del usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Detalles de tu cuenta en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <p className="text-gray-900 font-medium">{user?.name || "No especificado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Rol</label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-gray-900 font-medium capitalize">
                  {user?.role === "superadmin" ? "Super Administrador" : 
                   user?.role === "admin" ? "Administrador" : "Empleado"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes funcionalidades */}
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password">Cambiar Contraseña</TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CambiarPasswordForm />
            </CardContent>
          </Card>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription>
                  Administra todos los usuarios del sistema y sus contraseñas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GestionUsuarios />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
