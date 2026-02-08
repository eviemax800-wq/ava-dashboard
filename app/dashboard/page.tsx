'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatCard } from '@/components/dashboard/StatCard';
import { TeamSummaryWidget } from '@/components/dashboard/TeamSummaryWidget';
import {
    Bot,
    CheckSquare,
    AlertCircle,
    CheckCircle,
    Activity,
    FolderKanban,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '@/lib/utils';

interface ActivityItem {
    id: string;
    timestamp: string;
    event_type: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export default function DashboardPage() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        activeAgents: 0,
        tasksReady: 0,
        blockers: 0,
        completedToday: 0,
    });
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const [agents, tasks, blockers, completed] = await Promise.all([
                supabase.from('agents').select('id').eq('status', 'running'),
                supabase.from('tasks').select('id').eq('status', 'READY'),
                supabase.from('blockers').select('id').neq('status', 'resolved'),
                supabase
                    .from('tasks')
                    .select('id')
                    .eq('status', 'COMPLETED')
                    .gte('completed_at', new Date().toISOString().split('T')[0]),
            ]);

            setStats({
                activeAgents: agents.data?.length || 0,
                tasksReady: tasks.data?.length || 0,
                blockers: blockers.data?.length || 0,
                completedToday: completed.data?.length || 0,
            });
        }

        async function fetchActivity() {
            const { data } = await supabase
                .from('activity_log')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(15);

            setActivity((data as ActivityItem[]) || []);
            setLoading(false);
        }

        fetchStats();
        fetchActivity();

        const channel = supabase
            .channel('dashboard-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'agents' },
                fetchStats
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                fetchStats
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'blockers' },
                fetchStats
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'activity_log' },
                fetchActivity
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'task_completed':
                return <CheckCircle size={16} className="text-emerald-400" />;
            case 'agent_started':
            case 'agent_status':
                return <Bot size={16} className="text-violet-400" />;
            case 'blocker_resolved':
            case 'blocker_created':
                return <AlertCircle size={16} className="text-amber-400" />;
            case 'project_created':
                return <FolderKanban size={16} className="text-blue-400" />;
            default:
                return <Activity size={16} className="text-zinc-400" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
                <p className="text-zinc-400 mt-1">
                    Premium visibility into your autonomous workforce
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Bot}
                    label="Active Agents"
                    value={stats.activeAgents}
                    color="#8b5cf6"
                />
                <StatCard
                    icon={CheckSquare}
                    label="Tasks Ready"
                    value={stats.tasksReady}
                    color="#3b82f6"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Active Blockers"
                    value={stats.blockers}
                    color="#ef4444"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Completed Today"
                    value={stats.completedToday}
                    color="#10b981"
                />
            </div>

            {/* Team Summary Widget */}
            <TeamSummaryWidget />

            {/* Activity Feed */}
            <motion.div
                className="glass rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                    <span className="text-xs text-zinc-500">
                        {activity.length} events
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="shimmer h-12 rounded-lg" />
                        ))}
                    </div>
                ) : activity.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity size={32} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No recent activity</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activity.map((item, i) => (
                            <motion.div
                                key={item.id}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-default"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <div className="mt-0.5">{getEventIcon(item.event_type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-200 leading-relaxed">
                                        {item.message}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {formatTimeAgo(item.timestamp)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
