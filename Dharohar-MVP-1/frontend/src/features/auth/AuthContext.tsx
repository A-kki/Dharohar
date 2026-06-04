import React, { createContext, useContext, useState, useEffect } from 'react';


export interface User {
    id: string;
    email: string;
    roles: ('community' | 'review' | 'admin' | 'general')[];
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved session
        const token = localStorage.getItem('dharohar_token');
        const savedUser = localStorage.getItem('dharohar_user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('dharohar_user');
                localStorage.removeItem('dharohar_token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('dharohar_token', token);
        localStorage.setItem('dharohar_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('dharohar_token');
        localStorage.removeItem('dharohar_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
