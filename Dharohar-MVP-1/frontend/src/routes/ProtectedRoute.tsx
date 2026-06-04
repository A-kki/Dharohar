import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: ('community' | 'review' | 'admin' | 'general')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading-spinner">Loading Dharohar...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasAccess = allowedRoles.some(role => user.roles.includes(role));
        if (!hasAccess) {
            return <Navigate to="/dashboard" replace />; // Bounces to dispatcher which resolves correct role view
        }
    }

    return <Outlet />;
};
