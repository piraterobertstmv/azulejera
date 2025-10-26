
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
// Icons removed as per user request
import { DashboardStats, ChartData } from "../lib/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from "recharts";
import { formateoMoneda, formateoPorcentaje } from "../lib/utils";

const COLORS = ['#A855F7', '#3B82F6', '#EC4899', '#F59E0B', '#10B981'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [beneficiosData, setBeneficiosData] = useState<ChartData[]>([]);
  const [beneficiosAñoActual, setBeneficiosAñoActual] = useState<ChartData[]>([]);
  const [beneficiosAñoAnterior, setBeneficiosAñoAnterior] = useState<ChartData[]>([]);
  const [estadosData, setEstadosData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date filter state
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState<string>(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [yearFilter, setYearFilter] = useState<number>(currentYear);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const previousYear = yearFilter - 1;

        const [statsRes, beneficiosRes, estadosRes, beneficiosAñoActualRes, beneficiosAñoAnteriorRes] = await Promise.all([
          fetch(`/api/dashboard/stats?startDate=${startDate}&endDate=${endDate}`),
          fetch(`/api/dashboard/beneficios?startDate=${startDate}&endDate=${endDate}`),
          fetch(`/api/dashboard/estados?startDate=${startDate}&endDate=${endDate}`),
          fetch(`/api/dashboard/beneficios-anio?anio=${yearFilter}`),
          fetch(`/api/dashboard/beneficios-anio?anio=${previousYear}`)
        ]);

        const statsData = await statsRes.json();
        const beneficiosData = await beneficiosRes.json();
        const estadosData = await estadosRes.json();
        const beneficiosAñoActualData = await beneficiosAñoActualRes.json();
        const beneficiosAñoAnteriorData = await beneficiosAñoAnteriorRes.json();

        setStats(statsData);
        setBeneficiosData(beneficiosData || []);
        setBeneficiosAñoActual(beneficiosAñoActualData || []);
        setBeneficiosAñoAnterior(beneficiosAñoAnteriorData || []);
        setEstadosData(estadosData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, yearFilter]);

  if (loading) {
    return <div className="p-8 text-center">Cargando estadísticas...</div>;
  }

  const handleApplyFilters = () => {
    // Force re-fetch by updating a dummy state or just rely on useEffect dependency
  };

  const handleResetFilters = () => {
    setStartDate(`${currentYear}-01-01`);
    setEndDate(new Date().toISOString().split('T')[0]);
    setYearFilter(currentYear);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-purple-500">Dashboard</h1>
      </div>

      {/* Date Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl">Filtros de Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Fecha Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Fecha Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Año para Gráficas</label>
              <Input
                type="number"
                value={yearFilter}
                onChange={(e) => setYearFilter(parseInt(e.target.value) || currentYear)}
                min="2020"
                max="2030"
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="rounded-xl flex-1"
              >
                Resetear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPedidos || 0}</div>
            <p className="text-xs text-gray-600">Pedidos registrados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formateoMoneda(stats?.beneficioTotal || 0, 2)}
            </div>
            <p className="text-xs text-gray-600">Beneficios acumulados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Incidencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pedidosConIncidencia || 0}</div>
            <p className="text-xs text-gray-600">Pedidos con problemas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pedidosPendientes || 0}</div>
            <p className="text-xs text-gray-600">Pedidos por procesar</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>
              Beneficios por Mes - {yearFilter}
            </CardTitle>
            <CardDescription>
              Evolución de beneficios desde enero {yearFilter}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={beneficiosAñoActual} margin={{ bottom: 20, left: 20 }}>
                  <defs>
                    <linearGradient id="purpleGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#9333EA" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    label={{ 
                      value: 'Beneficio (€)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 11 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      padding: '12px'
                    }}
                    formatter={(value: number) => [`${formateoMoneda(value)}`, 'Beneficio']}
                    labelStyle={{ color: '#a855f7', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Bar dataKey="value" fill="url(#purpleGradient1)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>
              Beneficios por Mes - {yearFilter - 1}
            </CardTitle>
            <CardDescription>
              Evolución de beneficios desde enero {yearFilter - 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={beneficiosAñoAnterior} margin={{ bottom: 20, left: 20 }}>
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#0891B2" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    label={{ 
                      value: 'Beneficio (€)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 11 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(6, 182, 212, 0.5)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      padding: '12px'
                    }}
                    formatter={(value: number) => [`${formateoMoneda(value)}`, 'Beneficio']}
                    labelStyle={{ color: '#06b6d4', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Bar dataKey="value" fill="url(#cyanGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>
              Distribución por Estado
            </CardTitle>
            <CardDescription>
              Distribución de pedidos según su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={8}
                    dataKey="value"
                    label={({ percent, x, y, cx, cy }) => {
                      const radius = 125;
                      const angle = Math.atan2(y - cy, x - cx);
                      const labelX = cx + radius * Math.cos(angle);
                      const labelY = cy + radius * Math.sin(angle);
                      return (
                        <text
                          x={labelX}
                          y={labelY}
                          fill="white"
                          textAnchor={labelX > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          style={{ fontWeight: 'bold', fontSize: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                        >
                          {`${(percent * 100).toFixed(1)}%`}
                        </text>
                      );
                    }}
                    labelLine={{
                      stroke: '#666',
                      strokeWidth: 1,
                      strokeDasharray: '3 3'
                    }}
                  >
                    {estadosData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="top"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
