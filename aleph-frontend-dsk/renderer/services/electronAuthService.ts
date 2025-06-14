import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { 
    storeAccessToken, 
    storeRefreshToken, 
    getAccessToken, 
    clearAccessToken, 
    clearRefreshToken,
    isTokenValid,
    decodeToken
} from './tokenService';

const API_URL = "/api/v1/auth";


// Esto almacena el token de autenticación en el almacenamiento local de Electron
const storeAuthToken = async (token: string) => {
    return await window.ipc.invoke('store-auth-token', token);
}

// Esto obtiene el token de autenticación del almacenamiento local de Electron
const getAuthToken = async () => {
    return await window.ipc.invoke('get-auth-token');
}

// Limpieza del token

const clearAuthToken = async () => {
    return await window.ipc.invoke('clear-auth-token');
}

// Verificar el token

export const tokenIsValid = async (token: string | null) => {
    if (!token) {
        return false;
    }

    try {
        const decoded: any = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch (error: any){
        console.error('Error decoding token:', error);
        return false;
    }
}

// Verificar autenticación

export const checkAuth = async () => {
    try {
        const token = await getAccessToken();
        if (!token || !isTokenValid(token)) {
            return { authenticated: false };
        }
        const decoded: any = decodeToken(token);
        if (!decoded){
            return { authenticated: false };
        }
        return {
            authenticated: true,
            user: {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email
            }
        }
    } catch (error: any) {
        console.error('Error checking authentication:', error);
        await clearAccessToken();
        return { authenticated: false, message: 'An error occurred while checking authentication' };
    }
}

// Solicita el envío del código de recuperación
export async function requestResetCode(email: string) {
    try {
        const res = await axios.post(`${API_URL}/forgot-password`, { email });
        return { success: true, message: 'Reset code sent successfully' };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.error || 'An error occurred while requesting reset code'
        }
    } 
}

// Verifica el código recibido por correo
export async function verifyResetCode(email: string, code: string) {
    try {
        const res = await axios.post(`${API_URL}/verify-reset-code`, { email, code });
        return { success: true, message: 'Reset code verified successfully' };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.error || 'An error occurred while verifying reset code'
        }
    }
}

export async function resetPassword(email: string, code: string, newPassword: string) {
    try {
        const res = await axios.post(`${API_URL}/reset-password`, { email, code, newPassword });
        return { success: true, message: 'Password reset successfully' };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.error || 'An error occurred while resetting password'
        }
    }
}

// Login con email y password
export const login = async (email: string, password: string) => {
    try {
        const res = await window.ipc.invoke('auth:login', email, password);
        if (res.success !== false) {
            if (res.refreshToken) {
                await storeRefreshToken(res.refreshToken);
            }
            return { success: true, user: res.user };
        }
        return { success: false, message: res.message || 'Login failed' };
    } catch (error: any) {
        console.error('Login error:', error);
        return {
            success: false,
            message: error.response?.data || 'An error occurred during login'
        }
    }
}


// Registro de usuario
export const register = async (data: { name: string, email: string, password: string }) => {
    try {
        console.log('Calling IPC register with:', data); // Debug log
        const res = await window.ipc.invoke('auth:register', data);
        console.log('IPC register response:', res); // Debug log
        
        if (res.success) {
            return { success: true, message: res.message || 'User registered successfully' };
        }
        return { success: false, message: res.message || 'Registration failed' };
    } catch (error: any) {
        console.error('Register error:', error);
        return {
            success: false,
            message: 'An error occurred during registration'
        }
    }
}

export const activateUserDsk = async (email: string, code: string) => {
    try {
        console.log('Calling IPC activate with:', { email, code: code ? 'PROVIDED' : 'MISSING' }); // Debug log
        const res = await window.ipc.invoke('auth:activate', { email, code });
        console.log('IPC activate response:', res); // Debug log
        
        if (res.success) {
            return { success: true, message: res.message || 'Account activated successfully', user: res.user, token: res.token };
        }
        return { success: false, message: res.message || 'Activation failed' };
    } catch (error: any) {
        console.error('Activate error:', error);
        return {
            success: false,
            message: 'An error occurred during activation'
        }
    }
}


export const logout = async () => {
    await clearAccessToken();
    await clearRefreshToken();
    return { success: true, message: 'Logged out successfully' };
}

export function activateAccount(token: string) {
    try {
        const res = axios.post(`${API_URL}/activate`, { token });
        return {
            success: true,
            message: 'Account activated successfully'
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.error || 'An error occurred during account activation'
        }
    }
}
