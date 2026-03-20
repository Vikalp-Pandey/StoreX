import { useState, useRef } from 'react';
import { useFiles } from '@/hooks/useFileUpload';
import {
  Upload,
  X,
  File,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUpload({
  parentFolderId,
}: {
  parentFolderId: string | null;
}) {
  const { fileUpload } = useFiles(parentFolderId);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    fileUpload.mutate(
      { file, parentFolder: parentFolderId || undefined },
      {
        onSuccess: () => setFile(null),
      },
    );
  };
  console.log(parentFolderId);

  return (
    <div className="w-full space-y-4">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-sky-400 tracking-widest uppercase">
          Asset_Ingestion_Unit
        </span>
        {file && !fileUpload.isPending && (
          <button
            onClick={() => setFile(null)}
            className="text-slate-500 hover:text-rose-500 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* DROP ZONE / PREVIEW AREA */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
          dragActive
            ? 'border-sky-500 bg-sky-500/10'
            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
        } ${file ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-center"
            >
              <div className="bg-sky-500/10 p-3 rounded-full mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                <Upload size={20} className="text-sky-400" />
              </div>
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-tighter">
                Click or drag asset to ingest
              </p>
              <p className="text-[9px] font-mono text-slate-500 mt-1">
                MAX_SIZE: 50MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file-info"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="bg-emerald-500/20 p-3 rounded-2xl mb-3">
                <File size={24} className="text-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-100 font-mono truncate max-w-[200px] mb-1">
                {file.name}
              </p>
              <p className="text-[9px] text-slate-500 font-mono">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ACTION BUTTON */}
      <button
        onClick={handleUpload}
        disabled={!file || fileUpload.isPending}
        className={`w-full h-11 rounded-xl font-bold text-[10px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 ${
          file && !fileUpload.isPending
            ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-sky-400'
            : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
        }`}
      >
        {fileUpload.isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Uploading_To_Node...</span>
          </>
        ) : fileUpload.isError ? (
          <>
            <AlertCircle size={14} className="text-rose-400" />
            <span>Upload_Failed</span>
          </>
        ) : (
          <>
            <span>Initialize_Transfer</span>
          </>
        )}
      </button>

      {/* HELPER FOOTER */}
      <div className="flex items-center gap-2 px-1">
        <div
          className={`h-1.5 w-1.5 rounded-full ${fileUpload.isPending ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}
        />
        <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
          {fileUpload.isPending ? 'Data_Streaming_Active' : 'Ingest_Unit_Idle'}
        </span>
      </div>
    </div>
  );
}
