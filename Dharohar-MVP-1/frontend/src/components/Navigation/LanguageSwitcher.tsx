import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import './LanguageSwitcher.css';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
];

interface LanguageSwitcherProps {
    position?: 'up' | 'down';
    className?: string;
    variant?: 'light' | 'dark' | 'transparent';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    position = 'down',
    className = '',
    variant = 'transparent'
}) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const changeLanguage = (lngCode: string) => {
        i18n.changeLanguage(lngCode);
        localStorage.setItem('dharohar_lang', lngCode);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    return (
        <div className={`language-switcher-container ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className={`language-switcher-btn variant-${variant}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <FiGlobe className="language-switcher-icon" aria-hidden="true" />
                <span>{currentLang.label}</span>
                <span className="language-switcher-arrow">▼</span>
            </button>

            {isOpen && (
                <div
                    className={`language-dropdown pos-${position}`}
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="language-dropdown-list" role="none">
                        {LANGUAGES.map((lang) => {
                            const isActive = i18n.language === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`language-dropdown-item ${isActive ? 'active' : ''}`}
                                    role="menuitem"
                                >
                                    <span>{lang.label}</span>
                                    {isActive && <span className="language-check-icon">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;

