
import React, { useRef, useCallback, useState, useEffect } from 'react';
import CameraIcon from './icons/CameraIcon';
import UploadIcon from './icons/UploadIcon';
import SwitchCameraIcon from './icons/SwitchCameraIcon';

interface TryOnModalProps {
  onClose: () => void;
  onImageReady: (imageBase64: string) => void;
}

const TryOnModal: React.FC<TryOnModalProps> = ({ onClose, onImageReady }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'close' | 'back' | null>(null);
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
                setPermissionStatus('prompt'); // Assume we can prompt if query fails
            }
        } else {
             // Fallback for browsers that don't support the Permissions API
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
    stopCamera(); // Stop any existing stream before starting a new one
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
      let errorMessage = 'An unexpected error occurred with the camera. Please try uploading a photo instead.';
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
      setIsCameraOpen(false); // Ensure camera view is closed on error
    }
  }, [isCameraOpen, stopCamera]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onImageReady(base64String);
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

    // Check for multiple cameras to conditionally show the switch button
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
    } catch (e) {
        console.warn("Could not check for multiple cameras, switch button will be hidden.", e);
        setHasMultipleCameras(false);
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
            // Flip the image if it's from the user-facing camera
            if (facingMode === 'user') {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
            }
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            onImageReady(dataUrl);
            // The modal will close via parent state change, triggering cleanup
        }
    }
  };

  const handleClose = () => {
      if (isCameraOpen) {
          setConfirmationAction('close');
      } else {
          onClose();
      }
  };
  
  const handleBack = () => {
      setConfirmationAction('back');
  };

  const handleConfirmExit = () => {
    stopCamera();
    if (confirmationAction === 'close') {
      onClose();
    } else if (confirmationAction === 'back') {
      setIsCameraOpen(false);
      setError(null);
    }
    setConfirmationAction(null);
  };

  const handleCancelExit = () => {
    setConfirmationAction(null);
  };

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    // Cleanup on component unmount
    return () => {
      stopCamera();
    };
  }, [isCameraOpen, stream, stopCamera]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full text-center transform transition-all animate-fade-in-up relative" onClick={(e) => e.stopPropagation()}>
        {confirmationAction && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex justify-center items-center rounded-2xl animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full text-center border">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Are you sure?</h3>
              <p className="text-gray-600 mb-8">
                Your photo will not be saved if you leave now.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleCancelExit}
                  className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 w-full transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="bg-red-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-600 w-full transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!isCameraOpen ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Virtual Try-On</h2>
            <p className="text-gray-600 mb-8">
              Choose a clear, full-body photo in front of a mirror or have someone take a picture for you.
            </p>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            <div className="space-y-4">
              <button
                onClick={handleCameraClick}
                disabled={isCameraLoading || permissionStatus === null}
                className="w-full primary-gradient text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
              >
                {isCameraLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Starting Camera...
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
                className="w-full flex items-center justify-center bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105"
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
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Take a Picture</h2>
            <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden aspect-[3/4] mb-4">
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                
                {/* Visual Guide Overlay */}
                <div className="absolute inset-0 p-4 pointer-events-none">
                  <div
                    className="w-full h-full border-4 border-dashed border-white/50 rounded-xl"
                    aria-hidden="true"
                  />
                  <p className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm text-center p-2 rounded-md w-11/12 max-w-xs">
                    Position your full body inside the dashed line
                  </p>
                </div>

                {/* Prominent Switch Camera Button */}
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

export default TryOnModal;