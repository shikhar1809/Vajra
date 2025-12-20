import type { Metadata } from "next";
import { Shield, FileText, DollarSign, Eye, Target, Zap, Users, Lock, TrendingUp, Award, CheckCircle2, ArrowRight } from "lucide-react";
import BoxLoader from "@/components/BoxLoader";
import MountainVistaParallax from "@/components/MountainVistaParallax";

export const metadata: Metadata = {
    title: "About Us - Vajra",
    description: "Learn about Vajra's mission to protect businesses from cyber threats with enterprise-grade security solutions",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Mountain Parallax Background */}
            <MountainVistaParallax />

            {/* Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black/60 to-black/60" />
                    <div className="relative container mx-auto px-6 py-24">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
                                <Shield className="w-4 h-4" />
                                <span>Enterprise-Grade Cybersecurity</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black mb-12 bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
                                About Vajra
                            </h1>
                            <div className="flex justify-center mb-6">
                                <BoxLoader />
                            </div>
                            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                                Your Digital Fortress Against Modern Cyber Threats
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="border-y border-slate-800 bg-slate-900/30 backdrop-blur-sm">
                    <div className="container mx-auto px-6 py-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-red-500 mb-2">99.9%</div>
                                <div className="text-sm text-slate-400">Threat Detection Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-red-500 mb-2">&lt;1s</div>
                                <div className="text-sm text-slate-400">Response Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-red-500 mb-2">24/7</div>
                                <div className="text-sm text-slate-400">Real-Time Monitoring</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-red-500 mb-2">100+</div>
                                <div className="text-sm text-slate-400">Businesses Protected</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-20">
                    <div className="max-w-6xl mx-auto">
                        {/* Mission */}
                        <section className="mb-24">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-4">
                                        <Target className="w-4 h-4" />
                                        <span>Our Mission</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
                                        Empowering Businesses with Enterprise Security
                                    </h2>
                                    <p className="text-lg text-slate-300 leading-relaxed mb-4">
                                        Vajra is built to democratize enterprise-grade cybersecurity. We believe that every organization, regardless of size, deserves access to powerful, easy-to-use security solutions that protect against modern cyber threats.
                                    </p>
                                    <p className="text-lg text-slate-300 leading-relaxed">
                                        Our platform combines four powerful modules—Shield, Aegis, Scout, and Sentry—into a unified workspace where teams can monitor, detect, and respond to security threats in real-time.
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-2xl blur-3xl" />
                                    <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-red-500/10 rounded-lg">
                                                    <Lock className="w-6 h-6 text-red-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white mb-1">Secure by Design</h3>
                                                    <p className="text-sm text-slate-400">Built with security-first architecture</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-red-500/10 rounded-lg">
                                                    <Zap className="w-6 h-6 text-red-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white mb-1">Lightning Fast</h3>
                                                    <p className="text-sm text-slate-400">Real-time threat detection and response</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-red-500/10 rounded-lg">
                                                    <TrendingUp className="w-6 h-6 text-red-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white mb-1">Always Improving</h3>
                                                    <p className="text-sm text-slate-400">Continuous updates and enhancements</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* What We Do */}
                        <section className="mb-24">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-4">
                                    <Award className="w-4 h-4" />
                                    <span>Our Solutions</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
                                    Four Pillars of Protection
                                </h2>
                                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                    Comprehensive security coverage across all attack vectors
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="group bg-slate-900/30 backdrop-blur-sm border border-slate-800 hover:border-red-500/50 rounded-xl p-8 transition-all hover:scale-105">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                                            <Shield className="w-8 h-8 text-red-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Shield</h3>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed">
                                        Web Application Firewall protecting against DDoS, SQL injection, XSS, CSRF, and brute force attacks with real-time threat intelligence.
                                    </p>
                                </div>

                                <div className="group bg-slate-900/30 backdrop-blur-sm border border-slate-800 hover:border-blue-500/50 rounded-xl p-8 transition-all hover:scale-105">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                            <FileText className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Aegis</h3>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed">
                                        Advanced document scanning with malware detection, risk scoring, and suspicious content analysis to protect your data assets.
                                    </p>
                                </div>

                                <div className="group bg-slate-900/30 backdrop-blur-sm border border-slate-800 hover:border-yellow-500/50 rounded-xl p-8 transition-all hover:scale-105">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                                            <DollarSign className="w-8 h-8 text-yellow-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Scout</h3>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed">
                                        AI-powered financial transaction monitoring with fraud detection, risk analysis, and anomaly detection to prevent financial losses.
                                    </p>
                                </div>

                                <div className="group bg-slate-900/30 backdrop-blur-sm border border-slate-800 hover:border-purple-500/50 rounded-xl p-8 transition-all hover:scale-105">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                                            <Eye className="w-8 h-8 text-purple-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Sentry</h3>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed">
                                        Deepfake detection for images, videos, and audio using advanced AI to combat digital manipulation and misinformation.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Why Choose Vajra */}
                        <section className="mb-24">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-4">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Why Vajra</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
                                    Built for Modern Businesses
                                </h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-lg">
                                        <CheckCircle2 className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-white">Unified Platform</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            All your security tools in one centralized workspace with a single, intuitive dashboard for complete visibility.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-lg">
                                        <Zap className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-white">Real-Time Protection</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Continuous 24/7 monitoring with instant alerts and automated responses to keep you ahead of emerging threats.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-lg">
                                        <Users className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-white">Team Collaboration</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Invite team members, assign roles, and work together seamlessly to secure your business with role-based access control.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-white">Easy to Use</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Intuitive interface designed for both security experts and business owners, with no steep learning curve required.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* CTA */}
                        <section>
                            <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-red-600/5 to-transparent border border-red-500/20 rounded-2xl p-12 text-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                                <div className="relative">
                                    <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
                                        Ready to Secure Your Business?
                                    </h2>
                                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                                        Join businesses worldwide who trust Vajra to protect their digital assets with enterprise-grade security.
                                    </p>
                                    <a
                                        href="/workspace"
                                        className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-900/30"
                                    >
                                        <span>Get Started</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
