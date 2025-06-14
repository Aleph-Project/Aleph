import { jwtDecode } from 'jwt-decode';
import { JWT } from 'next-auth/jwt';
import { redirect } from 'next/dist/server/api-utils';

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

type Auth0JwtPayload = {
    sub: string;
    name?: string;
    email?: string;
    exp: number;
    [key: string]: any;
};

export const loginAuth0 = async () => {
    try {
        console.log('Initiating Auth0 login from renderer...');
        const res = await window.ipc.invoke('auth0-login');
        
        console.log('Auth0 login response:', res.success ? 'Success' : 'Failed');
        
        if (res.success) {
            // Almacena tokens en el proceso principal
            await window.ipc.invoke('store-auth-token', res.token || res.accessToken);
            if (res.refreshToken) {
                await window.ipc.invoke('store-refresh-token', res.refreshToken);
            }
            
            // Decodifica el token para obtener información del usuario
            const token = res.idToken || res.token || res.accessToken;
            const decodedUser = jwtDecode<Auth0JwtPayload>(token);

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