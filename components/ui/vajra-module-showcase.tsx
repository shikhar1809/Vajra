'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Shield,
    Search,
    Eye,
    Code,
    ChevronRight,
    Zap,
    Lock,
    Activity,
    LucideIcon,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// =========================================
// 1. CONFIGURATION & DATA TYPES
// =========================================

export type ModuleId = 'shield' | 'sentry' | 'scout' | 'agenios';

export interface FeatureMetric {
    label: string;
    value: number; // 0-100
    icon: LucideIcon;
}

export interface ModuleData {
    id: ModuleId;
    label: string;
    title: string;
    description: string;
    image: string;
    link: string;
    colors: {
        gradient: string;
        glow: string;
        ring: string;
    };
    stats: {
        status: string;
        activeThreats: number;
    };
    features: FeatureMetric[];
}

// Vajra Security Modules Data
const MODULE_DATA: Record<ModuleId, ModuleData> = {
    shield: {
        id: 'shield',
        label: 'Shield',
        title: 'Vajra Shield',
        description: 'Real-time traffic monitoring and threat detection. Automatically activates Bunker Mode when suspicious activity is detected, protecting your application from cyber attacks.',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
        link: '/shield',
        colors: {
            gradient: 'from-red-600 to-rose-900',
            glow: 'bg-red-500',
            ring: 'border-l-red-500/50',
        },
        stats: { status: 'Active', activeThreats: 0 },
        features: [
            { label: 'Protection', value: 98, icon: Shield },
            { label: 'Response Time', value: 95, icon: Zap },
        ],
    },
    sentry: {
        id: 'sentry',
        label: 'Sentry',
        title: 'Vajra Sentry',
        description: 'Advanced threat intelligence and malware detection. Scans URLs and documents using the latest threat feeds to identify phishing attempts and malicious content.',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
        link: '/sentry',
        colors: {
            gradient: 'from-green-600 to-emerald-900',
            glow: 'bg-green-500',
            ring: 'border-r-green-500/50',
        },
        stats: { status: 'Monitoring', activeThreats: 3 },
        features: [
            { label: 'Detection Rate', value: 99, icon: Eye },
            { label: 'Threat Intel', value: 94, icon: Activity },
        ],
    },
    scout: {
        id: 'scout',
        label: 'Scout',
        title: 'Vajra Scout',
        description: 'Vendor security intelligence and compliance tracking. Analyzes your vendor relationships and financial documents to identify security risks in your supply chain.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        link: '/scout',
        colors: {
            gradient: 'from-purple-600 to-violet-900',
            glow: 'bg-purple-500',
            ring: 'border-l-purple-500/50',
        },
        stats: { status: 'Scanning', activeThreats: 1 },
        features: [
            { label: 'Vendor Score', value: 87, icon: Search },
            { label: 'Compliance', value: 92, icon: Lock },
        ],
    },
    agenios: {
        id: 'agenios',
        label: 'Agenios',
        title: 'Vajra Agenios',
        description: 'Automated security testing and code analysis. Performs penetration testing on your codebase using AI-powered vulnerability detection and attack simulations.',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
        link: '/agenios',
        colors: {
            gradient: 'from-blue-600 to-cyan-900',
            glow: 'bg-blue-500',
            ring: 'border-r-blue-500/50',
        },
        stats: { status: 'Ready', activeThreats: 0 },
        features: [
            { label: 'Code Security', value: 91, icon: Code },
            { label: 'Pen Testing', value: 88, icon: Zap },
        ],
    },
};

// =========================================
// 2. ANIMATION VARIANTS
// =========================================

const ANIMATIONS = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2 },
        },
    },
    item: {
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { type: 'spring', stiffness: 100, damping: 20 },
        },
        exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
    },
    image: (): Variants => ({
        initial: {
            opacity: 0,
            scale: 1.3,
            filter: 'blur(15px)',
        },
        animate: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: { type: 'spring', stiffness: 260, damping: 20 },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            filter: 'blur(20px)',
            transition: { duration: 0.25 },
        },
    }),
};

// =========================================
// 3. SUB-COMPONENTS
// =========================================

const BackgroundGradient = ({ moduleId }: { moduleId: ModuleId }) => {
    const gradients = {
        shield: 'radial-gradient(circle at 30% 50%, rgba(239, 68, 68, 0.15), transparent 50%)',
        sentry: 'radial-gradient(circle at 70% 50%, rgba(34, 197, 94, 0.15), transparent 50%)',
        scout: 'radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.15), transparent 50%)',
        agenios: 'radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.15), transparent 50%)',
    };

    return (
        <div className="fixed inset-0 pointer-events-none">
            <motion.div
                animate={{ background: gradients[moduleId] }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
            />
        </div>
    );
};

const ModuleVisual = ({ data }: { data: ModuleData }) => (
    <motion.div layout="position" className="relative group shrink-0">
        {/* Animated Rings */}
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className={`absolute inset-[-20%] rounded-full border border-dashed border-white/10 ${data.colors.ring}`}
        />
        <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.colors.gradient} blur-2xl opacity-40`}
        />

        {/* Image Container */}
        <div className="relative h-80 w-80 md:h-[450px] md:w-[450px] rounded-full border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-sm">
            <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="relative z-10 w-full h-full flex items-center justify-center"
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={data.id}
                        src={data.image}
                        alt={data.title}
                        variants={ANIMATIONS.image()}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full h-full object-cover rounded-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        draggable={false}
                    />
                </AnimatePresence>
            </motion.div>
        </div>

        {/* Status Label */}
        <motion.div
            layout="position"
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 bg-zinc-950/80 px-4 py-2 rounded-full border border-white/5 backdrop-blur">
                <span className={`h-1.5 w-1.5 rounded-full ${data.colors.glow} animate-pulse`} />
                {data.stats.status}
            </div>
        </motion.div>
    </motion.div>
);

const ModuleDetails = ({ data }: { data: ModuleData }) => (
    <motion.div
        variants={ANIMATIONS.container}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col items-start text-left"
    >
        <motion.h2 variants={ANIMATIONS.item} className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
            {data.label} Module
        </motion.h2>
        <motion.h1 variants={ANIMATIONS.item} className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
            {data.title}
        </motion.h1>
        <motion.p variants={ANIMATIONS.item} className="text-zinc-400 mb-8 max-w-sm leading-relaxed">
            {data.description}
        </motion.p>

        {/* Feature Grid */}
        <motion.div variants={ANIMATIONS.item} className="w-full space-y-6 bg-zinc-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            {data.features.map((feature, idx) => (
                <div key={feature.label} className="group">
                    <div className="flex items-center justify-between mb-3 text-sm">
                        <div className={`flex items-center gap-2 ${feature.value > 50 ? 'text-zinc-200' : 'text-zinc-400'}`}>
                            <feature.icon size={16} /> <span>{feature.label}</span>
                        </div>
                        <span className="font-mono text-xs text-zinc-500">{feature.value}%</span>
                    </div>
                    <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${feature.value}%` }}
                            transition={{ duration: 1, delay: 0.4 + idx * 0.15 }}
                            className={`absolute top-0 bottom-0 left-0 ${data.colors.glow} opacity-80`}
                        />
                    </div>
                </div>
            ))}

            <div className="pt-4 flex justify-start">
                <Link href={data.link} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors group">
                    Open Module
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>

        {/* Active Threats */}
        <motion.div variants={ANIMATIONS.item} className="mt-6 flex items-center gap-3 text-zinc-500">
            <Activity size={16} />
            <span className="text-sm font-medium">{data.stats.activeThreats} Active Threats</span>
        </motion.div>
    </motion.div>
);

const ModuleSwitcher = ({
    activeId,
    onToggle
}: {
    activeId: ModuleId;
    onToggle: (id: ModuleId) => void
}) => {
    const modules = Object.values(MODULE_DATA);
    const currentIndex = modules.findIndex(m => m.id === activeId);

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % modules.length;
        onToggle(modules[nextIndex].id);
    };

    return (
        <div className="fixed bottom-12 inset-x-0 flex justify-center z-50 pointer-events-none gap-4">
            {/* Module Selector */}
            <motion.div layout className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
                {modules.map((module) => (
                    <motion.button
                        key={module.id}
                        onClick={() => onToggle(module.id)}
                        whileTap={{ scale: 0.96 }}
                        className="relative w-24 h-12 rounded-full flex items-center justify-center text-sm font-medium focus:outline-none"
                    >
                        {activeId === module.id && (
                            <motion.div
                                layoutId="island-surface"
                                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-white/5 shadow-inner"
                                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                            />
                        )}
                        <span className={`relative z-10 transition-colors duration-300 ${activeId === module.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            {module.label}
                        </span>
                        {activeId === module.id && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                            />
                        )}
                    </motion.button>
                ))}
            </motion.div>

            {/* Next Button */}
            <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.96 }}
                className="pointer-events-auto h-12 px-6 rounded-full bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/5 flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
            >
                Next
                <ChevronRight size={16} />
            </motion.button>
        </div>
    );
};

// =========================================
// 4. MAIN COMPONENT
// =========================================

export default function VajraModuleShowcase() {
    const [activeModule, setActiveModule] = useState<ModuleId>('shield');

    const currentData = MODULE_DATA[activeModule];

    return (
        <div className="relative min-h-screen w-full bg-black text-zinc-100 overflow-hidden selection:bg-zinc-800 flex flex-col items-center justify-center">

            <BackgroundGradient moduleId={activeModule} />

            <main className="relative z-10 w-full px-6 py-8 flex flex-col justify-center max-w-7xl mx-auto">
                <motion.div
                    layout
                    transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 lg:gap-48 w-full"
                >
                    {/* Module Visual */}
                    <ModuleVisual data={currentData} />

                    {/* Module Details */}
                    <motion.div layout="position" className="w-full max-w-md">
                        <AnimatePresence mode="wait">
                            <ModuleDetails
                                key={activeModule}
                                data={currentData}
                            />
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </main>

            <ModuleSwitcher activeId={activeModule} onToggle={setActiveModule} />
        </div>
    );
}
