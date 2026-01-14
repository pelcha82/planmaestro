import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Check, X, AlertCircle, WifiOff } from "lucide-react";
import { fetchWithTimeout } from "@/react-app/utils/fetchWithTimeout";

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isTimeout, setIsTimeout] = useState(false);
  const navigate = useNavigate();
  
  // Email validation state
  const [emailInput, setEmailInput] = useState("");
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    message: string;
    touched: boolean;
  }>({
    isValid: false,
    message: "",
    touched: false
  });

  // Check if user is already logged in
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      // User is already logged in, redirect to dashboard
      navigate('/');
    }
  }, [navigate]);

  // Email validation function
  const validateEmail = (email: string): { isValid: boolean; message: string } => {
    // Empty email
    if (!email.trim()) {
      return { isValid: false, message: "" };
    }

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "El formato del correo no es válido" };
    }

    // Check for common typos in domain
    const commonDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Check for typos like "gmial.com" or "gmai.com"
    if (domain) {
      const similarDomain = commonDomains.find(d => {
        const distance = levenshteinDistance(domain, d);
        return distance === 1 || distance === 2;
      });
      
      if (similarDomain && domain !== similarDomain) {
        return { 
          isValid: false, 
          message: `¿Quisiste decir @${similarDomain}?` 
        };
      }
    }

    // Check for missing TLD
    if (domain && !domain.includes('.')) {
      return { isValid: false, message: "El correo debe incluir un dominio válido (ej: @gmail.com)" };
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      return { isValid: false, message: "El correo no puede tener puntos consecutivos" };
    }

    // Check for spaces
    if (email.includes(' ')) {
      return { isValid: false, message: "El correo no puede contener espacios" };
    }

    // All checks passed
    return { isValid: true, message: "Correo válido" };
  };

  // Simple Levenshtein distance for typo detection
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Validate email on input change with debouncing
  useEffect(() => {
    // Don't validate if field is untouched or empty
    if (!emailValidation.touched || !emailInput.trim()) {
      return;
    }

    // Debounce validation
    const timeoutId = setTimeout(() => {
      const validation = validateEmail(emailInput);
      setEmailValidation(prev => ({
        ...prev,
        isValid: validation.isValid,
        message: validation.message
      }));
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [emailInput, emailValidation.touched]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInput(value);
    
    // Mark as touched on first interaction
    if (!emailValidation.touched && value.length > 0) {
      setEmailValidation(prev => ({ ...prev, touched: true }));
    }
  };

  const attemptLogin = async (email: string, code: string) => {
    const data = {
      correo: email,
      code: code
    };

    try {
      console.log('📤 [LOGIN] Enviando credenciales con timeout de 30s');
      
      const response = await fetchWithTimeout(
        '/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        30000 // 30 second timeout
      );

      const result = await response.json();

      if (!response.ok) {
        // If code is invalid, clear localStorage
        if (response.status === 401) {
          localStorage.removeItem('verificationCode');
          localStorage.removeItem('userEmail');
          throw new Error('Tu código de verificación ha expirado o es inválido. Por favor, solicita uno nuevo.');
        }
        throw new Error(result.error || 'Error al iniciar sesión. Por favor, intenta nuevamente.');
      }

      console.log('✅ [LOGIN] Inicio de sesión exitoso');

      // Store email in localStorage
      if (result.correo) {
        localStorage.setItem('userEmail', result.correo);
      }

      return result;
    } catch (err) {
      console.error('❌ [LOGIN] Error:', err);
      
      // Check if it's a timeout error
      if (err instanceof Error && err.message.includes('tardó más de')) {
        setIsTimeout(true);
      }
      
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Final validation before submit
    const validation = validateEmail(emailInput);
    
    if (!validation.isValid) {
      setEmailValidation({
        isValid: false,
        message: validation.message || "Por favor ingresa un correo válido",
        touched: true
      });
      return;
    }

    setIsSubmitting(true);
    setError("");
    setIsTimeout(false);

    const correo = emailInput.trim().toLowerCase();
    
    // Get verification code from localStorage
    const verificationCode = localStorage.getItem('verificationCode');
    
    // If no code in localStorage, user needs to verify email first
    if (!verificationCode) {
      setError('No tienes un código de verificación guardado. Por favor, solicita un nuevo código.');
      setIsSubmitting(false);
      // Redirect to registration/verification flow after 2 seconds
      setTimeout(() => {
        navigate('/registro');
      }, 2000);
      return;
    }

    try {
      await attemptLogin(correo, verificationCode);
      
      // Redirect to dashboard after successful login
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (!emailInput.trim()) return;
    
    const verificationCode = localStorage.getItem('verificationCode');
    if (!verificationCode) {
      setError('No tienes un código de verificación guardado.');
      return;
    }

    setIsSubmitting(true);
    setError("");
    setIsTimeout(false);

    const correo = emailInput.trim().toLowerCase();

    try {
      await attemptLogin(correo, verificationCode);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine input styling based on validation state
  const getInputClassName = () => {
    let baseClass = "block w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    if (!emailValidation.touched || !emailInput.trim()) {
      return `${baseClass} border-slate-300 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`;
    }
    
    if (emailValidation.isValid) {
      return `${baseClass} border-green-500 bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-transparent`;
    }
    
    return `${baseClass} border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 backdrop-blur-sm"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-slate-800 tracking-tight">
            Inicio de sesión
          </h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <div className="flex items-start gap-2 mb-3">
                {isTimeout ? (
                  <WifiOff className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span>{error}</span>
              </div>
              
              {isTimeout && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isSubmitting}
                  className="w-full mt-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Reintentando...' : 'Reintentar'}
                </button>
              )}
            </div>
          )}
          
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col">
              <label 
                htmlFor="correo" 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 tracking-wide"
              >
                CORREO ELECTRÓNICO
              </label>
              
              <div className="relative">
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  required
                  disabled={isSubmitting}
                  value={emailInput}
                  onChange={handleEmailChange}
                  className={getInputClassName()}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  autoFocus
                />
                
                {/* Validation icon */}
                {emailValidation.touched && emailInput.trim() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailValidation.isValid ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Validation message */}
              {emailValidation.touched && emailInput.trim() && emailValidation.message && (
                <div className={`mt-2 flex items-start gap-2 text-sm ${
                  emailValidation.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {!emailValidation.isValid && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <span>{emailValidation.message}</span>
                </div>
              )}
              
              {/* Helper text */}
              {!emailValidation.touched && (
                <p className="mt-2 text-xs sm:text-sm text-slate-500">
                  Ingresa el correo con el que te registraste
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (emailValidation.touched && !emailValidation.isValid)}
              className="w-full mt-6 sm:mt-8 px-6 py-3 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            <div className="mt-4 text-center space-y-2">
              <Link 
                to="/registro"
                className="block text-sm sm:text-base text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                ¿No tienes cuenta? Regístrate
              </Link>
              <Link 
                to="/"
                className="block text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200 text-xs sm:text-sm"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
