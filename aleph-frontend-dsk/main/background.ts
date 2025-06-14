import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import * as keytar from 'keytar';
import axios from 'axios'
import { openAuth0LoginWin, refreshToken, logoutAuth0 } from './auth/auth0';
// import { refreshAuth0Token } from '@/renderer/services/auth0Service';
import dotenv from 'dotenv';
import { loadEnv } from './utils/env';
const envLoaded = loadEnv();
console.log('Variables de entorno cargadas:', envLoaded);

// Carga adicional con dotenv como respaldo
dotenv.config({ path: path.join(__dirname, '../.env') });

// Verifica las variables críticas
console.log('Auth0 config disponible:', {
  domain: process.env.AUTH0_DOMAIN ? 'Sí' : 'No',
  clientId: process.env.AUTH0_CLIENT_ID ? 'Sí' : 'No'
});

dotenv.config({ path: path.join(__dirname, '../.env') });

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

// Función para inicializar Auth0
const setupAuth0 = () => {
  // Registra el protocolo custom para Auth0
  if (!app.isDefaultProtocolClient('aleph')) {
    const success = app.setAsDefaultProtocolClient('aleph');
    console.log('Setting Aleph as default protocol client:', success ? 'Success' : 'Failed');
  }

  // Para macOS, registra el manejador open-url
  app.on('will-finish-launching', () => {
    app.on('open-url', (event, url) => {
      event.preventDefault();
      console.log('Open URL event received:', url);
    });
  });
};

(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})();

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

// Añade esto a tu archivo background.ts
ipcMain.handle('get-auth0-config', () => {
  return {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    redirectUri: process.env.AUTH0_REDIRECT_URI || 'aleph://auth/callback'
  };
});

ipcMain.handle('store-auth-token', async (_, token: string) => {
  try {
    await keytar.setPassword('aleph-frontend-dsk', 'auth-token', token);
  } catch (error: any) {
    console.error('Error storing auth token:', error);
    throw new Error('Failed to store auth token');
  }
})

ipcMain.handle('get-auth-token', async () => {
  try {
    const token = await keytar.getPassword('aleph-frontend-dsk', 'auth-token');
    return token;
  } catch (error: any) {
    console.error('Error retrieving auth token:', error);
    throw new Error('Failed to retrieve auth token');
  }
})

ipcMain.handle('clear-auth-token', async () => {
  try {
    await keytar.deletePassword('aleph-frontend-dsk', 'auth-token');
  } catch (error: any) {
    console.error('Error clearing auth token:', error);
    throw new Error('Failed to clear auth token');
  }
})

ipcMain.handle('auth:login', async (_, email: string, password: string) => {
  try {
    const response = await axios.post('http://localhost:8080/api/v1/auth/login', { 
      email, 
      password 
    });
    if (response.data.token) {
      await keytar.setPassword('aleph-frontend-dsk', 'auth-token', response.data.token);
      return { success: true, user: response.data.user };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: error.response?.data?.error || 'Login failed' };
  }
});

//user registration
{/*ipcMain.handle('auth:register', async (_, data) => {
    console.log('=== REGISTER HANDLER START ===');
    console.log('Received data:', data);
    
    try {
        console.log('Making API call to: http://localhost:8080/api/v1/auth/register');
        const response = await axios.post('http://localhost:8080/api/v1/auth/register', data);
        console.log('Registration response:', response.data);
        
        
        if (response.data.token) {
            console.log('Token found in registration response, storing in keytar...');
            await keytar.setPassword('aleph-frontend-dsk', 'auth-token', response.data.token);
            console.log('Token stored successfully');
            return { 
                success: true, 
                message: response.data.message || 'User registered successfully',
                user: response.data.user,
                autoLogin: true 
            };
        } else {
            console.log('Registration successful, no token provided');
            return { 
                success: true, 
                message: response.data.message || 'User registered successfully',
                autoLogin: false 
            };
        }
    } catch (error: any) {
        console.log('=== ERROR CAUGHT ===');
        console.log('Error details:', error.message);
        console.log('Error response:', error.response?.data);
        console.log('Error status:', error.response?.status);
        
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred during registration';
        console.log('Returning error result:', { success: false, message: errorMessage });
        
        return {
            success: false,
            message: errorMessage
        };
    } finally {
        console.log('=== REGISTER HANDLER END ===');
    }
});

// Manejadores IPC para autenticación
ipcMain.handle('auth0-login', async () => {
  try {
    console.log('Auth0 login requested');
    return await openAuth0LoginWin();
  } catch (error: any) {
    console.error('Auth0 login error:', error);
    return { success: false, error: error.message || 'Failed to authenticate with Auth0' };
  }
});

ipcMain.handle('auth0-refresh-token', async (_, refreshTokenParam) => {
  try {
    return await refreshToken(refreshTokenParam);
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message || 'Failed to refresh token' };
  }
});

ipcMain.handle('auth0-logout', async () => {
  try {
    return await logoutAuth0();
  } catch (error: any) {
    console.error('Auth0 logout error:', error);
    return { success: false, error: error.message || 'Failed to logout properly' };
  }
});



ipcMain.handle('store-refresh-token', async (_, token: string) => {
  try {
    await keytar.setPassword('aleph-frontend-dsk', 'refresh-token', token);
  } catch (error: any) {
    console.error('Error storing refresh token:', error);
    throw new Error('Failed to store refresh token');
  }
});

ipcMain.handle('get-refresh-token', async () => {
  try {
    const token = await keytar.getPassword('aleph-frontend-dsk', 'refresh-token');
    return token;
  } catch (error: any) {
    console.error('Error retrieving refresh token:', error);
    throw new Error('Failed to retrieve refresh token');
  }
});

// Manejador para eliminar el refresh token
ipcMain.handle('clear-refresh-token', async () => {
  try {
    await keytar.deletePassword('aleph-frontend-dsk', 'refresh-token');
  } catch (error: any) {
    console.error('Error clearing refresh token:', error);
    throw new Error('Failed to clear refresh token');
  }
});*/}

ipcMain.handle('auth:register', async (_, data) => {
    console.log('=== REGISTER DSK HANDLER START ===');
    console.log('Received data:', data);
    
    try {
        console.log('Making API call to: http://localhost:8080/api/v1/auth/registerdsk');
        const response = await axios.post('http://localhost:8080/api/v1/auth/registerdsk', data);
        console.log('Registration response:', response.data);
        //No se espera al token para que el usuario active primero su cuenta
        if (response.data.user) {
            console.log('User created successfully, activation required');
            return { 
                success: true, 
                message: response.data.message || 'User registered successfully. Check your email for activation code.',
                user: response.data.user,
                code: response.data.code, 
                autoLogin: false 
            };
        } else {
            console.log('Unexpected response format');
            return { 
                success: false, 
                message: 'Unexpected response from server'
            };
        }
    } catch (error: any) {
        console.log('=== ERROR CAUGHT ===');
        console.log('Error details:', error.message);
        console.log('Error response:', error.response?.data);
        console.log('Error status:', error.response?.status);
        
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred during registration';
        console.log('Returning error result:', { success: false, message: errorMessage });
        
        return {
            success: false,
            message: errorMessage
        };
    } finally {
        console.log('=== REGISTER DSK HANDLER END ===');
    }
});

ipcMain.handle('auth:activate', async (_, { email, code }) => {
    console.log('=== ACTIVATE USER HANDLER START ===');
    console.log('Activating user:', { email, code: code ? 'PROVIDED' : 'MISSING' });
    
    try {
        console.log('Making API call to: http://localhost:8080/api/v1/auth/activateDsk');
        const response = await axios.post('http://localhost:8080/api/v1/auth/activateDsk', { email, code });
        console.log('Activation response:', response.data);
        
        if (response.data.user) {
            console.log('User activated successfully');
            
            //Si se recibe un token se almacena
            if (response.data.token) {
                console.log('Token received after activation, storing...');
                await keytar.setPassword('aleph-frontend-dsk', 'auth-token', response.data.token);
                console.log('Token stored successfully');
            }
            
            return { 
                success: true, 
                message: response.data.message || 'Account activated successfully',
                user: response.data.user,
                token: response.data.token || null
            };
        } else {
            return { 
                success: false, 
                message: 'Unexpected response from server'
            };
        }
    } catch (error: any) {
        console.log('=== ACTIVATION ERROR CAUGHT ===');
        console.log('Error details:', error.message);
        console.log('Error response:', error.response?.data);
        console.log('Error status:', error.response?.status);
        
        const errorMessage = error.response?.data?.error || error.message || 'Invalid or expired code';
        console.log('Returning error result:', { success: false, message: errorMessage });
        
        return {
            success: false,
            message: errorMessage
        };
    } finally {
        console.log('=== ACTIVATE USER HANDLER END ===');
    }
});