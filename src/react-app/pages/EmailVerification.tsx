import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, RefreshCw, Check, Clock, AlertTriangle } from "lucide-react";
import { fetchWithTimeout, fetchWithRetry } from "@/react-app/utils/fetchWithTimeout";
import ErrorDisplay from "@/react-app/components/ErrorDisplay";
import ProgressSteps from "@/react-app/components/ProgressSteps";
import CodeInput from "@/react-app/components/CodeInput";

const REGISTRATION_STEPS = [
  {
    id: 1,
    name: "Registro",
    description: "Ingresa tu correo"
  },
  {
    id: 2,
    name: "Verificación",
    description: "Confirma tu código"
  },
  {
    id: 3,
    name: "Completar Perfil",
    description: "Datos de maestro"
  }
];

const CODE_EXPIRATION_TIME = 10 * 60; // 10 minutes in seconds

interface EmailVerificationProps {
  email: string;
}

export default function EmailVerification({ email }: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [codeExpirationTime, setCodeExpirationTime] = useState(CODE_EXPIRATION_TIME);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const navigate = useNavigate();

  // Countdown timer for code expiration
  useEffect(() => {
    if (codeExpirationTime > 0 && !isCodeExpired) {
      const timer = setTimeout(() => {
        setCodeExpirationTime(codeExpirationTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (codeExpirationTime === 0 && !isCodeExpired) {
      setIsCodeExpired(true);
      setError('Tu código de verificación ha expirado. Por favor, solicita uno nuevo.');
    }
  }, [codeExpirationTime, isCodeExpired]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Format time for display (MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine expiration status
  const getExpirationStatus = () => {
    if (isCodeExpired) {
      return { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: AlertTriangle, message: 'Código expirado' };
    }
    if (codeExpirationTime <= 60) {
      return { color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: AlertTriangle, message: '¡Menos de 1 minuto!' };
    }
    if (codeExpirationTime <= 180) {
      return { color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: Clock, message: 'Expira pronto' };
    }
    return { color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', icon: Clock, message: 'Válido por' };
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isCodeExpired) {
      setError('Tu código ha expirado. Por favor, solicita uno nuevo.');
      return;
    }
    
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      console.log('📤 [VERIFICACIÓN] Verificando código con timeout de 30s');
      
      const response = await fetchWithTimeout(
        '/api/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: email, code }),
        },
        30000 // 30 second timeout
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Código de verificación inválido');
      }

      console.log('✅ [VERIFICACIÓN] Código verificado exitosamente');

      // Store email and verification code in localStorage
      if (result.correo) {
        localStorage.setItem('userEmail', result.correo);
      }
      if (result.code) {
        localStorage.setItem('verificationCode', result.code);
        console.log('✅ Código de verificación guardado en localStorage');
      }
      
      // 🆕 Store teacher data if available in response
      if (result.nombre) {
        localStorage.setItem('teacherNombre', result.nombre);
      }
      if (result.apellido) {
        localStorage.setItem('teacherApellido', result.apellido);
      }
      if (result.centro_educativo) {
        localStorage.setItem('teacherCentroEducativo', result.centro_educativo);
      }
      if (result.nombre || result.apellido || result.centro_educativo) {
        console.log('✅ Datos del docente guardados en localStorage desde verificación');
      }
      
      navigate('/');
    } catch (err) {
      console.error('❌ [VERIFICACIÓN] Error:', err);
      setError(err instanceof Error ? err.message : 'Error al verificar código');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    // Prevent spam - enforce countdown
    if (resendCountdown > 0) {
      return;
    }

    setIsResending(true);
    setError("");
    setResendSuccess(false);

    const data = { correo: email };

    try {
      console.log('📤 [REENVIAR] Reenviando código con reintentos automáticos');
      
      // Use fetchWithRetry for automatic retries (max 3 attempts)
      const response = await fetchWithRetry(
        '/api/send-to-n8n',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        3, // Max 3 retries
        30000 // 30 second timeout per attempt
      );

      if (!response.ok) {
        throw new Error('No se pudo enviar el código. Por favor, intenta nuevamente.');
      }

      console.log('✅ [REENVIAR] Código reenviado exitosamente');
      
      // Reset expiration timer
      setCodeExpirationTime(CODE_EXPIRATION_TIME);
      setIsCodeExpired(false);
      setCode(''); // Clear previous code
      
      // Show success message
      setResendSuccess(true);
      
      // Start 60 second countdown before allowing another resend
      setResendCountdown(60);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('❌ [REENVIAR] Error:', err);
      setError(err instanceof Error ? err.message : 'Error al reenviar código. Por favor, intenta nuevamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleRetryVerification = async () => {
    if (isCodeExpired) {
      await handleResendCode();
      return;
    }
    
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetchWithTimeout(
        '/api/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: email, code }),
        },
        30000
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Código de verificación inválido');
      }

      if (result.correo) {
        localStorage.setItem('userEmail', result.correo);
      }
      if (result.code) {
        localStorage.setItem('verificationCode', result.code);
      }
      
      // Store teacher data if available in response
      if (result.nombre) {
        localStorage.setItem('teacherNombre', result.nombre);
      }
      if (result.apellido) {
        localStorage.setItem('teacherApellido', result.apellido);
      }
      if (result.centro_educativo) {
        localStorage.setItem('teacherCentroEducativo', result.centro_educativo);
      }
      
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar código');
    } finally {
      setIsVerifying(false);
    }
  };

  const expirationStatus = getExpirationStatus();
  const ExpirationIcon = expirationStatus.icon;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 backdrop-blur-sm">
          {/* Progress Steps */}
          <ProgressSteps currentStep={2} steps={REGISTRATION_STEPS} />

          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-100 mb-4">
              <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-3">
              Verifica tu correo
            </h2>
            <p className="text-slate-600 text-sm">
              Hemos enviado un código de verificación a
            </p>
            <p className="text-indigo-600 font-semibold mt-1 break-all">
              {email}
            </p>
          </div>

          {/* Code Expiration Timer */}
          <div className={`mb-6 p-4 rounded-lg border ${expirationStatus.bgColor} ${expirationStatus.borderColor}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ExpirationIcon className={`w-5 h-5 ${expirationStatus.color}`} />
                <span className={`text-sm font-medium ${expirationStatus.color}`}>
                  {expirationStatus.message}
                </span>
              </div>
              <div className={`text-lg font-bold font-mono ${expirationStatus.color}`}>
                {formatTime(codeExpirationTime)}
              </div>
            </div>
            {codeExpirationTime <= 180 && !isCodeExpired && (
              <p className={`mt-2 text-xs ${expirationStatus.color}`}>
                {codeExpirationTime <= 60 
                  ? '⚠️ Tu código está a punto de expirar. Ingrésalo ahora o solicita uno nuevo.'
                  : '⏰ Tu código expirará pronto. Ingrésalo antes de que sea muy tarde.'
                }
              </p>
            )}
            {isCodeExpired && (
              <p className="mt-2 text-xs text-red-600 font-medium">
                ❌ Este código ya no es válido. Haz clic en "Reenviar" para obtener uno nuevo.
              </p>
            )}
          </div>

          {error && (
            <ErrorDisplay 
              error={error} 
              onRetry={handleRetryVerification}
              isRetrying={isVerifying || isResending}
            />
          )}

          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Código reenviado exitosamente</p>
                <p className="text-xs mt-1">Revisa tu correo. El nuevo código es válido por 10 minutos.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5 sm:space-y-6">
            <div className="flex flex-col">
              <label 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-4 tracking-wide text-center"
              >
                CÓDIGO DE VERIFICACIÓN
              </label>
              
              {/* New 6-digit code input component */}
              <CodeInput
                length={6}
                value={code}
                onChange={setCode}
                disabled={isVerifying || isCodeExpired}
                autoFocus
              />
              
              {/* Status indicator */}
              <div className="mt-4 text-center">
                {code.length === 0 && !isCodeExpired && (
                  <p className="text-xs sm:text-sm text-slate-500">
                    Ingresa el código de 6 dígitos que recibiste por correo
                  </p>
                )}
                {code.length > 0 && code.length < 6 && !isCodeExpired && (
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      Faltan {6 - code.length} dígitos
                    </span>
                  </div>
                )}
                {code.length === 6 && !isCodeExpired && (
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Código completo
                    </span>
                  </div>
                )}
                {isCodeExpired && (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Código expirado - Solicita uno nuevo
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || code.length !== 6 || isCodeExpired}
              className="w-full px-6 py-3 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : isCodeExpired ? (
                'Código expirado'
              ) : (
                'Verificar código'
              )}
            </button>

            <div className="text-center pt-4 border-t border-slate-200">
              {resendCountdown > 0 ? (
                <p className="text-slate-500 text-sm">
                  Podrás solicitar otro código en <span className="font-semibold text-indigo-600">{resendCountdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendCode}
                  className={`inline-flex items-center gap-2 font-medium transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCodeExpired 
                      ? 'text-red-600 hover:text-red-800' 
                      : 'text-indigo-600 hover:text-indigo-800'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {isResending 
                      ? 'Reenviando...' 
                      : isCodeExpired 
                      ? 'Solicitar nuevo código' 
                      : '¿No recibiste el código? Reenviar'
                    }
                  </span>
                </button>
              )}
            </div>
          </form>

          {/* Helper text */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Si no recibes el código en unos minutos, revisa tu carpeta de spam
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Válido por 10 minutos
                </span>
                <span>•</span>
                <span>💡 Puedes pegar el código</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
