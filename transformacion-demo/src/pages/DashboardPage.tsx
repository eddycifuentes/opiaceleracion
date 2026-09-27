import React from 'react';
import { useIniciativasStore } from '../store/iniciativasStore';
import { useTareasStore } from '../store/tareasStore';
import { useSprintsStore } from '../store/sprintsStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { KPICard } from '../components/KPICard';
import { Button } from '../components/Button';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Zap, CheckSquare, Target } from 'lucide-react';

// Logger utility
const Logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

export const DashboardPage: React.FC = () => {
  Logger.info('[DashboardPage] DashboardPage loaded');
  
  const { iniciativas } = useIniciativasStore();
  const { tareas } = useTareasStore();
  const { sprints } = useSprintsStore();

  // Calculate KPIs
  const totalIniciativas = iniciativas.length;
  const activas = iniciativas.filter((i) => i.estado === 'Activo').length;
  const completadas = iniciativas.filter((i) => i.estado === 'Completado').length;
  const cerradas = iniciativas.filter((i) => i.estado === 'Cerrado').length;

  // Data for Iniciativas por Empresa
  const empresasData = [
    { name: 'Davivienda', value: 3 },
    { name: 'Seguros Bolívar', value: 4 },
    { name: 'Constructora', value: 1 },
  ];

  // Data for Iniciativas por Etapa
  const etapasData = [
    { name: 'Discovery', count: 1 },
    { name: 'Concept', count: 2 },
    { name: 'Setup', count: 2 },
    { name: 'Delivery', count: 2 },
    { name: 'Launchpad', count: 1 },
  ];

  // Data for Tareas por Estado
  const tareasData = [
    { name: 'Pendiente', count: tareas.filter((t) => t.estado === 'Pendiente').length },
    { name: 'En Proceso', count: tareas.filter((t) => t.estado === 'En Proceso').length },
    { name: 'Completada', count: tareas.filter((t) => t.estado === 'Completada').length },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Total Iniciativas"
                value={totalIniciativas}
                icon={Target}
                color="blue"
              />
              <KPICard
                title="En Curso"
                value={activas}
                icon={TrendingUp}
                color="green"
              />
              <KPICard
                title="Completadas"
                value={completadas}
                icon={CheckSquare}
                color="amber"
              />
              <KPICard
                title="Cerradas"
                value={cerradas}
                icon={Zap}
                color="red"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button variant="primary">Ver Iniciativas</Button>
              <Button variant="secondary">Ver Tareas</Button>
              <Button variant="secondary">Ver Sprints</Button>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Iniciativas por Empresa */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Iniciativas por Empresa
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={empresasData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {empresasData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Iniciativas por Etapa */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Iniciativas por Etapa
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={etapasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tareas por Estado */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Tareas por Estado
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tareasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen Ejecutivo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total de Sprints</p>
                  <p className="text-2xl font-bold text-blue-600">{sprints.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total de Tareas</p>
                  <p className="text-2xl font-bold text-green-600">{tareas.length}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tasa de Completitud</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {Math.round(
                      (tareas.filter((t) => t.estado === 'Completada').length / tareas.length) *
                        100
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
