'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Upload, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

export function CameraCaptureModal({ onClose, onSelectImage }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start device camera on mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported on this device/browser.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err: any) {
        console.warn('Camera stream error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission was denied. You can upload or snap a photo using the file picker.'
            : 'Could not access device camera stream directly. Please use the photo upload option.'
        );
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirmUse = () => {
    if (capturedImage) {
      onSelectImage(capturedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-purple-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-lg font-bold">Snap Garment Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-purple-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="p-5 space-y-4">
          {!capturedImage ? (
            <div className="space-y-4">
              {/* Camera Viewfinder */}
              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                {!cameraError ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center text-white space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-gray-300">{cameraError}</p>
                  </div>
                )}

                {/* Shutter Button */}
                {!cameraError && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={handleCaptureSnapshot}
                      className="w-14 h-14 bg-white rounded-full border-4 border-purple-950 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      title="Take Snapshot"
                    >
                      <div className="w-10 h-10 bg-purple-950 rounded-full" />
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden Canvas */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Upload Alternative */}
              <div className="text-center pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-50 text-purple-950 border border-purple-200 rounded-xl text-xs font-semibold hover:bg-purple-100 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Or Choose Photo From Device
                </button>
              </div>
            </div>
          ) : (
            /* Captured Photo Preview */
            <div className="space-y-4 text-xs">
              <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                <img src={capturedImage} alt="Captured Garment" className="w-full h-full object-cover" />
                <button
                  onClick={handleRetake}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-black cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>
              </div>
              <p className="text-center text-gray-600 font-medium">Photo captured successfully!</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>

          {capturedImage && (
            <button
              type="button"
              onClick={handleConfirmUse}
              className="px-5 py-2 bg-purple-950 text-white text-xs font-bold rounded-xl hover:bg-purple-900 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" /> Use This Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
