import { jwtDecode } from 'jwt-decode';
import { JWT } from 'next-auth/jwt';
import { redirect } from 'next/dist/server/api-utils';
import { decodeToken } from '@/renderer/services/tokenService';
import { get } from 'http';

// Obtiene la configuración de Auth0 desde el proceso principal
const getAuth0Config = async () => {
  try {
    return await window.ipc.invoke('get-auth0-config');
  } catch (error) {
    console.error('Error obteniendo configuración Auth0:', error);
    return {
      domain: '',
      clientId: '',
      redirectUri: 'aleph://auth/callback'
    };
  }
};

// type Auth0JwtPayload = {
//     sub: string;
//     name?: string;
//     email?: string;
//     exp: number;
//     [key: string]: any;
// };
interface Auth0JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  [key: string]: any; 
}

async function checkOnlineStatus() {
    try {
        
        const response = await fetch('https://www.google.com', { 
            mode: 'no-cors',
            cache: 'no-cache',
            method: 'HEAD',
            // Timeout corto para no bloquear la interfaz
            signal: AbortSignal.timeout(3000)
        });
        return true;
    } catch (error) {
        console.error('Error checking online status:', error);
        return false;
    }
}

export const loginAuth0 = async () => {
    try {
        console.log('Starting Auth0 login process...');
        const auth0Config = await getAuth0Config();
        console.log('Auth0 Config:', auth0Config);

        // Añade este código al inicio de loginAuth0()
        const isOnline = await checkOnlineStatus();
        
        if (!isOnline) {
            console.error('No hay conexión a Internet disponible');
            return {
                success: false,
                error: 'No hay conexión a Internet. Por favor, verifica tu conexión e intenta nuevamente.'
            };
        }

        console.log('Initiating Auth0 login from renderer...');
        const res = await window.ipc.invoke('auth0-login');
        
        console.log('Auth0 login response:', res.success ? 'Success' : 'Failed');
        console.log('Response details:', res);
        
        if (res.success) {

            const accessToken = res.token || res.accessToken;
            const idToken = res.idToken;

            if (!accessToken) {
                console.error('No access token received from Auth0');
                return {
                    success: false,
                    error: 'No access token received from Auth0'
                }
            }

            console.log('Access Token:', accessToken);
            console.log('ID Token:', idToken);

            const tokenToStore = idToken || accessToken;
            // Almacena tokens en el proceso principal
            await window.ipc.invoke('store-auth-token', tokenToStore);
            if (res.refreshToken) {
                await window.ipc.invoke('store-refresh-token', res.refreshToken);
            }
            
            const decodedUser = decodeToken(tokenToStore);

            if(!decodedUser){
                return {
                    success: false,
                    error: 'Failed to decode Auth0 token'
                }
            }
            return {
                success: true,
                user: {
                    id: decodedUser.sub,
                    name: decodedUser.name || '',
                    email: decodedUser.email || '',
                }
            };
        }
        
        return { 
            success: false, 
            error: res.error || 'Login failed' 
        };
    } catch (error: any) {
        console.error('Error during Auth0 login:', error);
        return { 
            success: false, 
            error: error.message || 'An unexpected error occurred during authentication' 
        };
    }
}


export const refreshAuth0Token = async () => {
    try {
        console.log('Attempting to refresh Auth0 token...');
        const refreshToken = await window.ipc.invoke('get-refresh-token');
        
        if (!refreshToken) {
            return { success: false, error: 'No refresh token found' };
        }

        const res = await window.ipc.invoke('auth0-refresh-token', refreshToken);
        
        if (res.success) {
            await window.ipc.invoke('store-auth-token', res.accessToken);
            console.log('Auth0 token refreshed successfully');
            return { success: true };
        } else {
            console.error('Failed to refresh token:', res.error);
            return { success: false, error: res.error || 'Failed to refresh token' };
        }
    } catch (error: any) {
        console.error('Error refreshing Auth0 token:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to refresh token' 
        };
    }
}


export const logoutAuth0 = async () => {
    try {
        console.log('Logging out from Auth0...');
        const res = await window.ipc.invoke('auth0-logout');
        
        if (res.success) {
            await window.ipc.invoke('clear-auth-token');
            await window.ipc.invoke('clear-refresh-token');
            return { 
                success: true, 
                message: 'Logged out successfully' 
            };
        }
        
        return {
            success: false,
            error: res.error || 'Logout failed'
        };
    } catch (error: any) {
        console.error('Error during Auth0 logout:', error);
        return {
            success: false,
            error: error.message || 'An error occurred during logout'
        };
    }
}