'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface RevenueData {
    total_mrr: number;
    phase: string;
    phase_name: string;
    phase_progress_pct: number;
}

interface Milestone {
    id: string;
    phase_name: string;
    phase_number: number;
    target: string;
    target_date: string;
    status: string;
}

export function MRRHeroCard() {
    const supabase = createClient();
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [displayMRR, setDisplayMRR] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const [revResult, msResult] = await Promise.all([
                supabase.from('revenue_summary').select('*').limit(1).single(),
                supabase.from('milestones').select('*').order('phase_number', { ascending: true }),
            ]);

            if (revResult.data) {
                setRevenue(revResult.data as RevenueData);
            }
            if (msResult.data) {
                setMilestones(msResult.data as Milestone[]);
            }
        }
        fetchData();
    }, [supabase]);

    // Animate MRR counter
    useEffect(() => {
        if (!revenue) return;
        const target = revenue.total_mrr;
        if (target === 0) {
            setDisplayMRR(0);
            return;
        }
        const duration = 1500;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setDisplayMRR(target);
                clearInterval(timer);
            } else {
                setDisplayMRR(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [revenue]);

    const activePhase = milestones.find((m) => m.status === 'active');
    const activeIndex = activePhase ? milestones.indexOf(activePhase) : 0;

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-blue-600/10 to-fuchsia-600/15" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />

            <div className="relative glass rounded-2xl p-8 border border-violet-500/10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* MRR Display */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-violet-400" />
                            <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                                Monthly Recurring Revenue
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl lg:text-6xl font-bold tracking-tight">
                                ${displayMRR.toLocaleString()}
                            </span>
                            <span className="text-zinc-500 text-lg">/mo</span>
                        </div>
                        {activePhase && (
                            <div className="mt-3 flex items-center gap-2">
                                <Target size={14} className="text-emerald-400" />
                                <span className="text-sm text-zinc-400">
                                    Phase {activePhase.phase_number}:{' '}
                                    <span className="text-white font-medium">{activePhase.phase_name}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Phase Progress */}
                    <div className="flex-1 max-w-lg">
                        <div className="flex items-center justify-between mb-3">
                            {milestones.map((m, i) => (
                                <div key={m.id} className="flex flex-col items-center flex-1">
                                    <motion.div
                                        className={`w-3 h-3 rounded-full border-2 ${m.status === 'completed'
                                                ? 'bg-emerald-400 border-emerald-400'
                                                : m.status === 'active'
                                                    ? 'bg-violet-400 border-violet-400'
                                                    : 'bg-transparent border-zinc-600'
                                            }`}
                                        animate={
                                            m.status === 'active'
                                                ? {
                                                    boxShadow: [
                                                        '0 0 0px rgba(139,92,246,0.3)',
                                                        '0 0 12px rgba(139,92,246,0.6)',
                                                        '0 0 0px rgba(139,92,246,0.3)',
                                                    ],
                                                }
                                                : {}
                                        }
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <span
                                        className={`text-[10px] mt-1.5 text-center leading-tight ${i <= activeIndex ? 'text-zinc-300' : 'text-zinc-600'
                                            }`}
                                    >
                                        {m.phase_name}
                                    </span>
                                    <span className="text-[9px] text-zinc-600">{m.target_date}</span>
                                </div>
                            ))}
                        </div>
                        {/* Progress bar */}
                        <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${revenue?.phase_progress_pct || 0}%`,
                                }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
