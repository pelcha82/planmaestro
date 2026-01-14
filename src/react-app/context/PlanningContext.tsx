import { createContext, useContext, useState, ReactNode } from 'react';

interface PlanningData {
  // Step 1: Personal Data
  nombre: string;
  apellido: string;
  centro_educativo: string;
  
  // Step 2: Group Context
  grado: string;
  asignatura: string;
  cantidad_alumnos: number;
  
  // Step 3: Planning Details
  estrategia_planificacion: string;
  tema: string;
  recursos_disponibles: string;
  horario_clase: string;
  fecha_estimada: string;
}

interface PlanningContextType {
  planningData: PlanningData;
  updatePlanningData: (data: Partial<PlanningData>) => void;
  resetPlanningData: () => void;
}

const initialData: PlanningData = {
  nombre: '',
  apellido: '',
  centro_educativo: '',
  grado: '',
  asignatura: '',
  cantidad_alumnos: 0,
  estrategia_planificacion: '',
  tema: '',
  recursos_disponibles: '',
  horario_clase: '',
  fecha_estimada: '',
};

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [planningData, setPlanningData] = useState<PlanningData>(initialData);

  const updatePlanningData = (data: Partial<PlanningData>) => {
    setPlanningData(prev => ({ ...prev, ...data }));
  };

  const resetPlanningData = () => {
    setPlanningData(initialData);
  };

  return (
    <PlanningContext.Provider value={{ planningData, updatePlanningData, resetPlanningData }}>
      {children}
    </PlanningContext.Provider>
  );
}

export function usePlanning() {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within PlanningProvider');
  }
  return context;
}
