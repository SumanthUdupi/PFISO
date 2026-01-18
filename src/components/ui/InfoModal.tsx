import React from 'react'
import { useUIStore } from '../../stores/uiStore'

import ContactForm from './ContactForm'

export const InfoModal: React.FC = () => {
    const { isModalOpen, modalContent, closeModal } = useUIStore()

    if (!isModalOpen || !modalContent) return null

    const isContact = modalContent.type === 'CONTACT'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
            <div
                className="bg-cozy-bg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border-2 border-cozy-border transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Image */}
                {modalContent.image && (
                    <div className="h-48 w-full overflow-hidden bg-gray-200">
                        <img src={modalContent.image} alt={modalContent.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            {modalContent.subtitle && (
                                <span className="inline-block px-2 py-1 bg-cozy-sage/20 text-cozy-sage text-xs font-bold rounded mb-2 uppercase tracking-wide">
                                    {modalContent.subtitle}
                                </span>
                            )}
                            <h2 className="text-3xl font-bold text-cozy-text font-serif">{modalContent.title}</h2>
                        </div>
                        <button
                            onClick={closeModal}
                            className="p-2 hover:bg-black/10 rounded-full transition-colors text-cozy-text"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {isContact ? (
                        <ContactForm />
                    ) : (
                        <>
                            <div className="prose prose-stone max-w-none text-cozy-text leading-relaxed font-sans whitespace-pre-line">
                                <p>{modalContent.description}</p>
                            </div>

                            {/* Footer / Meta */}
                            <div className="mt-8 pt-6 border-t border-cozy-border flex flex-wrap gap-2">
                                {modalContent.tags?.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white border border-cozy-border rounded-full text-sm text-cozy-text/70 font-mono">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {modalContent.links && modalContent.links.length > 0 && (
                                <div className="mt-6 flex gap-4">
                                    {modalContent.links.map(link => (
                                        <a
                                            key={link.label}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-6 py-2 bg-cozy-orange text-white rounded-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-cozy-orange/30"
                                        >
                                            {link.label} →
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
