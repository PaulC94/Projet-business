import React, { useState, useCallback } from 'react';
import type { UploadedFile } from '../types';
import { UploadIcon, FileIcon, CloseIcon } from './Icons';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onRemoveFile: (fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange, onRemoveFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      processFiles(Array.from(selectedFiles));
    }
  }, [onFilesChange]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      processFiles(Array.from(event.dataTransfer.files));
    }
  }, [onFilesChange]);

  const processFiles = (fileList: File[]) => {
    const filePromises: Promise<UploadedFile>[] = fileList.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            resolve({
              name: file.name,
              mimeType: file.type,
              data: e.target.result,
            });
          } else {
            reject(new Error('Failed to read file.'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(onFilesChange).catch(console.error);
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  return (
    <div className="bg-[#2D2E31] p-6 rounded-lg border border-[#3e4042] h-full flex flex-col">
      <h2 className="text-xl font-semibold text-white mb-4">Contexte Documentaire</h2>
      <label
        onDrop={handleDrop}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDragging ? 'border-[#A8C7FA] bg-[#3a3b3e]' : 'border-gray-600 hover:border-gray-500 hover:bg-[#3a3b3e]'}`}
      >
        <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
        <p className="mb-2 text-sm text-gray-400 text-center">
          <span className="font-semibold text-[#A8C7FA]">Cliquez pour téléverser</span> ou glissez-déposez
        </p>
        <p className="text-xs text-gray-500">PDF, TXT, DOCX, etc.</p>
        <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileSelect} accept=".pdf,.txt,.md,.docx,.doc,.csv" />
      </label>

      {files.length > 0 && (
        <div className="mt-6 flex-grow overflow-y-auto">
          <h3 className="text-lg font-medium text-[#E3E3E3] mb-2">Fichiers Chargés</h3>
          <ul className="space-y-2">
            {files.map(file => (
              <li key={file.name} className="flex items-center justify-between bg-[#3a3b3e] p-2 rounded-md">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-[#E3E3E3] truncate" title={file.name}>{file.name}</span>
                </div>
                <button onClick={() => onRemoveFile(file.name)} className="p-1 rounded-full hover:bg-[#4a4b4e] transition-colors">
                  <CloseIcon className="w-4 h-4 text-gray-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
