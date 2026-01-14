import { useState } from "react";
import { DailyPlanData } from "./DailyPlanForm";

interface DailyDashboardProps {
  unitName: string;
  activityName: string;
  planData: DailyPlanData;
  onBack: () => void;
  onFinish: () => void;
}

export default function DailyDashboard({ unitName, activityName, planData, onBack, onFinish }: DailyDashboardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: '¡Hola! Estoy aquí para ayudarte a mejorar tu planificación diaria. ¿Qué te gustaría ajustar o agregar?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setIsSending(true);
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiResponse = `Entiendo que quieres mejorar "${userMessage}". En el contexto de ${activityName}, te sugiero considerar los siguientes puntos:\n\n1. Asegúrate de que todos los estudiantes participen activamente\n2. Mantén un ritmo dinámico pero claro\n3. Usa ejemplos concretos del entorno de los niños\n\n¿Hay algo específico que quieras profundizar?`;
    
    setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg">Editar Planificación</span>
          </button>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Tu Planificación Diaria</h1>
          <p className="text-slate-600">
            {unitName} • {activityName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Planning Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Información General</h2>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-bold text-slate-500 uppercase">Fecha</span>
                  <p className="text-lg text-slate-800 mt-1">
                    {new Date(planData.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-500 uppercase">Unidad</span>
                  <p className="text-lg text-slate-800 mt-1">{unitName}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-bold text-slate-500 uppercase">Actividad</span>
                  <p className="text-lg text-slate-800 mt-1">{activityName}</p>
                </div>
              </div>
            </div>

            {/* Contexto */}
            {planData.contexto && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-amber-600 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Contexto / Efemérides y Actos Especiales
                </h3>
                <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">{planData.contexto}</p>
              </div>
            )}

            {/* Recursos Didácticos */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-cyan-600 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Recursos Didácticos
              </h3>
              <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">{planData.recursosDidacticos}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onFinish}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl transition-all duration-200"
              >
                Finalizar y Guardar
              </button>
            </div>
          </div>

          {/* Sidebar - Chatbot */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Chatbot Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Asistente IA</h3>
                        <p className="text-indigo-100 text-sm">Mejora tu planificación</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className="lg:hidden text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isChatOpen ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className={`${isChatOpen ? 'block' : 'hidden lg:block'}`}>
                  <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-slate-800 border border-slate-200'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isSending && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-slate-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSending}
                        placeholder="Pregunta cómo mejorar..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isSending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Consejos Rápidos
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Mantén actividades cortas y variadas</li>
                  <li>• Usa ejemplos del día a día</li>
                  <li>• Verifica la comprensión constantemente</li>
                  <li>• Prepara material de respaldo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
