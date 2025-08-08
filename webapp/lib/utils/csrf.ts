/**
 * ⚠️ CSRF-Schutz für VYSN Hub Webapp
 * 
 * Client-seitige CSRF-Token-Verwaltung
 */

import { useState, useEffect } from 'react';

// CSRF-Token-Cache
let csrfToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Holt einen neuen CSRF-Token vom Server
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'same-origin', // Cookies mitsenden
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('CSRF-Token konnte nicht abgerufen werden');
    }

    const data = await response.json();
    
    if (!data.success || !data.csrfToken) {
      throw new Error('Ungültiger CSRF-Token vom Server');
    }

    // Token cachen
    csrfToken = data.csrfToken;
    tokenExpiry = Date.now() + (data.expiresIn * 1000);

    return data.csrfToken;
  } catch (error) {
    console.error('CSRF-Token Fehler:', error);
    throw error;
  }
}

/**
 * Gibt den aktuellen CSRF-Token zurück oder holt einen neuen
 */
export async function getCsrfToken(): Promise<string> {
  // Token noch gültig?
  if (csrfToken && tokenExpiry && Date.now() < tokenExpiry - 60000) { // 1 Minute Puffer
    return csrfToken;
  }

  // Neuen Token holen
  return await fetchCsrfToken();
}

/**
 * Fügt CSRF-Token zu fetch-Requests hinzu
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getCsrfToken();

  const csrfHeaders = {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const csrfOptions: RequestInit = {
    ...options,
    credentials: 'same-origin',
    headers: csrfHeaders
  };

  // Für POST/PUT/PATCH auch im Body hinzufügen (falls benötigt)
  if (['POST', 'PUT', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')) {
    if (options.body && typeof options.body === 'string') {
      try {
        const bodyData = JSON.parse(options.body);
        bodyData._csrf = token;
        csrfOptions.body = JSON.stringify(bodyData);
      } catch (e) {
        // Body ist kein JSON, Token nur in Header
      }
    } else if (options.body instanceof FormData) {
      (options.body as FormData).append('_csrf', token);
    }
  }

  const response = await fetch(url, csrfOptions);

  // Bei 403 CSRF-Fehler: Token erneuern und retry
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    
    if (errorData.error?.includes('CSRF')) {
      console.warn('CSRF-Token abgelaufen, erneuere Token...');
      
      // Token invalidieren und neuen holen
      csrfToken = null;
      tokenExpiry = null;
      
      const newToken = await getCsrfToken();
      csrfHeaders['X-CSRF-Token'] = newToken;
      
      // Request mit neuem Token wiederholen
      return fetch(url, { ...csrfOptions, headers: csrfHeaders });
    }
  }

  return response;
}

/**
 * CSRF-geschützter API-Call Helper
 */
export class CsrfApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await csrfFetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * React Hook für CSRF-Token
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newToken = await fetchCsrfToken();
      setToken(newToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSRF-Token-Fehler');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  return { token, loading, error, refreshToken };
}

/**
 * Form-Helper: Fügt CSRF-Token zu Formularen hinzu
 */
export function addCsrfToForm(form: HTMLFormElement): void {
  getCsrfToken().then(token => {
    // Entferne vorhandenes CSRF-Input
    const existingInput = form.querySelector('input[name="_csrf"]');
    if (existingInput) {
      existingInput.remove();
    }

    // Füge neues CSRF-Input hinzu
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_csrf';
    csrfInput.value = token;
    form.appendChild(csrfInput);
  }).catch(error => {
    console.error('CSRF-Token für Form konnte nicht hinzugefügt werden:', error);
  });
}

/**
 * Meta-Tag Helper für Server-Side Rendering
 */
export function getMetaCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
}

// Auto-Setup für alle Formulare auf der Seite
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-csrf="true"]');
    forms.forEach(form => {
      if (form instanceof HTMLFormElement) {
        addCsrfToForm(form);
      }
    });
  });
}

export default {
  getCsrfToken,
  csrfFetch,
  CsrfApiClient,
  addCsrfToForm
};