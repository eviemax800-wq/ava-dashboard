'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Pause, Play } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatTimeAgo } from '@/lib/utils';

interface AgentActivity {
    id: string;
    agent_name: string;
    agent_icon: string;
    activity_text: string;
    activity_type: string;
    created_at: string;
}

const activityTypeColors: Record<string, string> = {
    build: '#8b5cf6',
    task_completed: '#10b981',
    research: '#3b82f6',
    content: '#ec4899',
    deploy: '#f59e0b',
    system: '#a1a1aa',
    dm: '#ec4899',
    heartbeat: '#6366f1',
    general: '#71717a',
    task_started: '#8b5cf6',
};

export function AgentActivityFeed() {
    const supabase = createClient();
    const [activities, setActivities] = useState<AgentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    async function fetchActivities() {
        const { data } = await supabase
            .from('agent_activity')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(25);

        if (data) {
            setActivities(data as AgentActivity[]);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchActivities();

        // Realtime subscription
        const channel = supabase
            .channel('agent-activity-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'agent_activity' },
                (payload) => {
                    if (!paused) {
                        setActivities((prev) => [payload.new as AgentActivity, ...prev].slice(0, 25));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, paused]);

    return (
        <motion.div
            className="glass rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-violet-400" />
                    <h2 className="text-lg font-semibold">Agent Activity</h2>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                </div>
                <button
                    onClick={() => setPaused(!paused)}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-zinc-500 hover:text-zinc-300"
                    title={paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
                >
                    {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
            </div>

            <div
                ref={scrollRef}
                className="max-h-[320px] overflow-y-auto space-y-0.5 scrollbar-thin"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="shimmer h-14 rounded-lg" />
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity size={28} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No agent activity yet</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {activities.map((item, i) => (
                            <motion.div
                                key={item.id}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.25, delay: i < 3 ? i * 0.05 : 0 }}
                            >
                                {/* Agent icon */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                                    style={{
                                        backgroundColor: `${activityTypeColors[item.activity_type] || '#71717a'}15`,
                                    }}
                                >
                                    {item.agent_icon}
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-200 leading-relaxed">
                                        <span
                                            className="font-semibold"
                                            style={{
                                                color: activityTypeColors[item.activity_type] || '#a1a1aa',
                                            }}
                                        >
                                            {item.agent_name}
                                        </span>{' '}
                                        {item.activity_text}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-0.5">
                                        {formatTimeAgo(item.created_at)}
                                    </p>
                                </div>
                                {/* Activity type dot */}
                                <div
                                    className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"
                                    style={{
                                        backgroundColor: activityTypeColors[item.activity_type] || '#71717a',
                                    }}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
