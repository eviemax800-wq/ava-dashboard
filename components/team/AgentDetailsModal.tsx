'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ListTodo, Award, Tag } from 'lucide-react';
import { TeamAgent } from '@/app/dashboard/team/page';
import { formatDistanceToNow } from 'date-fns';

interface AgentDetailsModalProps {
    agent: TeamAgent | null;
    onClose: () => void;
}

export function AgentDetailsModal({ agent, onClose }: AgentDetailsModalProps) {
    if (!agent) return null;

    function formatTimeAgo(date: string | null) {
        if (!date) return 'Never';
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'Unknown';
        }
    }

    const statusConfig = {
        working: { color: 'text-green-400', bg: 'bg-green-500/10' },
        queued: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
        idle: { color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
        blocked: { color: 'text-red-400', bg: 'bg-red-500/10' },
    };

    const config = statusConfig[agent.status];
    const queueCount = agent.queue_tasks?.length || 0;

    return (
        <AnimatePresence>
            {agent && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 overflow-hidden"
                    >
                        <div className="glass-strong rounded-lg border border-white/10 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between p-6 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-3xl ring-2 ring-white/10">
                                        {agent.emoji}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            {agent.name}
                                        </h2>
                                        <p className="text-sm text-zinc-400">{agent.role}</p>
                                        <div
                                            className={`mt-2 inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.color}`}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-current" />
                                            {agent.status.charAt(0).toUpperCase() +
                                                agent.status.slice(1)}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Specialties */}
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Specialties
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(agent.specialties) ? agent.specialties : []).map((specialty, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Task */}
                                {agent.current_task && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            Current Task
                                        </h3>
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                            <p className="text-sm text-white font-medium mb-2">
                                                {agent.current_task.name}
                                            </p>

                                            {/* Progress */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-zinc-500">
                                                    <span>Progress</span>
                                                    <span>{agent.current_task.progress || 0}%</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                                        style={{
                                                            width: `${agent.current_task.progress || 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <p className="text-xs text-zinc-500 mt-3">
                                                Started{' '}
                                                {formatTimeAgo(agent.current_task.startedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Queue */}
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                                        <ListTodo className="w-4 h-4" />
                                        Queue ({queueCount})
                                    </h3>
                                    {queueCount > 0 ? (
                                        <div className="space-y-2">
                                            {agent.queue_tasks.map((task, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 rounded-lg bg-white/5 border border-white/5"
                                                >
                                                    <p className="text-sm text-zinc-300">
                                                        {task.name || `Task ${idx + 1}`}
                                                    </p>
                                                    {task.priority && (
                                                        <span className="text-xs text-zinc-500 mt-1 inline-block">
                                                            {task.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 italic">
                                            No queued tasks
                                        </p>
                                    )}
                                </div>

                                {/* Performance Stats */}
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        Performance
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                            <p className="text-2xl font-bold text-white">
                                                {agent.total_completed}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Tasks Completed
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                            <p className="text-2xl font-bold text-white">
                                                {queueCount}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1">In Queue</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/5">
                                        <p className="text-xs text-zinc-500 mb-1">Last Active</p>
                                        <p className="text-sm text-white">
                                            {formatTimeAgo(agent.last_active)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
