import React, { useState } from 'react';
import { Listing, UserProfile, UserWarning } from '../types';
import { PREDEFINED_ACCOUNTS } from '../data/predefinedUsers';
import { 
  ShieldAlert, 
  X, 
  Trash2, 
  AlertTriangle, 
  UserX, 
  UserCheck, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Info,
  Building,
  Tag
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  listings: Listing[];
  userModeration: Record<string, { userId: string; isSuspended: boolean; warnings: UserWarning[] }>;
  removalLogs?: { id: string; listingId: string; listingTitle: string; sellerId: string; reason?: string; timestamp: string; adminName: string }[];
  onRemoveListing: (listingId: string, reason?: string) => void;
  onWarnUser: (userId: string, reason: string) => void;
  onSuspendUser: (userId: string, suspended: boolean, reason?: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  listings,
  userModeration,
  removalLogs = [],
  onRemoveListing,
  onWarnUser,
  onSuspendUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'logs'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state for removing item
  const [selectedListingToRemove, setSelectedListingToRemove] = useState<Listing | null>(null);
  const [removalReason, setRemovalReason] = useState('');

  // Dialog state for warning user
  const [selectedUserToWarn, setSelectedUserToWarn] = useState<string | null>(null);
  const [warnReason, setWarnReason] = useState('');

  // Dialog state for suspending user
  const [selectedUserToSuspend, setSelectedUserToSuspend] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Success toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmRemoval = () => {
    if (!selectedListingToRemove) return;
    onRemoveListing(selectedListingToRemove.id, removalReason.trim() || undefined);
    showToast(`Removed "${selectedListingToRemove.title}" ${removalReason.trim() ? 'with notice' : 'without explanation'}`);
    setSelectedListingToRemove(null);
    setRemovalReason('');
  };

  const handleConfirmWarning = () => {
    if (!selectedUserToWarn || !warnReason.trim()) return;
    onWarnUser(selectedUserToWarn, warnReason.trim());
    showToast(`Issued warning to user: "${warnReason.trim()}"`);
    setSelectedUserToWarn(null);
    setWarnReason('');
  };

  const handleConfirmSuspension = (suspend: boolean) => {
    if (!selectedUserToSuspend) return;
    onSuspendUser(selectedUserToSuspend, suspend, suspendReason.trim() || undefined);
    showToast(`${suspend ? 'Suspended' : 'Reactivated'} user account`);
    setSelectedUserToSuspend(null);
    setSuspendReason('');
  };

  // Student accounts excluding admin
  const studentAccounts = PREDEFINED_ACCOUNTS.filter(acc => !acc.isAdmin);

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-[#4F46E5] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Campus Moderator & Proctor Panel</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/25 text-white uppercase tracking-wider">
                  Admin Privileges
                </span>
              </h2>
              <p className="text-xs text-indigo-100 font-medium">
                Chief Proctor Office · UIET Kurukshetra University
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="px-6 py-2.5 bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Student Accounts & Sanctions</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'listings'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Manage Listings ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Moderation Audit Logs ({removalLogs.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: USERS & SANCTIONS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-white">
                    Campus Students & Reputation Control
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Issue proctorial warnings or suspend students from trading on the platform.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {studentAccounts.map((student) => {
                  const mod = userModeration[student.id] || { isSuspended: false, warnings: [] };
                  const isSuspended = mod.isSuspended;
                  const warningsCount = mod.warnings?.length || 0;

                  return (
                    <div
                      key={student.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSuspended
                          ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-[#0F172A] dark:text-white">
                              {student.fullName}
                            </span>
                            {isSuspended ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                                Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                            {student.course} · {student.hostelName} ({student.roomNumber})
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                            Phone: {student.phone} · Roll: {student.rollNumber}
                          </span>
                        </div>
                      </div>

                      {/* Warnings Display */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className={`w-3.5 h-3.5 ${warningsCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span className={warningsCount > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>
                            {warningsCount} Official Warning{warningsCount === 1 ? '' : 's'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserToWarn(student.id);
                              setWarnReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                          >
                            Warn
                          </button>

                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserToSuspend(student.id);
                                setSuspendReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Reactivate</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserToSuspend(student.id);
                                setSuspendReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Suspend</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Warning Notes if any */}
                      {mod.warnings && mod.warnings.length > 0 && (
                        <div className="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                          <span className="font-bold block">Recent Sanction Note:</span>
                          <p className="italic">"{mod.warnings[mod.warnings.length - 1].reason}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE LISTINGS */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search listings by title, seller, or category..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                  {filteredListings.length} items
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-[#0F172A] dark:text-white truncate">
                          {listing.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold shrink-0">
                          {listing.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-black font-mono text-purple-600 dark:text-cyan-400">
                          ₹{listing.price}
                        </span>
                        <span>•</span>
                        <span>Seller: {listing.sellerName} ({listing.hostelName})</span>
                        <span>•</span>
                        <span className="font-mono">{listing.createdAt}</span>
                      </div>
                    </div>

                    {/* Admin Remove Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedListingToRemove(listing);
                        setRemovalReason('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-transform active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Item</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT & REMOVAL LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-white">
                  Proctorial Removal & Moderation Log
                </h3>
                <span className="text-xs text-slate-400">Chronological Record</span>
              </div>

              {removalLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No products have been removed yet. All campus listings are in compliance.
                </div>
              ) : (
                <div className="space-y-2">
                  {removalLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Removed: {log.listingTitle}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        <strong>Reason provided:</strong>{' '}
                        {log.reason ? `"${log.reason}"` : <span className="italic text-slate-400">None (Removed without explanation)</span>}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Actioned by: {log.adminName} · Seller ID: {log.sellerId}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* DIALOG: REMOVE LISTING (WITH COMPLETELY OPTIONAL EXPLANATION) */}
        {selectedListingToRemove && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-[#0F172A] dark:text-white">
                    Remove Listing from Marketplace
                  </h4>
                  <p className="text-xs text-slate-500">
                    "{selectedListingToRemove.title}"
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Optional Reason Policy</span>
                </div>
                <p className="leading-relaxed">
                  Mentioning why an item is getting removed is <strong>completely optional</strong>. Products can be removed without any explanation as needed.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                  Explanation / Message for Seller (Optional):
                </label>
                <textarea
                  rows={3}
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  placeholder="e.g. Inappropriate item, misleading price, duplicate spam... (or leave blank to remove with no message)"
                  className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedListingToRemove(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemoval}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm & Remove</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIALOG: ISSUE WARNING */}
        {selectedUserToWarn && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-[#0F172A] dark:text-white">
                    Issue Proctorial Warning
                  </h4>
                  <p className="text-xs text-slate-500">
                    Warning will be saved to the student profile record.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                  Reason for Warning:
                </label>
                <textarea
                  rows={3}
                  required
                  value={warnReason}
                  onChange={(e) => setWarnReason(e.target.value)}
                  placeholder="e.g. Unresponsive to verified exchange meeting, spamming listing titles, false condition ratings..."
                  className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserToWarn(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!warnReason.trim()}
                  onClick={handleConfirmWarning}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Issue Warning</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIALOG: SUSPEND USER */}
        {selectedUserToSuspend && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
              {(() => {
                const isCurrentlySuspended = userModeration[selectedUserToSuspend]?.isSuspended;
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${isCurrentlySuspended ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} shrink-0`}>
                        {isCurrentlySuspended ? <UserCheck className="w-6 h-6" /> : <UserX className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-black text-base text-[#0F172A] dark:text-white">
                          {isCurrentlySuspended ? 'Reactivate Student Account' : 'Suspend Student Account'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {isCurrentlySuspended 
                            ? 'Lifting suspension restores listing & marketplace privileges.' 
                            : 'Suspended students cannot post listings or message on campus.'}
                        </p>
                      </div>
                    </div>

                    {!isCurrentlySuspended && (
                      <>
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-300">
                          <p className="leading-snug">
                            When suspended, the student screen will be <strong>blocked</strong> upon login with: <em>"YOU WERE SUSPENDED , PLEASE CONTACT ADMIN"</em> and they can opt to contact admin via WhatsApp.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                            Reason for Suspension (Optional):
                          </label>
                          <input
                            type="text"
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="e.g. Multiple severe policy breaches, fraudulent listings"
                            className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserToSuspend(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmSuspension(!isCurrentlySuspended)}
                        className={`px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 ${
                          isCurrentlySuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {isCurrentlySuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        <span>{isCurrentlySuspended ? 'Confirm Reactivation' : 'Confirm Suspension'}</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
