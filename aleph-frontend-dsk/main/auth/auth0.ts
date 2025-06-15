import { BrowserWindow, app, shell, ipcMain } from "electron";
import { AuthenticationClient, ManagementClient } from "auth0";
import { URL } from "url";
import crypto from "crypto";
import * as keytar from "keytar";
import path from "path";
import fs from "fs";
import * as dns from "dns";
import { promisify } from "util";
import { retry } from "auth0/dist/cjs/lib/retry";

const dnsLookup = promisify(dns.lookup);


const verifyDnsResolution = async (domain: string) => {
  try {
    console.log(`Verificando resolución DNS para ${domain}...`);

    // Configurar un timeout para la resolución DNS
    const options = {
      family: 4,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
      timeout: 5000,
    };

    // Intentar resolver con servidores DNS alternativos desde el inicio
    const dnsServers = [
      ["8.8.8.8", "8.8.4.4"], // Google DNS
      ["1.1.1.1", "1.0.0.1"], // Cloudflare DNS
      [], // Sistema por defecto
    ];

    for (const servers of dnsServers) {
      try {
        if (servers.length > 0) {
          console.log(`Intentando con servidores DNS: ${servers.join(", ")}`);
          dns.setServers(servers);
        } else {
          console.log("Intentando con servidores DNS del sistema");
        }

        const result = await Promise.race([
          dnsLookup(domain, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("DNS Timeout")), 5000)
          ),
        ]);

        console.log(`✅ DNS resuelto correctamente: ${domain} -> ${result}`);
        return true;
      } catch (err) {
        console.error(`Error con servidor DNS actual: ${err.message}`);
      }
    }

    throw new Error("No se pudo resolver el dominio con ningún servidor DNS");
  } catch (error) {
    console.error(`❌ Error de resolución DNS para ${domain}:`, error.message);
    return false;
  }
};

// if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
//   console.log("Variables Auth0 no encontradas, intentando cargar desde .env");
//   try {
//     const envPath = path.resolve(process.cwd(), ".env");
//     if (fs.existsSync(envPath)) {
//       const envContent = fs.readFileSync(envPath, "utf8");
//       const envLines = envContent.split("\n");

//       envLines.forEach((line) => {
//         const match = line.match(/^(AUTH0_[A-Z_]+)=(.+)$/);
//         if (match && match[1] && match[2]) {
//           process.env[match[1]] = match[2].trim();
//         }
//       });
//     }
//   } catch (error) {
//     new Error(
//       `Error al cargar variables desde .env: ${error.message}`
//     );
//   }
// }

let config = {
  domain: process.env.AUTH0_DOMAIN || "",
  clientId: process.env.AUTH0_CLIENT_ID || "",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
  redirectUri: process.env.AUTH0_REDIRECT_URI || "",
};

let auth0Client = new AuthenticationClient({
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

async function loadAuth0Config() {
  try {
    // En el proceso principal, debes usar ipcMain, no window.ipc
    if (!ipcMain) {
      console.error("Esta función debe ejecutarse en el proceso principal");
      return config;
    }

    const configFromEnv = {
      domain: process.env.AUTH0_DOMAIN,
      clientId:
        process.env.AUTH0_CLIENT_ID,
      redirectUri:
        process.env.AUTH0_REDIRECT_URI,
      clientSecret:
        process.env.AUTH0_CLIENT_SECRET,
    };

    // Actualizar la configuración
    config = configFromEnv;

    console.log("Auth0 Config en auth0.ts:", {
      domain: config.domain,
      clientId: config.clientId ? "[PRESENTE]" : "[AUSENTE]",
      redirectUri: config.redirectUri,
    });

    // Reinicializar el cliente Auth0 con la nueva configuración
    auth0Client = new AuthenticationClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    return config;
  } catch (error) {
    console.error("Error loading Auth0 configuration:", error);
    return config; // Devuelve la configuración actual como fallback
  }
}

// Método para abrir Auth0 en ventana de Electron
export async function openAuth0LoginWin() {
  const solvedConfig = await loadAuth0Config();
  if (!solvedConfig || !solvedConfig.domain || !solvedConfig.clientId) {
    console.error(
      "Auth0 configuration is incomplete. Please check your environment variables or .env file."
    );
    return Promise.reject(
      new Error(
        "Auth0 configuration is incomplete. Please check your environment variables or .env file."
      )
    );
  }

  return new Promise((resolve, reject) => {
    try {
      verifyDnsResolution(config.domain).then((canResolve) => {
        if (!canResolve) {
          console.error(
            `No se pudo resolver el dominio ${config.domain}. Verifica tu conexión a Internet o la configuración de DNS.`
          );
          dns.setServers(["8.8.8.8", "8.8.4.4"]);

          verifyDnsResolution(config.domain).then((retryResult) => {
            if (!retryResult) {
              return reject({
                success: false,
                error: `No se pudo resolver el dominio ${config.domain} después de intentar cambiar los servidores DNS.`,
              });
            }
          });
        }
      });

      console.log("Starting Auth0 authentication flow");
      console.log("Auth0 Domain:", config.domain);
      console.log(
        "Auth0 Client ID:",
        config.clientId ? "[CONFIGURED]" : "[MISSING]"
      );
      console.log("Auth0 Redirect URI:", config.redirectUri);

      // Genera estado para seguridad CSRF
      const state = generateState();

      // Registra el protocolo personalizado
      if (!app.isDefaultProtocolClient("aleph")) {
        const success = app.setAsDefaultProtocolClient("aleph");
        console.log(
          "Setting Aleph as default protocol client:",
          success ? "Success" : "Failed"
        );
      }

      // Crea una nueva ventana para autenticación
      const authWindow = new BrowserWindow({
        width: 800,
        height: 700,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
          devTools: true,
          allowRunningInsecureContent: false,
          webgl: true,
          plugins: true,
          webviewTag: true,
        },
      });

      authWindow.webContents.session.webRequest.onHeadersReceived(
        {
          urls: [
            "*://*.auth0.com/*",
            "*://dev-pbzynlz04jh56kar.us.auth0.com/*",
            "*://*.google.com/*",
            "*://accounts.google.com/*",
          ],
        },
        (details, callback) => {
          callback({
            responseHeaders: {
              ...details.responseHeaders,
              "Content-Security-Policy": [
                "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
                  "script-src * 'unsafe-inline' 'unsafe-eval'; " +
                  "connect-src * 'unsafe-inline'; " +
                  "img-src * data: blob: 'unsafe-inline'; " +
                  "frame-src * 'self' https://*.auth0.com https://*.google.com; " +
                  "style-src * 'unsafe-inline';",
              ],
            },
          });
        }
      );

      authWindow.webContents.on("did-start-loading", () => {
        console.log("Started loading Auth0 page");
      });

      authWindow.webContents.on("did-finish-load", () => {
        console.log("Finished loading Auth0 page");
      });

      authWindow.webContents.on(
        "did-fail-load",
        (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
          console.error(
            "Failed to load Auth0 page:",
            errorCode,
            errorDescription,
            validatedURL
          );
          if (isMainFrame) {
            if (errorCode === -3) {
              // Aborted - podría ser una redirección, no hacer nada
              console.log("Load aborted, likely due to redirect");
            } else {
              reject(
                new Error(
                  `Failed to load Auth0 page: ${errorDescription} (code: ${errorCode})`
                )
              );
              // authWindow.close();
            }
          }
        }
      );

      // Crea la URL de autorización
      const authUrl = new URL(`https://${config.domain}/authorize`);
      authUrl.searchParams.append("client_id", config.clientId);
      authUrl.searchParams.append("redirect_uri", config.redirectUri);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append(
        "scope",
        "openid profile email offline_access"
      );
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("connection", "google-oauth2");
      authUrl.searchParams.append("prompt", "select_account");

      // Log de la URL completa para diagnóstico
      console.log("Auth0 authorization URL:", authUrl.toString());

      // Función para procesar la respuesta de Auth0
      const handleAuthCallback = async (url: string) => {
        try {
          console.log("Auth0 callback received:", url);
          const urlObj = new URL(url);
          const returnedState = urlObj.searchParams.get("state");
          const code = urlObj.searchParams.get("code");
          const error = urlObj.searchParams.get("error");

          // Cierra la ventana de autenticación
          authWindow.destroy();

          if (error) {
            console.error("Auth0 error:", error);
            reject(new Error(`Auth0 error: ${error}`));
            return error;
          }

          if (returnedState !== state) {
            console.error("Invalid state parameter");
            reject(new Error("Invalid state returned from Auth0"));
            return;
          }

          if (!code) {
            console.error("No authorization code returned");
            reject(new Error("No authorization code returned"));
            return;
          }

          // Intercambio del código por tokens
          console.log("Exchanging authorization code for tokens");
          const response = await auth0Client.oauth.authorizationCodeGrant({
            code,
            redirect_uri: config.redirectUri,
          });

          const tokenData = response.data;

          // Almacena tokens de forma segura
          await keytar.setPassword(
            SERVICE_NAME,
            AUTH_TOKEN_KEY,
            tokenData.access_token
          );
          if (tokenData.refresh_token) {
            await keytar.setPassword(
              SERVICE_NAME,
              REFRESH_TOKEN_KEY,
              tokenData.refresh_token
            );
          }

          console.log("Auth0 authentication successful");
          resolve({
            success: true,
            token: tokenData.access_token,
            idToken: tokenData.id_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
          });
        } catch (error) {
          console.error("Error processing Auth0 callback:", error);
          reject({
            success: false,
            error: error || "Failed to process Auth0 authentication",
          });
        }
      };

      // Monitores para capturar redirecciones
      authWindow.webContents.on("will-redirect", (event, url) => {
        if (url.startsWith(config.redirectUri)) {
          event.preventDefault();
          handleAuthCallback(url);
        }
      });

      authWindow.webContents.on("will-navigate", (event, url) => {
        if (url.startsWith(config.redirectUri)) {
          event.preventDefault();
          handleAuthCallback(url);
        }
      });
      app.once("open-url", (event, url) => {
        console.log("Custom protocol handler triggered:", url);
        event.preventDefault();
        // Si la ventana aún existe, ciérrala
        if (!authWindow.isDestroyed()) {
          authWindow.destroy();
        }
        handleAuthCallback(url);
      });

      authWindow.on("closed", () => {
        if (!authWindow.isDestroyed()) {
          reject(
            new Error("Authentication window was closed before completion")
          );
        }
      });

      authWindow.loadURL(authUrl.toString()).catch((error) => {
        console.error("Failed to load Auth0 URL:", error);
        shell.openExternal(authUrl.toString());
        authWindow.close();
      });
      // authWindow.loadURL("https://www.google.com");
      authWindow.show();
    } catch (error) {
      console.error("Error initiating Auth0 login:", error);
      reject({
        success: false,
        error: error || "Failed to initiate Auth0 authentication",
      });
    }
  });
}

export async function refreshToken(refreshTokenParam?: string) {
  try {
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
    await keytar.deletePassword(SERVICE_NAME, AUTH_TOKEN_KEY);
    await keytar.deletePassword(SERVICE_NAME, REFRESH_TOKEN_KEY);

    const logoutUrl = new URL(`https://${config.domain}/v2/logout`);
    logoutUrl.searchParams.append("client_id", config.clientId);

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
