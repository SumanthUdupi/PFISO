import React from 'react';
import PixelTransition from './PixelTransition';
import SmoothText from './SmoothText';
import Modal from './Modal';
import { resolveAssetPath } from '../../utils/assetUtils';

interface BioData {
    name: string;
    role: string;
    photo: string;
    summary: string[];
    philosophy: string;
    targetAudience: string;
    competencies: { title: string; description: string; keywords: string[] }[];
    domainExpertise: { area: string; description: string }[];
    skills: { category: string; items: { name: string; level: string; description: string; certification?: string }[] }[];
    experience: { role: string; company: string; years: string }[];
    certifications: { name: string; issuer: string; date: string }[];
    testimonials: { quote: string; author: string }[];
}

interface BioModalProps {
    isOpen: boolean;
    onClose: () => void;
    bio: BioData;
}

const BioModal: React.FC<BioModalProps> = ({ isOpen, onClose, bio }) => {
    if (!isOpen) return null;

    return (
        <Modal
            title={`PERSONNEL FILE: ${bio.name.toUpperCase()}`}
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="900px"
        >
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <PixelTransition>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                        {/* Top Section: Photo & Intro */}
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '0 0 250px' }}>
                                <div style={{ border: '4px solid #000', padding: '5px', background: 'white', transform: 'rotate(-2deg)' }}>
                                    <img
                                        src={resolveAssetPath(bio.photo)}
                                        alt="Profile"
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                        onError={(e) => (e.currentTarget.src = resolveAssetPath('./assets/placeholder_sm.webp'))}
                                    />
                                </div>
                                <div style={{ textAlign: 'center', marginTop: '15px', fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}>
                                    {bio.role}
                                </div>
                            </div>

                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '2px solid #d7ccc8', paddingBottom: '10px' }}>ABOUT ME</h3>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, marginBottom: '20px' }}>
                                    {bio.summary.map((paragraph, idx) => (
                                        <p key={idx} style={{ marginBottom: '15px' }}>
                                            <SmoothText text={paragraph} delay={idx * 0.1} />
                                        </p>
                                    ))}
                                </div>

                                <div style={{ background: '#fff3e0', padding: '15px', borderLeft: '4px solid #ffb74d', marginBottom: '20px' }}>
                                    <h4 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', marginBottom: '10px' }}>TARGET AUDIENCE</h4>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontStyle: 'italic' }}>{bio.targetAudience}</p>
                                </div>
                            </div>
                        </div>

                        {/* What I Do / Competencies */}
                        <div>
                            <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '2px solid #d7ccc8', paddingBottom: '10px', marginTop: '10px' }}>WHAT I DO</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' }}>
                                {bio.competencies.map((comp, i) => (
                                    <div key={i} style={{ background: '#fff', padding: '15px', border: '1px solid #d7ccc8', borderRadius: '4px' }}>
                                        <h4 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', color: '#4a3728', marginBottom: '10px' }}>{comp.title}</h4>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', marginBottom: '10px' }}>{comp.description}</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            {comp.keywords.map((kw, k) => (
                                                <span key={k} style={{ background: '#efebe9', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', fontFamily: 'var(--font-body)' }}>{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Domain Expertise */}
                        <div>
                            <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '2px solid #d7ccc8', paddingBottom: '10px', marginTop: '30px' }}>DOMAIN EXPERTISE</h3>
                            <div style={{ marginTop: '15px' }}>
                                {bio.domainExpertise.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                        <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', color: '#e67e22', minWidth: '150px' }}>{exp.area}</span>
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>{exp.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills Detail View */}
                        <div>
                            <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '2px solid #d7ccc8', paddingBottom: '10px', marginTop: '30px' }}>TECHNICAL TOOLKIT</h3>
                            {bio.skills.map((category, i) => (
                                <div key={i} style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 'bold', fontSize: '16px', color: '#4a3728', marginBottom: '10px', borderLeft: '4px solid #ffa726', paddingLeft: '10px' }}>{category.category}</h4>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {category.items.map((skill, j) => (
                                            <div key={j} style={{ background: '#efebe9', padding: '10px', borderRadius: '4px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                    <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}>{skill.name}</span>
                                                    <span style={{ fontSize: '10px', background: '#9CCC65', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>{skill.level}</span>
                                                </div>
                                                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', margin: 0, color: '#4a3728' }}>{skill.description}</p>
                                                {skill.certification && (
                                                    <div style={{ marginTop: '5px', fontSize: '11px', color: '#27ae60', fontStyle: 'italic' }}>Verified: {skill.certification}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Certifications (Traditional List) */}
                        <div>
                            <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', background: '#27AE60', color: 'white', padding: '10px' }}>CERTIFICATIONS</h3>
                            <div style={{ border: '2px solid #27AE60', padding: '15px' }}>
                                {bio.certifications.map((cert, i) => (
                                    <div key={i} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '20px' }}>📜</div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-body)', fontSize: '14px' }}>{cert.name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{cert.issuer}, {cert.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Bottom Section: Testimonials */}
                        <div style={{ marginTop: '20px' }}>
                            <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>TESTIMONIALS</h3>
                            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                                {bio.testimonials.map((t, i) => (
                                    <div key={i} style={{
                                        background: '#FFD54F',
                                        padding: '20px',
                                        width: '300px',
                                        flexShrink: 0,
                                        position: 'relative',
                                        boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
                                        color: '#333'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-10px', left: '10px', fontSize: '30px', fontFamily: 'serif' }}>"</div>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginTop: '10px', fontStyle: 'italic' }}>{t.quote}</p>
                                        <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '12px', textAlign: 'right' }}>— {t.author}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </PixelTransition>
            </div>
        </Modal>
    );
};

export default BioModal;
