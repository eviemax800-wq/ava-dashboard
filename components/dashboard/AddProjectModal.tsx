'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddProjectModal({ isOpen, onClose }: AddProjectModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        type: 'platform',
        health_score: 100,
        progress_percent: 0,
        next_milestone: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('projects').insert({
            name: form.name,
            type: form.type,
            health_score: form.health_score,
            progress_percent: form.progress_percent,
            next_milestone: form.next_milestone || null,
            last_activity: new Date().toISOString(),
        });

        if (!error) {
            setForm({
                name: '',
                type: 'platform',
                health_score: 100,
                progress_percent: 0,
                next_milestone: '',
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
                                <h2 className="text-lg font-semibold">Add New Project</h2>
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
                                        Project Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                                        placeholder="e.g. Luna & Margot"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                        Type
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) =>
                                            setForm({ ...form, type: e.target.value })
                                        }
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                    >
                                        <option value="ai-influencer">AI Influencer</option>
                                        <option value="saas">SaaS</option>
                                        <option value="platform">Platform</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                            Health Score (0-100)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={form.health_score}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    health_score: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                            Progress (0-100)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={form.progress_percent}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    progress_percent: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                        Next Milestone
                                    </label>
                                    <input
                                        type="text"
                                        value={form.next_milestone}
                                        onChange={(e) =>
                                            setForm({ ...form, next_milestone: e.target.value })
                                        }
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                                        placeholder="e.g. MVP Launch"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !form.name}
                                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} />
                                    {loading ? 'Creating...' : 'Create Project'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
