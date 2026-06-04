import React from 'react';
import { useTranslation } from 'react-i18next';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUIRED';

interface StatusBadgeProps {
    status: Status;
    className?: string;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string }> = {
    PENDING: {
        label: 'Pending',
        color: '#92400e',
        bg: 'rgba(251, 191, 36, 0.12)',
        border: '#f59e0b',
    },
    APPROVED: {
        label: 'Approved',
        color: '#14532d',
        bg: 'rgba(34, 197, 94, 0.12)',
        border: '#22c55e',
    },
    REJECTED: {
        label: 'Rejected',
        color: '#7f1d1d',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: '#ef4444',
    },
    MODIFICATION_REQUIRED: {
        label: 'Modification Required',
        color: '#1e3a5f',
        bg: 'rgba(59, 130, 246, 0.12)',
        border: '#3b82f6',
    },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const { t } = useTranslation();
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['PENDING'];

    const translatedLabel = t(`status.${status.toLowerCase()}`, { defaultValue: config.label });

    return (
        <span
            className={`status-badge ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
                color: config.color,
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
                whiteSpace: 'nowrap',
            }}
        >
            <span
                style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: config.border,
                    flexShrink: 0,
                }}
            />
            {translatedLabel}
        </span>
    );
};
