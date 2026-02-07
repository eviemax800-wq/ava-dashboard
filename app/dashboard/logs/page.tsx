'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
    Activity,
    Bot,
    CheckCircle,
    AlertCircle,
    FolderKanban,
    Filter,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

interface LogEntry {
    id: string;
    timestamp: string;
    event_type: string;
    agent_id?: string;
    task_id?: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export default function LogsPage() {
    const supabase = createClient();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');

    const fetchLogs = useCallback(async () => {
        let query = supabase
            .from('activity_log')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

        if (filterType !== 'all') {
            query = query.eq('event_type', filterType);
        }

        const { data } = await query;
        setLogs((data as LogEntry[]) || []);
        setLoading(false);
    }, [supabase, filterType]);

    useEffect(() => {
        fetchLogs();

        const channel = supabase
            .channel('logs-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'activity_log' },
                fetchLogs
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchLogs]);

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'task_completed':
                return <CheckCircle size={14} className="text-emerald-400" />;
            case 'agent_started':
            case 'agent_status':
                return <Bot size={14} className="text-violet-400" />;
            case 'blocker_resolved':
            case 'blocker_created':
                return <AlertCircle size={14} className="text-amber-400" />;
            case 'project_created':
                return <FolderKanban size={14} className="text-blue-400" />;
            default:
                return <Activity size={14} className="text-zinc-500" />;
        }
    };

    const eventTypes = [
        'all',
        ...Array.from(new Set(logs.map((l) => l.event_type))),
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="shimmer h-10 w-48 rounded-lg" />
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="shimmer h-12 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                <p className="text-zinc-400 mt-1 text-sm">
                    Full audit trail of system events
                </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-zinc-500" />
                {eventTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => {
                            setFilterType(type);
                            setLoading(true);
                        }}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${filterType === type
                                ? 'bg-violet-600 text-white'
                                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {type === 'all' ? 'All' : type.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Logs */}
            <motion.div
                className="glass rounded-xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity size={32} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No log entries found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {logs.map((log, i) => (
                            <motion.div
                                key={log.id}
                                className="flex items-start gap-3 p-4 hover:bg-white/[0.02] transition-colors"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                            >
                                <div className="mt-0.5">{getEventIcon(log.event_type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-200">{log.message}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-medium">
                                            {log.event_type}
                                        </span>
                                        <span className="text-xs text-zinc-600">
                                            {formatTimeAgo(log.timestamp)}
                                        </span>
                                        {log.agent_id && (
                                            <span className="text-xs text-zinc-600">
                                                Agent: {log.agent_id.slice(0, 8)}...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
