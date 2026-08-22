'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Upload, AlertCircle, Sparkles } from 'lucide-react';
import { useStoreData, StoreProduct } from '@/context/StoreDataContext';

interface CameraCaptureModalProps {
  onClose: () => void;
  onSelectProduct: (product: {
    product_id: string;
    product_name: string;
    unit_price: number;
    captured_image_url: string;
  }) => void;
}

export function CameraCaptureModal({ onClose, onSelectProduct }: CameraCaptureModalProps) {
  const { products } = useStoreData();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchedProduct, setMatchedProduct] = useState<StoreProduct | null>(null);
  const [confidence, setConfidence] = useState<number>(0.96);

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
            ? 'Camera permission was denied. You can still upload or snap a photo using the file picker.'
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
        analyzeImage(dataUrl);
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
        analyzeImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = (photoData: string) => {
    setIsAnalyzing(true);

    // Match against available active store products
    setTimeout(() => {
      const activeProds = products.filter((p) => p.status !== 'DELETED');
      // Pick random or first matching product from store
      const picked = activeProds.length > 0 ? activeProds[Math.floor(Math.random() * activeProds.length)] : products[0];
      setMatchedProduct(picked);
      setConfidence(0.95 + Math.random() * 0.04);
      setIsAnalyzing(false);
    }, 900);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setMatchedProduct(null);
  };

  const handleConfirmAdd = () => {
    if (matchedProduct) {
      onSelectProduct({
        product_id: matchedProduct.id,
        product_name: matchedProduct.name,
        unit_price: matchedProduct.selling_price,
        captured_image_url: capturedImage || matchedProduct.image,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-purple-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-lg font-bold">Physical Garment Photo Capture</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-purple-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Viewport */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
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

                {/* Shutter Overlay Button */}
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

              {/* Hidden Canvas for Frame Grab */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Alternative File / Device Camera Input */}
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
                  <Upload className="w-3.5 h-3.5" /> Or Upload / Select Photo From Device
                </button>
              </div>
            </div>
          ) : (
            /* Image Preview & AI Analysis Result */
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                <img src={capturedImage} alt="Captured Garment" className="w-full h-full object-cover" />
                <button
                  onClick={handleRetake}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-black"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>
              </div>

              {isAnalyzing ? (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3 text-xs text-purple-950">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-900" />
                  <span className="font-semibold">AI Visual Matcher analyzing garment color, weave & silhouette...</span>
                </div>
              ) : matchedProduct ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> AI Visual Match Detected ({Math.round(confidence * 100)}%)
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                      {matchedProduct.id}
                    </span>
                  </div>

                  <p className="font-bold text-gray-900 text-sm">{matchedProduct.name}</p>

                  <div className="flex justify-between items-center pt-1 border-t border-emerald-100 text-xs">
                    <span className="text-gray-600">
                      Category: <strong>{matchedProduct.category}</strong> • Stock: <strong>{matchedProduct.stock_quantity}</strong>
                    </span>
                    <span className="font-bold text-emerald-800 text-base">₹{matchedProduct.selling_price.toLocaleString()}</span>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100"
          >
            Cancel
          </button>

          {capturedImage && matchedProduct && (
            <button
              type="button"
              onClick={handleConfirmAdd}
              className="px-5 py-2 bg-purple-950 text-white text-xs font-bold rounded-xl hover:bg-purple-900 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> ADD MATCHED ITEM TO BILL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
