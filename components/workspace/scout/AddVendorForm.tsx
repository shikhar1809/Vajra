"use client";

import { useState } from "react";
import { Plus, Building2, Globe, Mail, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AddVendorFormProps {
    workspaceId: string;
    onVendorAdded?: () => void;
}

export default function AddVendorForm({ workspaceId, onVendorAdded }: AddVendorFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        domain: "",
        contactEmail: "",
        contactName: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Save vendor to database
            const response = await fetch('/api/workspace/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    workspaceId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Reset form
                setFormData({
                    name: "",
                    domain: "",
                    contactEmail: "",
                    contactName: "",
                    description: "",
                });
                setIsOpen(false);

                // Trigger scan
                await fetch('/api/scout/vendors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId: data.data.id,
                        domain: formData.domain,
                    }),
                });

                // Notify parent
                onVendorAdded?.();
            }
        } catch (error) {
            console.error('Failed to add vendor:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Vendor
            </button>
        );
    }

    return (
        <Card className="cyber-card border-purple-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Building2 className="w-6 h-6 text-purple-500" />
                    Add New Vendor
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Vendor Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Vendor Name *
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Acme Corporation"
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Domain */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Domain *
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                placeholder="e.g., acme.com"
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Contact Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contact Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                placeholder="e.g., John Doe"
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Contact Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contact Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="e.g., contact@acme.com"
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of vendor relationship..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Adding & Scanning...' : 'Add & Scan Vendor'}
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
