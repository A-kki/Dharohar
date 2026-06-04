import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { FiLogOut, FiHome, FiUploadCloud, FiList, FiCheckSquare, FiGlobe, FiFileText, FiClock, FiMenu, FiX } from 'react-icons/fi';
import { BackButton } from '../Navigation/BackButton';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../Navigation/LanguageSwitcher';
import './DashboardLayout.css';

interface LayoutProps {
    title: string;
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ title, children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleLinks = () => {
        if (!user) return [];
        const roles = user.roles;
        const links = [];

        links.push({ to: '/dashboard', label: t('nav.dashboard'), icon: <FiHome /> });

        const isGovernanceUser = roles.includes('community') || roles.includes('review') || roles.includes('admin');
        if (!isGovernanceUser) {
            links.push({ to: '/cultural-explorer', label: t('nav.publicExplorer'), icon: <FiGlobe /> });
            links.push({ to: '/dashboard/licenses/mine', label: t('nav.myApplications'), icon: <FiFileText /> });
        }

        if (roles.includes('community')) {
            links.push({ to: '/dashboard/assets/new', label: t('nav.uploadAsset'), icon: <FiUploadCloud /> });
            links.push({ to: '/dashboard/assets/mine', label: t('nav.mySubmissions'), icon: <FiList /> });
        }

        if (roles.includes('review')) {
            links.push({ to: '/dashboard/review-queue', label: t('nav.pendingReviews'), icon: <FiCheckSquare /> });
            links.push({ to: '/dashboard/review-history', label: t('nav.reviewHistory'), icon: <FiClock /> });
        }

        if (roles.includes('admin')) {
            links.push({ to: '/dashboard/license-requests', label: t('nav.licenseRequests'), icon: <FiCheckSquare /> });
            links.push({ to: '/dashboard/license-history', label: t('nav.licenseHistory'), icon: <FiClock /> });
        }

        return links;
    };

    const links = getRoleLinks();

    return (
        <div className="layout-container">
            {/* ── Mobile top bar ── */}
            <div className="mobile-topbar">
                <button
                    className="hamburger-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open navigation"
                >
                    <FiMenu />
                </button>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/logo.png" alt="Dharohar Logo" style={{ height: '32px' }} />
                    <span className="brand-logo" style={{ fontSize: '1.2rem', margin: 0 }}>DHAROHAR</span>
                </Link>
                <div style={{ width: 44 }} /> {/* spacer to center brand */}
            </div>

            {/* ── Overlay (mobile only) ── */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <nav className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
                <div className="brand-section">
                    <button
                        className="sidebar-close-btn"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation"
                    >
                        <FiX />
                    </button>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src="/logo.png" alt="Dharohar Logo" className="brand-logo-img" style={{ maxWidth: '100px', marginBottom: '10px' }} />
                        <h1 className="brand-logo">DHAROHAR</h1>
                        <p className="brand-subtitle">{t('nav.culturalPreservation', 'Cultural Preservation')}</p>
                    </Link>
                    <div className="decorative-divider-small"></div>
                </div>

                <ul className="nav-links">
                    {links.map((link) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                end={link.to === '/dashboard'}
                                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="sidebar-footer">
                    <div className="user-info w-full mb-3">
                        <LanguageSwitcher position="up" variant="light" className="w-full" />
                    </div>
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role">{user?.roles.join(', ')}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut />
                        <span>{t('nav.signOut', 'Sign Out')}</span>
                    </button>
                </div>
            </nav>

            <main className="content-area">
                <BackButton />
                <header className="page-header">
                    <h2>{title}</h2>
                    <div className="decorative-divider">
                        <span className="diamond"></span>
                    </div>
                </header>

                <section className="framed-section content-framed">
                    {children}
                </section>
            </main>
        </div>
    );
};
