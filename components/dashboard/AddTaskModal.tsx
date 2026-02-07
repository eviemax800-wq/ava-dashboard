'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        priority: 'P2',
        status: 'READY',
        assigned_to: '',
        time_estimate: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('tasks').insert({
            name: form.name,
            description: form.description || null,
            priority: form.priority,
            status: form.status,
            assigned_to: form.assigned_to || null,
            time_estimate: form.time_estimate || null,
        });

        if (!error) {
            setForm({
                name: '',
                description: '',
                priority: 'P2',
                status: 'READY',
                assigned_to: '',
                time_estimate: '',
            });
            onClose();
        }
        setLoading(false);
    }

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
                            className="glass-strong rounded-xl p-6 w-full max-w-md"
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
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                                        placeholder="e.g. Build Dashboard V2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({ ...form, description: e.target.value })
                                        }
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                                        placeholder="Task details..."
                                        rows={3}
                                    />
                                </div>

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
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                        >
                                            <option value="P0">P0 — Critical</option>
                                            <option value="P1">P1 — High</option>
                                            <option value="P2">P2 — Medium</option>
                                            <option value="P3">P3 — Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                            Status
                                        </label>
                                        <select
                                            value={form.status}
                                            onChange={(e) =>
                                                setForm({ ...form, status: e.target.value })
                                            }
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                        >
                                            <option value="READY">Ready</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="BLOCKED">Blocked</option>
                                        </select>
                                    </div>
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
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                                        placeholder="e.g. antigravity"
                                    />
                                </div>

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
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                                        placeholder="e.g. 2-4 hours"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !form.name}
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
