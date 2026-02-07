'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

interface Blocker {
    id: string;
    type: string;
    resource: string;
    discovered_at: string;
    discovered_by?: string;
    resolved_at?: string;
    priority_impact: string;
    impacts?: string[];
    details: string;
    resolution?: string;
    status: string;
}

export default function BlockersPage() {
    const supabase = createClient();
    const [blockers, setBlockers] = useState<Blocker[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

    const fetchBlockers = useCallback(async () => {
        const { data } = await supabase
            .from('blockers')
            .select('*')
            .order('discovered_at', { ascending: false });

        setBlockers((data as Blocker[]) || []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchBlockers();

        const channel = supabase
            .channel('blockers-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'blockers' },
                fetchBlockers
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchBlockers]);

    const filtered = blockers.filter((b) => {
        if (filter === 'active') return b.status === 'active';
        if (filter === 'resolved') return b.status === 'resolved';
        return true;
    });

    const activeCount = blockers.filter((b) => b.status === 'active').length;
    const resolvedCount = blockers.filter((b) => b.status === 'resolved').length;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="shimmer h-10 w-48 rounded-lg" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-24 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Blockers</h1>
                <p className="text-zinc-400 mt-1 text-sm">
                    Track and resolve blockers across all tasks
                </p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'all', label: `All (${blockers.length})` },
                    { key: 'active', label: `Active (${activeCount})` },
                    { key: 'resolved', label: `Resolved (${resolvedCount})` },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as 'all' | 'active' | 'resolved')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === tab.key
                                ? 'bg-violet-600 text-white'
                                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Blockers list */}
            {filtered.length === 0 ? (
                <motion.div
                    className="glass rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <CheckCircle size={40} className="text-emerald-500/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400 mb-2">
                        {filter === 'active'
                            ? 'No Active Blockers'
                            : 'No Blockers Found'}
                    </h3>
                    <p className="text-sm text-zinc-500">
                        {filter === 'active'
                            ? 'All clear! No blockers are currently active.'
                            : 'Blockers will appear here when they are created.'}
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((blocker, i) => (
                        <motion.div
                            key={blocker.id}
                            className="glass rounded-xl p-5 card-glow"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`p-2 rounded-lg ${blocker.status === 'active'
                                            ? 'bg-red-500/10'
                                            : 'bg-emerald-500/10'
                                        }`}
                                >
                                    {blocker.status === 'active' ? (
                                        <AlertCircle size={18} className="text-red-400" />
                                    ) : (
                                        <CheckCircle size={18} className="text-emerald-400" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider bg-white/5 text-zinc-400">
                                            {blocker.type}
                                        </span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${blocker.priority_impact === 'P0'
                                                    ? 'bg-red-500/15 text-red-400'
                                                    : blocker.priority_impact === 'P1'
                                                        ? 'bg-amber-500/15 text-amber-400'
                                                        : 'bg-blue-500/15 text-blue-400'
                                                }`}
                                        >
                                            {blocker.priority_impact}
                                        </span>
                                    </div>

                                    <p className="text-sm font-medium text-zinc-200 mb-1">
                                        {blocker.details}
                                    </p>

                                    {blocker.resource && (
                                        <p className="text-xs text-zinc-500 mb-1">
                                            Resource: {blocker.resource}
                                        </p>
                                    )}

                                    {blocker.resolution && (
                                        <p className="text-xs text-emerald-400/70 mt-2">
                                            ✅ {blocker.resolution}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-zinc-600 flex items-center gap-1">
                                            <Clock size={10} />
                                            {formatTimeAgo(blocker.discovered_at)}
                                        </span>
                                        {blocker.discovered_by && (
                                            <span className="text-xs text-zinc-600">
                                                by {blocker.discovered_by}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
