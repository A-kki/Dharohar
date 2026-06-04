import { useParams, useNavigate } from 'react-router-dom';
import { mockCommunities } from '../../data/mockData';
import { CommunityDossier } from './CommunityDossier';
import { BackButton } from '../../components/Navigation/BackButton';
import './CommunityDetail.css';

export const CommunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const community = mockCommunities.find(c => c.id === id);

    if (!community) {
        return (
            <div className="framed-section" style={{ margin: '10vh auto', maxWidth: 600, textAlign: 'center' }}>
                <h2>Community Archive Not Found</h2>
                <button className="minimal-btn" onClick={() => navigate('/cultural-explorer')}>Return to Explorer</button>
            </div>
        );
    }

    return (
        <div className="community-detail-page">
            <div style={{ padding: '1rem 2rem', backgroundColor: 'var(--color-parchment)' }}>
                <BackButton />
            </div>
            <CommunityDossier community={community} />
        </div>
    );
};
