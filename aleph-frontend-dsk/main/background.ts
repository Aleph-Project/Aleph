import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import * as keytar from 'keytar';
import axios from 'axios'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
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
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

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