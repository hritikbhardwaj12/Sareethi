'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { processCatalogueUploadAction, CatalogueProcessResult } from '@/lib/actions/catalogue';
import { Upload, FileText, Image as ImageIcon, Video, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminCataloguePage() {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'IDLE' | 'PROCESSING' | 'COMPLETED'>('IDLE');
  const [result, setResult] = useState<CatalogueProcessResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setStep('PROCESSING');
    startTransition(async () => {
      const res = await processCatalogueUploadAction(file.name, file.type, file.size);
      setResult(res);
      setStep('COMPLETED');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="bg-purple-950 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">AI Catalogue Ingestion Pipeline</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Upload raw catalogues in PDF, Image, or Video format. Sareethi AI extracts garments, groups photos, extracts attributes & prices, and creates products automatically.
            </p>
          </div>

          <span className="bg-purple-900 border border-purple-700 text-purple-200 font-mono text-[11px] px-3 py-1.5 rounded-full font-bold">
            No CSV / Excel Required
          </span>
        </div>

        {/* Upload Dropzone Container */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Upload Catalogue File
          </h2>

          {step === 'IDLE' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-purple-200 bg-purple-50/30 rounded-2xl p-8 text-center hover:bg-purple-50/60 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,image/*,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-12 h-12 text-purple-950 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-900">
                  {file ? file.name : 'Drag & drop catalogue PDF, Images, or Video here'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported: <span className="font-bold text-purple-950">PDF, JPG, PNG, MP4, MOV</span> (Max 100MB)
                </p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-4 text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-purple-950" /> PDF Catalogues</span>
                  <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4 text-purple-950" /> High-res Images</span>
                  <span className="flex items-center gap-1"><Video className="w-4 h-4 text-purple-950" /> Catalogue Video Clips</span>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || isPending}
                  className="px-6 py-3 bg-purple-950 text-white font-bold rounded-xl hover:bg-purple-900 shadow-md disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  START INGESTION <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-950 rounded-full animate-spin mx-auto" />
              <h3 className="font-serif text-xl font-bold text-gray-900">Processing Catalogue...</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Running 12-step pipeline: Content Chunking $\rightarrow$ Product Segmentation $\rightarrow$ Image Grouping $\rightarrow$ Attribute Extraction $\rightarrow$ Price Lookup.
              </p>
            </div>
          )}

          {step === 'COMPLETED' && result && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">Catalogue Ingestion Completed!</h3>
                    <p className="text-xs text-emerald-700">Workflow: <span className="font-mono">{result.workflowId}</span> • File: {result.fileName}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setStep('IDLE'); setFile(null); setResult(null); }}
                  className="px-4 py-2 bg-white text-emerald-900 border border-emerald-300 font-bold text-xs rounded-lg hover:bg-emerald-100"
                >
                  Upload Another
                </button>
              </div>

              {/* Extracted Product Candidates Review Gallery */}
              <div className="space-y-4">
                <h3 className="font-serif text-base font-bold text-gray-900">Extracted Product Candidates ({result.extractedProducts.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.extractedProducts.map((prod) => (
                    <div key={prod.tempId} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between">
                      <div className="relative aspect-[3/4] bg-gray-50">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-purple-950 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          {prod.suggestedSku}
                        </span>
                        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                          prod.status === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {prod.status === 'ACTIVE' ? 'Auto-Published' : 'Needs Review'}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2">{prod.name}</h4>
                        
                        <div className="text-[11px] space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <p><span className="font-semibold text-gray-700">Category:</span> {prod.category}</p>
                          <p><span className="font-semibold text-gray-700">Fabric:</span> {prod.attributes.fabric}</p>
                          <p><span className="font-semibold text-gray-700">Color:</span> {prod.attributes.color}</p>
                          <p className="flex items-center justify-between pt-1 border-t border-gray-200">
                            <span className="font-bold text-gray-900">Final Price:</span>
                            <span className="font-bold text-purple-950 text-sm">₹{prod.finalPrice}</span>
                          </p>
                          {prod.fallbackPriceUsed && (
                            <span className="text-[9px] text-amber-700 font-semibold block">⚠️ Catalogue price missing → Owner fallback applied</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                          <span>AI Confidence:</span>
                          <span className="font-bold text-emerald-600">{Math.round(prod.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <Link
                  href="/admin/store"
                  className="px-6 py-3 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 shadow-md"
                >
                  View In Admin Store
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
