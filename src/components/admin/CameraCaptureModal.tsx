'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Upload, AlertCircle, Plus } from 'lucide-react';
import { useStoreData } from '@/context/StoreDataContext';

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

  // Manual Item Inputs
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedSKU, setSelectedSKU] = useState('');

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

  const handleQuickPick = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    setSelectedSKU(prodId);
    if (!prodId) return;
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setProductName(prod.name);
      setProductPrice(prod.selling_price.toString());
    }
  };

  const handleConfirmAdd = () => {
    if (!productName.trim() || !productPrice) {
      alert('Please enter a product description and price.');
      return;
    }

    onSelectProduct({
      product_id: selectedSKU || `ITEM-${Math.floor(1000 + Math.random() * 9000)}`,
      product_name: productName.trim(),
      unit_price: parseFloat(productPrice) || 0,
      captured_image_url:
        capturedImage ||
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    });
    onClose();
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
            /* Image Preview & Manual Product Entry */
            <div className="space-y-4 text-xs">
              <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 max-h-48">
                <img src={capturedImage} alt="Captured Garment" className="w-full h-full object-cover" />
                <button
                  onClick={handleRetake}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-black cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
                </button>
              </div>

              {/* Quick Select from existing catalog */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quick Select From Catalogue (Optional):</label>
                <select
                  value={selectedSKU}
                  onChange={handleQuickPick}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none"
                >
                  <option value="">-- Custom Manual Entry --</option>
                  {products
                    .filter((p) => p.status !== 'DELETED')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.selling_price}) - {p.id}
                      </option>
                    ))}
                </select>
              </div>

              {/* Manual Product Name & Price */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silk Saree / Handloom Kurta"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1299"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none font-bold text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
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
              onClick={handleConfirmAdd}
              className="px-5 py-2 bg-purple-950 text-white text-xs font-bold rounded-xl hover:bg-purple-900 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> ADD ITEM TO BILL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
