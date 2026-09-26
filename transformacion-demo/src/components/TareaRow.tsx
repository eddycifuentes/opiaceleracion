import React from 'react';
import { Tarea } from '../data/mockData';
import { Badge } from './Badge';
import { Button } from './Button';
import { Eye, Trash2 } from 'lucide-react';

interface TareaRowProps {
  tarea: Tarea;
  projectName: string;
  onViewDetail: (tarea: Tarea) => void;
  onChangeEstado: (tarea: Tarea) => void;
  onDelete: (id: string) => void;
}

export const TareaRow: React.FC<TareaRowProps> = ({
  tarea,
  projectName,
  onViewDetail,
  onChangeEstado,
  onDelete,
}) => {
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return 'success';
      case 'En Proceso':
        return 'warning';
      case 'Pendiente':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getPrioridadBadgeVariant = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta':
        return 'danger';
      case 'Media':
        return 'warning';
      case 'Baja':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{tarea.id}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{tarea.nombre}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{projectName}</td>
      <td className="px-6 py-4">
        <Badge variant={getEstadoBadgeVariant(tarea.estado)}>
          {tarea.estado}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge variant={getPrioridadBadgeVariant(tarea.prioridad)}>
          {tarea.prioridad}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{tarea.asignado}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{tarea.fechaEntrega}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onViewDetail(tarea)}
            className="flex items-center gap-1"
          >
            <Eye size={16} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onChangeEstado(tarea)}
          >
            Cambiar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(tarea.id)}
            className="flex items-center gap-1"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
};
