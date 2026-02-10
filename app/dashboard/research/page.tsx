'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Microscope,
    Search,
    Tag,
    Globe,
    Shield,
    Swords,
    Calendar,
    ExternalLink,
    FileText,
    Lightbulb,
    Check,
    X,
    Archive,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface Research {
    id: string;
    topic: string;
    key_findings: string;
    full_report_url: string;
    report_path: string;
    tags: string[];
    source: string;
    researched_at: string;
}

interface Competitor {
    id: string;
    name: string;
    market: string;
    product_url: string;
    pricing: string;
    strengths: string;
    weaknesses: string;
    notes: string;
    last_updated: string;
}

interface Proposal {
    id: string;
    title: string;
    summary: string;
    category: string;
    status: string;
    report_url: string;
    report_path: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

const marketColors: Record<string, string> = {
    invoicing: '#10b981',
    property_investment: '#3b82f6',
    ai_influencers: '#ec4899',
    testimonials: '#f59e0b',
    Invoicing: '#10b981',
    'AI Influencers': '#ec4899',
    'AI Creators': '#ec4899',
    'Property Investment': '#3b82f6',
    'Testimonials/Reviews': '#f59e0b',
};

const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'rgba(113,113,122,0.15)', text: '#71717a' },
    ready: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
    approved: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    implemented: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' },
    rejected: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};

type TabType = 'research' | 'competitors' | 'proposals';

export default function ResearchPage() {
    const supabase = createClient();
    const [research, setResearch] = useState<Research[]>([]);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('research');

    useEffect(() => {
        async function fetchData() {
            const [researchRes, compRes, propRes] = await Promise.all([
                supabase
                    .from('research')
                    .select('*')
                    .is('archived_at', null)
                    .order('researched_at', { ascending: false }),
                supabase
                    .from('competitors')
                    .select('*')
                    .order('market'),
                supabase
                    .from('proposals')
                    .select('*')
                    .is('archived_at', null)
                    .neq('status', 'rejected')
                    .order('created_at', { ascending: false }),
            ]);

            if (researchRes.data) setResearch(researchRes.data as Research[]);
            if (compRes.data) setCompetitors(compRes.data as Competitor[]);
            if (propRes.data) setProposals(propRes.data as Proposal[]);
            setLoading(false);
        }
        fetchData();
    }, [supabase]);

    const filteredResearch = research.filter(
        (r) =>
            !search ||
            r.topic.toLowerCase().includes(search.toLowerCase()) ||
            r.key_findings?.toLowerCase().includes(search.toLowerCase()) ||
            r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

    const filteredCompetitors = competitors.filter(
        (c) =>
            !search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.market.toLowerCase().includes(search.toLowerCase())
    );

    const filteredProposals = proposals.filter(
        (p) =>
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.summary?.toLowerCase().includes(search.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilriyvzvwarnqrbnranq.supabase.co';

    const openReport = (reportPath: string | null | undefined) => {
        if (!reportPath) return;
        window.open(`${supabaseUrl}/storage/v1/object/public/reports/${reportPath}`, '_blank');
    };

    // Handler functions for proposals
    async function handleApproveProposal(id: string, event: React.MouseEvent) {
        event.stopPropagation();
        const res = await fetch(`/api/proposals/${id}/approve`, { method: 'POST' });
        if (res.ok) {
            setProposals(proposals.map(p => p.id === id ? { ...p, status: 'approved' } : p));
            alert('✓ Approved!');
        }
    }

    async function handleRejectProposal(id: string, event: React.MouseEvent) {
        event.stopPropagation();
        const reason = prompt('Reason for rejection (optional):');
        if (reason === null) return; // User cancelled

        const res = await fetch(`/api/proposals/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (res.ok) {
            setProposals(proposals.filter(p => p.id !== id));
            alert('✗ Rejected and archived');
        }
    }

    async function handleArchiveProposal(id: string, event: React.MouseEvent) {
        event.stopPropagation();
        const reason = prompt('Reason for archiving (optional):');
        if (reason === null) return;

        const res = await fetch(`/api/proposals/${id}/archive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (res.ok) {
            setProposals(proposals.filter(p => p.id !== id));
            alert('📁 Archived');
        }
    }

    // Handler functions for research
    async function handleApproveResearch(id: string, event: React.MouseEvent) {
        event.stopPropagation();
        const res = await fetch(`/api/research/${id}/approve`, { method: 'POST' });
        if (res.ok) {
            alert('✓ Approved!');
        }
    }

    async function handleRejectResearch(id: string, event: React.MouseEvent) {
        event.stopPropagation();
        const reason = prompt('Reason for rejection (optional):');
        if (reason === null) return;

        const res = await fetch(`/api/research/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (res.ok) {
            setResearch(research.filter(r => r.id !== id));
            alert('✗ Rejected and archived');
        }
    }

    async function handleArchiveResearch(id: string, event: React.MouseEvent) {
        event.stopPropagation();
        const reason = prompt('Reason for archiving (optional):');
        if (reason === null) return;

        const res = await fetch(`/api/research/${id}/archive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (res.ok) {
            setResearch(research.filter(r => r.id !== id));
            alert('📁 Archived');
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Microscope className="text-blue-400" size={28} />
                    Research &amp; Intel
                </h1>
                <p className="text-zinc-400 mt-1">
                    Market research, competitor intelligence, proposals, and strategic insights
                </p>
            </div>

            {/* Tabs + Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('research')}
                        className={`text-sm px-4 py-2 rounded-md transition-all ${activeTab === 'research'
                            ? 'bg-violet-500/20 text-violet-400 font-medium'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Research ({research.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('proposals')}
                        className={`text-sm px-4 py-2 rounded-md transition-all ${activeTab === 'proposals'
                            ? 'bg-violet-500/20 text-violet-400 font-medium'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Proposals ({proposals.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('competitors')}
                        className={`text-sm px-4 py-2 rounded-md transition-all ${activeTab === 'competitors'
                            ? 'bg-violet-500/20 text-violet-400 font-medium'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Competitors ({competitors.length})
                    </button>
                </div>
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-32 rounded-xl" />
                    ))}
                </div>
            ) : activeTab === 'research' ? (
                /* Research Cards */
                filteredResearch.length === 0 ? (
                    <motion.div
                        className="glass rounded-xl p-12 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Microscope size={32} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500">No research found</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {filteredResearch.map((item, i) => (
                            <motion.div
                                key={item.id}
                                className={`glass rounded-xl p-5 card-glow ${item.report_path ? 'cursor-pointer hover:border-violet-500/30 border border-transparent transition-colors' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => item.report_path && openReport(item.report_path)}
                            >
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm">{item.topic}</h3>
                                        {item.report_path && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 flex items-center gap-0.5">
                                                <FileText size={9} />
                                                .html
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 flex-shrink-0">
                                        <Calendar size={10} />
                                        {formatDate(item.researched_at)}
                                    </div>
                                </div>

                                {item.key_findings && (
                                    <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                                        {item.key_findings}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mb-4">
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
                                    <div className="flex items-center gap-2">
                                        {item.source && (
                                            <span className="text-[10px] text-zinc-600">{item.source}</span>
                                        )}
                                        {item.report_path && (
                                            <ExternalLink size={12} className="text-zinc-600" />
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => handleApproveResearch(item.id, e)}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <Check size={14} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={(e) => handleRejectResearch(item.id, e)}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <X size={14} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={(e) => handleArchiveResearch(item.id, e)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <Archive size={14} />
                                        Archive
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            ) : activeTab === 'proposals' ? (
                /* Proposals Cards */
                filteredProposals.length === 0 ? (
                    <motion.div
                        className="glass rounded-xl p-12 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Lightbulb size={32} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500">No proposals yet</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProposals.map((prop, i) => {
                            const statusStyle = statusColors[prop.status] || statusColors.draft;

                            return (
                                <motion.div
                                    key={prop.id}
                                    className={`glass rounded-xl p-5 card-glow ${prop.report_path ? 'cursor-pointer hover:border-violet-500/30 border border-transparent transition-colors' : 'border border-transparent'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => prop.report_path && openReport(prop.report_path)}
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
                                            {prop.status}
                                        </span>
                                    </div>

                                    {prop.summary && (
                                        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                                            {prop.summary}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mb-4">
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
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-zinc-600">
                                                {formatDate(prop.created_at)}
                                            </span>
                                            {prop.report_path && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 flex items-center gap-0.5">
                                                    <FileText size={9} />
                                                    View
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => handleApproveProposal(prop.id, e)}
                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                        >
                                            <Check size={14} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={(e) => handleRejectProposal(prop.id, e)}
                                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                        >
                                            <X size={14} />
                                            Reject
                                        </button>
                                        <button
                                            onClick={(e) => handleArchiveProposal(prop.id, e)}
                                            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                        >
                                            <Archive size={14} />
                                            Archive
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )
            ) : (
                /* Competitor Cards */
                filteredCompetitors.length === 0 ? (
                    <motion.div
                        className="glass rounded-xl p-12 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Globe size={32} className="text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500">No competitors tracked</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCompetitors.map((comp, i) => {
                            const marketColor = marketColors[comp.market] || '#71717a';

                            return (
                                <motion.div
                                    key={comp.id}
                                    className="glass rounded-xl p-5 card-glow"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-sm">{comp.name}</h3>
                                                {comp.product_url && (
                                                    <a
                                                        href={comp.product_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-zinc-500 hover:text-zinc-300"
                                                    >
                                                        <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </div>
                                            <span
                                                className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block"
                                                style={{
                                                    backgroundColor: `${marketColor}15`,
                                                    color: marketColor,
                                                }}
                                            >
                                                {comp.market}
                                            </span>
                                        </div>
                                        {comp.pricing && (
                                            <span className="text-sm font-bold text-emerald-400">
                                                {comp.pricing}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {comp.strengths && (
                                            <div className="flex items-start gap-2">
                                                <Shield size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-zinc-400">{comp.strengths}</p>
                                            </div>
                                        )}
                                        {comp.weaknesses && (
                                            <div className="flex items-start gap-2">
                                                <Swords size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-zinc-400">{comp.weaknesses}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
}
