'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Search,
    FileText,
    Calendar,
    ChevronDown,
    ChevronRight,
    Check,
    Archive,
    RefreshCw,
    Sparkles,
    Heart,
    Shield,
    Target,
    Megaphone,
    Bug,
    BarChart3,
    BookOpen,
    MessageSquare,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface MemoryFile {
    key: string;
    label: string;
    description: string;
    content: string;
    lines: number;
    sizeBytes: number;
    lastModified: string | null;
}

interface MemoryReview {
    id: string;
    review_date: string;
    title: string;
    summary: string;
    changes: Array<{ file: string; description: string }>;
    pruned: Array<{ file: string; item: string }>;
    action_items: Array<{ action: string; status: string }>;
    files_reviewed: string[];
    ashan_notes: string | null;
    status: string;
    created_at: string;
    archived_at?: string;
}

type TabType = 'live' | 'reviews';

const fileIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    soul: Heart,
    index: Brain,
    products: Target,
    strategy: Sparkles,
    architecture: Shield,
    marketing: Megaphone,
    personas: BookOpen,
    'market-research': BarChart3,
    debugging: Bug,
};

const fileColors: Record<string, string> = {
    soul: '#ec4899',
    index: '#a78bfa',
    products: '#10b981',
    strategy: '#f59e0b',
    architecture: '#3b82f6',
    marketing: '#f97316',
    personas: '#ec4899',
    'market-research': '#06b6d4',
    debugging: '#ef4444',
};

const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'rgba(113,113,122,0.15)', text: '#71717a' },
    ready: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    reviewed: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
};

export default function MemoryPage() {
    const supabase = createClient();
    const { toast } = useToast();
    const [files, setFiles] = useState<MemoryFile[]>([]);
    const [reviews, setReviews] = useState<MemoryReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('live');
    const [expandedFile, setExpandedFile] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [notesInput, setNotesInput] = useState<Record<string, string>>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [memoryRes, reviewsRes] = await Promise.all([
            fetch('/api/memory').then((r) => r.json()),
            supabase
                .from('memory_reviews')
                .select('*')
                .is('archived_at', null)
                .order('review_date', { ascending: false }),
        ]);

        if (memoryRes.files) setFiles(memoryRes.files);
        if (reviewsRes.data) setReviews(reviewsRes.data as MemoryReview[]);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredFiles = files.filter(
        (f) =>
            !search ||
            f.label.toLowerCase().includes(search.toLowerCase()) ||
            f.content.toLowerCase().includes(search.toLowerCase())
    );

    const filteredReviews = reviews.filter(
        (r) =>
            !search ||
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.summary?.toLowerCase().includes(search.toLowerCase())
    );

    async function handleReviewAction(id: string, action: 'approve' | 'archive') {
        setActionLoading(id);
        try {
            const body: Record<string, string> = { type: 'memory_reviews', id, action };
            if (action === 'approve' && notesInput[id]) {
                body.notes = notesInput[id];
            }
            const res = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                toast(action === 'approve' ? 'Review marked as reviewed' : 'Archived', 'success');
                if (action === 'archive') {
                    setReviews((prev) => prev.filter((r) => r.id !== id));
                } else {
                    setReviews((prev) =>
                        prev.map((r) =>
                            r.id === id
                                ? { ...r, status: 'reviewed', ashan_notes: notesInput[id] || r.ashan_notes }
                                : r
                        )
                    );
                }
            } else {
                toast(data.error || 'Failed', 'error');
            }
        } catch {
            toast('Network error', 'error');
        }
        setActionLoading(null);
    }

    function formatBytes(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    function getLineLimitColor(lines: number, limit: number): string {
        const ratio = lines / limit;
        if (ratio > 0.9) return '#ef4444';
        if (ratio > 0.7) return '#f59e0b';
        return '#10b981';
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Brain className="text-violet-400" size={28} />
                    Ava&apos;s Memory
                </h1>
                <p className="text-zinc-400 mt-1">
                    Live memory state, weekly reviews, and knowledge management
                </p>
            </div>

            {/* Tabs + Search + Refresh */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`text-sm px-4 py-2 rounded-md transition-all ${
                            activeTab === 'live'
                                ? 'bg-violet-500/20 text-violet-400 font-medium'
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Live State ({files.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`text-sm px-4 py-2 rounded-md transition-all ${
                            activeTab === 'reviews'
                                ? 'bg-violet-500/20 text-violet-400 font-medium'
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Reviews ({reviews.length})
                    </button>
                </div>
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'live' ? 'memory files' : 'reviews'}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <button
                    onClick={fetchData}
                    className="text-sm px-3 py-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="shimmer h-24 rounded-xl" />
                    ))}
                </div>
            ) : activeTab === 'live' ? (
                /* ==================== LIVE MEMORY STATE ==================== */
                <div className="space-y-3">
                    {/* Summary bar */}
                    <div className="glass rounded-xl p-4 flex flex-wrap gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{files.length}</p>
                            <p className="text-[10px] text-zinc-500 uppercase">Files</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">
                                {files.reduce((sum, f) => sum + f.lines, 0)}
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase">Total Lines</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">
                                {formatBytes(files.reduce((sum, f) => sum + f.sizeBytes, 0))}
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase">Total Size</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">
                                {files[0]?.lastModified ? formatDate(files[0].lastModified) : 'N/A'}
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase">Last Updated</p>
                        </div>
                    </div>

                    {/* File cards */}
                    <AnimatePresence>
                        {filteredFiles.map((file, i) => {
                            const isExpanded = expandedFile === file.key;
                            const Icon = fileIcons[file.key] || FileText;
                            const color = fileColors[file.key] || '#71717a';
                            const limit = file.key === 'index' || file.key === 'soul' ? 100 : 150;

                            return (
                                <motion.div
                                    key={file.key}
                                    className="glass rounded-xl card-glow border border-transparent transition-colors overflow-hidden"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    {/* Card header — always visible */}
                                    <button
                                        onClick={() => setExpandedFile(isExpanded ? null : file.key)}
                                        className="w-full p-5 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `${color}15` }}
                                            >
                                                <span style={{ color }}><Icon size={18} /></span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                                    {file.label}
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-normal">
                                                        {file.key === 'soul' ? 'SOUL.md' : `${file.key}.md`}
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-zinc-500 mt-0.5">{file.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Line count with limit indicator */}
                                            <div className="text-right">
                                                <p className="text-sm font-medium" style={{ color: getLineLimitColor(file.lines, limit) }}>
                                                    {file.lines} <span className="text-zinc-600">/ {limit}</span>
                                                </p>
                                                <p className="text-[10px] text-zinc-600">lines</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-zinc-500">{formatBytes(file.sizeBytes)}</p>
                                                <p className="text-[10px] text-zinc-600">
                                                    {file.lastModified ? formatDate(file.lastModified) : '—'}
                                                </p>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown size={16} className="text-zinc-500" />
                                            ) : (
                                                <ChevronRight size={16} className="text-zinc-500" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="border-t border-white/5 px-5 pb-5">
                                                    <pre className="mt-4 text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono bg-black/30 rounded-lg p-4 max-h-[500px] overflow-auto">
                                                        {file.content}
                                                    </pre>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                /* ==================== WEEKLY REVIEWS ==================== */
                filteredReviews.length === 0 ? (
                    <motion.div
                        className="glass rounded-xl p-12 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Brain size={32} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500">No memory reviews yet</p>
                        <p className="text-xs text-zinc-600 mt-1">
                            Ava generates these weekly — or say &quot;review memory&quot; anytime
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredReviews.map((review, i) => {
                                const statusStyle = statusColors[review.status] || statusColors.draft;
                                const isLoading = actionLoading === review.id;

                                return (
                                    <motion.div
                                        key={review.id}
                                        className="glass rounded-xl p-5 card-glow border border-transparent"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: i * 0.04 }}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm">{review.title}</h3>
                                                    <span
                                                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                                                    >
                                                        {review.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar size={10} className="text-zinc-600" />
                                                    <span className="text-[10px] text-zinc-500">
                                                        {formatDate(review.review_date)}
                                                    </span>
                                                    {review.files_reviewed?.length > 0 && (
                                                        <span className="text-[10px] text-zinc-600">
                                                            · {review.files_reviewed.length} files reviewed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        {review.summary && (
                                            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                                {review.summary}
                                            </p>
                                        )}

                                        {/* Changes */}
                                        {review.changes && review.changes.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                                                    Changes Made
                                                </p>
                                                <div className="space-y-1">
                                                    {review.changes.map((change, j) => (
                                                        <div
                                                            key={j}
                                                            className="flex items-start gap-2 text-xs text-zinc-400"
                                                        >
                                                            <span className="text-emerald-400 mt-0.5">+</span>
                                                            <span>
                                                                <span className="text-zinc-500">{change.file}:</span>{' '}
                                                                {change.description}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pruned */}
                                        {review.pruned && review.pruned.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                                                    Pruned
                                                </p>
                                                <div className="space-y-1">
                                                    {review.pruned.map((item, j) => (
                                                        <div
                                                            key={j}
                                                            className="flex items-start gap-2 text-xs text-zinc-400"
                                                        >
                                                            <span className="text-red-400 mt-0.5">−</span>
                                                            <span>
                                                                <span className="text-zinc-500">{item.file}:</span>{' '}
                                                                {item.item}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Items */}
                                        {review.action_items && review.action_items.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                                                    Action Items
                                                </p>
                                                <div className="space-y-1">
                                                    {review.action_items.map((item, j) => (
                                                        <div
                                                            key={j}
                                                            className="flex items-center gap-2 text-xs text-zinc-400"
                                                        >
                                                            <span className="text-amber-400">→</span>
                                                            {item.action}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Ashan's Notes */}
                                        {review.ashan_notes && (
                                            <div className="mb-3 bg-violet-500/5 rounded-lg p-3 border border-violet-500/10">
                                                <p className="text-[10px] text-violet-400 uppercase tracking-wider mb-1">
                                                    Your Notes
                                                </p>
                                                <p className="text-xs text-zinc-300">{review.ashan_notes}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            {review.status !== 'reviewed' && (
                                                <div className="flex-1 w-full sm:w-auto">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <MessageSquare size={10} className="text-zinc-500" />
                                                        <span className="text-[10px] text-zinc-500">Add notes (optional)</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Any feedback or corrections..."
                                                        value={notesInput[review.id] || ''}
                                                        onChange={(e) =>
                                                            setNotesInput((prev) => ({ ...prev, [review.id]: e.target.value }))
                                                        }
                                                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {review.status !== 'reviewed' && (
                                                    <button
                                                        onClick={() => handleReviewAction(review.id, 'approve')}
                                                        disabled={isLoading}
                                                        className="text-[11px] px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <Check size={11} />
                                                        Mark Reviewed
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleReviewAction(review.id, 'archive')}
                                                    disabled={isLoading}
                                                    className="text-[11px] px-2 py-1.5 rounded-md bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <Archive size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )
            )}
        </div>
    );
}
