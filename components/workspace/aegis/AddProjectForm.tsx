"use client";

import { useState } from "react";
import { Plus, Code, Github, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AddProjectFormProps {
    workspaceId: string;
    onProjectAdded?: () => void;
}

export default function AddProjectForm({ workspaceId, onProjectAdded }: AddProjectFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        repositoryUrl: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/workspace/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    workspaceId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setFormData({
                    name: "",
                    repositoryUrl: "",
                    description: "",
                });
                setIsOpen(false);
                onProjectAdded?.();
            }
        } catch (error) {
            console.error('Failed to add project:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Project
            </button>
        );
    }

    return (
        <Card className="cyber-card border-red-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Code className="w-6 h-6 text-red-500" />
                    Add New Project
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Project Name *
                        </label>
                        <div className="relative">
                            <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., E-commerce Platform"
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* Repository URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Repository URL
                        </label>
                        <div className="relative">
                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                value={formData.repositoryUrl}
                                onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                                placeholder="https://github.com/owner/repo"
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the project..."
                                rows={3}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Project'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
