import {jwtDecode} from 'jwt-decode';
import { Auth0JwtPayload } from '../types/jwt-type';

// Almacena un token de acceso
export const storeAccessToken = async (token: string) => {
    if (!token) {
        console.error('Attempted to store empty access token');
        return false;
    }
    try {
        return await window.ipc.invoke('store-auth-token', token);
    } catch (error) {
        console.error('Error storing access token:', error);
        return false;
    }
}

// Almacena un token de refresco
export const storeRefreshToken = async (token: string) => {
    if (!token) {
        console.error('Attempted to store empty refresh token');
        return false;
    }
    try {
        return await window.ipc.invoke('store-refresh-token', token);
    } catch (error) {
        console.error('Error storing refresh token:', error);
        return false;
    }
}

// Obtiene el token de acceso
export const getAccessToken = async () => {
    try {
        return await window.ipc.invoke('get-auth-token');
    } catch (error) {
        console.error('Error retrieving access token:', error);
        return null;
    }
}

// Obtiene el token de refresco
export const getRefreshToken = async () => {
    try {
        return await window.ipc.invoke('get-refresh-token');
    } catch (error) {
        console.error('Error retrieving refresh token:', error);
        return null;
    }
}

// Elimina el token de acceso
export const clearAccessToken = async () => {
    try {
        return await window.ipc.invoke('clear-auth-token');
    } catch (error) {
        console.error('Error clearing access token:', error);
        return false;
    }
}

// Elimina el token de refresco
export const clearRefreshToken = async () => {
    try {
        return await window.ipc.invoke('clear-refresh-token');
    } catch (error) {
        console.error('Error clearing refresh token:', error);
        return false;
    }
}

// Verifica si un token JWT es válido
export const isTokenValid = (token: string | null) => {
    if (!token) {
        return false;
    }

    try {
        // Verifica formato básico
        if (!token.includes('.') || token.split('.').length !== 3) {
            console.error('Token does not have valid JWT format');
            return false;
        }
        
        const decoded: any = jwtDecode<Auth0JwtPayload>(token);
        
        // Verifica que exista exp y sub
        if (!decoded || !decoded.exp) {
            console.error('Token missing required claims');
            return false;
        }
        
        // Verifica que no esté expirado
        return decoded.exp * 1000 > Date.now();
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

// Función para decodificar un token de manera segura
export const decodeToken = (token: string): Auth0JwtPayload | null => {
    try {
        return jwtDecode<Auth0JwtPayload>(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}