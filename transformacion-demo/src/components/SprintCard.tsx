import React from 'react';
import { Sprint } from '../data/mockData';
import { Badge } from './Badge';
import { Button } from './Button';
import { Eye, Edit2, Trash2, CheckSquare } from 'lucide-react';

interface SprintCardProps {
  sprint: Sprint;
  onViewDetail: (sprint: Sprint) => void;
  onEdit: (sprint: Sprint) => void;
  onDelete: (id: string) => void;
}

export const SprintCard: React.FC<SprintCardProps> = ({
  sprint,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
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
    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{sprint.nombre}</h3>
        <p className="text-sm text-gray-500 mb-3">{sprint.id}</p>
        <Badge variant={getEstadoBadgeVariant(sprint.estado)}>
          {sprint.estado}
        </Badge>
      </div>

      <div className="text-sm text-gray-600 space-y-2 mb-4">
        <p><span className="font-medium">Proyecto:</span> {sprint.proyecto}</p>
        <p><span className="font-medium">Período:</span> {sprint.fechaInicio} → {sprint.fechaFin}</p>
        <p className="flex items-center gap-2">
          <CheckSquare size={16} />
          <span><span className="font-medium">{sprint.tareasCount}</span> tareas</span>
        </p>
        <p className="text-gray-700 italic">{sprint.objetivo}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() => onViewDetail(sprint)}
          className="flex items-center gap-1"
        >
          <Eye size={16} /> Ver Detalle
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(sprint)}
          className="flex items-center gap-1"
        >
          <Edit2 size={16} /> Editar
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onDelete(sprint.id)}
          className="flex items-center gap-1"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};
