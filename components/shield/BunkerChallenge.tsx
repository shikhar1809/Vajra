"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Check } from "lucide-react";

interface BunkerChallengeProps {
    challengeTypes: string[];
}

export function BunkerChallenge({ challengeTypes }: BunkerChallengeProps) {
    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [otp, setOtp] = useState("");
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const challenges = challengeTypes.map(type => {
        switch (type) {
            case 'otp':
                return { type: 'otp', title: 'OTP Verification', component: <OTPChallenge otp={otp} setOtp={setOtp} /> };
            case 'pen_tool':
                return { type: 'pen_tool', title: 'Draw Pattern', component: <PenToolChallenge canvasRef={canvasRef} isDrawing={isDrawing} setIsDrawing={setIsDrawing} /> };
            case 'captcha':
                return { type: 'captcha', title: 'CAPTCHA Verification', component: <CaptchaChallenge /> };
            case 'behavioral':
                return { type: 'behavioral', title: 'Behavioral Verification', component: <BehavioralChallenge /> };
            case 'device_fingerprint':
                return { type: 'device_fingerprint', title: 'Device Verification', component: <DeviceFingerprintChallenge /> };
            default:
                return null;
        }
    }).filter(Boolean);

    const currentChallengeData = challenges[currentChallenge];

    if (!currentChallengeData) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyber-blue/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-cyber-blue/20 rounded-lg">
                            <Shield className="w-6 h-6 text-cyber-blue" />
                        </div>
                        <div>
                            <CardTitle className="text-white">{currentChallengeData.title}</CardTitle>
                            <p className="text-sm text-gray-400">Challenge {currentChallenge + 1} of {challenges.length}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {currentChallengeData.component}

                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex gap-2">
                            {challenges.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${index === currentChallenge ? 'bg-cyber-blue' : 'bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                if (currentChallenge < challenges.length - 1) {
                                    setCurrentChallenge(currentChallenge + 1);
                                }
                            }}
                            className="px-6 py-2 bg-cyber-blue hover:bg-cyber-blue/90 text-white rounded-lg font-semibold transition-colors"
                        >
                            {currentChallenge < challenges.length - 1 ? 'Next Challenge' : 'Complete Verification'}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function OTPChallenge({ otp, setOtp }: { otp: string; setOtp: (v: string) => void }) {
    return (
        <div className="space-y-4">
            <p className="text-gray-300">A 6-digit code has been sent to your registered email address.</p>
            <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 text-center text-2xl font-bold bg-slate-700 border-2 border-white/20 rounded-lg text-white focus:border-cyber-blue focus:outline-none"
                        value={otp[index] || ''}
                        onChange={(e) => {
                            const newOtp = otp.split('');
                            newOtp[index] = e.target.value;
                            setOtp(newOtp.join(''));
                            if (e.target.value && index < 5) {
                                const nextInput = e.target.nextElementSibling as HTMLInputElement;
                                nextInput?.focus();
                            }
                        }}
                    />
                ))}
            </div>
            <button className="w-full py-2 text-cyber-blue hover:text-cyber-blue/80 text-sm">
                Resend Code
            </button>
        </div>
    );
}

function PenToolChallenge({ canvasRef, isDrawing, setIsDrawing }: any) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#0EA5E9';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        const startDrawing = (e: MouseEvent) => {
            setIsDrawing(true);
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        };

        const draw = (e: MouseEvent) => {
            if (!isDrawing) return;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        };

        const stopDrawing = () => setIsDrawing(false);

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);
        };
    }, [isDrawing, setIsDrawing, canvasRef]);

    return (
        <div className="space-y-4">
            <p className="text-gray-300">Draw a checkmark (✓) in the box below:</p>
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="w-full border-2 border-white/20 rounded-lg bg-slate-700 cursor-crosshair"
                />
            </div>
            <button
                onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        ctx?.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }}
                className="text-sm text-gray-400 hover:text-white"
            >
                Clear Drawing
            </button>
        </div>
    );
}

function CaptchaChallenge() {
    const [selected, setSelected] = useState<number[]>([]);
    const images = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <div className="space-y-4">
            <p className="text-gray-300">Select all images containing traffic lights:</p>
            <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                    <div
                        key={img}
                        onClick={() => {
                            setSelected(prev =>
                                prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]
                            );
                        }}
                        className={`aspect-square bg-slate-700 rounded-lg cursor-pointer border-2 transition-all ${selected.includes(img) ? 'border-cyber-blue' : 'border-white/20'
                            } flex items-center justify-center relative`}
                    >
                        <div className="text-4xl">🚦</div>
                        {selected.includes(img) && (
                            <div className="absolute top-1 right-1 w-6 h-6 bg-cyber-blue rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function BehavioralChallenge() {
    const [mouseMovements, setMouseMovements] = useState(0);

    return (
        <div className="space-y-4">
            <p className="text-gray-300">Move your mouse naturally within the box below:</p>
            <div
                onMouseMove={() => setMouseMovements(prev => prev + 1)}
                className="h-48 border-2 border-white/20 rounded-lg bg-slate-700 flex items-center justify-center"
            >
                <div className="text-center">
                    <div className="text-4xl mb-2">🖱️</div>
                    <p className="text-gray-400">Mouse movements detected: {mouseMovements}</p>
                    <div className="mt-4 w-64 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyber-blue transition-all duration-300"
                            style={{ width: `${Math.min((mouseMovements / 100) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeviceFingerprintChallenge() {
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        // Simulate device fingerprint verification
        setTimeout(() => setVerified(true), 2000);
    }, []);

    return (
        <div className="space-y-4">
            <p className="text-gray-300">Verifying your device characteristics...</p>
            <div className="space-y-3">
                {[
                    { label: 'Browser fingerprint', status: verified },
                    { label: 'Screen resolution', status: verified },
                    { label: 'Timezone', status: verified },
                    { label: 'Language settings', status: verified },
                ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-gray-300">{item.label}</span>
                        {item.status ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <div className="w-5 h-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
