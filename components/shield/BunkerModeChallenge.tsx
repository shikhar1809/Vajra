"use client";

import { useState } from "react";
import { Shield, Lock, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Challenge {
    challengeId: string;
    type: 'captcha' | 'math' | 'pattern' | 'slider';
    question: string;
    options?: string[];
    expiresAt: number;
}

export default function BunkerModeChallenge() {
    const [showChallenge, setShowChallenge] = useState(false);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [answer, setAnswer] = useState("");
    const [sliderValue, setSliderValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ verified: boolean; message: string } | null>(null);

    const requestChallenge = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/shield/bunker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip: '127.0.0.1' }),
            });

            const data = await response.json();

            if (data.success) {
                setChallenge(data.data);
                setShowChallenge(true);
                setAnswer("");
                setSliderValue(0);
            }
        } catch (error) {
            console.error('Failed to get challenge:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyAnswer = async () => {
        if (!challenge) return;

        setLoading(true);

        try {
            const finalAnswer = challenge.type === 'slider' ? sliderValue.toString() : answer;

            const response = await fetch('/api/shield/bunker', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId: challenge.challengeId,
                    answer: finalAnswer,
                    ip: '127.0.0.1',
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);

                if (data.data.verified) {
                    setTimeout(() => {
                        setShowChallenge(false);
                        setChallenge(null);
                        setResult(null);
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Failed to verify answer:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Trigger Button */}
            <Card className="cyber-card border-red-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Shield className="w-6 h-6 text-red-500" />
                        Bunker Mode Challenge System
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-400">
                        Test the bunker mode challenge system. When suspicious traffic is detected,
                        users must complete a challenge to prove they're human.
                    </p>

                    <button
                        onClick={requestChallenge}
                        disabled={loading || showChallenge}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
                    >
                        <Lock className="w-5 h-5" />
                        {loading ? 'Loading...' : 'Trigger Bunker Mode'}
                    </button>
                </CardContent>
            </Card>

            {/* Challenge Modal */}
            {showChallenge && challenge && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <Card className="cyber-card border-red-500 max-w-md w-full">
                        <CardHeader className="border-b border-red-500/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                    Security Challenge
                                </CardTitle>
                                <button
                                    onClick={() => setShowChallenge(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Challenge Question */}
                            <div className="text-center">
                                <p className="text-sm text-gray-400 mb-2">
                                    {challenge.type.toUpperCase()} Challenge
                                </p>
                                <p className="text-lg font-semibold text-white">
                                    {challenge.question}
                                </p>
                            </div>

                            {/* Answer Input */}
                            {challenge.type === 'slider' ? (
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={sliderValue}
                                        onChange={(e) => setSliderValue(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-center text-white font-mono text-2xl">
                                        {sliderValue}
                                    </p>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && verifyAnswer()}
                                    placeholder="Enter your answer..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-center text-lg font-mono"
                                    autoFocus
                                />
                            )}

                            {/* Result Message */}
                            {result && (
                                <div className={`p-4 rounded-lg flex items-center gap-2 ${result.verified
                                        ? 'bg-green-500/10 border border-green-500/30'
                                        : 'bg-red-500/10 border border-red-500/30'
                                    }`}>
                                    {result.verified ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    )}
                                    <p className={result.verified ? 'text-green-400' : 'text-red-400'}>
                                        {result.message}
                                    </p>
                                </div>
                            )}

                            {/* Verify Button */}
                            <button
                                onClick={verifyAnswer}
                                disabled={loading || (!answer && challenge.type !== 'slider')}
                                className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify Answer'}
                            </button>

                            {/* Timer */}
                            <p className="text-xs text-gray-500 text-center">
                                Challenge expires in {Math.floor((challenge.expiresAt - Date.now()) / 1000)}s
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
