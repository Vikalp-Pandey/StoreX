import { useState, useMemo, useEffect } from 'react';
import { useUser } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFileUpload';
import FileUpload from '@/components/upload/fileupload';
import { downloadFileBlob } from '@/api/fileupload.api';
import {
  Database,
  FileText,
  Loader2,
  Plus,
  FolderPlus,
  Folder,
  Check,
  MoreVertical,
  Download,
  Trash2,
  Edit3,
  ChevronRight,
  HardDrive,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function DashboardPage() {
  const { data: userData, isLoading: userLoading } = useUser();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // States
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pathStack, setPathStack] = useState([{ id: null, name: 'Root' }]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [draft, setDraft] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { fetchItems, folderCreate, fileDelete, folderDelete } =
    useFiles(currentFolderId);

  // Sync server data to local state
  useEffect(() => {
    if (fetchItems.data) {
      setItems(fetchItems.data);
    }
  }, [fetchItems.data]);

  const resolveItemName = (item: any) =>
    item.itemName || item.name || 'Untitled_Asset';

  // Data Filtering
  const filesToRender = useMemo(() => {
    let list = [...items];
    if (draft && draft.parentId === currentFolderId) {
      if (!list.find((i) => (i._id || i.id) === draft.id))
        list = [draft, ...list];
    }
    return list.filter((item) =>
      resolveItemName(item).toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, draft, searchQuery, currentFolderId]);

  // Handlers
  const handleItemClick = (item: any) => {
    const itemId = item._id || item.id;
    if (editingId === itemId || item.isDraft) return;
    const isFolder = !item.fileUrl && !item.key;

    if (isFolder) {
      setPathStack((prev) => [
        ...prev,
        { id: itemId, name: resolveItemName(item) },
      ]);
      setCurrentFolderId(itemId);
      setSearchQuery('');
      setDraft(null);
      setActiveMenu(null);
    } else if (item.fileUrl) {
      window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const isFolder = !item.fileUrl && !item.key;
    const itemName = resolveItemName(item);

    if (isFolder) {
      toast.info(`${itemName} is empty.`);
      return;
    }

    if (item.fileUrl) {
      try {
        await downloadFileBlob(item.fileUrl, itemName);
        toast.success(`${itemName} downloaded successfully`);
      } catch (err) {
        toast.error('Download failed. Check CORS settings.');
      }
    }
    setActiveMenu(null);
  };

  const handleSaveName = (id: string, isDraft: boolean) => {
    if (!editValue.trim()) {
      setEditingId(null);
      setDraft(null);
      return;
    }

    if (isDraft) {
      folderCreate.mutate(
        { name: editValue, parentId: currentFolderId },
        {
          onSuccess: () => {
            setEditingId(null);
            setDraft(null);
            setEditValue('');
            toast.success('Folder created successfully');
          },
        },
      );
    } else {
      setItems((prev) =>
        prev.map((item) =>
          (item._id || item.id) === id
            ? { ...item, itemName: editValue, name: editValue }
            : item,
        ),
      );
      setEditingId(null);
      toast.info('Label updated locally');
    }
  };

  const handleDelete = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const itemId = item._id || item.id;
    if (!window.confirm('Purge this data node?')) return;
    setActiveMenu(null);

    const isFolder = !item.fileUrl && !item.key;

    if (isFolder) {
      folderDelete.mutate({
        folderId: itemId,
        parentFolderId: currentFolderId ?? undefined,
      });
    } else {
      fileDelete.mutate(itemId);
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
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <Database size={20} className="text-sky-400" />
            </div>
            <div>
              <h1 className="text-lg font-light text-white tracking-[0.3em] uppercase leading-tight">
                Registry_OS
              </h1>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                NODE_STATION: {userData?.data?.user?.name || 'anonymous'}
              </p>
            </div>
          </div>
          <input
            type="text"
            placeholder="FILTER_DATA_REGISTRY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-mono focus:outline-none focus:border-sky-500/50 transition-all"
          />
        </header>

        <section className="flex-1 min-h-0 flex gap-6">
          <motion.div className="flex-1 rounded-[2.5rem] border border-white/5 bg-[#050505]/40 backdrop-blur-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-2xl">
                {pathStack.map((crumb, idx) => (
                  <div key={idx} className="flex items-center shrink-0">
                    <button
                      onClick={() => {
                        setPathStack(pathStack.slice(0, idx + 1));
                        setCurrentFolderId(crumb.id as string | null);
                      }}
                      className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-md transition-all ${
                        idx === pathStack.length - 1
                          ? 'text-sky-400 bg-sky-400/10'
                          : 'text-slate-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {crumb.name}
                    </button>
                    {idx < pathStack.length - 1 && (
                      <ChevronRight
                        size={12}
                        className="text-slate-700 mx-0.5"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!draft) {
                      const id = `temp-${Date.now()}`;
                      setDraft({
                        id,
                        name: 'New_Folder',
                        isFolder: true,
                        isDraft: true,
                        parentId: currentFolderId,
                      });
                      setEditingId(id);
                      setEditValue('New_Folder');
                    }
                  }}
                  className="h-10 px-4 rounded-xl bg-amber-500/10 border border-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all"
                >
                  <FolderPlus size={16} />
                </button>
                <div className="relative group/upload">
                  <button className="h-10 px-4 flex items-center gap-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-[9px] tracking-widest uppercase active:scale-95 transition-transform">
                    <Plus size={16} />
                    <span>Ingest</span>
                  </button>
                  <div className="absolute top-full right-0 mt-3 w-80 invisible group-hover/upload:visible opacity-0 group-hover/upload:opacity-100 transition-all z-50">
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-3xl">
                      <FileUpload parentFolderId={currentFolderId} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {fetchItems.isFetching && !fetchItems.isPlaceholderData ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <Loader2 className="animate-spin text-sky-500 mb-2" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    Syncing_Nodes...
                  </span>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filesToRender.map((item) => {
                    const itemId = item._id || item.id;
                    const isFolder =
                      item.isFolder ||
                      item.itemType === 'Folder' ||
                      (!item.fileUrl && !item.key);
                    // Updated Loading Check
                    const isDeleting =
                      (fileDelete.isPending &&
                        fileDelete.variables === itemId) ||
                      (folderDelete.isPending &&
                        folderDelete.variables?.folderId === itemId);

                    return (
                      <motion.div
                        key={itemId}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleItemClick(item)}
                        className={`group flex items-center justify-between p-3.5 border rounded-xl transition-all cursor-pointer ${
                          editingId === itemId
                            ? 'bg-sky-500/5 border-sky-500/40'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        } ${isDeleting ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                      >
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          <div
                            className={`p-2.5 rounded-lg border border-white/5 ${isFolder ? 'text-amber-500 bg-amber-500/5' : 'text-slate-500 bg-black/40'}`}
                          >
                            {isDeleting ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : isFolder ? (
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
                            {editingId === itemId ? (
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  autoFocus
                                  className="bg-black border border-sky-500/40 outline-none text-xs text-white px-2 py-1 rounded-md w-full max-w-[250px] font-mono"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                      handleSaveName(itemId, !!item.isDraft);
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    handleSaveName(itemId, !!item.isDraft)
                                  }
                                >
                                  <Check
                                    size={14}
                                    className="text-emerald-500"
                                  />
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs font-light text-slate-200 truncate tracking-wide">
                                  {resolveItemName(item)}
                                </p>
                                <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                                  {isFolder ? 'DIRECTORY_NODE' : 'ASSET_DATA'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {!item.isDraft && (
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
                                  {item.fileUrl && (
                                    <button
                                      onClick={() =>
                                        window.open(item.fileUrl, '_blank')
                                      }
                                      className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/5 rounded-lg font-mono uppercase"
                                    >
                                      <Eye size={12} /> View
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => handleDownload(e, item)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/5 rounded-lg font-mono uppercase"
                                  >
                                    <Download size={12} /> Download
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(itemId);
                                      setEditValue(resolveItemName(item));
                                      setActiveMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/5 rounded-lg font-mono uppercase"
                                  >
                                    <Edit3 size={12} /> Rename
                                  </button>
                                  <div className="h-px bg-white/5 my-1" />
                                  <button
                                    onClick={(e) => handleDelete(e, item)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-rose-500/10 text-rose-500 rounded-lg font-mono uppercase"
                                  >
                                    <Trash2 size={12} /> Delete
                                  </button>
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
