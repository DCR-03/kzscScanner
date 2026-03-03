"use client";

import { useRef, useState } from "react";

interface ImageCaptureProps {
  onCapture: (base64: string, mimeType: string) => void;
  disabled?: boolean;
}

export default function ImageCapture({ onCapture, disabled }: ImageCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      // Extract base64 data (strip the data:...;base64, prefix)
      const base64 = dataUrl.split(",")[1];
      onCapture(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Preview */}
      {preview && (
        <div className="w-full rounded-lg overflow-hidden border border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Captured CD" className="w-full h-auto" />
        </div>
      )}

      {/* Buttons */}
      {!disabled && (
        <div className="flex gap-3 w-full">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Take Photo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Upload File
          </button>
        </div>
      )}

      {!preview && !disabled && (
        <p className="text-xs text-zinc-500 text-center">
          Take a photo or upload an image of a CD cover, spine, back, or disc
        </p>
      )}
    </div>
  );
}
