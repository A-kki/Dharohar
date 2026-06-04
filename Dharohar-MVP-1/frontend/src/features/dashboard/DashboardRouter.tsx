import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { useAuth } from '../auth/AuthContext';
import { UploadAsset } from '../assets/UploadAsset.tsx';
import { ReviewDashboard } from './ReviewDashboard';
import { ReviewHistory } from './ReviewHistory';
import { AdminDashboard } from './AdminDashboard';
import { LicenseHistory } from './LicenseHistory';
import { MySubmissions } from './MySubmissions';
import { MyLicenses } from './MyLicenses';
import { GeneralDashboard } from './GeneralDashboard';
import { ProtectedRoute } from '../../routes/ProtectedRoute';
import { useTranslation } from 'react-i18next';

const AnimatedCounter = ({ value, label }: { value: number, label: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const duration = 1000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="stat-card" style={{
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid var(--color-muted-gold)',
            borderRadius: 'var(--border-radius)',
            background: 'var(--color-bg-light)',
            flex: '1',
            minWidth: '200px',
            animation: 'fadeInUp var(--transition-base)'
        }}>
            <h4 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--color-terracotta)' }}>{count}</h4>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
        </div>
    );
};

const Overview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Redirect governance users to their primary view
    if (user?.roles.includes('community')) {
        return <Navigate to="/dashboard/assets/mine" replace />;
    }
    if (user?.roles.includes('general')) {
        return <Navigate to="/dashboard/home" replace />;
    }
    if (user?.roles.includes('review')) {
        return <Navigate to="/dashboard/review-queue" replace />;
    }
    if (user?.roles.includes('admin')) {
        return <Navigate to="/dashboard/license-requests" replace />;
    }

    return (
        <div style={{ animation: 'fadeIn var(--transition-slow)' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h3>{t('dashboard.overviewTitle', 'Institutional Overview')}</h3>
                <p style={{ color: 'var(--color-text-light)' }}>{t('dashboard.overviewDesc', 'Live governance metrics for the DHAROHAR ecosystem.')}</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
                <AnimatedCounter value={124} label={t('dashboard.totalSubmissions', 'Total Submissions')} />
                <AnimatedCounter value={12} label={t('dashboard.pendingReviews', 'Pending Reviews')} />
                <AnimatedCounter value={89} label={t('dashboard.approvedLicenses', 'Approved Licenses')} />
            </div>

            <div className="framed-section" style={{ padding: '2rem' }}>
                <h4>{t('dashboard.governanceNotice', 'Governance Notice')}</h4>
                <p>{t('dashboard.welcomeBack', 'Welcome back')}, <strong>{user?.roles[0]}</strong>. {t('dashboard.accountVerified', 'Your account is verified for the DHAROHAR governance framework. Please use the sidebar to access role-specific actions.')}</p>
            </div>

            {/* Licensing Guide Widget */}
            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(161,75,59,0.06) 0%, rgba(176,141,87,0.1) 100%)',
                border: '1px solid var(--color-muted-gold)',
                borderRadius: '6px',
                borderLeft: '4px solid var(--color-terracotta)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', color: 'var(--color-burnt-umber)' }}>
                            📜 {t('dashboard.understandingLicensing', 'Understanding Licensing')}
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {[
                                t('dashboard.licenseBenefit1', '4 license types: Research, Commercial, Media & Music'),
                                t('dashboard.licenseBenefit2', 'Fees range from ₹10,000 to ₹50,00,000'),
                                t('dashboard.licenseBenefit3', 'Communities receive 80% of all license fees and royalties'),
                                t('dashboard.licenseBenefit4', 'Approval takes 2–5 business days'),
                            ].map(item => (
                                <li key={item} style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ color: 'var(--color-terracotta)', fontWeight: 700 }}>•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button
                        className="minimal-btn"
                        onClick={() => navigate('/licensing-guide')}
                        style={{ whiteSpace: 'nowrap', alignSelf: 'flex-end' }}
                    >
                        {t('dashboard.viewFullGuide', 'View Full Guide →')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const DashboardRouter = () => {
    const { t } = useTranslation();
    return (
        <Routes>
            {/* The root dispatcher (resolves correct workspace based on role) */}
            <Route path="/" element={<DashboardLayout title={t('nav.dashboard', 'Overview')}><Overview /></DashboardLayout>} />

            {/* Community Role */}
            <Route element={<ProtectedRoute allowedRoles={['community']} />}>
                <Route path="/assets/new" element={<DashboardLayout title={t('nav.uploadAsset', 'Upload Asset')}><UploadAsset /></DashboardLayout>} />
                <Route path="/assets/mine" element={<MySubmissions />} />
            </Route>

            {/* Review Role */}
            <Route element={<ProtectedRoute allowedRoles={['review']} />}>
                <Route path="/review-queue" element={<DashboardLayout title={t('nav.reviewQueue', 'Review Queue')}><ReviewDashboard /></DashboardLayout>} />
                <Route path="/review-history" element={<ReviewHistory />} />
            </Route>

            {/* Admin Role */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/license-requests" element={<DashboardLayout title={t('nav.licenseRequests', 'License Requests')}><AdminDashboard /></DashboardLayout>} />
                <Route path="/license-history" element={<LicenseHistory />} />
            </Route>

            {/* General Role */}
            <Route element={<ProtectedRoute allowedRoles={['general']} />}>
                <Route path="/licenses/mine" element={<MyLicenses />} />
                <Route path="/home" element={<GeneralDashboard />} />
            </Route>
        </Routes>
    );
};
