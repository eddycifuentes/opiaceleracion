import React from 'react';
import { useIniciativasStore } from '../store/iniciativasStore';
import { useTareasStore } from '../store/tareasStore';
import { useSprintsStore } from '../store/sprintsStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/Button';
import { Download, FileText } from 'lucide-react';

export const ReportesPage: React.FC = () => {
  const { iniciativas } = useIniciativasStore();
  const { tareas } = useTareasStore();
  const { sprints } = useSprintsStore();

  // Calculate metrics
  const totalIniciativas = iniciativas.length;
  const activas = iniciativas.filter((i) => i.estado === 'Activo').length;
  const completadas = iniciativas.filter((i) => i.estado === 'Completado').length;
  const cerradas = iniciativas.filter((i) => i.estado === 'Cerrado').length;

  const tareasCompletadas = tareas.filter((t) => t.estado === 'Completada').length;
  const completitudTareas = Math.round((tareasCompletadas / tareas.length) * 100);

  const sprintsEnCurso = sprints.filter((s) => s.estado === 'En Curso').length;
  const sprintsCompletados = sprints.filter((s) => s.estado === 'Completado').length;

  // Top 3 critical initiatives (by activas + alta prioridad)
  const topIniciativas = iniciativas
    .filter((i) => i.estado === 'Activo')
    .slice(0, 3);

  // Workload by person
  const workloadByPerson = new Map<string, number>();
  tareas.forEach((t) => {
    workloadByPerson.set(
      t.asignado,
      (workloadByPerson.get(t.asignado) || 0) + 1
    );
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reportes" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Export Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                variant="primary"
                className="flex items-center gap-2"
                onClick={() => alert('Funcionalidad de descarga PDF no implementada en demo')}
              >
                <Download size={18} />
                Descargar PDF
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={() => alert('Funcionalidad de descarga CSV no implementada en demo')}
              >
                <Download size={18} />
                Descargar CSV
              </Button>
            </div>

            {/* Executive Summary */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Resumen Ejecutivo
              </h2>
              <div className="text-gray-700 space-y-3 mb-6">
                <p>
                  Se han registrado <span className="font-bold">{totalIniciativas}</span> iniciativas en el
                  sistema OPI 2026, con un estado actual de{' '}
                  <span className="font-bold text-green-600">{activas} activas</span>,{' '}
                  <span className="font-bold text-blue-600">{completadas} completadas</span> y{' '}
                  <span className="font-bold text-red-600">{cerradas} cerradas</span>.
                </p>
                <p>
                  En relación a las tareas, se han completado{' '}
                  <span className="font-bold text-green-600">{tareasCompletadas}</span> de{' '}
                  <span className="font-bold">{tareas.length}</span>, lo que representa una tasa de
                  completitud del <span className="font-bold">{completitudTareas}%</span>.
                </p>
                <p>
                  Actualmente hay <span className="font-bold">{sprintsEnCurso}</span> sprints en
                  curso y <span className="font-bold">{sprintsCompletados}</span> sprints completados.
                </p>
              </div>
            </div>

            {/* KPIs Table */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">KPIs Principales</h2>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Métrica
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Meta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Iniciativas Activas
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{activas}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">10</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
                        En Meta
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Tasa Completitud Tareas
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{completitudTareas}%</td>
                    <td className="px-6 py-4 text-sm text-gray-700">75%</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
                        En Meta
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Sprints Completados
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{sprintsCompletados}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">4</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                        Por Debajo
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Iniciativas Completadas
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{completadas}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">2</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
                        En Meta
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Top 3 Critical Initiatives */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Top 3 Iniciativas Críticas
              </h2>
              <div className="space-y-3">
                {topIniciativas.length > 0 ? (
                  topIniciativas.map((ini, index) => (
                    <div key={ini.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                              {index + 1}
                            </span>
                            <p className="font-bold text-gray-900">{ini.nombre}</p>
                          </div>
                          <p className="text-sm text-gray-600 ml-11">
                            {ini.empresa} • {ini.etapa}
                          </p>
                          <p className="text-sm text-gray-700 ml-11 mt-2">
                            {ini.descripcion}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold whitespace-nowrap ml-4">
                          {ini.impacto}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay iniciativas activas
                  </p>
                )}
              </div>
            </div>

            {/* Workload by Person */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Carga de Trabajo por Persona
              </h2>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Persona
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Tareas Asignadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Carga (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from(workloadByPerson.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([person, count]) => {
                      const percentage = Math.round((count / tareas.length) * 100);
                      return (
                        <tr key={person}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {person}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{count}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
