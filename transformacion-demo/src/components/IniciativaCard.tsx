import React from 'react';
import { Iniciativa } from '../data/mockData';
import { Badge } from './Badge';
import { Button } from './Button';
import { Edit2, Trash2, Eye, ArrowRight } from 'lucide-react';

interface IniciativaCardProps {
  iniciativa: Iniciativa;
  onViewDetail: (ini: Iniciativa) => void;
  onEdit: (ini: Iniciativa) => void;
  onChangeEtapa: (ini: Iniciativa) => void;
  onDelete: (id: string) => void;
}

export const IniciativaCard: React.FC<IniciativaCardProps> = ({
  iniciativa,
  onViewDetail,
  onEdit,
  onChangeEtapa,
  onDelete,
}) => {
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Completado':
        return 'info';
      case 'Cerrado':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getEtapaColor = (etapa: string) => {
    if (etapa.startsWith('1')) return 'bg-purple-100 text-purple-800';
    if (etapa.startsWith('2')) return 'bg-blue-100 text-blue-800';
    if (etapa.startsWith('3')) return 'bg-green-100 text-green-800';
    if (etapa.startsWith('4')) return 'bg-amber-100 text-amber-800';
    if (etapa.startsWith('5')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm text-gray-500">{iniciativa.id}</p>
            <h3 className="text-lg font-bold text-gray-900">{iniciativa.nombre}</h3>
          </div>
          <Badge variant={getEstadoBadgeVariant(iniciativa.estado)}>
            {iniciativa.estado}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3">{iniciativa.empresa}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded ${getEtapaColor(iniciativa.etapa)}`}>
          {iniciativa.etapa}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-4 space-y-1">
        <p><span className="font-medium">Líder:</span> {iniciativa.lider}</p>
        <p><span className="font-medium">Impacto:</span> {iniciativa.impacto}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() => onViewDetail(iniciativa)}
          className="flex items-center gap-1"
        >
          <Eye size={16} /> Ver Detalle
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(iniciativa)}
          className="flex items-center gap-1"
        >
          <Edit2 size={16} /> Editar
        </Button>
        <Button
          size="sm"
          variant="warning"
          onClick={() => onChangeEtapa(iniciativa)}
          className="flex items-center gap-1"
        >
          <ArrowRight size={16} /> Cambiar Etapa
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onDelete(iniciativa.id)}
          className="flex items-center gap-1"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};
