import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';

interface FileUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    maxSize?: number; // in MB
    acceptedTypes?: string[];
    maxFiles?: number;
}

export default function FileUploadZone({
    onFilesSelected,
    maxSize = 10,
    acceptedTypes = ['.pdf', '.docx', '.xlsx', '.pptx', '.zip', '.exe', '.txt'],
    maxFiles = 5,
}: FileUploadZoneProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string>('');

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const validateFiles = (files: File[]): { valid: File[]; error?: string } => {
        const maxSizeBytes = maxSize * 1024 * 1024;
        const valid: File[] = [];

        for (const file of files) {
            // Check file size
            if (file.size > maxSizeBytes) {
                return { valid: [], error: `File "${file.name}" exceeds ${maxSize}MB limit` };
            }

            // Check file type
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (acceptedTypes.length > 0 && !acceptedTypes.includes(extension)) {
                return { valid: [], error: `File type "${extension}" is not supported` };
            }

            valid.push(file);
        }

        // Check max files
        if (selectedFiles.length + valid.length > maxFiles) {
            return { valid: [], error: `Maximum ${maxFiles} files allowed` };
        }

        return { valid };
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError('');

        const files = Array.from(e.dataTransfer.files);
        const { valid, error } = validateFiles(files);

        if (error) {
            setError(error);
            return;
        }

        const newFiles = [...selectedFiles, ...valid];
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
    }, [selectedFiles, onFilesSelected, maxFiles, maxSize, acceptedTypes]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setError('');

        if (e.target.files) {
            const files = Array.from(e.target.files);
            const { valid, error } = validateFiles(files);

            if (error) {
                setError(error);
                return;
            }

            const newFiles = [...selectedFiles, ...valid];
            setSelectedFiles(newFiles);
            onFilesSelected(newFiles);
        }
    }, [selectedFiles, onFilesSelected, maxFiles, maxSize, acceptedTypes]);

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-600 hover:border-cyan-500/50 bg-white/5'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={handleChange}
                    className="hidden"
                />

                <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                    <p className="text-white font-semibold mb-2">
                        Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-400">
                        Supports: {acceptedTypes.join(', ')} (Max {maxSize}MB per file)
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Up to {maxFiles} files at once
                    </p>
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-gray-400 font-semibold">
                        Selected Files ({selectedFiles.length})
                    </p>
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <File className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-white truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
