import React, { useEffect, useState } from 'react';
import { Listing } from '../types';
import { ItemVisual } from './ItemVisual';
import { X, ZoomIn, ZoomOut, RotateCcw, Tag, MapPin, Maximize2 } from 'lucide-react';

interface ImageMaximizeModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageMaximizeModal: React.FC<ImageMaximizeModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Reset zoom whenever a new image opens
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
    }
  }, [isOpen, listing]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !listing) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container */}
      <div 
        className="relative w-full max-w-4xl h-full max-h-[95vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Controls Bar */}
        <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 text-white z-20 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-[#4F46E5] dark:bg-cyan-500 flex items-center justify-center text-white dark:text-slate-950 shrink-0">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black truncate">{listing.title}</h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>₹{listing.price.toLocaleString('en-IN')}</span>
                <span>•</span>
                <span>{listing.condition}</span>
                <span>•</span>
                <span className="truncate">{listing.hostelName}</span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {listing.imageUrl && (
              <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.8}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-1 text-slate-400">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 shadow-md ml-1"
              title="Close Full Photo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Canvas - Uncropped 100% Full View */}
        <div className="flex-1 w-full my-3 rounded-2xl overflow-hidden bg-slate-950/70 border border-slate-800/80 flex items-center justify-center p-2 sm:p-6 relative">
          {listing.imageUrl ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                referrerPolicy="no-referrer"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl select-none"
              />
            </div>
          ) : (
            <div className="w-full h-full max-w-lg max-h-[70vh] flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <div className="w-full h-56 rounded-2xl overflow-hidden">
                <ItemVisual
                  title={listing.title}
                  category={listing.category}
                  tags={listing.tags}
                  className="w-full h-full"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Campus Verified Catalog Representation
                </span>
                <p className="text-sm font-semibold text-white">
                  {listing.title}
                </p>
                <p className="text-xs text-slate-400 max-w-md">
                  Seller {listing.sellerName} listed this from {listing.hostelName}, {listing.roomNumber}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Info Bar */}
        <div className="w-full p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Condition: {listing.condition}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{listing.hostelName}</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Full uncropped image inspection · Click outside or Esc to exit
          </span>
        </div>
      </div>
    </div>
  );
};
