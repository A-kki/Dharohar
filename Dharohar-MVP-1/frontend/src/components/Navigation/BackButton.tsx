import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../features/auth/AuthContext';
import './BackButton.css';

export const BackButton = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleBack = () => {
        // Check if we can go back in history
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            // Redirect to appropriate dashboard based on role
            if (user?.roles.includes('review')) {
                navigate('/dashboard/review-queue');
            } else if (user?.roles.includes('admin')) {
                navigate('/dashboard/license-requests');
            } else if (user?.roles.includes('community')) {
                navigate('/dashboard');
            } else {
                navigate('/cultural-explorer');
            }
        }
    };

    return (
        <button className="back-navigation-btn" onClick={handleBack} aria-label="Go back">
            <FiArrowLeft />
            <span>Back</span>
        </button>
    );
};
