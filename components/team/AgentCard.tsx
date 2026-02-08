'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ListTodo, AlertCircle, Zap } from 'lucide-react';
import { TeamAgent } from '@/app/dashboard/team/page';
import { formatDistanceToNow } from 'date-fns';

interface AgentCardProps {
    agent: TeamAgent;
    onClick: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
    const statusConfig = {
        working: {
            color: 'bg-green-500',
            ringColor: 'ring-green-500/30',
            textColor: 'text-green-400',
            bgColor: 'bg-green-500/10',
            label: 'Working',
            pulse: true,
        },
        queued: {
            color: 'bg-amber-500',
            ringColor: 'ring-amber-500/30',
            textColor: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            label: 'Queued',
            pulse: false,
        },
        idle: {
            color: 'bg-zinc-500',
            ringColor: 'ring-zinc-500/30',
            textColor: 'text-zinc-400',
            bgColor: 'bg-zinc-500/10',
            label: 'Idle',
            pulse: false,
        },
        blocked: {
            color: 'bg-red-500',
            ringColor: 'ring-red-500/30',
            textColor: 'text-red-400',
            bgColor: 'bg-red-500/10',
            label: 'Blocked',
            pulse: true,
        },
    };

    const config = statusConfig[agent.status];
    const queueCount = agent.queue_tasks?.length || 0;

    function formatTimeAgo(date: string | null) {
        if (!date) return 'Never';
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'Unknown';
        }
    }

    function getProgress() {
        if (!agent.current_task) return 0;
        return agent.current_task.progress || 0;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="glass rounded-lg p-4 border border-white/5 cursor-pointer transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10"
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-2xl ring-2 ring-white/10">
                        {agent.emoji}
                    </div>
                    {/* Status indicator */}
                    <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${config.color} rounded-full ring-2 ring-[#0a0a0a] ${config.pulse ? 'animate-pulse' : ''}`}
                    />
                </div>

                {/* Name & Role */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{agent.name}</h3>
                    <p className="text-xs text-zinc-500 truncate">{agent.role}</p>
                </div>

                {/* Status badge */}
                <div
                    className={`px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}
                >
                    {config.label}
                </div>
            </div>

            {/* Current Task */}
            {agent.status === 'working' && agent.current_task && (
                <div className="mb-3 p-2 rounded bg-white/5 border border-white/5">
                    <div className="flex items-start gap-2 mb-2">
                        <Zap className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-300 line-clamp-2">
                            {agent.current_task.name}
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgress()}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-zinc-500">
                        <Clock className="w-3 h-3" />
                        Started {formatTimeAgo(agent.current_task.startedAt)}
                    </div>
                </div>
            )}

            {/* Queued status indicator */}
            {agent.status === 'queued' && (
                <div className="mb-3 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Waiting for Antigravity capacity</span>
                    </div>
                </div>
            )}

            {/* Blocked status indicator */}
            {agent.status === 'blocked' && (
                <div className="mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 text-xs text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Task blocked</span>
                    </div>
                </div>
            )}

            {/* Queue & Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                {/* Queue count */}
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>
                        {queueCount} in queue
                    </span>
                </div>

                {/* Completed count */}
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{agent.total_completed} done</span>
                </div>
            </div>

            {/* Last active */}
            <div className="mt-2 text-xs text-zinc-600 text-center">
                {agent.last_active ? formatTimeAgo(agent.last_active) : 'Never active'}
            </div>
        </motion.div>
    );
}
