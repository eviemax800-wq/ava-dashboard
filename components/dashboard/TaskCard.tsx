'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertCircle, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { priorityConfig } from '@/lib/design-tokens';

interface TaskData {
    id: string;
    name: string;
    description?: string;
    priority: string;
    status: string;
    assigned_to?: string | null;
    blockers?: string[];
    time_estimate?: string;
    created_at: string;
    updated_at?: string;
    completed_at?: string;
    progress?: number;
    source?: string;
    skip_auto_spawn?: boolean;
    context_type?: string;
    modified_by?: string;
}

interface TaskCardProps {
    task: TaskData;
    onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const isLocked = task.status === 'IN_PROGRESS';

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        disabled: isLocked,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 100 : undefined,
    };

    const priority = priorityConfig[task.priority] || priorityConfig.P2;
    const hasBlockers =
        task.blockers && task.blockers.length > 0 && task.status === 'BLOCKED';

    return (
        <div ref={setNodeRef} style={style}>
            <motion.div
                className={`bg-[#1a1a1a] border rounded-lg p-4 cursor-pointer transition-all duration-200 group ${isLocked
                        ? 'border-amber-500/20 bg-amber-500/[0.03]'
                        : 'border-white/[0.06] hover:border-violet-500/30'
                    }`}
                whileHover={!isLocked ? { y: -1 } : undefined}
                onClick={onClick}
            >
                <div className="flex items-start gap-2">
                    {/* Drag handle */}
                    {!isLocked ? (
                        <div
                            {...listeners}
                            {...attributes}
                            className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <GripVertical size={14} className="text-zinc-600" />
                        </div>
                    ) : (
                        <div className="mt-1">
                            <Lock size={12} className="text-amber-400/60" />
                        </div>
                    )}

                    <div className="flex-1 space-y-2.5 min-w-0">
                        {/* Priority badge + Title */}
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                                    style={{
                                        color: priority.color,
                                        backgroundColor: priority.bg,
                                    }}
                                >
                                    {task.priority}
                                </span>
                                {task.source === 'dashboard' && (
                                    <span className="text-[9px] px-1 py-0.5 rounded bg-violet-500/15 text-violet-400 font-medium">
                                        👤
                                    </span>
                                )}
                                {task.skip_auto_spawn && (
                                    <Zap size={10} className="text-amber-400/60" />
                                )}
                            </div>
                            <h3 className="font-medium text-sm mt-1.5 text-zinc-100 leading-snug truncate">
                                {task.name}
                            </h3>
                        </div>

                        {/* Context type */}
                        {task.context_type && (
                            <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                                {task.context_type}
                            </div>
                        )}

                        {/* Agent */}
                        {task.assigned_to && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <span>🤖</span>
                                <span className="truncate">{task.assigned_to}</span>
                            </div>
                        )}

                        {/* Time estimate */}
                        {task.time_estimate && (
                            <div className="text-xs text-zinc-600">
                                ⏱ {task.time_estimate}
                            </div>
                        )}

                        {/* Blocker warning */}
                        {hasBlockers && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
                                <AlertCircle size={12} />
                                <span className="truncate">
                                    {task.blockers![0]}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
