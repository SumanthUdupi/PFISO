import React from 'react';
import PixelTransition from './PixelTransition';
import Typewriter from './Typewriter';

interface BioData {
  name: string;
  role: string;
  photo: string;
  summary: string;
  philosophy: string;
  skills: string[];
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      pointerEvents: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        border: '4px solid #000',
        borderRadius: '8px',
        boxShadow: '10px 10px 0px #000',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#8E44AD',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '4px solid #000'
        }}>
          <h2 style={{ margin: 0, fontFamily: '"Press Start 2P", cursive', fontSize: '18px' }}>
            PERSONNEL FILE: {bio.name.toUpperCase()}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            X
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <PixelTransition>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                    {/* Top Section: Photo & Intro */}
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ flex: '0 0 250px' }}>
                            <div style={{ border: '4px solid #000', padding: '5px', background: 'white', transform: 'rotate(-2deg)' }}>
                                <img
                                    src={bio.photo}
                                    alt="Profile"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')}
                                />
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '15px', fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}>
                                {bio.role}
                            </div>
                        </div>

                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>ABOUT ME</h3>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: 1.6, marginBottom: '20px' }}>
                                <Typewriter text={bio.summary} speed={5} />
                            </div>

                            <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginTop: '30px' }}>DESIGN PHILOSOPHY</h3>
                            <blockquote style={{
                                fontFamily: 'Inter, sans-serif',
                                fontStyle: 'italic',
                                borderLeft: '4px solid #8E44AD',
                                paddingLeft: '15px',
                                margin: '15px 0',
                                background: '#f9f9f9',
                                padding: '15px'
                            }}>
                                "{bio.philosophy}"
                            </blockquote>
                        </div>
                    </div>

                    {/* Middle Section: Experience & Certs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
                        <div>
                             <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', background: '#2C3E50', color: 'white', padding: '10px' }}>EXPERIENCE</h3>
                             <div style={{ border: '2px solid #2C3E50', padding: '15px' }}>
                                 {bio.experience.map((exp, i) => (
                                     <div key={i} style={{ marginBottom: '15px', borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
                                         <div style={{ fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }}>{exp.role}</div>
                                         <div style={{ fontSize: '14px', color: '#666' }}>{exp.company} | {exp.years}</div>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        <div>
                             <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', background: '#27AE60', color: 'white', padding: '10px' }}>CERTIFICATIONS</h3>
                             <div style={{ border: '2px solid #27AE60', padding: '15px' }}>
                                 {bio.certifications.map((cert, i) => (
                                     <div key={i} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                         <div style={{ fontSize: '20px' }}>📜</div>
                                         <div>
                                            <div style={{ fontWeight: 'bold', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>{cert.name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{cert.issuer}, {cert.date}</div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>

                    {/* Bottom Section: Testimonials */}
                    <div style={{ marginTop: '20px' }}>
                        <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>TESTIMONIALS</h3>
                        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                            {bio.testimonials.map((t, i) => (
                                <div key={i} style={{
                                    background: '#F1C40F',
                                    padding: '20px',
                                    width: '300px',
                                    flexShrink: 0,
                                    position: 'relative',
                                    boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
                                    color: '#333'
                                }}>
                                    <div style={{ position: 'absolute', top: '-10px', left: '10px', fontSize: '30px', fontFamily: 'serif' }}>"</div>
                                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', marginTop: '10px', fontStyle: 'italic' }}>{t.quote}</p>
                                    <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '12px', textAlign: 'right' }}>— {t.author}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PixelTransition>
        </div>
      </div>
    </div>
  );
};

export default BioModal;
