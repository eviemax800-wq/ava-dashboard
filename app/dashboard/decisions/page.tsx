'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    CheckCircle,
    XCircle,
    Clock,
    HelpCircle,
    Search,
    Filter,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface Decision {
    id: string;
    title: string;
    context: string;
    category: string;
    outcome_status: string;
    learnings: string;
    decision_date: string;
    created_at: string;
}

const outcomeConfig: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string; label: string }> = {
    validated: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Validated' },
    invalidated: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Invalidated' },
    pending: { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Pending' },
    unknown: { icon: HelpCircle, color: '#71717a', bg: 'rgba(113,113,122,0.15)', label: 'Unknown' },
};

const categoryLabels: Record<string, string> = {
    product_strategy: 'Product Strategy',
    pricing: 'Pricing',
    market_positioning: 'Market Positioning',
    feature_prioritization: 'Feature Priority',
    go_to_market: 'Go-to-Market',
    general: 'General',
};

const categories = ['all', 'product_strategy', 'pricing', 'market_positioning', 'feature_prioritization', 'go_to_market', 'general'];

export default function DecisionsPage() {
    const supabase = createClient();
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        async function fetchDecisions() {
            let query = supabase
                .from('decisions')
                .select('*')
                .order('decision_date', { ascending: false });

            if (search) {
                query = query.or(`title.ilike.%${search}%,context.ilike.%${search}%,learnings.ilike.%${search}%`);
            }
            if (categoryFilter !== 'all') {
                query = query.eq('category', categoryFilter);
            }

            const { data } = await query;
            if (data) setDecisions(data as Decision[]);
            setLoading(false);
        }
        fetchDecisions();
    }, [supabase, search, categoryFilter]);

    // Stats
    const total = decisions.length;
    const validated = decisions.filter((d) => d.outcome_status === 'validated').length;
    const pending = decisions.filter((d) => d.outcome_status === 'pending').length;
    const successRate = total > 0 ? Math.round((validated / Math.max(validated + decisions.filter(d => d.outcome_status === 'invalidated').length, 1)) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BookOpen className="text-amber-400" size={28} />
                    Decision Log
                </h1>
                <p className="text-zinc-400 mt-1">
                    Strategic decisions with context, outcomes, and learnings
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Decisions', value: total, color: '#8b5cf6' },
                    { label: 'Validated', value: validated, color: '#10b981' },
                    { label: 'Pending', value: pending, color: '#f59e0b' },
                    { label: 'Success Rate', value: `${successRate}%`, color: '#3b82f6' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="glass rounded-xl p-4 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <p className="text-2xl font-bold" style={{ color: stat.color }}>
                            {stat.value}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search decisions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Filter size={14} className="text-zinc-500 flex-shrink-0" />
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${categoryFilter === cat
                                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                    : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                                }`}
                        >
                            {cat === 'all' ? 'All' : categoryLabels[cat] || cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Decision Cards */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-36 rounded-xl" />
                    ))}
                </div>
            ) : decisions.length === 0 ? (
                <motion.div
                    className="glass rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <BookOpen size={32} className="text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500">No decisions logged yet</p>
                </motion.div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-3">
                        {decisions.map((decision, i) => {
                            const outcome = outcomeConfig[decision.outcome_status] || outcomeConfig.unknown;
                            const OutcomeIcon = outcome.icon;

                            return (
                                <motion.div
                                    key={decision.id}
                                    className="glass rounded-xl p-5 card-glow"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    layout
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm">{decision.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-zinc-500">
                                                    {formatDate(decision.decision_date)}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-500">
                                                    {categoryLabels[decision.category] || decision.category}
                                                </span>
                                            </div>
                                        </div>
                                        <span
                                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: outcome.bg,
                                                color: outcome.color,
                                            }}
                                        >
                                            <OutcomeIcon size={12} />
                                            {outcome.label}
                                        </span>
                                    </div>

                                    {decision.context && (
                                        <p className="text-sm text-zinc-400 mb-2 leading-relaxed">
                                            {decision.context}
                                        </p>
                                    )}

                                    {decision.learnings && (
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2 mt-2">
                                            <span className="text-[10px] text-emerald-400 font-medium block mb-0.5">
                                                Learning
                                            </span>
                                            <p className="text-xs text-zinc-400">{decision.learnings}</p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
