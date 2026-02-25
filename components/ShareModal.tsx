import React, { useState } from 'react';
import ShareIcon from './icons/ShareIcon';

interface ShareModalProps {
  imageUrl?: string;
  videoUrl?: string;
  initialCaption: string;
  onClose: () => void;
  onShare: (caption: string) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ imageUrl, videoUrl, initialCaption, onClose, onShare }) => {
  const [caption, setCaption] = useState(initialCaption);

  const handleShareClick = () => {
    onShare(caption);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 m-4 max-w-lg w-full text-left transform transition-all animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Share The Look</h2>
        <div className="flex gap-4 items-start">
            {imageUrl && <img src={imageUrl} alt="Outfit to share" className="w-32 h-40 object-cover rounded-lg" />}
            {videoUrl && <video src={videoUrl} loop muted autoPlay playsInline className="w-32 h-40 object-cover rounded-lg bg-gray-200" />}
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
            />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="text-gray-600 font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleShareClick}
            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Share Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;