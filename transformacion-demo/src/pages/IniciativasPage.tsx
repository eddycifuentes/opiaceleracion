import React, { useState, useMemo } from 'react';
import { useIniciativasStore } from '../store/iniciativasStore';
import { useTareasStore } from '../store/tareasStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { IniciativaCard } from '../components/IniciativaCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Iniciativa, empresas, etapas } from '../data/mockData';
import { Search } from 'lucide-react';

export const IniciativasPage: React.FC = () => {
  const { iniciativas, updateIniciativa, deleteIniciativa, changeEtapa } =
    useIniciativasStore();
  const { tareas } = useTareasStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('');

  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalChangeEtapaOpen, setModalChangeEtapaOpen] = useState(false);
  const [selectedIniciativa, setSelectedIniciativa] = useState<Iniciativa | null>(null);

  const [editFormData, setEditFormData] = useState<Partial<Iniciativa>>({});
  const [changeEtapaData, setChangeEtapaData] = useState({ etapa: '', motivo: '' });

  const filteredIniciativas = useMemo(() => {
    return iniciativas.filter((ini) => {
      const matchSearch =
        ini.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ini.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEmpresa = !filterEmpresa || ini.empresa === filterEmpresa;
      const matchEtapa = !filterEtapa || ini.etapa === filterEtapa;
      return matchSearch && matchEmpresa && matchEtapa;
    });
  }, [iniciativas, searchTerm, filterEmpresa, filterEtapa]);

  const handleViewDetail = (ini: Iniciativa) => {
    setSelectedIniciativa(ini);
    setModalDetailOpen(true);
  };

  const handleEdit = (ini: Iniciativa) => {
    setSelectedIniciativa(ini);
    setEditFormData(ini);
    setModalEditOpen(true);
  };

  const handleChangeEtapa = (ini: Iniciativa) => {
    setSelectedIniciativa(ini);
    setChangeEtapaData({ etapa: ini.etapa, motivo: '' });
    setModalChangeEtapaOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedIniciativa) {
      updateIniciativa(selectedIniciativa.id, editFormData);
      setModalEditOpen(false);
      setSelectedIniciativa(null);
    }
  };

  const handleSaveChangeEtapa = () => {
    if (selectedIniciativa) {
      changeEtapa(selectedIniciativa.id, changeEtapaData.etapa, changeEtapaData.motivo);
      setModalChangeEtapaOpen(false);
      setSelectedIniciativa(null);
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
        <Header title="Iniciativas" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  label="Empresa"
                  options={empresas.map((e) => ({ value: e, label: e }))}
                  value={filterEmpresa}
                  onChange={(e) => setFilterEmpresa(e.target.value)}
                />

                <Select
                  label="Etapa"
                  options={etapas.map((e) => ({ value: e, label: e }))}
                  value={filterEtapa}
                  onChange={(e) => setFilterEtapa(e.target.value)}
                />

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterEmpresa('');
                      setFilterEtapa('');
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Iniciativas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIniciativas.map((ini) => (
                <IniciativaCard
                  key={ini.id}
                  iniciativa={ini}
                  onViewDetail={handleViewDetail}
                  onEdit={handleEdit}
                  onChangeEtapa={handleChangeEtapa}
                  onDelete={deleteIniciativa}
                />
              ))}
            </div>

            {filteredIniciativas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay iniciativas que coincidan con los filtros</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={modalDetailOpen}
        onClose={() => setModalDetailOpen(false)}
        title={selectedIniciativa?.nombre || 'Detalle'}
        size="lg"
      >
        {selectedIniciativa && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-mono font-semibold">{selectedIniciativa.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Empresa</p>
                <p className="font-semibold">{selectedIniciativa.empresa}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Etapa</p>
                <p className="font-semibold">{selectedIniciativa.etapa}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-semibold">{selectedIniciativa.estado}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Descripción</p>
              <p className="text-gray-700">{selectedIniciativa.descripcion}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Líder</p>
                <p className="text-gray-700">{selectedIniciativa.lider}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Impacto</p>
                <p className="text-gray-700">{selectedIniciativa.impacto}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Tareas Asociadas</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tareas
                  .filter((t) => t.proyecto === selectedIniciativa.id)
                  .map((t) => (
                    <div key={t.id} className="text-sm p-2 bg-gray-50 rounded">
                      <p className="font-medium">{t.nombre}</p>
                      <p className="text-gray-600">{t.estado}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={modalEditOpen}
        onClose={() => setModalEditOpen(false)}
        title="Editar Iniciativa"
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
              Empresa
            </label>
            <select
              value={editFormData.empresa || ''}
              onChange={(e) =>
                setEditFormData({ ...editFormData, empresa: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {empresas.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Líder
            </label>
            <input
              type="email"
              value={editFormData.lider || ''}
              onChange={(e) =>
                setEditFormData({ ...editFormData, lider: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

      {/* Change Etapa Modal */}
      <Modal
        isOpen={modalChangeEtapaOpen}
        onClose={() => setModalChangeEtapaOpen(false)}
        title="Cambiar Etapa"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Etapa
            </label>
            <select
              value={changeEtapaData.etapa}
              onChange={(e) =>
                setChangeEtapaData({ ...changeEtapaData, etapa: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {etapas.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo
            </label>
            <textarea
              value={changeEtapaData.motivo}
              onChange={(e) =>
                setChangeEtapaData({ ...changeEtapaData, motivo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Explica el motivo del cambio..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleSaveChangeEtapa}>
              Cambiar Etapa
            </Button>
            <Button variant="secondary" onClick={() => setModalChangeEtapaOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
