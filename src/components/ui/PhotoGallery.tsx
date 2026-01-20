import React from 'react'
import { usePhotoStore } from '../../stores/photoStore'

export const PhotoGallery: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { photos, deletePhoto, clearAll } = usePhotoStore()
    const [selectedPhotoId, setSelectedPhotoId] = React.useState<string | null>(null)

    const selectedPhoto = photos.find(p => p.id === selectedPhotoId)

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col p-8 text-white font-sans">
            <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
                <h2 className="text-3xl font-bold tracking-tighter">PHOTO GALLERY</h2>
                <div className="flex gap-4">
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/50 rounded uppercase text-sm font-bold transition-colors"
                    >
                        Delete All
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded uppercase text-sm font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex gap-6">
                {/* Photo Grid */}
                <div className="w-1/3 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {photos.length === 0 && (
                        <div className="text-white/50 italic text-center mt-20">No photos captured yet.</div>
                    )}
                    {photos.map(photo => (
                        <div
                            key={photo.id}
                            onClick={() => setSelectedPhotoId(photo.id)}
                            className={`relative aspect-video bg-black border-2 cursor-pointer transition-all hover:scale-[1.02] ${selectedPhotoId === photo.id ? 'border-cozy-accent' : 'border-white/20 hover:border-white/50'}`}
                        >
                            <img src={photo.dataUrl} alt="Capture" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 px-2 text-[10px] items-center flex justify-between">
                                <span>{new Date(photo.timestamp).toLocaleTimeString()}</span>
                                <span className="uppercase text-white/70">{photo.filter}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main View */}
                <div className="flex-1 bg-black/50 border border-white/10 rounded-lg flex items-center justify-center relative p-4">
                    {selectedPhoto ? (
                        <>
                            <img src={selectedPhoto.dataUrl} alt="Selected" className="max-w-full max-h-full shadow-2xl border border-white/10" />
                            <div className="absolute bottom-6 right-6 flex gap-2">
                                <a
                                    href={selectedPhoto.dataUrl}
                                    download={`photo_${selectedPhoto.timestamp}.jpg`}
                                    className="px-4 py-2 bg-cozy-accent text-black font-bold rounded hover:bg-white transition-colors"
                                >
                                    DOWNLOAD
                                </a>
                                <button
                                    onClick={() => {
                                        deletePhoto(selectedPhoto.id)
                                        setSelectedPhotoId(null)
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-500 transition-colors"
                                >
                                    DELETE
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-white/30 text-xl tracking-widest uppercase font-bold">Select a photo</div>
                    )}
                </div>
            </div>
        </div>
    )
}