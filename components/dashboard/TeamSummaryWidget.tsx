'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SlotSummary {
    active: number;
    available: number;
    maxSlots: number;
    queued: number;
    subAgentsDisabled: boolean;
}

export function TeamSummaryWidget() {
    const [summary, setSummary] = useState<SlotSummary>({
        active: 0,
        available: 0,
        maxSlots: 2,
        queued: 0,
        subAgentsDisabled: true,
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchSummary();

        const subscription = supabase
            .channel('team-summary-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'team_agents',
                },
                () => {
                    fetchSummary();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function fetchSummary() {
        try {
            const { data, error } = await supabase
                .from('team_agents')
                .select('status, queue_tasks, specialties')
                .like('agent_id', 'slot-%');

            if (error) throw error;

            const slots = data || [];
            const active = slots.filter(s => s.status === 'working').length;
            const queued = slots.reduce((sum, s) => (s.queue_tasks?.length || 0) + sum, 0);

            // Extract routing config from specialties
            let maxSlots = slots.length || 2;
            let subAgentsDisabled = true;
            for (const slot of slots) {
                try {
                    const specs = typeof slot.specialties === 'string'
                        ? JSON.parse(slot.specialties)
                        : slot.specialties;
                    if (specs?.routingConfig) {
                        maxSlots = specs.routingConfig.maxSlots || maxSlots;
                        subAgentsDisabled = specs.routingConfig.subAgentsDisabled ?? true;
                        break;
                    }
                } catch { }
            }

            setSummary({ active, available: slots.length - active, maxSlots, queued, subAgentsDisabled });
        } catch (error) {
            console.error('Error fetching slot summary:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="glass rounded-xl p-6 border border-white/5">
                <div className="shimmer h-32 rounded-lg" />
            </div>
        );
    }

    const isAtCapacity = summary.active >= summary.maxSlots;

    return (
        <motion.div
            className="glass rounded-xl p-6 border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-violet-400" />
                    <h2 className="text-lg font-semibold">Antigravity</h2>
                </div>
                <Link
                    href="/dashboard/team"
                    className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors group"
                >
                    View Slots
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* Capacity Badge */}
            <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${isAtCapacity
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-violet-500/10 border border-violet-500/20'
                    }`}
            >
                <Zap className={`w-4 h-4 ${isAtCapacity ? 'text-amber-400' : 'text-violet-400'}`} />
                <span className={`text-sm font-medium ${isAtCapacity ? 'text-amber-400' : 'text-violet-400'}`}>
                    {summary.active}/{summary.maxSlots} slots in use
                </span>
                {isAtCapacity && (
                    <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                        At capacity
                    </span>
                )}
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-2">
                {summary.active > 0 && (
                    <div className="px-3 py-1.5 rounded-full text-sm font-medium border bg-green-500/10 text-green-400 border-green-500/20">
                        <span className="font-bold">{summary.active}</span> active
                    </div>
                )}
                {summary.available > 0 && (
                    <div className="px-3 py-1.5 rounded-full text-sm font-medium border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
                        <span className="font-bold">{summary.available}</span> available
                    </div>
                )}
                {summary.queued > 0 && (
                    <div className="px-3 py-1.5 rounded-full text-sm font-medium border bg-violet-500/10 text-violet-400 border-violet-500/20">
                        <span className="font-bold">{summary.queued}</span> queued
                    </div>
                )}
            </div>
        </motion.div>
    );
}
