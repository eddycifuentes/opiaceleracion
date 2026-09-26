// Test básico para validar mock data (Clase 5: Testing)

import { mockIniciativas, mockTareas, mockSprints } from '../src/data/mockData';

describe('Mock Data - OPI Aceleración', () => {
  
  test('mockIniciativas está cargado correctamente', () => {
    expect(mockIniciativas).toBeDefined();
    expect(Array.isArray(mockIniciativas)).toBe(true);
    expect(mockIniciativas.length).toBeGreaterThan(0);
    console.log(`✅ [test] ${mockIniciativas.length} iniciativas cargadas`);
  });

  test('mockTareas está cargado correctamente', () => {
    expect(mockTareas).toBeDefined();
    expect(Array.isArray(mockTareas)).toBe(true);
    expect(mockTareas.length).toBeGreaterThan(0);
    console.log(`✅ [test] ${mockTareas.length} tareas cargadas`);
  });

  test('mockSprints está cargado correctamente', () => {
    expect(mockSprints).toBeDefined();
    expect(Array.isArray(mockSprints)).toBe(true);
    expect(mockSprints.length).toBeGreaterThan(0);
    console.log(`✅ [test] ${mockSprints.length} sprints cargados`);
  });

  test('Iniciativa tiene campos requeridos', () => {
    const init = mockIniciativas[0];
    expect(init.id).toBeDefined();
    expect(init.nombre).toBeDefined();
    expect(init.etapa).toBeDefined();
    expect(init.empresa).toBeDefined();
    console.log(`✅ [test] Iniciativa ${init.id} tiene todos los campos`);
  });

  test('Tarea tiene campos requeridos', () => {
    const tarea = mockTareas[0];
    expect(tarea.id).toBeDefined();
    expect(tarea.nombre).toBeDefined();
    expect(tarea.estado).toBeDefined();
    console.log(`✅ [test] Tarea ${tarea.id} tiene todos los campos`);
  });

  test('Sprint tiene campos requeridos', () => {
    const sprint = mockSprints[0];
    expect(sprint.id).toBeDefined();
    expect(sprint.nombre).toBeDefined();
    expect(sprint.fechaInicio).toBeDefined();
    expect(sprint.fechaFin).toBeDefined();
    console.log(`✅ [test] Sprint ${sprint.id} tiene todos los campos`);
  });

});
