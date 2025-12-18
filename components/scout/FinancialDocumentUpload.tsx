"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
    id: string;
    file: File;
    status: "pending" | "uploading" | "processing" | "completed" | "error";
    progress: number;
    error?: string;
}

export default function FinancialDocumentUpload() {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) => ({
            id: Math.random().toString(36).substring(7),
            file,
            status: "pending" as const,
            progress: 0,
        }));
        setFiles((prev) => [...prev, ...newFiles]);

        // Auto-upload files
        newFiles.forEach((uploadFile) => {
            uploadDocument(uploadFile.id, uploadFile.file);
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "text/csv": [".csv"],
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const uploadDocument = async (fileId: string, file: File) => {
        try {
            // Update status to uploading
            setFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" } : f))
            );

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/scout/upload-financial-document", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();

            // Update to processing
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileId ? { ...f, status: "processing", progress: 50 } : f
                )
            );

            // Poll for processing status
            pollProcessingStatus(fileId, data.documentId);
        } catch (error) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileId
                        ? { ...f, status: "error", error: "Upload failed" }
                        : f
                )
            );
        }
    };

    const pollProcessingStatus = async (fileId: string, documentId: string) => {
        const maxAttempts = 30;
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await fetch(
                    `/api/scout/document-status/${documentId}`
                );
                const data = await response.json();

                if (data.status === "completed") {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileId ? { ...f, status: "completed", progress: 100 } : f
                        )
                    );
                } else if (data.status === "failed") {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileId
                                ? { ...f, status: "error", error: data.error }
                                : f
                        )
                    );
                } else {
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(poll, 2000);
                    }
                }
            } catch (error) {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId
                            ? { ...f, status: "error", error: "Processing failed" }
                            : f
                    )
                );
            }
        };

        poll();
    };

    const removeFile = (fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    const getStatusIcon = (status: UploadedFile["status"]) => {
        switch (status) {
            case "uploading":
            case "processing":
                return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
            case "completed":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "error":
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <File className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusText = (file: UploadedFile) => {
        switch (file.status) {
            case "uploading":
                return "Uploading...";
            case "processing":
                return "Processing document...";
            case "completed":
                return "Completed";
            case "error":
                return file.error || "Error";
            default:
                return "Pending";
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                    isDragActive
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                        : "border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600"
                )}
            >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Upload Financial Documents
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Drag and drop your expense reports, invoices, or bank statements here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                    Supports PDF, Excel, CSV, and images (max 10MB)
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Uploaded Files ({files.length})
                    </h4>
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                            {getStatusIcon(file.status)}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {file.file.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {getStatusText(file)}
                                </p>
                            </div>
                            {file.status === "completed" && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    Vendors extracted
                                </span>
                            )}
                            <button
                                onClick={() => removeFile(file.id)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
