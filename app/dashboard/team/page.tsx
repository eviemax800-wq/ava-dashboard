'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, Clock, CheckCircle2, ListTodo, ChevronRight } from 'lucide-react';
import { CapacityIndicator } from '@/components/team/CapacityIndicator';

export type TeamAgent = {
    id: string;
    agent_id: string;
    name: string;
    emoji: string;
    role: string;
    specialties: string[] | { routingConfig?: RoutingConfig };
    status: 'idle' | 'queued' | 'working' | 'blocked';
    current_task?: {
        id: string;
        name: string;
        progress: number;
        startedAt: string;
        priority?: string;
        contextType?: string;
        description?: string;
        deliverables?: string[];
    };
    queue_tasks: any[];
    last_active: string | null;
    total_completed: number;
    created_at: string;
    updated_at: string;
};

type RoutingConfig = {
    maxSlots: number;
    antigravityActive: boolean;
    subAgentsDisabled: boolean;
    subAgentNote: string;
};

function getRoutingConfig(agents: TeamAgent[]): RoutingConfig | null {
    for (const agent of agents) {
        const specs = agent.specialties;
        if (specs && typeof specs === 'object' && !Array.isArray(specs) && 'routingConfig' in specs) {
            return specs.routingConfig as RoutingConfig;
        }
        // Also check if it's a JSON string
        if (typeof specs === 'string') {
            try {
                const parsed = JSON.parse(specs);
                if (parsed.routingConfig) return parsed.routingConfig;
            } catch { }
        }
    }
    return null;
}

function formatTimeAgo(date: string | null) {
    if (!date) return 'Never';
    try {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    } catch {
        return 'Unknown';
    }
}

function SlotCard({ slot, queueDepth }: { slot: TeamAgent; queueDepth: number }) {
    const isWorking = slot.status === 'working' && slot.current_task;
    const priorityColors: Record<string, string> = {
        P0: 'bg-red-500/15 text-red-400 border-red-500/30',
        P1: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        P2: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    };

    const contextIcons: Record<string, string> = {
        coding: '💻',
        research: '🔍',
        content: '🎨',
        general: '⚙️',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl border overflow-hidden transition-all ${isWorking
                    ? 'border-green-500/20 shadow-lg shadow-green-500/5'
                    : 'border-white/5'
                }`}
        >
            {/* Slot Header */}
            <div className={`px-5 py-3 flex items-center justify-between ${isWorking ? 'bg-green-500/5' : 'bg-white/[0.02]'
                }`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-xl ring-2 ring-white/10">
                            🚀
                        </div>
                        <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[#0a0a0a] ${isWorking ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'
                                }`}
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">{slot.name}</h3>
                        <p className="text-xs text-zinc-500">Antigravity Processing</p>
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${isWorking
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-zinc-500/10 text-zinc-500'
                    }`}>
                    {isWorking ? 'Working' : 'Available'}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
                {isWorking && slot.current_task ? (
                    <div className="space-y-3">
                        {/* Task Name + Priority */}
                        <div className="flex items-start gap-2">
                            <span className="text-base mt-0.5">
                                {contextIcons[slot.current_task.contextType || 'general']}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white leading-snug">
                                    {slot.current_task.name}
                                </p>
                                {slot.current_task.description && (
                                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                        {slot.current_task.description}
                                    </p>
                                )}
                            </div>
                            {slot.current_task.priority && (
                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${priorityColors[slot.current_task.priority] || 'bg-zinc-500/15 text-zinc-400'
                                    }`}>
                                    {slot.current_task.priority}
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(slot.current_task.progress || 5, 5)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>

                        {/* Time + Type */}
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                Started {formatTimeAgo(slot.current_task.startedAt)}
                            </div>
                            <span className="capitalize">{slot.current_task.contextType || 'general'}</span>
                        </div>

                        {/* Deliverables */}
                        {slot.current_task.deliverables && slot.current_task.deliverables.length > 0 && (
                            <div className="pt-2 border-t border-white/5">
                                <p className="text-xs text-zinc-500 mb-1.5 uppercase tracking-wider font-medium">
                                    Deliverables
                                </p>
                                <ul className="space-y-1">
                                    {slot.current_task.deliverables.slice(0, 3).map((d, i) => (
                                        <li key={i} className="flex items-center gap-1.5 text-xs text-zinc-400">
                                            <ChevronRight className="w-3 h-3 text-violet-500" />
                                            {d}
                                        </li>
                                    ))}
                                    {slot.current_task.deliverables.length > 3 && (
                                        <li className="text-xs text-zinc-600">
                                            +{slot.current_task.deliverables.length - 3} more
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                            <Zap className="w-5 h-5 text-zinc-600" />
                        </div>
                        <p className="text-sm text-zinc-500 font-medium">Ready for next task</p>
                        {queueDepth > 0 && (
                            <p className="text-xs text-zinc-600 mt-1">
                                {queueDepth} task{queueDepth > 1 ? 's' : ''} in queue
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{slot.total_completed} completed</span>
                </div>
                {slot.queue_tasks?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <ListTodo className="w-3.5 h-3.5" />
                        <span>{slot.queue_tasks.length} queued</span>
                    </div>
                )}
                {slot.last_active && (
                    <span className="text-xs text-zinc-600">
                        {formatTimeAgo(slot.last_active)}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

export default function TeamPage() {
    const [slots, setSlots] = useState<TeamAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchSlots();
    }, []);

    // Real-time subscription
    useEffect(() => {
        const subscription = supabase
            .channel('team-slots-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'team_agents',
                },
                () => {
                    fetchSlots();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function fetchSlots() {
        try {
            const { data, error } = await supabase
                .from('team_agents')
                .select('*')
                .like('agent_id', 'slot-%')
                .order('agent_id', { ascending: true });

            if (error) throw error;
            setSlots(data || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoading(false);
        }
    }

    const routingConfig = getRoutingConfig(slots);
    const activeSlots = slots.filter(s => s.status === 'working').length;
    const maxSlots = routingConfig?.maxSlots || slots.length || 2;
    const totalQueued = slots.reduce((sum, s) => sum + (s.queue_tasks?.length || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-zinc-500">Loading slots...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
                        <Zap className="w-8 h-8" />
                        Antigravity
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Processing capacity — {maxSlots} concurrent slots
                    </p>
                </div>

                <CapacityIndicator active={activeSlots} max={maxSlots} />
            </div>

            {/* Sub-agent status note */}
            {routingConfig?.subAgentsDisabled && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10"
                >
                    <AlertTriangle className="w-4 h-4 text-amber-500/60 flex-shrink-0" />
                    <p className="text-xs text-amber-500/70">
                        Sub-agents disabled — all tasks route through Antigravity
                    </p>
                </motion.div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="glass rounded-lg p-4 border border-white/5 bg-green-500/5"
                >
                    <p className="text-3xl font-bold text-green-400">{activeSlots}</p>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">Active</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-lg p-4 border border-white/5 bg-zinc-500/5"
                >
                    <p className="text-3xl font-bold text-zinc-400">{slots.length - activeSlots}</p>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">Available</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-lg p-4 border border-white/5 bg-violet-500/5"
                >
                    <p className="text-3xl font-bold text-violet-400">{totalQueued}</p>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">Queued</p>
                </motion.div>
            </div>

            {/* Slot Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {slots.map((slot) => (
                        <SlotCard
                            key={slot.agent_id}
                            slot={slot}
                            queueDepth={totalQueued}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Queue Preview */}
            {totalQueued > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-xl p-5 border border-white/5"
                >
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-violet-400" />
                        Task Queue
                    </h3>
                    <div className="space-y-2">
                        {slots
                            .flatMap(s => s.queue_tasks || [])
                            .map((task, i) => (
                                <div
                                    key={task.id || i}
                                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5"
                                >
                                    <span className="text-sm text-zinc-300">{task.name}</span>
                                    {task.priority && (
                                        <span className="text-xs font-bold text-zinc-500">{task.priority}</span>
                                    )}
                                </div>
                            ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
