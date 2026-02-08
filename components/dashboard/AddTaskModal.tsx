'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Zap } from 'lucide-react';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CONTEXT_TYPES = [
    { value: 'code-build', label: '🔨 Code Build' },
    { value: 'deployment', label: '🚀 Deployment' },
    { value: 'research', label: '🔍 Research' },
    { value: 'content', label: '📝 Content' },
    { value: 'other', label: '📋 Other' },
];

const DEFAULTS = {
    executor: 'antigravity',
    independent: true,
    dependencies: [],
    blockers: [],
};

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        priority: 'P2',
        status: 'READY',
        assigned_to: 'antigravity',
        time_estimate: '',
        context_type: 'code-build',
        skip_auto_spawn: false,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim() || !form.context_type) return;

        setLoading(true);

        const taskId = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const { error } = await supabase.from('tasks').insert({
            id: taskId,
            name: form.name,
            description: form.description || null,
            priority: form.priority,
            status: form.status,
            assigned_to: form.assigned_to || DEFAULTS.executor,
            time_estimate: form.time_estimate || null,
            context_type: form.context_type,
            skip_auto_spawn: form.skip_auto_spawn,
            source: 'dashboard',
            synced: false,
            modified_by: 'human',
        });

        if (!error) {
            setForm({
                name: '',
                description: '',
                priority: 'P2',
                status: 'READY',
                assigned_to: 'antigravity',
                time_estimate: '',
                context_type: 'code-build',
                skip_auto_spawn: false,
            });
            onClose();
        }
        setLoading(false);
    }

    const inputClasses =
        'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="glass-strong rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold">Add New Task</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <X size={18} className="text-zinc-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Task Name */}
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                        Task Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        className={inputClasses}
                                        placeholder="e.g. Build Dashboard V2"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({ ...form, description: e.target.value })
                                        }
                                        className={`${inputClasses} resize-none`}
                                        placeholder="Full task instructions for Antigravity..."
                                        rows={4}
                                    />
                                </div>

                                {/* Priority + Context Type */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                            Priority
                                        </label>
                                        <select
                                            value={form.priority}
                                            onChange={(e) =>
                                                setForm({ ...form, priority: e.target.value })
                                            }
                                            className={inputClasses}
                                        >
                                            <option value="P0">P0 — Critical</option>
                                            <option value="P1">P1 — High</option>
                                            <option value="P2">P2 — Medium</option>
                                            <option value="P3">P3 — Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                            Context Type *
                                        </label>
                                        <select
                                            value={form.context_type}
                                            onChange={(e) =>
                                                setForm({ ...form, context_type: e.target.value })
                                            }
                                            className={inputClasses}
                                        >
                                            {CONTEXT_TYPES.map((ct) => (
                                                <option key={ct.value} value={ct.value}>
                                                    {ct.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Status + Assign To */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                            Status
                                        </label>
                                        <select
                                            value={form.status}
                                            onChange={(e) =>
                                                setForm({ ...form, status: e.target.value })
                                            }
                                            className={inputClasses}
                                        >
                                            <option value="READY">Ready</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="BLOCKED">Blocked</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                            Assign To
                                        </label>
                                        <input
                                            type="text"
                                            value={form.assigned_to}
                                            onChange={(e) =>
                                                setForm({ ...form, assigned_to: e.target.value })
                                            }
                                            className={inputClasses}
                                            placeholder="antigravity"
                                        />
                                    </div>
                                </div>

                                {/* Time Estimate */}
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                        Time Estimate
                                    </label>
                                    <input
                                        type="text"
                                        value={form.time_estimate}
                                        onChange={(e) =>
                                            setForm({ ...form, time_estimate: e.target.value })
                                        }
                                        className={inputClasses}
                                        placeholder="e.g. 2-4 hours"
                                    />
                                </div>

                                {/* Skip Auto Spawn Toggle */}
                                <div className="flex items-center justify-between py-2 px-3 bg-white/[0.03] rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-amber-400" />
                                        <span className="text-sm text-zinc-300">Skip auto-spawn</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm({ ...form, skip_auto_spawn: !form.skip_auto_spawn })
                                        }
                                        className={`w-10 h-5 rounded-full transition-colors relative ${form.skip_auto_spawn ? 'bg-violet-600' : 'bg-zinc-700'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.skip_auto_spawn ? 'translate-x-5' : 'translate-x-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-600 -mt-2 pl-1">
                                    When enabled, Conductor won&apos;t auto-assign this task to Antigravity
                                </p>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || !form.name.trim() || !form.context_type}
                                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} />
                                    {loading ? 'Creating...' : 'Create Task'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
