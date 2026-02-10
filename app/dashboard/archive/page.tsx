'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Archive as ArchiveIcon,
    FileText,
    Lightbulb,
    Calendar,
    ExternalLink,
    Tag,
    Microscope,
    Trash2,
    RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface Research {
    id: string;
    topic: string;
    key_findings: string;
    report_path: string;
    tags: string[];
    archived_at: string;
    archived_reason: string | null;
}

interface Proposal {
    id: string;
    title: string;
    summary: string;
    status: string;
    report_path: string;
    tags: string[];
    archived_at: string;
    archived_reason: string | null;
    created_at: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
    rejected: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    archived: { bg: 'rgba(113,113,122,0.15)', text: '#71717a' },
};

export default function ArchivePage() {
    const supabase = createClient();
    const [research, setResearch] = useState<Research[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArchived();
    }, []);

    async function fetchArchived() {
        const [researchRes, propRes] = await Promise.all([
            supabase
                .from('research')
                .select('*')
                .not('archived_at', 'is', null)
                .order('archived_at', { ascending: false }),
            supabase
                .from('proposals')
                .select('*')
                .or('status.eq.rejected,and(archived_at.not.is.null)')
                .order('archived_at', { ascending: false }),
        ]);

        if (researchRes.data) setResearch(researchRes.data as Research[]);
        if (propRes.data) setProposals(propRes.data as Proposal[]);
        setLoading(false);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilriyvzvwarnqrbnranq.supabase.co';

    const openReport = (reportPath: string | null | undefined) => {
        if (!reportPath) return;
        window.open(`${supabaseUrl}/storage/v1/object/public/reports/${reportPath}`, '_blank');
    };

    async function handleUnarchiveResearch(id: string) {
        const res = await fetch(`/api/research/${id}/unarchive`, { method: 'POST' });
        if (res.ok) {
            setResearch(research.filter(r => r.id !== id));
            // Show toast (implement toast component if needed)
            alert('Research unarchived!');
        }
    }

    async function handleUnarchiveProposal(id: string) {
        const res = await fetch(`/api/proposals/${id}/unarchive`, { method: 'POST' });
        if (res.ok) {
            setProposals(proposals.filter(p => p.id !== id));
            alert('Proposal unarchived!');
        }
    }

    async function handleDeleteResearch(id: string) {
        if (!confirm('Permanently delete this research item? This cannot be undone.')) return;
        
        const res = await fetch(`/api/research/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setResearch(research.filter(r => r.id !== id));
            alert('Research permanently deleted!');
        }
    }

    async function handleDeleteProposal(id: string) {
        if (!confirm('Permanently delete this proposal? This cannot be undone.')) return;
        
        const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setProposals(proposals.filter(p => p.id !== id));
            alert('Proposal permanently deleted!');
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ArchiveIcon className="text-gray-400" size={32} />
                    📁 Archive
                </h1>
                <p className="text-gray-600 dark:text-zinc-400 mt-2">
                    Rejected and archived proposals & research
                </p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-32 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Proposals Section */}
                    {proposals.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                                <Lightbulb size={20} className="text-amber-400" />
                                Proposals ({proposals.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {proposals.map((prop, i) => {
                                    const isRejected = prop.status === 'rejected';
                                    const statusStyle = isRejected ? statusColors.rejected : statusColors.archived;

                                    return (
                                        <motion.div
                                            key={prop.id}
                                            className="glass rounded-xl p-5 card-glow border border-white/10"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Lightbulb size={16} className="text-amber-400 flex-shrink-0" />
                                                    <h3 className="font-semibold text-sm">{prop.title}</h3>
                                                </div>
                                                <span
                                                    className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                                    style={{
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.text,
                                                    }}
                                                >
                                                    {isRejected ? 'Rejected' : 'Archived'}
                                                </span>
                                            </div>

                                            {prop.summary && (
                                                <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                                                    {prop.summary}
                                                </p>
                                            )}

                                            {prop.archived_reason && (
                                                <div className="mb-3 p-2 bg-white/5 rounded text-xs text-zinc-500">
                                                    <span className="font-medium">Reason:</span> {prop.archived_reason}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {prop.tags?.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 flex items-center gap-1"
                                                        >
                                                            <Tag size={8} />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                                                    <Calendar size={10} />
                                                    {formatDate(prop.archived_at)}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                {prop.report_path && (
                                                    <button
                                                        onClick={() => openReport(prop.report_path)}
                                                        className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                                    >
                                                        <FileText size={12} />
                                                        View
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleUnarchiveProposal(prop.id)}
                                                    className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <RotateCcw size={12} />
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProposal(prop.id)}
                                                    className="px-3 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Research Section */}
                    {research.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                                <Microscope size={20} className="text-blue-400" />
                                Research ({research.length})
                            </h2>
                            <div className="space-y-3">
                                {research.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        className="glass rounded-xl p-5 card-glow border border-white/10"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-sm">{item.topic}</h3>
                                                <span
                                                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                                    style={{
                                                        backgroundColor: statusColors.archived.bg,
                                                        color: statusColors.archived.text,
                                                    }}
                                                >
                                                    Archived
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-zinc-500 flex-shrink-0">
                                                <Calendar size={10} />
                                                {formatDate(item.archived_at)}
                                            </div>
                                        </div>

                                        {item.key_findings && (
                                            <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                                                {item.key_findings}
                                            </p>
                                        )}

                                        {item.archived_reason && (
                                            <div className="mb-3 p-2 bg-white/5 rounded text-xs text-zinc-500">
                                                <span className="font-medium">Reason:</span> {item.archived_reason}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {item.tags?.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 flex items-center gap-1"
                                                    >
                                                        <Tag size={8} />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {item.report_path && (
                                                <button
                                                    onClick={() => openReport(item.report_path)}
                                                    className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <FileText size={12} />
                                                    View
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleUnarchiveResearch(item.id)}
                                                className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <RotateCcw size={12} />
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => handleDeleteResearch(item.id)}
                                                className="px-3 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {proposals.length === 0 && research.length === 0 && (
                        <motion.div
                            className="glass rounded-xl p-12 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <ArchiveIcon size={48} className="text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-500">Archive is empty</p>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
