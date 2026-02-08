'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    RotateCcw,
    Lock,
    Zap,
    Edit3,
    Save,
} from 'lucide-react';
import { priorityConfig, statusConfig } from '@/lib/design-tokens';

interface Task {
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
    context_type?: string;
    skip_auto_spawn?: boolean;
    source?: string;
    modified_by?: string;
    retry_count?: number;
}

interface TaskDetailPanelProps {
    task: Task | null;
    onClose: () => void;
    onUpdate?: () => void;
}

export function TaskDetailPanel({ task, onClose, onUpdate }: TaskDetailPanelProps) {
    const supabase = createClient();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        description: '',
        priority: '',
        skip_auto_spawn: false,
    });

    if (!task) return null;

    const t = task;
    const isLocked = t.status === 'IN_PROGRESS';
    const isCompleted = t.status === 'COMPLETED';
    const canEdit = !isLocked && !isCompleted;
    const priority = priorityConfig[t.priority] || priorityConfig.P2;
    const status = statusConfig[t.status] || statusConfig.READY;

    function startEditing() {
        setEditForm({
            description: t.description || '',
            priority: t.priority,
            skip_auto_spawn: t.skip_auto_spawn || false,
        });
        setEditing(true);
    }

    async function handleSave() {
        setSaving(true);
        await supabase.from('tasks').update({
            description: editForm.description || null,
            priority: editForm.priority,
            skip_auto_spawn: editForm.skip_auto_spawn,
            modified_by: 'human',
            synced: false,
            updated_at: new Date().toISOString(),
        }).eq('id', t.id);

        setEditing(false);
        setSaving(false);
        onUpdate?.();
    }

    async function handleRetry() {
        await supabase.from('tasks').update({
            status: 'READY',
            retry_count: 0,
            modified_by: 'human',
            synced: false,
            updated_at: new Date().toISOString(),
        }).eq('id', t.id);
        onUpdate?.();
    }

    function formatDate(dateStr?: string) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('en-AU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    const inputClasses =
        'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors';

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Panel */}
            <motion.div
                className="fixed top-0 right-0 h-full w-full max-w-md z-50 glass-strong border-l border-white/10 overflow-y-auto"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl p-5 border-b border-white/5 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                                style={{ color: priority.color, backgroundColor: priority.bg }}
                            >
                                {task.priority}
                            </span>
                            <span
                                className="inline-block text-[10px] px-1.5 py-0.5 rounded font-medium"
                                style={{ color: status.color, backgroundColor: status.bg }}
                            >
                                {status.label}
                            </span>
                            {isLocked && (
                                <Lock size={12} className="text-amber-400" />
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        >
                            <X size={16} className="text-zinc-400" />
                        </button>
                    </div>
                    <h2 className="text-lg font-semibold mt-3 text-zinc-100">{task.name}</h2>
                </div>

                <div className="p-5 space-y-5">
                    {/* Lock warning */}
                    {isLocked && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                            <Lock size={12} />
                            Task is running — editing locked
                        </div>
                    )}

                    {/* Meta row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/[0.03] rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <User size={11} />
                                Assigned To
                            </div>
                            <p className="text-sm text-zinc-200">{task.assigned_to || '—'}</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Clock size={11} />
                                Time Estimate
                            </div>
                            <p className="text-sm text-zinc-200">{task.time_estimate || '—'}</p>
                        </div>
                    </div>

                    {/* Source + Modified By */}
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span>
                            Source: {task.source === 'dashboard' ? '👤 Dashboard' : '🤖 Ava'}
                        </span>
                        {task.modified_by && (
                            <span>
                                Last edit: {task.modified_by === 'human' ? '👤 Human' : task.modified_by === 'ava' ? '🤖 Ava' : '⚙️ System'}
                            </span>
                        )}
                    </div>

                    {/* Context Type */}
                    {task.context_type && (
                        <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                            <span className="text-xs text-zinc-500">Context Type: </span>
                            <span className="text-xs text-zinc-300 font-medium">{task.context_type}</span>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                Description
                            </h3>
                            {canEdit && !editing && (
                                <button
                                    onClick={startEditing}
                                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    <Edit3 size={11} />
                                    Edit
                                </button>
                            )}
                        </div>
                        {editing ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, description: e.target.value })
                                    }
                                    className={`${inputClasses} resize-none`}
                                    rows={6}
                                />
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5">Priority</label>
                                    <select
                                        value={editForm.priority}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, priority: e.target.value })
                                        }
                                        className={inputClasses}
                                    >
                                        <option value="P0">P0 — Critical</option>
                                        <option value="P1">P1 — High</option>
                                        <option value="P2">P2 — Medium</option>
                                        <option value="P3">P3 — Low</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between py-2 px-3 bg-white/[0.03] rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-amber-400" />
                                        <span className="text-sm text-zinc-300">Skip auto-spawn</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditForm({ ...editForm, skip_auto_spawn: !editForm.skip_auto_spawn })
                                        }
                                        className={`w-10 h-5 rounded-full transition-colors relative ${editForm.skip_auto_spawn ? 'bg-violet-600' : 'bg-zinc-700'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editForm.skip_auto_spawn ? 'translate-x-5' : 'translate-x-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Save size={13} />
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="px-4 py-2 bg-white/5 text-zinc-300 text-sm rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                {task.description || 'No description provided.'}
                            </p>
                        )}
                    </div>

                    {/* Blockers */}
                    {task.blockers && task.blockers.length > 0 && (
                        <div>
                            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                                Blockers
                            </h3>
                            <div className="space-y-1.5">
                                {task.blockers.map((b, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3 py-2 rounded-lg"
                                    >
                                        <AlertCircle size={12} />
                                        {b}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timestamps (Read-only) */}
                    <div>
                        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                            Timeline
                        </h3>
                        <div className="space-y-1.5 text-xs text-zinc-500">
                            <div className="flex justify-between">
                                <span>Created</span>
                                <span className="text-zinc-400">{formatDate(task.created_at)}</span>
                            </div>
                            {task.updated_at && (
                                <div className="flex justify-between">
                                    <span>Updated</span>
                                    <span className="text-zinc-400">{formatDate(task.updated_at)}</span>
                                </div>
                            )}
                            {task.completed_at && (
                                <div className="flex justify-between">
                                    <span>Completed</span>
                                    <span className="text-emerald-400">{formatDate(task.completed_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Retry button for BLOCKED tasks */}
                    {task.status === 'BLOCKED' && (
                        <button
                            onClick={handleRetry}
                            className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-amber-500/20"
                        >
                            <RotateCcw size={14} />
                            Retry Task
                        </button>
                    )}

                    {/* Completed indicator */}
                    {isCompleted && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300">
                            <CheckCircle2 size={12} />
                            Task completed successfully
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
