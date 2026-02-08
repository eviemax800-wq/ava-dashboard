'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TeamStats {
    working: number;
    queued: number;
    idle: number;
    blocked: number;
    antigravityActive: number;
}

export function TeamSummaryWidget() {
    const [stats, setStats] = useState<TeamStats>({
        working: 0,
        queued: 0,
        idle: 0,
        blocked: 0,
        antigravityActive: 0,
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchTeamStats();

        // Real-time subscription
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
                    fetchTeamStats();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function fetchTeamStats() {
        try {
            const { data, error } = await supabase.from('team_agents').select('status');

            if (error) throw error;

            const working = data.filter((a) => a.status === 'working').length;
            const queued = data.filter((a) => a.status === 'queued').length;
            const idle = data.filter((a) => a.status === 'idle').length;
            const blocked = data.filter((a) => a.status === 'blocked').length;

            setStats({
                working,
                queued,
                idle,
                blocked,
                antigravityActive: working,
            });
        } catch (error) {
            console.error('Error fetching team stats:', error);
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

    const isAtCapacity = stats.antigravityActive >= 2;

    return (
        <motion.div
            className="glass rounded-xl p-6 border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-400" />
                    <h2 className="text-lg font-semibold">Team Status</h2>
                </div>
                <Link
                    href="/dashboard/team"
                    className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors group"
                >
                    View Team
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* Capacity Badge */}
            <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${isAtCapacity ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-violet-500/10 border border-violet-500/20'}`}
            >
                <Zap className={`w-4 h-4 ${isAtCapacity ? 'text-amber-400' : 'text-violet-400'}`} />
                <span className={`text-sm font-medium ${isAtCapacity ? 'text-amber-400' : 'text-violet-400'}`}>
                    {stats.antigravityActive}/2 Antigravity slots in use
                </span>
                {isAtCapacity && (
                    <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                        At capacity
                    </span>
                )}
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-2">
                {stats.working > 0 && (
                    <StatusPill color="green" count={stats.working} label="working" />
                )}
                {stats.queued > 0 && (
                    <StatusPill color="amber" count={stats.queued} label="queued" />
                )}
                {stats.idle > 0 && (
                    <StatusPill color="gray" count={stats.idle} label="idle" />
                )}
                {stats.blocked > 0 && (
                    <StatusPill color="red" count={stats.blocked} label="blocked" />
                )}
            </div>
        </motion.div>
    );
}

function StatusPill({
    color,
    count,
    label,
}: {
    color: 'green' | 'amber' | 'gray' | 'red';
    count: number;
    label: string;
}) {
    const colors = {
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        gray: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${colors[color]}`}>
            <span className="font-bold">{count}</span> {label}
        </div>
    );
}
