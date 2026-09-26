import React, { useState } from 'react';
import { useSprintsStore } from '../store/sprintsStore';
import { useTareasStore } from '../store/tareasStore';
import { useIniciativasStore } from '../store/iniciativasStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { SprintCard } from '../components/SprintCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Sprint } from '../data/mockData';
import { Badge } from '../components/Badge';

export const SprintsPage: React.FC = () => {
  const { sprints, updateSprint, deleteSprint } = useSprintsStore();
  const { tareas } = useTareasStore();
  const { iniciativas } = useIniciativasStore();

  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Sprint>>({});

  const handleViewDetail = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setModalDetailOpen(true);
  };

  const handleEdit = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setEditFormData(sprint);
    setModalEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedSprint) {
      updateSprint(selectedSprint.id, editFormData);
      setModalEditOpen(false);
      setSelectedSprint(null);
    }
  };

  const getProyectoNombre = (id: string) => {
    const ini = iniciativas.find((i) => i.id === id);
    return ini?.nombre || id;
  };

  const getSprintTareas = (sprintId: string) => {
    return tareas.filter((t) => t.sprint === sprintId);
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'En Curso':
        return 'warning';
      case 'Completado':
        return 'success';
      case 'Planeado':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Sprints" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Sprints</p>
                <p className="text-2xl font-bold text-gray-900">{sprints.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">En Curso</p>
                <p className="text-2xl font-bold text-amber-600">
                  {sprints.filter((s) => s.estado === 'En Curso').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {sprints.filter((s) => s.estado === 'Completado').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Planeados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {sprints.filter((s) => s.estado === 'Planeado').length}
                </p>
              </div>
            </div>

            {/* Sprints Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sprints.map((sprint) => (
                <SprintCard
                  key={sprint.id}
                  sprint={sprint}
                  onViewDetail={handleViewDetail}
                  onEdit={handleEdit}
                  onDelete={deleteSprint}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={modalDetailOpen}
        onClose={() => setModalDetailOpen(false)}
        title={selectedSprint?.nombre || 'Detalle Sprint'}
        size="lg"
      >
        {selectedSprint && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-mono font-semibold">{selectedSprint.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <Badge variant={getEstadoBadgeVariant(selectedSprint.estado)}>
                  {selectedSprint.estado}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Proyecto</p>
                <p className="text-gray-700">
                  {getProyectoNombre(selectedSprint.proyecto)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Período</p>
                <p className="text-gray-700">
                  {selectedSprint.fechaInicio} → {selectedSprint.fechaFin}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Objetivo</p>
              <p className="text-gray-700 italic">{selectedSprint.objetivo}</p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Tareas del Sprint</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getSprintTareas(selectedSprint.id).length > 0 ? (
                  getSprintTareas(selectedSprint.id).map((t) => (
                    <div key={t.id} className="text-sm p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium">{t.nombre}</p>
                        <Badge
                          variant={
                            t.estado === 'Completada'
                              ? 'success'
                              : t.estado === 'En Proceso'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {t.estado}
                        </Badge>
                      </div>
                      <p className="text-gray-600">Asignado: {t.asignado}</p>
                      <p className="text-gray-600">Entrega: {t.fechaEntrega}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay tareas en este sprint
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={modalEditOpen}
        onClose={() => setModalEditOpen(false)}
        title="Editar Sprint"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={editFormData.nombre || ''}
              onChange={(e) =>
                setEditFormData({ ...editFormData, nombre: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objetivo
            </label>
            <textarea
              value={editFormData.objetivo || ''}
              onChange={(e) =>
                setEditFormData({ ...editFormData, objetivo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={editFormData.fechaInicio || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fechaInicio: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={editFormData.fechaFin || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fechaFin: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleSaveEdit}>
              Guardar Cambios
            </Button>
            <Button variant="secondary" onClick={() => setModalEditOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
