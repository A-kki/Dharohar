import './SkeletonLoader.css';

export const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-header">
                <div className="skeleton-title"></div>
                <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-subtitle"></div>
            <div className="skeleton-body">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
            </div>
            <div className="skeleton-footer">
                <div className="skeleton-button"></div>
            </div>
        </div>
    );
};
