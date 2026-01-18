import React from 'react'
import Modal from './Modal'
import usePhotographyStore from '../../stores/photographyStore'

const PhotoGallery: React.FC = () => {
    const { photos, deletePhoto, setGalleryOpen } = usePhotographyStore()

    return (
        <Modal onClose={() => setGalleryOpen(false)} title="Photo Gallery">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {photos.length === 0 ? (
                    <p>No photos captured yet.</p>
                ) : (
                    photos.map(photo => (
                        <div key={photo.id} className="relative border rounded">
                            <img src={photo.dataUrl} alt="Captured" className="w-full h-32 object-cover" />
                            <button
                                onClick={() => deletePhoto(photo.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    )
}

export default PhotoGallery