import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export const GlobalHomeButton: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    // Do not show on the actual home page or cultural explorer
    if (location.pathname === '/' || location.pathname === '/cultural-explorer') {
        return null;
    }

    return (
        <button
            onClick={() => navigate('/')}
            title={t('common.goHome', 'Go to Home')}
            style={{
                position: 'fixed',
                top: '2rem',
                left: '2rem',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-parchment)',
                border: '1.5px solid var(--color-muted-gold)',
                color: 'var(--color-terracotta)',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
        >
            <FiHome size={20} />
        </button>
    );
};
