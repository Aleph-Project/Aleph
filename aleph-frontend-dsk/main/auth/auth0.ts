import { BrowserWindow, app, shell } from "electron";
import { AuthenticationClient, ManagementClient } from "auth0";
import { URL } from "url";
import crypto from "crypto";
import * as keytar from "keytar";
import path from "path";
import fs from "fs";

// Intenta cargar variables directamente si no están disponibles
if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
  console.log('Variables Auth0 no encontradas, intentando cargar desde .env');
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      envLines.forEach(line => {
        const match = line.match(/^(AUTH0_[A-Z_]+)=(.+)$/);
        if (match && match[1] && match[2]) {
          process.env[match[1]] = match[2].trim();
        }
      });
    }
  } catch (error) {
    console.error('Error al cargar variables de entorno en auth0.ts:', error);
  }
}

const config = {
  domain: process.env.AUTH0_DOMAIN || "",
  clientId: process.env.AUTH0_CLIENT_ID || "",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
  redirectUri: "aleph://auth/callback",
};

console.log('Auth0 Config en auth0.ts:', {
  domain: config.domain,
  clientId: config.clientId ? '[PRESENTE]' : '[AUSENTE]',
  redirectUri: config.redirectUri
});

const auth0Client = new AuthenticationClient({
  domain: config.domain,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
});

const SERVICE_NAME = "aleph-frontend-dsk";
const AUTH_TOKEN_KEY = "auth-token";
const REFRESH_TOKEN_KEY = "refresh-token";

function generateState() {
  return crypto.randomBytes(32).toString("hex");
}

// Método para abrir Auth0 en ventana de Electron
export async function openAuth0LoginWin(){
    return new Promise((resolve, reject) => {
        try {
            console.log('Starting Auth0 authentication flow');
            console.log('Auth0 Domain:', config.domain);
            console.log('Auth0 Client ID:', config.clientId ? '[CONFIGURED]' : '[MISSING]');
            console.log('Auth0 Redirect URI:', config.redirectUri);
            
            // Genera estado para seguridad CSRF
            const state = generateState();
            
            // Registra el protocolo personalizado
            if (!app.isDefaultProtocolClient('aleph')) {
                const success = app.setAsDefaultProtocolClient('aleph');
                console.log('Setting Aleph as default protocol client:', success ? 'Success' : 'Failed');
            }
            
            // Crea una nueva ventana para autenticación
            const authWindow = new BrowserWindow({
                width: 800,
                height: 700,
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });
            
            // Crea la URL de autorización
            const authUrl = new URL(`https://${config.domain}/authorize`);
            authUrl.searchParams.append('client_id', config.clientId);
            authUrl.searchParams.append('redirect_uri', config.redirectUri);
            authUrl.searchParams.append('response_type', 'code');
            authUrl.searchParams.append('scope', 'openid profile email offline_access');
            authUrl.searchParams.append('state', state);
            authUrl.searchParams.append('connection', 'google-oauth2');
            authUrl.searchParams.append('prompt', 'select_account');
            
            // Log de la URL completa para diagnóstico
            console.log('Auth0 authorization URL:', authUrl.toString());
            
            // Función para procesar la respuesta de Auth0
            const handleAuthCallback = async (url) => {
                try {
                    console.log('Auth0 callback received:', url);
                    const urlObj = new URL(url);
                    const returnedState = urlObj.searchParams.get('state');
                    const code = urlObj.searchParams.get('code');
                    const error = urlObj.searchParams.get('error');
                    
                    // Cierra la ventana de autenticación
                    authWindow.destroy();
                    
                    if (error) {
                        console.error('Auth0 error:', error);
                        reject(new Error(`Auth0 error: ${error}`));
                        return;
                    }
                    
                    if (returnedState !== state) {
                        console.error('Invalid state parameter');
                        reject(new Error('Invalid state returned from Auth0'));
                        return;
                    }
                    
                    if (!code) {
                        console.error('No authorization code returned');
                        reject(new Error('No authorization code returned'));
                        return;
                    }
                    
                    // Intercambio del código por tokens
                    console.log('Exchanging authorization code for tokens');
                    const response = await auth0Client.oauth.authorizationCodeGrant({
                        code,
                        redirect_uri: config.redirectUri,
                    });
                    
                    const tokenData = response.data;
                    
                    // Almacena tokens de forma segura
                    await keytar.setPassword(SERVICE_NAME, AUTH_TOKEN_KEY, tokenData.access_token);
                    if (tokenData.refresh_token) {
                        await keytar.setPassword(SERVICE_NAME, REFRESH_TOKEN_KEY, tokenData.refresh_token);
                    }
                    
                    console.log('Auth0 authentication successful');
                    resolve({
                        success: true,
                        token: tokenData.access_token,
                        idToken: tokenData.id_token,
                        refreshToken: tokenData.refresh_token,
                        expiresIn: tokenData.expires_in
                    });
                    
                } catch (error) {
                    console.error('Error processing Auth0 callback:', error);
                    reject({
                        success: false,
                        error: error.message || 'Failed to process Auth0 authentication'
                    });
                }
            };
            
            // Monitores para capturar redirecciones
            authWindow.webContents.on('will-redirect', (event, url) => {
                if (url.startsWith(config.redirectUri)) {
                    event.preventDefault();
                    handleAuthCallback(url);
                }
            });
            
            authWindow.webContents.on('will-navigate', (event, url) => {
                if (url.startsWith(config.redirectUri)) {
                    event.preventDefault();
                    handleAuthCallback(url);
                }
            });
            
            // También monitorea el protocolo personalizado para casos de redirección externa
            app.once('open-url', (event, url) => {
                console.log('Custom protocol handler triggered:', url);
                event.preventDefault();
                // Si la ventana aún existe, ciérrala
                if (!authWindow.isDestroyed()) {
                    authWindow.destroy();
                }
                handleAuthCallback(url);
            });
            
            // Manejo del cierre de la ventana
            authWindow.on('closed', () => {
                // Si la ventana se cierra manualmente antes de completar la autenticación
                if (!authWindow.isDestroyed()) {
                    reject(new Error('Authentication window was closed before completion'));
                }
            });
            
            // Carga y muestra la ventana
            authWindow.loadURL(authUrl.toString());
            authWindow.show();
            
        } catch (error) {
            console.error('Error initiating Auth0 login:', error);
            reject({
                success: false,
                error: error.message || 'Failed to initiate Auth0 authentication'
            });
        }
    });
}

export async function refreshToken(refreshTokenParam?: string) {
  try {
    // Usa el token proporcionado o intenta obtenerlo de keytar
    const refreshToken =
      refreshTokenParam ||
      (await keytar.getPassword(SERVICE_NAME, REFRESH_TOKEN_KEY));

    if (!refreshToken) {
      return { success: false, error: "No refresh token found" };
    }

    const res = await auth0Client.oauth.refreshTokenGrant({
      refresh_token: refreshToken,
      client_id: config.clientId,
    });

    const tokenData = res.data;

    await keytar.setPassword(
      SERVICE_NAME,
      AUTH_TOKEN_KEY,
      tokenData.access_token
    );

    return {
      success: true,
      accessToken: tokenData.access_token,
      idToken: tokenData.id_token,
      expiresIn: tokenData.expires_in,
    };
  } catch (error: any) {
    console.error("Error refreshing Auth0 token:", error);
    return {
      success: false,
      error: error.message || "Failed to refresh token",
    };
  }
}

export async function logoutAuth0() {
  try {
    // Eliminar tokens almacenados
    await keytar.deletePassword(SERVICE_NAME, AUTH_TOKEN_KEY);
    await keytar.deletePassword(SERVICE_NAME, REFRESH_TOKEN_KEY);

    const logoutUrl = new URL(`https://${config.domain}/v2/logout`);
    logoutUrl.searchParams.append("client_id", config.clientId);

    // Abrir URL de cierre de sesión en el navegador
    shell.openExternal(logoutUrl.toString());

    return { success: true };
  } catch (error: any) {
    console.error("Error during Auth0 logout:", error);
    return {
      success: false,
      error: error.message || "Failed to logout properly",
    };
  }
}
