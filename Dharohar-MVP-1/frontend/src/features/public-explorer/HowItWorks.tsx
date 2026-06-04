import { useTranslation } from 'react-i18next';
import communitySubmitImg from '../../assets/knowledge-capture.png';
import aiProcessingImg from '../../assets/ai-processing.png';
import reviewBoardImg from '../../assets/review-board-validation.png';
import archivePublicationImg from '../../assets/archive-publication.png';
import marketplaceImg from '../../assets/marketplace.png';
import './HowItWorks.css';

const steps = [
    {
        id: 1,
        titleKey: 'howItWorks.step1.title',
        defaultTitle: 'Community Submission',
        descKey: 'howItWorks.step1.desc',
        defaultDesc: 'Tribal communities upload bio-heritage knowledge or sonic heritage recordings along with metadata such as location, cultural context, and contributor details.',
        image: communitySubmitImg
    },
    {
        id: 2,
        titleKey: 'howItWorks.step2.title',
        defaultTitle: 'AI Documentation & Processing',
        descKey: 'howItWorks.step2.desc',
        defaultDesc: 'The platform transcribes voice recordings, extracts metadata, and generates structured cultural documentation.',
        image: aiProcessingImg
    },
    {
        id: 3,
        titleKey: 'howItWorks.step3.title',
        defaultTitle: 'Review Board Validation',
        descKey: 'howItWorks.step3.desc',
        defaultDesc: 'Cultural experts review the submission, verify authenticity, and approve or reject the archive entry.',
        image: reviewBoardImg
    },
    {
        id: 4,
        titleKey: 'howItWorks.step4.title',
        defaultTitle: 'Dharohar Archive Publication',
        descKey: 'howItWorks.step4.desc',
        defaultDesc: 'Approved cultural assets are stored in the Dharohar knowledge archive with community attribution and governance records.',
        image: archivePublicationImg
    },
    {
        id: 5,
        titleKey: 'howItWorks.step5.title',
        defaultTitle: 'Marketplace & Licensing',
        descKey: 'howItWorks.step5.desc',
        defaultDesc: 'Researchers, media houses, and organizations can explore the archive and apply for licensed access to cultural knowledge.',
        image: marketplaceImg
    }
];

export const HowItWorks = () => {
    const { t } = useTranslation();

    return (
        <section className="how-it-works-section">
            <div className="how-it-works-header">
                <h2>{t('howItWorks.heading', 'How Dharohar Works')}</h2>
                <p className="how-it-works-subheading">
                    {t('howItWorks.subheading', 'A structured governance system for preserving and licensing indigenous cultural knowledge.')}
                </p>
                <div className="decorative-divider"><span className="diamond"></span></div>
            </div>

            <div className="how-it-works-container">
                <div className="progress-line"></div>
                <div className="steps-wrapper">
                    {steps.map((step) => (
                        <div key={step.id} className="workflow-step-card">
                            <div className="step-badge">{step.id}</div>
                            <div className="step-content-wrapper">
                                <div className="step-image-container">
                                    <img
                                        src={step.image}
                                        alt={step.defaultTitle}
                                        className="step-image"
                                        onError={(e) => {
                                            // Fallback for missing images
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.classList.add('fallback-icon');
                                        }}
                                    />
                                </div>
                                <div className="step-text">
                                    <h4 className="step-title">{t(step.titleKey, step.defaultTitle)}</h4>
                                    <p className="step-desc">{t(step.descKey, step.defaultDesc)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
