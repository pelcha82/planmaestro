import { useState } from "react";
import { useNavigate } from "react-router";

interface DailyPlanningEditChatbotProps {
  planningId: string;
  planningTitle: string;
}

export default function DailyPlanningEditChatbot({ planningId, planningTitle }: DailyPlanningEditChatbotProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `¡Hola! Estoy aquí para ayudarte a modificar tu planificación "${planningTitle}". ¿Qué te gustaría cambiar o mejorar?`
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setIsSending(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate AI response
      const aiResponse = `Entiendo que quieres modificar: "${userMessage}". 

Voy a aplicar los siguientes cambios a tu planificación:

1. Actualizar la descripción de actividades
2. Ajustar los recursos didácticos según tu solicitud
3. Optimizar el contexto de la clase

¿Te parece bien que proceda con estos cambios?`;
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, hubo un error. Por favor, intenta de nuevo.' 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFinishEditing = async () => {
    setIsProcessing(true);
    
    // Simulate saving changes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to the planning detail view
    navigate(`/crear-planificacion-diaria/${planningId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            disabled={isProcessing}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg">Volver al Dashboard</span>
          </button>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Modificar Planificación con IA</h1>
          <p className="text-slate-600 text-lg">{planningTitle}</p>
        </div>

        {/* Chatbot Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Asistente IA</h3>
                <p className="text-indigo-100">Listo para ayudarte a mejorar tu planificación</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-5 py-4 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-lg px-5 py-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-6 bg-white">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending || isProcessing}
                placeholder="Describe los cambios que quieres hacer..."
                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 text-base"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isSending || isProcessing}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Action Button */}
            <button
              onClick={handleFinishEditing}
              disabled={isProcessing || messages.length <= 1}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Aplicando cambios...
                </span>
              ) : (
                'Finalizar y Ver Planificación Modificada'
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Consejo</h3>
              <p className="text-sm text-blue-800">
                Describe claramente qué secciones quieres modificar y cómo. La IA te ayudará a mejorar el contenido de tu planificación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
