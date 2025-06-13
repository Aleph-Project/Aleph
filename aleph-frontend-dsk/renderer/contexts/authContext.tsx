import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuth, login, logout, register, activateAccount, requestResetCode, tokenIsValid, verifyResetCode, resetPassword} from '@/renderer/services/electronAuthService';

type User = {
    id: string;
    name: string;
    email: string;
}

type AuthContextType = {
    authenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>;
    logout: () => Promise<void>;
    register: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
    activateAccount: (token: string) => Promise<{ success: boolean; message?: string }>; 
    requestResetCode: (email: string) => Promise<{ success: boolean; message?: string }>;
    verifyResetCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
    tokenIsValid: (token: string | null) => Promise<boolean>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>  {
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const { authenticated, user } = await checkAuth();
                setAuthenticated(authenticated);
                if (authenticated && user) {
                    setUser(user);
                }
            } catch (error: any){
                console.error('Error checking authentication:', error);
            } finally {
                setLoading(false);
            }
        };
        verifyAuth();
    }, []);

    const handleLogin = async (email: string, password: string) => {
        const res =  await login(email, password);
        if (res.success && res.user) {
            setUser(res.user);
            setAuthenticated(true);
        }
        return res;
    };

    const handleLogout = async () => {
        await logout();
        setUser(null);
        setAuthenticated(false);
    };

    const handleRegister = async (data: { name: string; email: string; password: string }) => {
        return await register(data);
    };

    const handleActivateAccount = async (token: string) => {
        return await activateAccount(token);
    }

    const handleRequestResetCode = async (email: string) => {
        return await requestResetCode(email);
    };

    const handleVerifyResetCode = async (email: string, code: string) => {
        return await verifyResetCode(email, code);
    };

    const handleResetPassword = async (email: string, code: string, newPassword: string) => {
        return await resetPassword(email, code, newPassword);
    };

    const handleTokenIsValid = async (token: string | null) => {
        if (!token) return false;
        return await tokenIsValid(token);
    };

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                login: handleLogin,
                logout: handleLogout,
                register: handleRegister,
                activateAccount: handleActivateAccount,
                requestResetCode: handleRequestResetCode,
                verifyResetCode: handleVerifyResetCode,
                tokenIsValid: handleTokenIsValid,
                resetPassword: handleResetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
