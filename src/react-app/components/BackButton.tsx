import { useNavigate } from "react-router";

interface BackButtonProps {
  className?: string;
  label?: string;
  fallbackPath?: string;
}

export default function BackButton({ 
  className = "", 
  label = "Volver Atrás",
  fallbackPath = "/"
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔙 [BACK BUTTON] Click detectado, navegando a:', fallbackPath);
    
    try {
      navigate(fallbackPath);
      console.log('✅ [BACK BUTTON] Navegación completada');
    } catch (error) {
      console.error('❌ [BACK BUTTON] Error al navegar:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`relative flex items-center gap-2 px-4 py-3 text-lg font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      style={{ zIndex: 9999, pointerEvents: 'auto' }}
      aria-label="Volver a la página anterior"
    >
      <svg 
        className="w-6 h-6 pointer-events-none" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span className="font-bold pointer-events-none">{label}</span>
    </button>
  );
}
