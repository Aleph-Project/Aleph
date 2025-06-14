import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

export function loadEnv() {
  // En desarrollo, carga desde .env en la raíz del proyecto
  if (process.env.NODE_ENV !== 'production') {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath));
      for (const key in envConfig) {
        process.env[key] = envConfig[key];
      }
      console.log('Variables de entorno cargadas desde archivo .env');
      console.log('Variables de entorno cargadas:', {
        domain: process.env.AUTH0_DOMAIN ? '[DISPONIBLE]' : '[NO DISPONIBLE]',
        clientId: process.env.AUTH0_CLIENT_ID ? '[DISPONIBLE]' : '[NO DISPONIBLE]'
      });
    } else {
      console.warn('Archivo .env no encontrado en desarrollo');
    }
    return;
  }
  
  // En producción, carga desde los recursos empaquetados
  try {
    const envPath = path.join(process.resourcesPath || '', '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath));
      for (const key in envConfig) {
        process.env[key] = envConfig[key];
      }
      console.log('Variables de entorno cargadas desde recursos en producción');
    } else {
      console.warn('Archivo .env no encontrado en producción');
    }
  } catch (error) {
    console.error('Error al cargar variables de entorno:', error);
  }
}