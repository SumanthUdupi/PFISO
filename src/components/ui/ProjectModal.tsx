import React, { useState } from 'react';
import PixelTransition from './PixelTransition';
import Typewriter from './Typewriter';
import Modal from './Modal';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

interface CaseStudy {
  id: string;
  title: string;
  role: string;
  timeline: string;
  heroImage: string;
  description: string;
  techStack: string[];
  links: { demo: string; code: string };
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
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: CaseStudy[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, projects }) => {
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);
  const { isMobile } = useDeviceDetect();

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
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
                  onFocus={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                  onBlur={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
                >
                  <div style={{ width: '100%', height: '150px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #000', overflow: 'hidden' }}>
                     <img src={project.heroImage} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')} />
                  </div>
                  <div style={{ padding: '15px' }}>
                    <h3 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px', marginTop: 0, marginBottom: '10px' }}>{project.title}</h3>
                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', color: '#555', lineHeight: '1.5', margin: '0 0 10px 0' }}>{project.description}</p>
                    <div>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'Inter, system-ui, sans-serif' }}>ROLE: </span>
                        <span style={{ fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}>{project.role}</span>
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
                    background: '#f1f1f1',
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    fontFamily: '"Press Start 2P", cursive',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    color: '#2C3E50',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '20px' }}>
                      <div>
                        <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: '32px', margin: 0 }}>{selectedProject.title}</h1>
                        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px', color: '#666' }}>{selectedProject.description}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: '5px', fontFamily: 'Inter, system-ui, sans-serif' }}><strong>Role:</strong> {selectedProject.role}</div>
                          <div style={{ marginBottom: '5px', fontFamily: 'Inter, system-ui, sans-serif' }}><strong>Timeline:</strong> {selectedProject.timeline}</div>
                          <div>
                            {selectedProject.techStack.map(tech => (
                                <span key={tech} style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '5px', display: 'inline-block', fontFamily: 'Inter, system-ui, sans-serif' }}>{tech}</span>
                            ))}
                          </div>
                      </div>
                  </div>
                </div>

                {/* Problem Statement */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '4px solid #F39C12', display: 'inline-block', paddingBottom: '5px' }}>PROBLEM STATEMENT</h2>
                    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #F39C12', marginTop: '15px' }}>
                        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}><strong>Context:</strong> {selectedProject.problemStatement.context}</p>
                        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}><strong>Constraints:</strong> {selectedProject.problemStatement.constraints}</p>
                        <ul style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}>
                            {selectedProject.problemStatement.goals.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                    </div>
                </section>

                {/* Research */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '4px solid #3498DB', display: 'inline-block', paddingBottom: '5px' }}>RESEARCH</h2>
                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6, marginTop: '15px' }}>{selectedProject.research.summary}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        <div style={{ background: '#eef', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontFamily: 'Inter, system-ui, sans-serif' }}>Key Insights</h4>
                            <ul style={{ paddingLeft: '20px' }}>
                                {selectedProject.research.insights.map((insight, i) => (
                                    <li key={i} style={{ fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '8px' }}>{insight}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                             {selectedProject.research.personas.map((img, i) => (
                                 <img key={i} src={img} alt="Persona" style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')} />
                             ))}
                        </div>
                    </div>
                </section>

                {/* Design Process */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '4px solid #9B59B6', display: 'inline-block', paddingBottom: '5px' }}>DESIGN PROCESS</h2>

                    <h3 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px', marginTop: '20px' }}>User Flows</h3>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                         {selectedProject.designProcess.userFlows.map((img, i) => (
                             <img key={i} src={img} style={{ height: '200px', border: '1px solid #ccc' }} alt="Flow" onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')} />
                         ))}
                    </div>

                    <h3 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px', marginTop: '20px' }}>Wireframes & Mockups</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                         {selectedProject.designProcess.wireframes.map((img, i) => (
                             <div key={i}>
                                 <img src={img} style={{ width: '100%', border: '1px solid #ccc' }} alt="Wireframe" onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')} />
                                 <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', fontFamily: 'Inter, system-ui, sans-serif' }}>Low-Fidelity</p>
                             </div>
                         ))}
                         {selectedProject.designProcess.mockups.map((img, i) => (
                             <div key={i}>
                                 <img src={img} style={{ width: '100%', border: '1px solid #ccc' }} alt="Mockup" onError={(e) => (e.currentTarget.src = './assets/placeholder_sm.webp')} />
                                 <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', fontFamily: 'Inter, system-ui, sans-serif' }}>High-Fidelity</p>
                             </div>
                         ))}
                    </div>

                    {selectedProject.designProcess.prototypeUrl && (
                        <div style={{ marginTop: '30px' }}>
                             <h3 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px' }}>Interactive Prototype</h3>
                             <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                                 <iframe
                                    src={selectedProject.designProcess.prototypeUrl}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                    title="Prototype"
                                    allowFullScreen
                                 />
                             </div>
                        </div>
                    )}
                </section>

                {/* Outcomes */}
                <section style={{ marginBottom: '40px', background: '#2C3E50', color: 'white', padding: '30px', borderRadius: '8px' }}>
                     <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', borderBottom: '4px solid #2ECC71', display: 'inline-block', paddingBottom: '5px', color: '#2ECC71' }}>OUTCOMES</h2>
                     <div style={{ display: 'flex', gap: '40px', marginTop: '20px', flexWrap: 'wrap' }}>
                        {selectedProject.outcomes.metrics.map((metric, i) => (
                            <div key={i} style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ fontSize: '24px', color: '#2ECC71', margin: '0 0 10px 0', fontFamily: '"Press Start 2P", cursive' }}>{metric}</h3>
                            </div>
                        ))}
                     </div>
                     <p style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6, marginTop: '20px', borderTop: '1px solid #555', paddingTop: '20px' }}>
                         <em>"{selectedProject.outcomes.reflection}"</em>
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
