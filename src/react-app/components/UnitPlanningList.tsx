interface UnitPlanning {
  id: number;
  teacher_registration_id: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio_date?: string;
  fecha_fin_date?: string;
  created_at: string;
  updated_at: string;
}

interface UnitPlanningListProps {
  units: UnitPlanning[];
  selectedUnit: UnitPlanning | null;
  onSelectUnit: (unit: UnitPlanning) => void;
  onDeleteUnit: (unitId: number) => void;
}

export default function UnitPlanningList({ units, selectedUnit, onSelectUnit, onDeleteUnit }: UnitPlanningListProps) {
  if (units.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No hay planificaciones de unidad.</p>
        <p className="text-sm mt-2">Crea una nueva para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {units.map((unit) => (
        <div
          key={unit.id}
          className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            selectedUnit?.id === unit.id
              ? 'border-indigo-500 bg-indigo-50 shadow-md'
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
          }`}
          onClick={() => onSelectUnit(unit)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{unit.titulo}</h3>
              {unit.descripcion && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{unit.descripcion}</p>
              )}
              {(unit.fecha_inicio_date || unit.fecha_fin_date) && (
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  {unit.fecha_inicio_date && (
                    <span className="px-2 py-1 bg-slate-100 rounded">{unit.fecha_inicio_date}</span>
                  )}
                  {unit.fecha_inicio_date && unit.fecha_fin_date && <span>-</span>}
                  {unit.fecha_fin_date && (
                    <span className="px-2 py-1 bg-slate-100 rounded">{unit.fecha_fin_date}</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteUnit(unit.id);
              }}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded text-red-600"
              title="Eliminar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
