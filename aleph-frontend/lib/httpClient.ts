import { getSession } from "next-auth/react";

// Cliente HTTP autenticado que automáticamente incluye el token JWT
export class AuthenticatedHttpClient {
  private baseURL: string;

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Agregar token si existe en la sesión
    if (session?.user && 'backendToken' in session.user) {
      const token = (session.user as any).backendToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get(url: string, options?: RequestInit): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(this.baseURL + url, {
      method: 'GET',
      headers: {
        ...headers,
        ...options?.headers,
      },
      ...options,
    });
  }

  async post(url: string, body?: any, options?: RequestInit): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(this.baseURL + url, {
      method: 'POST',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async put(url: string, body?: any, options?: RequestInit): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(this.baseURL + url, {
      method: 'PUT',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async delete(url: string, options?: RequestInit): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(this.baseURL + url, {
      method: 'DELETE',
      headers: {
        ...headers,
        ...options?.headers,
      },
      ...options,
    });
  }

  async patch(url: string, body?: any, options?: RequestInit): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(this.baseURL + url, {
      method: 'PATCH',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  // Método especial para FormData (sin Content-Type automático)
  async postFormData(url: string, formData: FormData, options?: RequestInit): Promise<Response> {
    const session = await getSession();
    const headers: HeadersInit = {};

    // Agregar token si existe en la sesión (sin Content-Type para FormData)
    if (session?.user && 'backendToken' in session.user) {
      const token = (session.user as any).backendToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return fetch(this.baseURL + url, {
      method: 'POST',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: formData,
      ...options,
    });
  }

  async patchFormData(url: string, formData: FormData, options?: RequestInit): Promise<Response> {
    const session = await getSession();
    const headers: HeadersInit = {};

    // Agregar token si existe en la sesión (sin Content-Type para FormData)
    if (session?.user && 'backendToken' in session.user) {
      const token = (session.user as any).backendToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return fetch(this.baseURL + url, {
      method: 'PATCH',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: formData,
      ...options,
    });
  }
}

// Instancia singleton del cliente autenticado
export const authHttpClient = new AuthenticatedHttpClient(); 