/**
 * Fetch with timeout utility
 * Cancels the request if it takes longer than the specified timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000 // Default 30 seconds
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Check if error was due to timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`La solicitud tardó más de ${timeoutMs / 1000} segundos. Por favor, verifica tu conexión e intenta nuevamente.`);
    }
    
    throw error;
  }
}

/**
 * Retry fetch with exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  timeoutMs: number = 30000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');
      
      // Don't retry on client errors (4xx)
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // If not the last attempt, wait before retrying
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
        console.log(`Reintentando en ${delay}ms... (intento ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Falló después de múltiples intentos');
}
