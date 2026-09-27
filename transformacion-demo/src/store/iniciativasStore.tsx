import { createContext, useContext, useState, ReactNode } from 'react';
import { Iniciativa, mockIniciativas } from '../data/mockData';

// Logger utility
const Logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

interface IniciativasState {
  iniciativas: Iniciativa[];
  updateIniciativa: (id: string, data: Partial<Iniciativa>) => void;
  deleteIniciativa: (id: string) => void;
  changeEtapa: (id: string, newEtapa: string, motivo: string) => void;
}

const IniciativasContext = createContext<IniciativasState | undefined>(undefined);

export const IniciativasProvider = ({ children }: { children: ReactNode }) => {
  Logger.info('[iniciativasStore] IniciativasProvider mounted');
  
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>(mockIniciativas);

  const updateIniciativa = (id: string, data: Partial<Iniciativa>) => {
    try {
      Logger.info(`[iniciativasStore.updateIniciativa] Actualizando iniciativa: ${id}`);
      setIniciativas((state) =>
        state.map((ini) =>
          ini.id === id ? { ...ini, ...data } : ini
        )
      );
      Logger.info(`[iniciativasStore.updateIniciativa] Actualización exitosa: ${id}`);
    } catch (e) {
      Logger.error(`[iniciativasStore.updateIniciativa] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo actualizar iniciativa: ${id}`);
    }
  };

  const deleteIniciativa = (id: string) => {
    try {
      Logger.info(`[iniciativasStore.deleteIniciativa] Eliminando iniciativa: ${id}`);
      setIniciativas((state) =>
        state.filter((ini) => ini.id !== id)
      );
      Logger.info(`[iniciativasStore.deleteIniciativa] Eliminación exitosa: ${id}`);
    } catch (e) {
      Logger.error(`[iniciativasStore.deleteIniciativa] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo eliminar iniciativa: ${id}`);
    }
  };

  const changeEtapa = (id: string, newEtapa: string, motivo: string) => {
    try {
      Logger.info(`[iniciativasStore.changeEtapa] Cambiando etapa de ${id} a ${newEtapa}. Motivo: ${motivo}`);
      setIniciativas((state) =>
        state.map((ini) =>
          ini.id === id ? { ...ini, etapa: newEtapa } : ini
        )
      );
      Logger.info(`[iniciativasStore.changeEtapa] Cambio exitoso: ${id} → ${newEtapa}`);
    } catch (e) {
      Logger.error(`[iniciativasStore.changeEtapa] FALLO al cambiar etapa ${id}: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo cambiar etapa de iniciativa: ${id}`);
    }
  };

  return (
    <IniciativasContext.Provider value={{ iniciativas, updateIniciativa, deleteIniciativa, changeEtapa }}>
      {children}
    </IniciativasContext.Provider>
  );
};

export const useIniciativasStore = () => {
  const context = useContext(IniciativasContext);
  if (!context) {
    throw new Error('useIniciativasStore must be used within IniciativasProvider');
  }
  return context;
};