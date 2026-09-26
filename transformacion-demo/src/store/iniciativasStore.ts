import { create } from 'zustand';
import { Iniciativa, mockIniciativas } from '../data/mockData';

// Logger utility (Clase 5: Logging explícito)
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

export const useIniciativasStore = create<IniciativasState>((set) => ({
  iniciativas: mockIniciativas,
  
  updateIniciativa: (id: string, data: Partial<Iniciativa>) => {
    try {
      Logger.info(`[iniciativasStore.updateIniciativa] Actualizando iniciativa: ${id}`);
      set((state) => ({
        iniciativas: state.iniciativas.map((ini) =>
          ini.id === id ? { ...ini, ...data } : ini
        ),
      }));
      Logger.info(`[iniciativasStore.updateIniciativa] Actualización exitosa: ${id}`);
    } catch (e) {
      Logger.error(`[iniciativasStore.updateIniciativa] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo actualizar iniciativa: ${id}`);
    }
  },
  
  deleteIniciativa: (id: string) => {
    try {
      Logger.info(`[iniciativasStore.deleteIniciativa] Eliminando iniciativa: ${id}`);
      set((state) => ({
        iniciativas: state.iniciativas.filter((ini) => ini.id !== id),
      }));
      Logger.info(`[iniciativasStore.deleteIniciativa] Eliminación exitosa: ${id}`);
    } catch (e) {
      Logger.error(`[iniciativasStore.deleteIniciativa] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo eliminar iniciativa: ${id}`);
    }
  },
  
  changeEtapa: (id: string, newEtapa: string, motivo: string) => {
    try {
      Logger.info(`[iniciativasStore.changeEtapa] Cambiando etapa de ${id} a ${newEtapa}. Motivo: ${motivo}`);
      set((state) => ({
        iniciativas: state.iniciativas.map((ini) =>
          ini.id === id ? { ...ini, etapa: newEtapa } : ini
        ),
      }));
      Logger.info(`[iniciativasStore.changeEtapa] Cambio exitoso: ${id} → ${newEtapa}`);
    } catch (e) {
      Logger.error(`[iniciativasStore.changeEtapa] FALLO al cambiar etapa ${id}: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo cambiar etapa de iniciativa: ${id}`);
    }
  },
}));