import axios from "axios";

const API_URL = "/api/v1/auth";
const FRONT_TOKEN = process.env.NEXT_PUBLIC_AUTH_FRONT_TOKEN;

// Helper para agregar el header
function withFrontToken(headers: any = {}) {
    return { ...headers, "x-auth-front-token": FRONT_TOKEN };
}

// Solicita el envío del código de recuperación
export async function requestResetCode(email: string) {
    return axios.post(`${API_URL}/forgot-password`, { email }, { headers: withFrontToken() });
}

// Verifica el código recibido por correo
export async function verifyResetCode(email: string, code: string) {
    return axios.post(`${API_URL}/verify-reset-code`, { email, code }, { headers: withFrontToken() });
}

// Cambia la contraseña usando el código y el nuevo password
export async function resetPassword(email: string, code: string, newPassword: string) {
    return axios.post(`${API_URL}/reset-password`, { email, code, newPassword }, { headers: withFrontToken() });
}

// Login con email y password (para NextAuth)
export function loginWithCredentials(email?: string, password?: string) {
    return axios.post(`${API_URL}/login`, { email, password }, { headers: withFrontToken() });
}

// Registro de usuario
export function registerUser(data: { name: string, email: string, password: string }) {
    return axios.post(`${API_URL}/register`, data, { headers: withFrontToken() });
}

// Activación de cuenta
export function activateAccount(token: string) {
    return axios.post(`${API_URL}/activate`, { token }, { headers: withFrontToken() });
}
