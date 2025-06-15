import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthCallbackPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Esta página se muestra brevemente después de la autenticación
    // La lógica principal ocurre en el proceso principal a través del handler de protocolo URL
    
    // Después de un breve delay, redireccionamos al home
    const timer = setTimeout(() => {
      router.push('/home');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="auth-callback-container">
      <h2>Completing Authentication</h2>
      <p>Please wait while we complete the authentication process...</p>
      
      <div className="loading-spinner"></div>
      
      <style jsx>{`
        .auth-callback-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          padding: 20px;
        }
        
        .loading-spinner {
          margin-top: 20px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallbackPage;