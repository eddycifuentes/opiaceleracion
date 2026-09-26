import { createContext, useContext, useState, ReactNode } from 'react';
import { Tarea, mockTareas } from '../data/mockData';

// Logger utility
const Logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

interface TareasState {
  tareas: Tarea[];
  updateTarea: (id: string, data: Partial<Tarea>) => void;
  deleteTarea: (id: string) => void;
  changeEstado: (id: string, newEstado: string) => void;
}

const TareasContext = createContext<TareasState | undefined>(undefined);

export const TareasProvider = ({ children }: { children: ReactNode }) => {
  const [tareas, setTareas] = useState<Tarea[]>(mockTareas);

  const updateTarea = (id: string, data: Partial<Tarea>) => {
    try {
      Logger.info(`[tareasStore.updateTarea] Actualizando tarea: ${id}`);
      setTareas((state) =>
        state.map((tarea) =>
          tarea.id === id ? { ...tarea, ...data } : tarea
        )
      );
      Logger.info(`[tareasStore.updateTarea] Actualización exitosa: ${id}`);
    } catch (e) {
      Logger.error(`[tareasStore.updateTarea] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo actualizar tarea: ${id}`);
    }
  };

  const deleteTarea = (id: string) => {
    try {
      Logger.info(`[tareasStore.deleteTarea] Eliminando tarea: ${id}`);
      setTareas((state) =>
        state.filter((tarea) => tarea.id !== id)
      );
      Logger.info(`[tareasStore.deleteTarea] Eliminación exitosa: ${id}`);
    } catch (e) {
      Logger.error(`[tareasStore.deleteTarea] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo eliminar tarea: ${id}`);
    }
  };

  const changeEstado = (id: string, newEstado: string) => {
    try {
      Logger.info(`[tareasStore.changeEstado] Cambiando estado de ${id} a ${newEstado}`);
      setTareas((state) =>
        state.map((tarea) =>
          tarea.id === id ? { ...tarea, estado: newEstado } : tarea
        )
      );
      Logger.info(`[tareasStore.changeEstado] Cambio exitoso: ${id} → ${newEstado}`);
    } catch (e) {
      Logger.error(`[tareasStore.changeEstado] FALLO al cambiar estado ${id}: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo cambiar estado de tarea: ${id}`);
    }
  };

  return (
    <TareasContext.Provider value={{ tareas, updateTarea, deleteTarea, changeEstado }}>
      {children}
    </TareasContext.Provider>
  );
};

export const useTareasStore = () => {
  const context = useContext(TareasContext);
  if (!context) {
    throw new Error('useTareasStore must be used within TareasProvider');
  }
  return context;
};
