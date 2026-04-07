import { useState, useEffect, useRef } from 'react';
import {
  useShareItem,
  useSharesForItem,
  useRevokeShare,
} from '@/hooks/useShare';
import { searchUsers, SearchedUser } from '@/api/share.api';
import {
  X,
  Share2,
  Loader2,
  UserPlus,
  Trash2,
  Shield,
  Search,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  itemType: 'file' | 'folder';
}

const PERMISSION_OPTIONS = [
  {
    key: 'read',
    label: 'Read',
    description: 'View and download',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    key: 'create',
    label: 'Create',
    description: 'Add files and folders',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    key: 'delete',
    label: 'Delete',
    description: 'Remove items',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
];

export default function ShareDialog({
  isOpen,
  onClose,
  itemId,
  itemName,
  itemType,
}: ShareDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'read',
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareMutation = useShareItem();
  const revokeMutation = useRevokeShare();
  const { data: existingShares, isLoading: sharesLoading } = useSharesForItem(
    isOpen ? itemId : null,
    itemType,
  );

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Don't search if a user is already selected and the query matches
    if (selectedUser && searchQuery === selectedUser.email) {
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery.trim());
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, selectedUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user: SearchedUser) => {
    setSelectedUser(user);
    setSearchQuery(user.email);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    searchInputRef.current?.focus();
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleShare = () => {
    const emailToShare = selectedUser?.email || searchQuery.trim();
    if (!emailToShare || selectedPermissions.length === 0) return;

    const payload: any = {
      email: emailToShare,
      permissions: selectedPermissions,
    };

    if (itemType === 'file') payload.fileId = itemId;
    else payload.folderId = itemId;

    shareMutation.mutate(payload, {
      onSuccess: () => {
        setSearchQuery('');
        setSelectedUser(null);
        setSelectedPermissions(['read']);
        setSearchResults([]);
      },
    });
  };

  const handleRevoke = (shareId: string) => {
    if (!window.confirm('Revoke access for this user?')) return;
    revokeMutation.mutate(shareId);
  };

  if (!isOpen) return null;

  const emailToShare = selectedUser?.email || searchQuery.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101]"
          >
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                    <Share2 size={16} className="text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-wide">
                      Share Access
                    </h2>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5 truncate max-w-[200px]">
                      {itemName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              {/* Share Form */}
              <div className="px-6 py-5 space-y-4">
                {/* User Search Input */}
                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 block">
                    Search_User
                  </label>
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10"
                    />
                    {/* Selected user chip or search input */}
                    {selectedUser ? (
                      <div className="w-full bg-white/5 border border-sky-500/30 rounded-xl pl-9 pr-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-sky-400">
                              {selectedUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-white font-medium truncate">
                              {selectedUser.name}
                            </p>
                            <p className="text-[8px] font-mono text-slate-500 truncate">
                              {selectedUser.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleClearSelection}
                          className="p-1 hover:bg-white/10 rounded-md transition-colors shrink-0"
                        >
                          <X size={12} className="text-slate-400" />
                        </button>
                      </div>
                    ) : (
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (searchResults.length > 0) setShowDropdown(true);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                        placeholder="Search by name or email..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors"
                      />
                    )}

                    {/* Loading spinner */}
                    {isSearching && !selectedUser && (
                      <Loader2
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 animate-spin"
                      />
                    )}

                    {/* Search Results Dropdown */}
                    {showDropdown && !selectedUser && (
                      <div
                        ref={dropdownRef}
                        className="absolute left-0 right-0 top-full mt-1.5 bg-[#0c0c0c] border border-white/10 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                      >
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                          {searchResults.map((user) => (
                            <button
                              key={user._id}
                              onClick={() => handleSelectUser(user)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/[0.03] last:border-0"
                            >
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
                                <User size={14} className="text-sky-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-white font-medium truncate">
                                  {user.name}
                                </p>
                                <p className="text-[9px] font-mono text-slate-500 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results message */}
                    {showDropdown === false &&
                      searchQuery.trim().length > 0 &&
                      !isSearching &&
                      searchResults.length === 0 &&
                      !selectedUser && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0c0c0c] border border-white/10 rounded-xl p-4 z-50">
                          <p className="text-[10px] font-mono text-slate-500 text-center">
                            No users found — will try exact email on share
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Permission Toggles */}
                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 block">
                    Permission_Grants
                  </label>
                  <div className="flex gap-2">
                    {PERMISSION_OPTIONS.map((perm) => {
                      const isActive = selectedPermissions.includes(perm.key);
                      return (
                        <button
                          key={perm.key}
                          onClick={() => togglePermission(perm.key)}
                          className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                            isActive
                              ? `${perm.bg} border-current ${perm.color}`
                              : 'border-white/5 text-slate-500 hover:border-white/10'
                          }`}
                        >
                          <Shield size={14} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">
                            {perm.label}
                          </span>
                          <span className="text-[7px] font-mono opacity-60">
                            {perm.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  disabled={
                    !emailToShare ||
                    selectedPermissions.length === 0 ||
                    shareMutation.isPending
                  }
                  className={`w-full h-11 rounded-xl font-bold text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all ${
                    emailToShare &&
                    selectedPermissions.length > 0 &&
                    !shareMutation.isPending
                      ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-sky-400 active:scale-[0.98]'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  {shareMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Grant_Access</span>
                    </>
                  )}
                </button>
              </div>

              {/* Existing Shares */}
              <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3 block">
                  Active_Access_Grants
                </label>

                {sharesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2
                      size={16}
                      className="animate-spin text-slate-500"
                    />
                  </div>
                ) : existingShares && existingShares.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {existingShares.map((share) => (
                      <div
                        key={share._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-violet-400">
                              {(
                                share.recipient?.name ||
                                share.recipient?.email ||
                                '?'
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-200 truncate font-medium">
                              {share.recipient?.name || share.recipient?.email}
                            </p>
                            <p className="text-[8px] font-mono text-slate-500 mt-0.5 truncate">
                              {share.recipient?.email}
                            </p>
                            <div className="flex gap-1.5 mt-1.5">
                              {share.permissions.map((p) => (
                                <span
                                  key={p}
                                  className={`text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                    p === 'read'
                                      ? 'text-sky-400 bg-sky-400/10'
                                      : p === 'create'
                                        ? 'text-emerald-400 bg-emerald-400/10'
                                        : 'text-rose-400 bg-rose-400/10'
                                  }`}
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevoke(share._id)}
                          disabled={revokeMutation.isPending}
                          className="p-2 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {revokeMutation.isPending ? (
                            <Loader2
                              size={12}
                              className="animate-spin text-slate-500"
                            />
                          ) : (
                            <Trash2 size={12} className="text-rose-400" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-600 font-mono text-center py-3">
                    No active shares
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
