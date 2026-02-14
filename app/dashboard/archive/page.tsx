'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Archive,
    RotateCcw,
    Trash2,
    FileText,
    ExternalLink,
    Calendar,
    Tag,
    Lightbulb,
    Microscope,
    AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface ArchivedItem {
    id: string;
    type: 'proposals' | 'research';
    title: string;
    summary: string;
    status: string;
    report_path: string | null;
    tags: string[];
    archived_at: string;
    archived_reason: string;
    created_at: string;
}

export default function ArchivePage() {
    const supabase = createClient();
    const { toast } = useToast();
    const [items, setItems] = useState<ArchivedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);



    useEffect(() => {
        fetchArchived();
    }, []);

    async function fetchArchived() {
        setLoading(true);
        const [propRes, resRes] = await Promise.all([
            supabase
                .from('proposals')
                .select('*')
                .not('archived_at', 'is', null)
                .order('archived_at', { ascending: false }),
            supabase
                .from('research')
                .select('*')
                .not('archived_at', 'is', null)
                .order('archived_at', { ascending: false }),
        ]);

        const proposals = (propRes.data || []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            type: 'proposals' as const,
            title: p.title as string,
            summary: p.summary as string,
            status: p.status as string,
            report_path: p.report_path as string | null,
            tags: (p.tags as string[]) || [],
            archived_at: p.archived_at as string,
            archived_reason: p.archived_reason as string,
            created_at: p.created_at as string,
        }));

        const research = (resRes.data || []).map((r: Record<string, unknown>) => ({
            id: r.id as string,
            type: 'research' as const,
            title: r.topic as string,
            summary: r.key_findings as string,
            status: (r.status as string) || 'archived',
            report_path: r.report_path as string | null,
            tags: (r.tags as string[]) || [],
            archived_at: r.archived_at as string,
            archived_reason: r.archived_reason as string,
            created_at: r.researched_at as string,
        }));

        setItems([...proposals, ...research].sort((a, b) =>
            new Date(b.archived_at).getTime() - new Date(a.archived_at).getTime()
        ));
        setLoading(false);
    }

    async function handleAction(id: string, type: 'proposals' | 'research', action: 'unarchive' | 'delete') {
        try {
            const res = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, action }),
            });
            const data = await res.json();
            if (data.success) {
                toast(
                    action === 'unarchive' ? 'Restored to main view' : 'Permanently deleted',
                    action === 'unarchive' ? 'success' : 'info'
                );
                setItems((prev) => prev.filter((i) => i.id !== id));
                setConfirmDelete(null);
            } else {
                toast(data.error || 'Action failed', 'error');
            }
        } catch {
            toast('Network error', 'error');
        }
    }

    const openReport = (reportPath: string) => {
        window.open(`/api/reports?path=${encodeURIComponent(reportPath)}`, '_blank');
    };

    const statusColors: Record<string, { bg: string; text: string }> = {
        rejected: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
        archived: { bg: 'rgba(113,113,122,0.15)', text: '#71717a' },
        draft: { bg: 'rgba(113,113,122,0.15)', text: '#71717a' },
        ready: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
        approved: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Archive className="text-zinc-400" size={28} />
                    Archive
                </h1>
                <p className="text-zinc-400 mt-1">
                    Rejected and archived research &amp; proposals
                </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
                <div className="glass rounded-lg px-4 py-2 text-sm">
                    <span className="text-zinc-500">Total: </span>
                    <span className="text-white font-medium">{items.length}</span>
                </div>
                <div className="glass rounded-lg px-4 py-2 text-sm">
                    <span className="text-zinc-500">Rejected: </span>
                    <span className="text-red-400 font-medium">{items.filter(i => i.status === 'rejected').length}</span>
                </div>
                <div className="glass rounded-lg px-4 py-2 text-sm">
                    <span className="text-zinc-500">Archived: </span>
                    <span className="text-zinc-400 font-medium">{items.filter(i => i.status !== 'rejected').length}</span>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-24 rounded-xl" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <motion.div
                    className="glass rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Archive size={32} className="text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500">Archive is empty</p>
                    <p className="text-zinc-600 text-sm mt-1">Rejected and archived items will appear here</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {items.map((item, i) => {
                            const sColor = statusColors[item.status] || statusColors.archived;

                            return (
                                <motion.div
                                    key={item.id}
                                    className="glass rounded-xl p-5 border border-transparent"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-2">
                                            {item.type === 'proposals' ? (
                                                <Lightbulb size={16} className="text-amber-400/50" />
                                            ) : (
                                                <Microscope size={16} className="text-blue-400/50" />
                                            )}
                                            <h3 className="font-semibold text-sm text-zinc-300">{item.title}</h3>
                                            <span
                                                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                                style={{ backgroundColor: sColor.bg, color: sColor.text }}
                                            >
                                                {item.status}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-600">
                                                {item.type === 'proposals' ? 'Proposal' : 'Research'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-600 flex-shrink-0">
                                            <Calendar size={10} />
                                            Archived {formatDate(item.archived_at)}
                                        </div>
                                    </div>

                                    {item.summary && (
                                        <p className="text-sm text-zinc-500 leading-relaxed mb-3 line-clamp-2">
                                            {item.summary}
                                        </p>
                                    )}

                                    {item.archived_reason && (
                                        <p className="text-xs text-zinc-600 mb-3 italic">
                                            Reason: {item.archived_reason}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.tags?.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-600 flex items-center gap-1"
                                                >
                                                    <Tag size={8} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.report_path && (
                                                <button
                                                    onClick={() => openReport(item.report_path!)}
                                                    className="text-[11px] px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                                                >
                                                    <ExternalLink size={10} />
                                                    View
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleAction(item.id, item.type, 'unarchive')}
                                                className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                                            >
                                                <RotateCcw size={10} />
                                                Restore
                                            </button>

                                            {confirmDelete === item.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleAction(item.id, item.type, 'delete')}
                                                        className="text-[11px] px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                                                    >
                                                        <AlertTriangle size={10} />
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        className="text-[11px] px-2 py-1 rounded-md text-zinc-500 hover:text-zinc-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDelete(item.id)}
                                                    className="text-[11px] px-2.5 py-1 rounded-md bg-red-500/10 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 size={10} />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
