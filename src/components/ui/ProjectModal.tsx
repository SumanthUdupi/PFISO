import React, { useState } from 'react';
import PixelTransition from './PixelTransition';
import SmoothText from './SmoothText';
import Modal from './Modal';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import useGameStore from '../../store';
import { useEffect } from 'react';

interface CaseStudy {
  id: string;
  title: string;
  role: string;
  timeline: string;
  heroImage: string;
  description: string;
  techStack: string[];
  links: { demo?: string; code?: string };
  problemStatement: {
    context: string;
    goals: string[];
    constraints: string;
  };
  research: {
    summary: string;
    personas: string[];
    insights: string[];
  };
  designProcess: {
    userFlows: string[];
    wireframes: string[];
    mockups: string[];
    prototypeUrl: string;
  };
  outcomes: {
    metrics: string[];
    reflection: string;
  };
  featured?: boolean;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: CaseStudy[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, projects }) => {
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);
  const { isMobile } = useDeviceDetect();
  const { unlockSkill, markProjectViewed } = useGameStore();

  useEffect(() => {
    if (selectedProject) {
      markProjectViewed(selectedProject.id);

      // Unlock skills associated with this project
      selectedProject.techStack.forEach(skill => {
        // Determine tier based on project scope or hardcoded mapping?
        // For now, let's say "featured" projects give Proficient, others Novice.
        // Or simple: Just unlocking it is Novice.
        // Requirement says: "Viewing a small project might grant 'Novice', while a major project grants 'Proficient'."
        const tier = selectedProject.featured ? 'Proficient' : 'Novice';
        unlockSkill(skill, tier);
      });
    }
  }, [selectedProject, markProjectViewed, unlockSkill]);

  if (!isOpen) return null;

  return (
    <Modal
      title={selectedProject ? selectedProject.title : 'ARCHIVE // WORK'}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="1000px"
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {!selectedProject ? (
          // Project Grid View
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', paddingBottom: '20px' }}>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                style={{
                  border: '4px solid #000',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  position: 'relative',
                  background: 'white',
                  padding: 0,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: project.featured ? '0 0 15px rgba(255, 165, 0, 0.5)' : 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
                onFocus={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                onBlur={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
              >
                {project.featured && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ffa726', color: 'black', padding: '4px 8px', fontSize: '10px', fontFamily: '"Press Start 2P", cursive', zIndex: 10 }}>
                    FEATURED
                  </div>
                )}
                <div style={{ width: '100%', height: '150px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #000', overflow: 'hidden' }}>
                  <img src={project.heroImage} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')} />
                </div>
                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', marginTop: 0, marginBottom: '10px', lineHeight: '1.4' }}>{project.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#555', lineHeight: '1.5', margin: '0 0 10px 0', flex: 1 }}>{project.description}</p>
                  <div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-body)' }}>{project.role.replace('**My Role**: ', '')}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Detailed Case Study View
          <PixelTransition>
            <div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  background: '#e7dcc9',
                  border: '2px solid #d7ccc8',
                  borderRadius: '8px',
                  fontFamily: '"Press Start 2P", cursive',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  color: '#4a3728',
                  textDecoration: 'none',
                  padding: '12px 16px',
                  width: isMobile ? '100%' : 'auto',
                  textAlign: 'center'
                }}
              >
                &lt; BACK TO PROJECTS
              </button>

              {/* Hero Section */}
              <div style={{ marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                <img
                  src={selectedProject.heroImage}
                  alt="Hero"
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #000' }}
                  onError={(e) => (e.currentTarget.src = './assets/placeholder_hero.webp')}
                />
                <div style={{ marginTop: '20px' }}>
                  <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '28px', margin: '0 0 10px 0', lineHeight: 1.3 }}>{selectedProject.title}</h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: '#666', marginTop: 0 }}>{selectedProject.description}</p>

                  <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                    <div style={{ marginBottom: '8px', fontFamily: 'var(--font-body)' }}>{selectedProject.role}</div>
                    <div style={{ marginBottom: '8px', fontFamily: 'var(--font-body)' }}><strong>Timeline:</strong> {selectedProject.timeline}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                      {selectedProject.techStack.map(tech => (
                        <span key={tech} style={{ background: '#e0e0e0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-body)' }}>{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem Statement */}
              <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '4px solid #F39C12', display: 'inline-block', paddingBottom: '5px' }}>THE CHALLENGE</h2>
                <div style={{ background: '#fff', padding: '0', marginTop: '15px' }}>
                  <p style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}><strong>Context:</strong> {selectedProject.problemStatement.context}</p>
                  <p style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}><strong>Constraints:</strong> {selectedProject.problemStatement.constraints}</p>
                  <div style={{ marginTop: '15px' }}>
                    <strong>Goals:</strong>
                    <ul style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6, marginTop: '5px' }}>
                      {selectedProject.problemStatement.goals.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Research / Approach */}
              <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '4px solid #8D6E63', display: 'inline-block', paddingBottom: '5px' }}>APPROACH & SOLUTION</h2>
                <p style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6, marginTop: '15px' }}>{selectedProject.research.summary}</p>

                {selectedProject.research.insights.length > 0 && (
                  <div style={{ marginTop: '20px', background: '#efebe9', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontFamily: 'var(--font-body)' }}>Key Insights</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {selectedProject.research.insights.map((insight, i) => (
                        <li key={i} style={{ fontFamily: 'var(--font-body)', marginBottom: '8px' }}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Design Process / Artifacts */}
              {(selectedProject.designProcess.userFlows.length > 0 || selectedProject.designProcess.mockups.length > 0) && (
                <section style={{ marginBottom: '40px' }}>
                  <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '4px solid #9B59B6', display: 'inline-block', paddingBottom: '5px' }}>ARTIFACTS</h2>

                  {selectedProject.designProcess.userFlows.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '18px' }}>Process Flows</h3>
                      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {selectedProject.designProcess.userFlows.map((img, i) => (
                          <img key={i} src={img} style={{ height: '200px', border: '1px solid #ccc' }} alt="Flow" onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')} />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProject.designProcess.mockups.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '18px' }}>Visuals</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        {selectedProject.designProcess.mockups.map((img, i) => (
                          <div key={i}>
                            <img src={img} style={{ width: '100%', border: '1px solid #ccc' }} alt="Mockup" onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Outcomes */}
              <section style={{ marginBottom: '40px', background: '#2d2424', color: '#fcf4e8', padding: '30px', borderRadius: '8px' }}>
                <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '4px solid #9CCC65', display: 'inline-block', paddingBottom: '5px', color: '#9CCC65' }}>IMPACT & RESULTS</h2>
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                  {selectedProject.outcomes.metrics.map((metric, i) => (
                    <div key={i} style={{ flex: 1, minWidth: '200px', borderLeft: '4px solid #9CCC65', paddingLeft: '15px' }}>
                      <p style={{ fontSize: '16px', color: '#fcf4e8', margin: 0, fontFamily: 'var(--font-body)', fontWeight: 'bold' }}>{metric}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6, marginTop: '20px', borderTop: '1px solid #555', paddingTop: '20px', fontStyle: 'italic' }}>
                  {selectedProject.outcomes.reflection}
                </p>
              </section>

            </div>
          </PixelTransition>
        )}
      </div>
    </Modal>
  );
};

export default ProjectModal;
