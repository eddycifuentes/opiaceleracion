import React, { useState, useMemo } from 'react';
import { useTareasStore } from '../store/tareasStore';
import { useIniciativasStore } from '../store/iniciativasStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { TareaRow } from '../components/TareaRow';
import { Tarea, estadosTarea } from '../data/mockData';
import { Search } from 'lucide-react';

export const TareasPage: React.FC = () => {
  const { tareas, deleteTarea, changeEstado } = useTareasStore();
  const { iniciativas } = useIniciativasStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterAsignado, setFilterAsignado] = useState('');

  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [modalChangeEstadoOpen, setModalChangeEstadoOpen] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [newEstado, setNewEstado] = useState('');

  const assignedToOptions = useMemo(() => {
    const assigned = new Set(tareas.map((t) => t.asignado));
    return Array.from(assigned).map((a) => ({ value: a, label: a }));
  }, [tareas]);

  const projectOptions = useMemo(
    () =>
      iniciativas.map((ini) => ({
        value: ini.id,
        label: ini.nombre,
      })),
    [iniciativas]
  );

  const filteredTareas = useMemo(() => {
    return tareas.filter((tarea) => {
      const matchSearch =
        tarea.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tarea.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchProyecto = !filterProyecto || tarea.proyecto === filterProyecto;
      const matchEstado = !filterEstado || tarea.estado === filterEstado;
      const matchAsignado = !filterAsignado || tarea.asignado === filterAsignado;
      return matchSearch && matchProyecto && matchEstado && matchAsignado;
    });
  }, [tareas, searchTerm, filterProyecto, filterEstado, filterAsignado]);

  const handleViewDetail = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setModalDetailOpen(true);
  };

  const handleChangeEstado = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setNewEstado(tarea.estado);
    setModalChangeEstadoOpen(true);
  };

  const handleSaveChangeEstado = () => {
    if (selectedTarea) {
      changeEstado(selectedTarea.id, newEstado);
      setModalChangeEstadoOpen(false);
      setSelectedTarea(null);
    }
  };

  const getProyectoNombre = (id: string) => {
    const ini = iniciativas.find((i) => i.id === id);
    return ini?.nombre || id;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Tareas" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <Select
                  label="Proyecto"
                  options={projectOptions}
                  value={filterProyecto}
                  onChange={(e) => setFilterProyecto(e.target.value)}
                />

                <Select
                  label="Estado"
                  options={estadosTarea.map((e) => ({ value: e, label: e }))}
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                />

                <Select
                  label="Asignado a"
                  options={assignedToOptions}
                  value={filterAsignado}
                  onChange={(e) => setFilterAsignado(e.target.value)}
                />

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterProyecto('');
                      setFilterEstado('');
                      setFilterAsignado('');
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Tareas Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Asignado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Fecha Entrega
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTareas.map((tarea) => (
                    <TareaRow
                      key={tarea.id}
                      tarea={tarea}
                      projectName={getProyectoNombre(tarea.proyecto)}
                      onViewDetail={handleViewDetail}
                      onChangeEstado={handleChangeEstado}
                      onDelete={deleteTarea}
                    />
                  ))}
                </tbody>
              </table>

              {filteredTareas.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No hay tareas que coincidan con los filtros
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Tareas</p>
                <p className="text-2xl font-bold text-gray-900">{tareas.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-red-600">
                  {tareas.filter((t) => t.estado === 'Pendiente').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-amber-600">
                  {tareas.filter((t) => t.estado === 'En Proceso').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {tareas.filter((t) => t.estado === 'Completada').length}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={modalDetailOpen}
        onClose={() => setModalDetailOpen(false)}
        title={selectedTarea?.nombre || 'Detalle de Tarea'}
        size="md"
      >
        {selectedTarea && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-mono font-semibold">{selectedTarea.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sprint</p>
                <p className="font-semibold">{selectedTarea.sprint}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-semibold">{selectedTarea.estado}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prioridad</p>
                <p className="font-semibold">{selectedTarea.prioridad}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Descripción</p>
              <p className="text-gray-700">{selectedTarea.descripcion}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Asignado a</p>
                <p className="text-gray-700">{selectedTarea.asignado}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha Entrega</p>
                <p className="text-gray-700">{selectedTarea.fechaEntrega}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Historial de Cambios</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  • Creada por Juan Pérez el 2025-01-15
                </p>
                <p className="text-gray-600">
                  • Estado cambió a "En Proceso" el 2025-01-20
                </p>
                <p className="text-gray-600">
                  • Asignada a {selectedTarea.asignado} el 2025-01-21
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Change Estado Modal */}
      <Modal
        isOpen={modalChangeEstadoOpen}
        onClose={() => setModalChangeEstadoOpen(false)}
        title="Cambiar Estado de Tarea"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Estado
            </label>
            <select
              value={newEstado}
              onChange={(e) => setNewEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {estadosTarea.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleSaveChangeEstado}>
              Cambiar Estado
            </Button>
            <Button
              variant="secondary"
              onClick={() => setModalChangeEstadoOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
