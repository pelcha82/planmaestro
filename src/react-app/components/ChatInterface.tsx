import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Send, User as UserIcon, Settings, LogOut, Sparkles, FileText, ChevronLeft, Eye, Lightbulb, X } from "lucide-react";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sectionLabel?: string;
}

interface ChatInterfaceProps {
  sectionFieldName: string;
  onCancel: () => void;
  correo: string;
  unitId: string;
  userName: string;
  editableSections: Array<{ value: string; label: string }>;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  isDailyPlanning?: boolean;
  activityName?: string;
  asignatura?: string;
  planningId?: string;
  planningData?: any;
}

interface Suggestion {
  icon: string;
  text: string;
  prompt: string;
}

export default function ChatInterface({ 
  sectionFieldName,
  onCancel,
  correo,
  unitId,
  editableSections,
  selectedSection,
  onSectionChange,
  isDailyPlanning = false,
  activityName = "",
  asignatura = "",
  planningId = "",
  planningData = null
}: ChatInterfaceProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingContent, setTypingContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSavingChat, setIsSavingChat] = useState(false);
  const [chatSaveSuccess, setChatSaveSuccess] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState({ current: '', new: '' });
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleGoToPlanning = () => {
    if (isDailyPlanning) {
      navigate('/crear-planificacion-diaria/detalle');
    } else {
      if (planningId) {
        navigate(`/ver-planificacion-unidad/${planningId}`);
      } else {
        navigate('/resumen-planificacion');
      }
    }
  };

  // Get current content for selected section
  const getCurrentSectionContent = (): string => {
    if (!planningData || !selectedSection) return '';
    
    // Try to find content using the field name
    const content = planningData[selectedSection] || 
                   planningData[selectedSection.toLowerCase()] ||
                   planningData[selectedSection.toUpperCase()] ||
                   '';
    
    return typeof content === 'string' ? content : '';
  };

  // Generate contextual suggestions based on section, grade, and subject
  const getContextualSuggestions = (): Suggestion[] => {
    if (!selectedSection) return [];

    const grado = planningData?.GRADO || planningData?.grado || '';
    const materia = asignatura || planningData?.MATERIA || '';

    // Base suggestions for all sections
    const baseSuggestions: Record<string, Suggestion[]> = {
      'INTENCIÓN PEDAGÓGICA': [
        { icon: '🎯', text: 'Hacer más específica', prompt: 'Haz la intención pedagógica más específica y medible' },
        { icon: '📚', text: 'Alinear con competencias', prompt: 'Asegúrate de que la intención pedagógica esté alineada con las competencias específicas' },
        { icon: '✨', text: 'Simplificar lenguaje', prompt: 'Simplifica el lenguaje para que sea más claro y directo' }
      ],
      'COMPETENCIAS FUNDAMENTALES': [
        { icon: '🎓', text: 'Agregar ejemplos', prompt: 'Agrega ejemplos concretos de cómo desarrollar estas competencias' },
        { icon: '🔗', text: 'Conectar con vida real', prompt: 'Conecta las competencias con situaciones de la vida real del estudiante' },
        { icon: '📊', text: 'Criterios medibles', prompt: 'Define criterios medibles para evaluar estas competencias' }
      ],
      'COMPETENCIA ESPECÍFICA': [
        { icon: '🎯', text: 'Hacer observable', prompt: 'Reformula para que sea observable y medible' },
        { icon: '📝', text: 'Descomponer pasos', prompt: 'Descompón en pasos más pequeños y alcanzables' },
        { icon: '💡', text: 'Agregar contexto', prompt: 'Agrega contexto sobre por qué es importante esta competencia' }
      ],
      'MOMENTO DE INICIO': [
        { icon: '🚀', text: 'Más dinámico', prompt: 'Haz el inicio más dinámico y motivador' },
        { icon: '❓', text: 'Agregar preguntas', prompt: 'Agrega preguntas detonadoras que activen conocimientos previos' },
        { icon: '⏱️', text: 'Ajustar tiempo', prompt: 'Optimiza el tiempo del momento de inicio (5-10 minutos)' }
      ],
      'MOMENTO DE DESARROLLO': [
        { icon: '🔨', text: 'Más actividades prácticas', prompt: 'Agrega más actividades prácticas y participativas' },
        { icon: '👥', text: 'Trabajo colaborativo', prompt: 'Incluye oportunidades para trabajo en equipos' },
        { icon: '🎨', text: 'Diversificar estrategias', prompt: 'Diversifica las estrategias para diferentes estilos de aprendizaje' }
      ],
      'MOMENTO DE CIERRE': [
        { icon: '✅', text: 'Reforzar aprendizajes', prompt: 'Agrega una actividad para reforzar los aprendizajes clave' },
        { icon: '🗣️', text: 'Más participación', prompt: 'Incluye más participación estudiantil en el cierre' },
        { icon: '🔄', text: 'Conectar con próxima clase', prompt: 'Conecta el cierre con lo que se verá en la próxima clase' }
      ],
      'INDICADORES DE LOGRO': [
        { icon: '📊', text: 'Hacer medibles', prompt: 'Reformula para que sean claramente medibles y observables' },
        { icon: '🎯', text: 'Alinear con actividades', prompt: 'Asegúrate de que los indicadores se alineen con las actividades planificadas' },
        { icon: '📈', text: 'Diferentes niveles', prompt: 'Incluye indicadores para diferentes niveles de logro' }
      ],
      'RECURSOS DIDÁCTICOS': [
        { icon: '💰', text: 'Opciones económicas', prompt: 'Sugiere alternativas de bajo costo o con materiales del entorno' },
        { icon: '🌐', text: 'Recursos digitales', prompt: 'Agrega recursos digitales gratuitos disponibles en línea' },
        { icon: '♻️', text: 'Materiales reciclables', prompt: 'Incluye opciones con materiales reciclables o reutilizables' }
      ],
      'ESTRATEGIA DE ENSEÑANZA': [
        { icon: '🎓', text: 'Adaptación por niveles', prompt: 'Agrega adaptaciones para diferentes niveles de aprendizaje' },
        { icon: '🌟', text: 'Más inclusiva', prompt: 'Haz la estrategia más inclusiva considerando la diversidad' },
        { icon: '🎯', text: 'Evaluar efectividad', prompt: 'Agrega criterios para evaluar la efectividad de la estrategia' }
      ]
    };

    const suggestions = baseSuggestions[selectedSection] || [
      { icon: '✨', text: 'Mejorar redacción', prompt: 'Mejora la redacción para que sea más clara y profesional' },
      { icon: '📚', text: 'Agregar detalles', prompt: 'Agrega más detalles y ejemplos concretos' },
      { icon: '🎯', text: 'Hacer más específico', prompt: 'Haz el contenido más específico para el contexto del aula' }
    ];

    // Add grade-specific suggestions
    if (grado.includes('1') || grado.includes('2')) {
      suggestions.unshift({
        icon: '🧒',
        text: 'Adaptar para primeros grados',
        prompt: `Adapta el contenido para estudiantes de ${grado}, usando lenguaje simple y ejemplos concretos`
      });
    }

    // Add subject-specific suggestions
    if (materia.toLowerCase().includes('matemática')) {
      suggestions.push({
        icon: '🔢',
        text: 'Agregar ejercicios',
        prompt: 'Agrega más ejercicios prácticos y ejemplos numéricos'
      });
    } else if (materia.toLowerCase().includes('lengua')) {
      suggestions.push({
        icon: '📖',
        text: 'Incluir lectura',
        prompt: 'Incluye actividades de lectura y escritura apropiadas'
      });
    }

    return suggestions.slice(0, 5); // Return max 5 suggestions
  };

  // Initialize with system welcome message
  useEffect(() => {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'Selecciona la sección que deseas editar. Te mostraré el contenido actual y sugerencias para mejorarlo.',
      timestamp: new Date()
    };
    setMessages([systemMessage]);
  }, []);

  // Show suggestions when section changes
  useEffect(() => {
    if (selectedSection) {
      setShowSuggestions(true);
    }
  }, [selectedSection]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingContent]);

  const cleanWebhookResponse = (text: string): string => {
    let cleaned = text;
    cleaned = cleaned.replace(/^\[?\{?"?RESPUESTA"?:\[?\{?"?output"?:"?\\?"/, '');
    cleaned = cleaned.replace(/\\?"?\}?\]?\}?\]?$/, '');
    cleaned = cleaned.replace(/\\n\\n/g, '\n\n');
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\"/g, '"');
    return cleaned.trim();
  };

  const typeMessage = async (content: string, sectionLabel: string = '') => {
    setIsTyping(true);
    setTypingContent("");
    
    const cleanedContent = cleanWebhookResponse(content);
    const words = cleanedContent.split(' ');
    let currentText = "";
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setTypingContent(currentText);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    setIsTyping(false);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: cleanedContent,
      timestamp: new Date(),
      sectionLabel: sectionLabel
    }]);
    
    setTypingContent("");
  };

  const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        
        const isNetworkError = error instanceof TypeError || 
                               (error instanceof Error && error.name === 'AbortError');
        
        if (isNetworkError && attempt < maxRetries - 1) {
          const waitTime = (attempt + 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (!isNetworkError) {
          throw error;
        }
      }
    }
    
    throw lastError || new Error('Error de conexión después de múltiples intentos');
  };

  const handleSendMessage = async (messageText?: string, isAutoLoad: boolean = false) => {
    const textToSend = messageText !== undefined ? messageText : inputValue.trim();
    
    if (isProcessing) return;

    if (!sectionFieldName) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Selecciona una sección antes de enviar un mensaje.',
        timestamp: new Date()
      }]);
      return;
    }

    if (!isAutoLoad && !textToSend) return;
    
    // Hide suggestions after first message
    setShowSuggestions(false);
    
    if (textToSend && textToSend.trim() !== '') {
      setMessages(prev => [...prev, {
        role: 'user',
        content: textToSend,
        timestamp: new Date()
      }]);
    }
    
    setInputValue("");
    setIsProcessing(true);

    try {
      const endpoint = isDailyPlanning ? '/api/send-daily-chat-message' : '/api/ai-modify-section';
      
      const requestBody = isDailyPlanning 
        ? {
            section: sectionFieldName,
            email: correo,
            message: textToSend,
            activityName: activityName,
            planningData: planningData
          }
        : {
            instruction: textToSend,
            correo: correo,
            section_name: sectionFieldName,
            unit_id: unitId,
            section_content: textToSend
          };
      
      const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }, 3);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar con IA');
      }

      const contentToDisplay = isDailyPlanning ? result.response : result.modified_content;
      const currentSectionLabel = sectionFieldName;
      
      await typeMessage(contentToDisplay, currentSectionLabel);
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al procesar solicitud';
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${errorMessage}. Verifica tu conexión e intenta nuevamente.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowPreview = (messageContent: string, messageIndex: number) => {
    const currentContent = getCurrentSectionContent();
    setPreviewContent({
      current: currentContent,
      new: cleanWebhookResponse(messageContent)
    });
    setCurrentMessageIndex(messageIndex);
    setShowPreview(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveChat = async (messageContent: string) => {
    if (!messageContent || messageContent.trim() === '') return;

    setIsSavingChat(true);
    setChatSaveSuccess(false);

    let cleanedMessage = messageContent;
    cleanedMessage = cleanedMessage.replace(/^\[\{"\.":\[\{"output":"/g, '');
    cleanedMessage = cleanedMessage.replace(/"\}\]\}\]$/g, '');
    cleanedMessage = cleanedMessage.replace(/\\"/g, '"');
    cleanedMessage = cleanedMessage.replace(/\\n/g, '\n');

    try {
      // Extract planning ID from planningData
      const planningId = planningData?.id || 
                        planningData?.ID || 
                        planningData?.uuid ||
                        planningData?.UUID ||
                        '';
      
      console.log('💾 [SAVE CHAT] Enviando al webhook 91e82ff0-cbe7-4df9-b617-adc1b4eb1771');
      console.log('  - ID de planificación:', planningId);
      console.log('  - Sección:', sectionFieldName);
      console.log('  - Texto (primeros 100 chars):', cleanedMessage.trim().substring(0, 100));
      
      // Send to new webhook with the 3 required fields
      const newWebhookPayload = {
        id: planningId,
        seccion: sectionFieldName,
        texto: cleanedMessage.trim()
      };
      
      const newWebhookResponse = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/91e82ff0-cbe7-4df9-b617-adc1b4eb1771', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWebhookPayload),
      });
      
      console.log('✅ [SAVE CHAT] Respuesta del nuevo webhook:', newWebhookResponse.status);
      
      if (!newWebhookResponse.ok) {
        console.error('❌ [SAVE CHAT] Error en webhook 91e82ff0:', newWebhookResponse.status);
        throw new Error('Error al guardar en el webhook');
      }
      
      // Also send to existing endpoints for backward compatibility
      const endpoint = isDailyPlanning 
        ? '/api/save-chat-response'
        : '/api/save-unit-chat-response';
      
      const requestBody = isDailyPlanning
        ? {
            correo: correo,
            unit_id: unitId,
            section_name: sectionFieldName,
            message_content: cleanedMessage.trim(),
            asignatura: asignatura,
            tema_del_dia: activityName
          }
        : {
            correo: correo,
            unit_id: unitId,
            section_name: sectionFieldName,
            message_content: cleanedMessage.trim(),
            asignatura: asignatura
          };
      
      const webhookResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!webhookResponse.ok) {
        console.warn('⚠️ [SAVE CHAT] Error en endpoint legacy, pero continuando...');
      }

      try {
        await fetch('/api/save-chat-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: correo,
            unit_id: unitId,
            section_name: sectionFieldName,
            conversation_data: messages
          }),
        });
      } catch (dbError) {
        console.error('Error al guardar en base de datos:', dbError);
      }

      setChatSaveSuccess(true);
      setShowPreview(false);
      setTimeout(() => {
        setChatSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('❌ [SAVE CHAT] Error al guardar:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar conversación');
    } finally {
      setIsSavingChat(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
    setShowSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  // Autofocus management
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current && !isProcessing && !isTyping) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [messages, isProcessing, isTyping, selectedSection, isSavingChat]);

  // Auto-load activity content when section is selected
  useEffect(() => {
    if (selectedSection && selectedSection !== '') {
      handleSendMessage('', true);
    }
  }, [selectedSection]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const suggestions = getContextualSuggestions();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header - WhatsApp style */}
      <div className="flex-none bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="px-3 py-3 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-white hover:bg-white/10 rounded-full p-2 transition-colors active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-white font-semibold text-base">Editar Planificación</h1>
            {selectedSection && (
              <p className="text-white/80 text-xs mt-0.5">
                {editableSections.find(s => s.value === selectedSection)?.label || ''}
              </p>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95"
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/mi-cuenta');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors active:bg-gray-100"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Mi Cuenta</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors active:bg-red-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-3 pb-3">
          <select
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/95 text-blue-900 font-medium shadow-sm"
          >
            <option value="">Selecciona la sección a editar</option>
            {editableSections.map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Contextual Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mb-4 animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border-2 border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-purple-900 text-sm">Sugerencias para mejorar</h3>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                    className="w-full text-left px-3 py-2 bg-white hover:bg-purple-50 rounded-xl transition-all border border-purple-100 hover:border-purple-300 active:scale-98 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{suggestion.icon}</span>
                      <span className="text-sm text-gray-700 group-hover:text-purple-700 font-medium">
                        {suggestion.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index}>
            {message.role === 'system' && (
              <div className="flex justify-center mb-4">
                <div className="max-w-sm px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-blue-800 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span>{message.content}</span>
                  </div>
                </div>
              </div>
            )}

            {message.role === 'user' && (
              <div className="flex justify-end mb-2">
                <div className="max-w-[85%] sm:max-w-[75%]">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md">
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <div className="flex justify-end mt-1 px-1">
                    <span className="text-[10px] text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {message.role === 'assistant' && (
              <div className="flex justify-start mb-2">
                <div className="max-w-[85%] sm:max-w-[75%]">
                  {message.sectionLabel && (
                    <div className="mb-1.5 ml-1">
                      <span className="inline-block px-2.5 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-[10px] sm:text-xs font-semibold shadow-sm">
                        {message.sectionLabel}
                      </span>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-md border border-gray-100">
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-[10px] text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  {index > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                      <button
                        onClick={() => handleShowPreview(message.content, index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100 transition-all active:scale-95 shadow-sm border border-purple-200"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Comparar</span>
                      </button>
                      <button
                        onClick={() => handleSaveChat(message.content)}
                        disabled={isSavingChat || isProcessing || isTyping}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                      >
                        {isSavingChat ? (
                          <>
                            <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Guardar</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleGoToPlanning}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition-all active:scale-95 shadow-sm border border-blue-200"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Ver</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isProcessing && !isTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 shadow-md border border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start mb-2">
            <div className="max-w-[85%] sm:max-w-[75%]">
              {selectedSection && (
                <div className="mb-1.5 ml-1">
                  <span className="inline-block px-2.5 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-[10px] sm:text-xs font-semibold shadow-sm">
                    {editableSections.find(s => s.value === selectedSection)?.label || ''}
                  </span>
                </div>
              )}
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-md border border-gray-100">
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                  {typingContent}
                  <span className="inline-block w-0.5 h-4 bg-blue-600 ml-0.5 animate-pulse"></span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none bg-white border-t border-gray-200 shadow-lg">
        <div className="px-3 py-2 sm:py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing || isTyping}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="w-full px-4 py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-3xl focus:outline-none focus:border-blue-500 focus:ring-0 resize-none disabled:opacity-50 disabled:bg-gray-50"
                style={{ minHeight: '42px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isProcessing || isTyping}
              className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md"
            >
              {isProcessing ? (
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Comparar Cambios</h2>
                  <p className="text-white/80 text-sm mt-1">
                    {editableSections.find(s => s.value === selectedSection)?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Comparison Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Current Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                    Contenido Actual
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 min-h-[200px]">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {previewContent.current || 'Sin contenido previo'}
                  </p>
                </div>
              </div>

              {/* New Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h3 className="font-bold text-green-700 text-sm uppercase tracking-wide">
                    Contenido Nuevo
                  </h3>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-300 min-h-[200px]">
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {previewContent.new}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-98"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (currentMessageIndex !== null) {
                    handleSaveChat(messages[currentMessageIndex].content);
                  }
                }}
                disabled={isSavingChat}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg active:scale-98"
              >
                {isSavingChat ? 'Guardando...' : 'Confirmar y Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success notification */}
      {chatSaveSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-full shadow-2xl flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Guardado exitosamente</span>
          </div>
        </div>
      )}
    </div>
  );
}
