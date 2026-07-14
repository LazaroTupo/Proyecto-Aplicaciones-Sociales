'use client';

import { forwardRef, InputHTMLAttributes, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, XCircle } from 'lucide-react';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string;
  error?: string;
  onChange: (file: File | null) => void;
  accept?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, error, onChange, accept = 'image/*', className = '', ...props }, ref) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const selectedFile = e.dataTransfer.files[0];
        setFile(selectedFile);
        onChange(selectedFile);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        onChange(selectedFile);
      }
    };

    const removeFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFile(null);
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    const triggerFileSelect = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-gray-200 ml-1">{label}</label>
        
        <div
          className={`
            relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer
            transition-colors duration-300 backdrop-blur-sm
            ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'}
            ${error ? 'border-red-500/50 bg-red-500/5' : ''}
            ${className}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            {...props}
          />
          
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center space-y-2"
              >
                <UploadCloud className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG or PDF</p>
              </motion.div>
            ) : (
              <motion.div
                key="filled"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between w-full p-2 bg-white/10 rounded-lg border border-white/10"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-white truncate max-w-[200px]">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
