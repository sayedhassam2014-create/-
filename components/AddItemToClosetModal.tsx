import React, { useRef, useCallback, useState, useEffect } from 'react';
import CameraIcon from './icons/CameraIcon';
import UploadIcon from './icons/UploadIcon';
import SwitchCameraIcon from './icons/SwitchCameraIcon';

interface AddItemToClosetModalProps {
  onClose: () => void;
  onItemAdded: (imageBase64: string) => void;
}

const AddItemToClosetModal: React.FC<AddItemToClosetModalProps> = ({ onClose, onItemAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
        if ('permissions' in navigator) {
            try {
                const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
                setPermissionStatus(status.state);
                status.onchange = () => setPermissionStatus(status.state);
            } catch (err) {
                console.warn('Could not query camera permissions.', err);
                setPermissionStatus('prompt');
            }
        } else {
            setPermissionStatus('prompt');
        }
    };
    checkPermissions();
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);
  
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    stopCamera();
    setError(null);
    try {
      const constraints = {
        video: { 
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (!isCameraOpen) setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera access error:", err);
      let errorMessage = 'Could not access the camera. Please try uploading a photo instead.';
      if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
              errorMessage = 'Camera access was denied. Please enable camera permissions in your browser settings and try again.';
          } else if (err.name === 'NotFoundError') {
              errorMessage = 'No camera was found on your device. Please connect a camera or upload a photo from your library.';
          } else if (err.name === 'NotReadableError') {
            errorMessage = 'The camera might be in use by another application. Please close any other apps using the camera and try again.';
          } else if (err.name === 'OverconstrainedError') {
            errorMessage = 'Your camera does not support the required video settings. Please try uploading a photo.';
          }
      }
      setError(errorMessage);
      setIsCameraOpen(false);
    }
  }, [isCameraOpen, stopCamera]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onItemAdded(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCameraClick = async () => {
    setError(null);
    if (stream || isCameraLoading) return;

    if (permissionStatus === 'denied') {
        setError('Camera access has been blocked. Please enable camera permissions in your browser settings to use this feature.');
        return;
    }

    setIsCameraLoading(true);

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
    } catch (e) {
        console.warn("Could not check for multiple cameras.", e);
    }
    await startCamera(facingMode);
    setIsCameraLoading(false);
  };

  const handleSwitchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    startCamera(newFacingMode);
  };

  const handleCapture = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            onItemAdded(dataUrl);
        }
    }
  };

  const handleBack = () => {
      stopCamera();
      setIsCameraOpen(false);
      setError(null);
  };

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      stopCamera();
    };
  }, [isCameraOpen, stream, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full text-center transform transition-all animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        {!isCameraOpen ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Add to Your Closet</h2>
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3 mb-6">
                <strong>Pro Tip:</strong> For best results, lay your clothing item flat on a plain, contrasting background (like a floor or bed).
            </div>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            <div className="space-y-4">
              <button
                onClick={handleCameraClick}
                disabled={isCameraLoading || permissionStatus === null}
                className="w-full primary-gradient text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
              >
                {isCameraLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Starting...
                    </>
                ) : (
                    <>
                        <CameraIcon className="w-6 h-6 mr-3" />
                        Use Camera
                    </>
                )}
              </button>
              <button
                onClick={handleUploadClick}
                className="w-full flex items-center justify-center bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-transform transform hover:scale-105"
              >
                <UploadIcon className="w-6 h-6 mr-3" />
                Upload Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <button onClick={onClose} className="mt-8 text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Capture Your Item</h2>
            <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden aspect-[3/4] mb-4">
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                <div className="absolute inset-0 p-4 pointer-events-none">
                  <div
                    className="w-full h-full border-4 border-dashed border-white/50 rounded-xl flex items-center justify-center"
                    aria-hidden="true"
                  >
                     <svg className="w-1/2 h-1/2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H20.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
                        <path d="m21 10-2 11a2 2 0 0 1-2 1H7a2 2 0 0 1-2-1l-2-11"></path>
                        <path d="M12 10v12"></path>
                    </svg>
                  </div>
                  <p className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm text-center p-2 rounded-md w-11/12 max-w-xs">
                    Center your item inside the frame
                  </p>
                </div>
                {hasMultipleCameras && (
                    <button 
                        onClick={handleSwitchCamera} 
                        className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-sm text-white rounded-full p-3 hover:bg-black/60 transition-colors"
                        aria-label="Switch camera"
                    >
                        <SwitchCameraIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            <div className="space-y-3">
                 <button
                    onClick={handleCapture}
                    className="w-full primary-gradient text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-transform transform hover:scale-105 flex items-center justify-center"
                 >
                    <CameraIcon className="w-6 h-6 mr-3 animate-pulse-camera" />
                    Capture Photo
                </button>
                 <button onClick={handleBack} className="w-full text-gray-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors">
                    Back
                 </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddItemToClosetModal;