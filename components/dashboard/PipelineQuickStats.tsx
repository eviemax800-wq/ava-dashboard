'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export function PipelineQuickStats() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        ready: 0,
        inProgress: 0,
        blocked: 0,
        completedToday: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            const today = new Date().toISOString().split('T')[0];
            const [ready, inProgress, blocked, completed] = await Promise.all([
                supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'READY'),
                supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'IN_PROGRESS'),
                supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'BLOCKED'),
                supabase
                    .from('tasks')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'COMPLETED')
                    .gte('completed_at', today),
            ]);

            setStats({
                ready: ready.count || 0,
                inProgress: inProgress.count || 0,
                blocked: blocked.count || 0,
                completedToday: completed.count || 0,
            });
        }
        fetchStats();

        const channel = supabase
            .channel('pipeline-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchStats)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const items = [
        { label: 'Ready', value: stats.ready, icon: Zap, color: '#3b82f6' },
        { label: 'In Progress', value: stats.inProgress, icon: Clock, color: '#8b5cf6' },
        { label: 'Blocked', value: stats.blocked, icon: AlertTriangle, color: '#ef4444' },
        { label: 'Done Today', value: stats.completedToday, icon: CheckCircle, color: '#10b981' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-amber-400" />
                    <h2 className="text-lg font-semibold">Pipeline</h2>
                </div>
                <Link
                    href="/dashboard/tasks"
                    className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                    View tasks <ExternalLink size={10} />
                </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.label}
                            className="glass rounded-xl p-4 text-center card-glow"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + i * 0.05 }}
                        >
                            <Icon size={16} className="mx-auto mb-2" style={{ color: item.color }} />
                            <p className="text-2xl font-bold tracking-tight">{item.value}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{item.label}</p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
