import { createContext, useContext, useState, useEffect } from 'react';
import { createAuthAxios } from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        const stored = sessionStorage.getItem('auth');
        if (stored) {
            const { username, password } = JSON.parse(stored);
            return { username, password, authAxios: createAuthAxios(username, password) };
        }
        return null;
    });

    const login = (username, password) => {
        const authAxios = createAuthAxios(username, password);
        const authState = { username, password, authAxios };
        sessionStorage.setItem('auth', JSON.stringify({ username, password }));
        setAuth(authState);
    };

    const logout = () => {
        sessionStorage.removeItem('auth');
        setAuth(null);
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
