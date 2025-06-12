import axios from "axios";

// const API_URL = "http://localhost:4000/api/v1/auth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Solicita el envío del código de recuperación
export async function requestResetCode(email: string) {
    return axios.post(`${API_URL}/forgot-password`, { email });
}

// Verifica el código recibido por correo
export async function verifyResetCode(email: string, code: string) {
    return axios.post(`${API_URL}/verify-reset-code`, { email, code });
}

// Cambia la contraseña usando el código y el nuevo password
export async function resetPassword(email: string, code: string, newPassword: string) {
    return axios.post(`${API_URL}/reset-password`, { email, code, newPassword });
}

// Login con email y password (para NextAuth)
export function loginWithCredentials(email?: string, password?: string) {
    return axios.post(`${API_URL}/login`, { email, password });
}

// Registro de usuario
export function registerUser(data: { name: string, email: string, password: string }) {
    return axios.post(`${API_URL}/register`, data);
}

// Activación de cuenta
export function activateAccount(token: string) {
    return axios.post(`${API_URL}/activate`, { token });
}
