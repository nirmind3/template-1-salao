import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Loader2 } from 'lucide-react';
import { processImageFile } from '../utils/imageUpload';

interface ImageUploadInputProps {
  value: string;
  onChange: (newUrl: string) => void;
  label?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label = 'Foto do Corte',
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const processed = await processImageFile(file, 1200, 0.85);
      setFileName(`${file.name} (~${processed.sizeKb} KB)`);
      onChange(processed.dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao carregar a imagem.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClearImage = () => {
    onChange('');
    setFileName(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDataUrl = value.startsWith('data:image/');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-300">
          {label}
        </label>
        
        {/* Toggle between Upload and URL */}
        <div className="inline-flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-800 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'upload'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Do Computador</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'url'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Link da Web</span>
          </button>
        </div>
      </div>

      {/* Upload from Computer Box */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="cut-image-file-input"
          />

          {!value ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-neutral-700 hover:border-amber-400/60 bg-neutral-900/60 hover:bg-neutral-900'
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                  <span className="text-xs text-amber-300 font-medium">Otimizando imagem do computador...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">
                      Clique para escolher a foto do computador
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      ou arraste e solte o arquivo aqui (JPG, PNG, WebP)
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-[10px] text-amber-300 font-medium border border-neutral-700">
                    Compactação automática em alta definição
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Uploaded Image Preview & Controls */
            <div className="bg-neutral-900/90 border border-neutral-700 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-500/40 bg-neutral-950 shrink-0">
                  <img
                    src={value}
                    alt="Pré-visualização"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Foto carregada com sucesso!</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {fileName || (isDataUrl ? 'Imagem salva do computador' : value)}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium underline mt-1 cursor-pointer"
                  >
                    Trocar foto do computador
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearImage}
                title="Remover foto"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Web URL Mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400"
            />
            {value && (
              <button
                type="button"
                onClick={handleClearImage}
                className="px-2.5 py-2 rounded-lg bg-neutral-800 hover:bg-red-950/50 text-neutral-400 hover:text-red-400 border border-neutral-700 text-xs cursor-pointer"
                title="Limpar link"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {value && !isDataUrl && (
            <div className="flex items-center gap-2 p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
              <img
                src={value}
                alt="Prévia"
                className="w-10 h-10 object-cover rounded-md border border-neutral-700 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[11px] text-neutral-400 truncate">
                Pré-visualização do link da web
              </span>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] text-red-400 font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
