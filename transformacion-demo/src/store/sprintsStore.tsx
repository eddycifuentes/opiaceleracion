import { createContext, useContext, useState, ReactNode } from 'react';
import { Sprint, mockSprints } from '../data/mockData';

// Logger utility
const Logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

interface SprintsState {
  sprints: Sprint[];
  updateSprint: (id: string, data: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
}

const SprintsContext = createContext<SprintsState | undefined>(undefined);

export const SprintsProvider = ({ children }: { children: ReactNode }) => {
  const [sprints, setSprints] = useState<Sprint[]>(mockSprints);

  const updateSprint = (id: string, data: Partial<Sprint>) => {
    try {
      Logger.info(`[sprintsStore.updateSprint] Actualizando sprint: ${id}`);
      setSprints((state) =>
        state.map((sprint) =>
          sprint.id === id ? { ...sprint, ...data } : sprint
        )
      );
      Logger.info(`[sprintsStore.updateSprint] Actualizacion exitosa: ${id}`);
    } catch (e) {
      Logger.error(`[sprintsStore.updateSprint] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo actualizar sprint: ${id}`);
    }
  };

  const deleteSprint = (id: string) => {
    try {
      Logger.info(`[sprintsStore.deleteSprint] Eliminando sprint: ${id}`);
      setSprints((state) =>
        state.filter((sprint) => sprint.id !== id)
      );
      Logger.info(`[sprintsStore.deleteSprint] Eliminacion exitosa: ${id}`);
    } catch (e) {
      Logger.error(`[sprintsStore.deleteSprint] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo eliminar sprint: ${id}`);
    }
  };

  return (
    <SprintsContext.Provider value={{ sprints, updateSprint, deleteSprint }}>
      {children}
    </SprintsContext.Provider>
  );
};

export const useSprintsStore = () => {
  const context = useContext(SprintsContext);
  if (!context) {
    throw new Error('useSprintsStore must be used within SprintsProvider');
  }
  return context;
};
