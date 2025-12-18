"use client";

import { useState } from "react";
import { Github, Lock, Globe, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GitHubConnectionFormProps {
    onConnect: (repoUrl: string, branch: string, isPrivate: boolean) => void;
    loading?: boolean;
}

export default function GitHubConnectionForm({ onConnect, loading = false }: GitHubConnectionFormProps) {
    const [repoUrl, setRepoUrl] = useState("");
    const [branch, setBranch] = useState("main");
    const [isPrivate, setIsPrivate] = useState(false);
    const [error, setError] = useState("");

    const validateGitHubUrl = (url: string): boolean => {
        const githubPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
        return githubPattern.test(url.trim());
    };

    const handleConnect = () => {
        setError("");

        if (!repoUrl.trim()) {
            setError("Please enter a GitHub repository URL");
            return;
        }

        if (!validateGitHubUrl(repoUrl)) {
            setError("Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)");
            return;
        }

        if (!branch.trim()) {
            setError("Please enter a branch name");
            return;
        }

        onConnect(repoUrl.trim(), branch.trim(), isPrivate);
    };

    const handleGitHubOAuth = () => {
        // Redirect to GitHub OAuth
        window.location.href = "/api/agenios/github/auth";
    };

    return (
        <Card className="cyber-card border-blue-500/50">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Github className="w-6 h-6 text-blue-400" />
                    Connect GitHub Repository
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Enter your repository URL to begin security analysis
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Repository URL Input */}
                <div className="space-y-2">
                    <Label htmlFor="repo-url" className="text-gray-300">
                        Repository URL
                    </Label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <Input
                            id="repo-url"
                            type="url"
                            placeholder="https://github.com/username/repository"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Branch Input */}
                <div className="space-y-2">
                    <Label htmlFor="branch" className="text-gray-300">
                        Branch
                    </Label>
                    <Input
                        id="branch"
                        type="text"
                        placeholder="main"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                        disabled={loading}
                    />
                </div>

                {/* Repository Type */}
                <div className="space-y-3">
                    <Label className="text-gray-300">Repository Type</Label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsPrivate(false)}
                            disabled={loading}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${!isPrivate
                                    ? "border-blue-500 bg-blue-500/20"
                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            <Globe className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                            <p className="text-sm font-semibold text-white">Public</p>
                            <p className="text-xs text-gray-400">No authentication required</p>
                        </button>

                        <button
                            onClick={() => setIsPrivate(true)}
                            disabled={loading}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${isPrivate
                                    ? "border-blue-500 bg-blue-500/20"
                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            <Lock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                            <p className="text-sm font-semibold text-white">Private</p>
                            <p className="text-xs text-gray-400">Requires GitHub OAuth</p>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {isPrivate ? (
                        <Button
                            onClick={handleGitHubOAuth}
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Github className="w-4 h-4 mr-2" />
                                    Connect with GitHub
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleConnect}
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                "Start Security Scan"
                            )}
                        </Button>
                    )}
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">What we'll analyze:</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Static code analysis (SAST)</li>
                        <li>• Dependency vulnerabilities</li>
                        <li>• Security best practices</li>
                        <li>• Penetration testing simulations</li>
                        <li>• AI-powered threat detection</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
