import { useState, useMemo } from 'react';
import { useUser } from '@/hooks/useAuth';
import { useSharedWithMe } from '@/hooks/useShare';
import { useFiles } from '@/hooks/useFileUpload';
import { downloadFileBlob } from '@/api/fileupload.api';
import {
  Database,
  FileText,
  Loader2,
  Folder,
  MoreVertical,
  Download,
  Eye,
  ChevronRight,
  Users,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function SharedPage() {
  const { data: userData, isLoading: userLoading } = useUser();
  const { data: sharedItems, isLoading: sharedLoading } = useSharedWithMe();

  // For navigating inside shared folders
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [pathStack, setPathStack] = useState<
    { id: string | null; name: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Active permissions for the currently viewed shared folder
  const [activePermissions, setActivePermissions] = useState<string[]>([]);

  // Fetch items when navigating inside a shared folder
  const { fetchItems } = useFiles(currentFolderId);

  // Determine what to show
  const isInsideSharedFolder = currentFolderId !== null;

  const resolveItemName = (item: any) =>
    item.itemName || item.name || 'Untitled_Asset';

  // Items to render based on context
  const itemsToRender = useMemo(() => {
    if (isInsideSharedFolder && fetchItems.data) {
      // Inside a shared folder — show its contents
      return fetchItems.data.filter((item: any) =>
        resolveItemName(item).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (!sharedItems) return [];

    // Root view — show all shared items
    return sharedItems.filter((s) =>
      s.item
        ? resolveItemName(s.item)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : false,
    );
  }, [sharedItems, fetchItems.data, isInsideSharedFolder, searchQuery]);

  const handleNavigateIntoFolder = (
    folderId: string,
    folderName: string,
    permissions: string[],
  ) => {
    if (!permissions.includes('read')) {
      toast.error('You do not have read access to this folder');
      return;
    }
    setPathStack((prev) => [...prev, { id: folderId, name: folderName }]);
    setCurrentFolderId(folderId);
    setActivePermissions(permissions);
    setSearchQuery('');
    setActiveMenu(null);
  };

  const handleBreadcrumbClick = (idx: number) => {
    if (idx < 0) {
      // Go back to shared root
      setPathStack([]);
      setCurrentFolderId(null);
      setActivePermissions([]);
    } else {
      setPathStack((prev) => prev.slice(0, idx + 1));
      setCurrentFolderId(pathStack[idx].id);
    }
    setSearchQuery('');
    setActiveMenu(null);
  };

  const handleDownload = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const itemName = resolveItemName(item);

    if (item.fileUrl) {
      try {
        await downloadFileBlob(item.fileUrl, itemName);
        toast.success(`${itemName} downloaded successfully`);
      } catch {
        toast.error('Download failed');
      }
    }
    setActiveMenu(null);
  };

  const handleItemClick = (item: any, permissions: string[]) => {
    const isFolder = !item.fileUrl && !item.key;
    const itemId = item._id || item.id;

    if (isFolder) {
      handleNavigateIntoFolder(itemId, resolveItemName(item), permissions);
    } else if (item.fileUrl) {
      if (permissions.includes('read')) {
        window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('You do not have read access to this file');
      }
    }
  };

  if (userLoading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020202]">
        <Loader2 className="animate-spin text-sky-500 size-10" />
      </div>
    );

  return (
    <div className="h-screen bg-[#020202] text-slate-300 overflow-hidden flex flex-col font-sans select-none">
      <main className="max-w-7xl mx-auto w-full h-full px-10 py-6 flex flex-col relative z-10">
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div className="flex items-center gap-5">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-lg">
              <Users size={20} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-light text-white tracking-[0.3em] uppercase leading-tight">
                Shared_Access
              </h1>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                NODE_STATION: {userData?.data?.user?.name || 'anonymous'}
              </p>
            </div>
          </div>
          <input
            type="text"
            placeholder="FILTER_SHARED_NODES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-mono focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </header>

        <section className="flex-1 min-h-0 flex gap-6">
          <motion.div className="flex-1 rounded-[2.5rem] border border-white/5 bg-[#050505]/40 backdrop-blur-3xl flex flex-col overflow-hidden shadow-2xl">
            {/* Breadcrumb */}
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-2xl">
                <button
                  onClick={() => handleBreadcrumbClick(-1)}
                  className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-md transition-all ${
                    pathStack.length === 0
                      ? 'text-violet-400 bg-violet-400/10'
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Shared
                </button>
                {pathStack.map((crumb, idx) => (
                  <div key={idx} className="flex items-center shrink-0">
                    <ChevronRight size={12} className="text-slate-700 mx-0.5" />
                    <button
                      onClick={() => handleBreadcrumbClick(idx)}
                      className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-md transition-all ${
                        idx === pathStack.length - 1
                          ? 'text-violet-400 bg-violet-400/10'
                          : 'text-slate-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </div>

              {isInsideSharedFolder && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {activePermissions.map((p) => (
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
                  <button
                    onClick={() => handleBreadcrumbClick(-1)}
                    className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft size={12} />
                    <span className="text-[9px] font-mono uppercase tracking-wider">
                      Back
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {(sharedLoading && !isInsideSharedFolder) ||
              (fetchItems.isFetching && isInsideSharedFolder) ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <Loader2 className="animate-spin text-violet-500 mb-2" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    Syncing_Shared_Nodes...
                  </span>
                </div>
              ) : itemsToRender.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <Users size={40} className="text-slate-600 mb-3" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                    {isInsideSharedFolder
                      ? 'Folder_Empty'
                      : 'No_Shared_Items_Found'}
                  </span>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {itemsToRender.map((entry: any) => {
                    // In root view, entry is a SharedItem wrapper; inside folder, entry is direct item
                    const item = isInsideSharedFolder ? entry : entry.item;
                    const permissions = isInsideSharedFolder
                      ? activePermissions
                      : entry.permissions;
                    const sharedBy = isInsideSharedFolder
                      ? null
                      : entry.sharedBy;
                    const itemId = item?._id || item?.id;

                    if (!item) return null;

                    const isFolder = !item.fileUrl && !item.key;

                    return (
                      <motion.div
                        key={itemId}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleItemClick(item, permissions)}
                        className="group flex items-center justify-between p-3.5 border rounded-xl transition-all cursor-pointer bg-white/[0.02] border-white/5 hover:border-white/10"
                      >
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          <div
                            className={`p-2.5 rounded-lg border border-white/5 ${
                              isFolder
                                ? 'text-amber-500 bg-amber-500/5'
                                : 'text-slate-500 bg-black/40'
                            }`}
                          >
                            {isFolder ? (
                              <Folder
                                size={16}
                                fill="currentColor"
                                className="fill-amber-500/10"
                              />
                            ) : (
                              <FileText size={16} />
                            )}
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs font-light text-slate-200 truncate tracking-wide">
                              {resolveItemName(item)}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                                {isFolder ? 'DIRECTORY_NODE' : 'ASSET_DATA'}
                              </span>
                              {sharedBy && (
                                <span className="text-[7px] font-mono text-violet-400/60 uppercase tracking-widest">
                                  from: {sharedBy.name || sharedBy.email}
                                </span>
                              )}
                            </div>
                            {/* Permission badges */}
                            {!isInsideSharedFolder && (
                              <div className="flex gap-1 mt-1">
                                {permissions.map((p: string) => (
                                  <span
                                    key={p}
                                    className={`text-[6px] font-bold uppercase tracking-wider px-1 py-0.5 rounded ${
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
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {!isFolder && item.fileUrl && (
                          <div
                            className="relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setActiveMenu(
                                  activeMenu === itemId ? null : itemId,
                                )
                              }
                              className="p-2 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {activeMenu === itemId && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveMenu(null)}
                                />
                                <div className="absolute right-0 mt-2 w-44 bg-[#0c0c0c] border border-white/10 rounded-xl p-1 shadow-2xl z-50 backdrop-blur-xl">
                                  {permissions.includes('read') && (
                                    <button
                                      onClick={() =>
                                        window.open(item.fileUrl, '_blank')
                                      }
                                      className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/5 rounded-lg font-mono uppercase"
                                    >
                                      <Eye size={12} /> View
                                    </button>
                                  )}
                                  {permissions.includes('read') && (
                                    <button
                                      onClick={(e) => handleDownload(e, item)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/5 rounded-lg font-mono uppercase"
                                    >
                                      <Download size={12} /> Download
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
