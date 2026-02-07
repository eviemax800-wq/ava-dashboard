'use client';

import { motion } from 'framer-motion';
import { Bot, ExternalLink } from 'lucide-react';
import { agentStatusConfig } from '@/lib/design-tokens';
import { formatTimeAgo } from '@/lib/utils';

interface AgentData {
    id: string;
    label: string;
    task?: string;
    status: string;
    progress: number;
    current_milestone?: string;
    last_update: string;
    started_at?: string;
    completed_at?: string;
    error?: string;
    blockers?: unknown;
}

interface AgentCardProps {
    agent: AgentData;
}

export function AgentCard({ agent }: AgentCardProps) {
    const statusCfg =
        agentStatusConfig[agent.status] || agentStatusConfig.idle;

    return (
        <motion.div
            className="glass rounded-xl p-6 card-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
                    <Bot size={22} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{agent.label}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                        />
                        <span
                            className="text-xs font-medium"
                            style={{ color: statusCfg.color }}
                        >
                            {statusCfg.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Current task */}
            {agent.task && (
                <div className="mb-4">
                    <p className="text-xs text-zinc-500 mb-1">Current Task</p>
                    <p className="text-sm font-medium text-zinc-200 truncate">
                        {agent.task}
                    </p>

                    {/* Progress bar */}
                    {agent.progress > 0 && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-zinc-500">Progress</span>
                                <span className="text-zinc-400 font-medium">
                                    {agent.progress}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${agent.progress}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Milestone */}
            {agent.current_milestone && (
                <div className="mb-4">
                    <p className="text-xs text-zinc-500 mb-1">Current Milestone</p>
                    <p className="text-xs text-zinc-300">{agent.current_milestone}</p>
                </div>
            )}

            {/* Error */}
            {agent.error && (
                <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400">{agent.error}</p>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <p className="text-xs text-zinc-600">
                    Updated {formatTimeAgo(agent.last_update)}
                </p>
                {agent.started_at && (
                    <p className="text-xs text-zinc-600">
                        Started {formatTimeAgo(agent.started_at)}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
