import React, { createContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(true);
    const [loading, setLoading] = useState(false); // Initially false for now, can be true if checking storage
    const [token, setApiToken] = useState(null);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });
            const userData = response.data;
            setUser(userData);
            setIsGuest(false);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            let msg = 'Giriş başarısız';
            if (error.response) {
                msg = error.response.data || msg;
            }
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const enterGuestMode = () => {
        setIsGuest(true);
        setUser(null);
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            await api.post('/auth/register', userData);
            return { success: true };
        } catch (error) {
            let msg = 'Kayıt başarısız';
            if (error.response) {
                msg = error.response.data || msg;
            }
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setIsGuest(false);
        setAuthToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, isGuest, loading, login, enterGuestMode, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
