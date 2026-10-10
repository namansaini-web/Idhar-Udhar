import React, { useState, useRef } from 'react';
import { CampusRequest, CategoryType, UserProfile } from '../types';
import { 
  X, 
  Bell, 
  Zap, 
  MapPin, 
  Send, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sparkles,
  Trash2
} from 'lucide-react';

interface CreateRequestModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: CampusRequest) => void;
}

// Pre-packaged high-clarity reference illustrations for 1-click photo attachment
const PRESET_REFERENCE_PHOTOS = [
  {
    name: 'Mini Drafter Ref',
    category: 'Academics',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23131720"/><rect x="40" y="30" width="320" height="240" rx="8" fill="%231E2330" stroke="%2300FFFF" stroke-width="2"/><line x1="60" y1="30" x2="60" y2="270" stroke="%23334155" stroke-dasharray="4 4"/><circle cx="150" cy="140" r="30" fill="%230A0A0A" stroke="%2300FFFF" stroke-width="3"/><circle cx="150" cy="140" r="8" fill="%23FF6D00"/><rect x="150" y="136" width="130" height="8" rx="2" fill="%23E2E8F0"/><rect x="150" y="136" width="8" height="100" rx="2" fill="%23E2E8F0"/><text x="200" y="260" fill="%2300FFFF" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">OMEGA MINI DRAFTER + SCALES</text></svg>`
  },
  {
    name: 'Lab Coat Ref',
    category: 'Academics',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23131720"/><path d="M140,50 L90,130 L130,130 L130,250 L270,250 L270,130 L310,130 L260,50 Z" fill="%23F8FAFC" stroke="%2394A3B8" stroke-width="3"/><path d="M140,50 L200,120 L260,50" fill="none" stroke="%2364748B" stroke-width="3"/><rect x="150" y="140" width="35" height="45" rx="3" fill="%23E2E8F0" stroke="%2394A3B8" stroke-width="1.5"/><line x1="162" y1="130" x2="162" y2="150" stroke="%2300FFFF" stroke-width="3"/><text x="200" y="280" fill="%2300FFFF" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">WHITE STUDENT LAB COAT (SIZE 38)</text></svg>`
  },
  {
    name: 'Casio 991EX Ref',
    category: 'Academics',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23131720"/><rect x="120" y="20" width="160" height="260" rx="14" fill="%231E232F" stroke="%23FF6D00" stroke-width="2.5"/><rect x="135" y="55" width="130" height="45" rx="6" fill="%23091B1F" stroke="%2300FFFF" stroke-width="1.5"/><text x="200" y="85" fill="%2300FFFF" font-size="16" font-family="monospace" font-weight="bold" text-anchor="middle">CASIO fx-991EX</text><text x="200" y="270" fill="%23FF6D00" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">EXAM APPROVED CLASSWIZ</text></svg>`
  },
  {
    name: 'Type-C Charger Ref',
    category: 'Electronics',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23131720"/><rect x="70" y="80" width="110" height="110" rx="12" fill="%231E293B" stroke="%2300FFFF" stroke-width="2"/><text x="125" y="145" fill="%2300FFFF" font-size="20" font-family="monospace" font-weight="bold" text-anchor="middle">65W</text><path d="M180,135 C240,135 240,160 300,160" fill="none" stroke="%2394A3B8" stroke-width="6" stroke-linecap="round"/><rect x="300" y="152" width="45" height="16" rx="4" fill="%23FF6D00"/><text x="200" y="260" fill="%2300FFFF" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">TYPE-C FAST CHARGER / ADAPTER</text></svg>`
  }
];

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('Academics');
  const [maxBudget, setMaxBudget] = useState('300');
  const [urgency, setUrgency] = useState<'Urgent (Today)' | 'Needed in 1-2 Days' | 'This Week'>('Urgent (Today)');
  
  // Attached Photo state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setImageError('Please choose an image under 8MB');
        return;
      }
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setImageUrl('');
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const rawBudgetNum = parseInt(maxBudget, 10);
    const numericBudget = isNaN(rawBudgetNum) 
      ? 200 
      : Math.min(10000000, Math.max(0, rawBudgetNum));

    const newRequest: CampusRequest = {
      id: `req-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `Urgent requirement in ${currentUser.hostelName}, ${currentUser.roomNumber}. Contact directly to hand over.`,
      category,
      maxBudget: numericBudget,
      urgency,
      requesterId: currentUser.id,
      requesterName: currentUser.fullName,
      requesterPhone: currentUser.phone,
      collegeId: currentUser.collegeId,
      collegeName: currentUser.collegeName,
      hostelName: currentUser.hostelName,
      roomNumber: currentUser.roomNumber,
      createdAt: 'Just now',
      imageUrl: imageUrl.trim() || undefined,
      status: 'open',
      responsesCount: 0
    };

    onSubmit(newRequest);
    onClose();
  };

  const handleApplySample = (sample: { title: string; category: CategoryType; budget: number; urgency: any; desc: string; presetRefIndex?: number }) => {
    setTitle(sample.title);
    setCategory(sample.category);
    setMaxBudget(sample.budget.toString());
    setUrgency(sample.urgency);
    setDescription(sample.desc);
    if (sample.presetRefIndex !== undefined && PRESET_REFERENCE_PHOTOS[sample.presetRefIndex]) {
      const p = PRESET_REFERENCE_PHOTOS[sample.presetRefIndex];
      setImageUrl(p.dataUrl);
      setImageFileName(`${p.name}.svg`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto space-y-5 select-none transition-colors duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-xs text-orange-600 dark:text-orange-400 font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Targeted Hostel Alert System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] dark:text-white">
            "Request Daalna" Broadcast
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Need an item urgently? Attach a photo reference and broadcast push notifications to students in your hostel wing.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
            Popular Exam / Lab Emergencies (with reference photo):
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleApplySample({
                title: 'Need Mini Drafter for ED Lab Exam tomorrow morning!',
                category: 'Academics',
                budget: 350,
                urgency: 'Urgent (Today)',
                desc: 'My drafter arm is loose. Need a working mini drafter with scales before 9 AM tomorrow. Can pick up from any room tonight!',
                presetRefIndex: 0
              })}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer shadow-xs"
            >
              + Mini Drafter + Photo
            </button>
            <button
              type="button"
              onClick={() => handleApplySample({
                title: 'Looking for 1st Year Chemistry Lab Coat for Wednesday',
                category: 'Academics',
                budget: 200,
                urgency: 'Needed in 1-2 Days',
                desc: 'Medium size lab coat required for 2 hours lab session. Will return washed or buy.',
                presetRefIndex: 1
              })}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer shadow-xs"
            >
              + Lab Coat + Photo
            </button>
            <button
              type="button"
              onClick={() => handleApplySample({
                title: 'Need 65W Laptop Type-C Charger for 3 hours',
                category: 'Electronics',
                budget: 100,
                urgency: 'Urgent (Today)',
                desc: 'Left charger at department lab. Need for emergency battery charge in the hostel.',
                presetRefIndex: 3
              })}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer shadow-xs"
            >
              + Type-C Charger + Photo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Urgency Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Urgent (Today)', value: 'Urgent (Today)' as const },
                { label: 'In 1-2 Days', value: 'Needed in 1-2 Days' as const },
                { label: 'This Week', value: 'This Week' as const }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUrgency(opt.value)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    urgency === opt.value
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Request Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Item Needed *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Engineering Drafter, White Lab Coat, Casio 991EX"
              className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {/* Category & Max Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="Academics">Academics</option>
                <option value="Electronics">Electronics</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>Max Budget (₹)</span>
                <span className="text-[9px] text-slate-400 font-normal">Max ₹1 Cr</span>
              </label>
              <input
                type="number"
                min="0"
                max="10000000"
                value={maxBudget}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val || parseInt(val, 10) <= 10000000) {
                    setMaxBudget(val);
                  }
                }}
                placeholder="300"
                className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 font-mono"
              />
            </div>
          </div>

          {/* ATTACH PHOTO SECTION */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Attach Reference Photo (Optional)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!imageUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-5 px-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 hover:bg-orange-50/50 dark:hover:bg-slate-800/80 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-orange-500 shadow-xs group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block">
                    Upload photo or camera shot
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    PNG, JPG, or SVG up to 8MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-orange-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 p-2 flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                  <img
                    src={imageUrl}
                    alt="Attached preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block">
                    {imageFileName || 'reference-photo.jpg'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" />
                    <span>Photo attached</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {imageError && (
              <p className="text-xs text-rose-500 font-semibold mt-1.5">{imageError}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Specific Instructions / Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Need for 2nd year practicals tomorrow. Can return by evening."
              className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 resize-none"
            />
          </div>

          {/* Bottom Broadcast CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Request to Hostel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
