'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Filter, SortAsc, Zap } from 'lucide-react';
import { AgentCard } from '@/components/team/AgentCard';
import { AgentDetailsModal } from '@/components/team/AgentDetailsModal';
import { CapacityIndicator } from '@/components/team/CapacityIndicator';
import { TeamSummary } from '@/components/team/TeamSummary';

export type TeamAgent = {
    id: string;
    agent_id: string;
    name: string;
    emoji: string;
    role: string;
    specialties: string[];
    status: 'idle' | 'queued' | 'working' | 'blocked';
    current_task?: {
        id: string;
        name: string;
        progress: number;
        startedAt: string;
    };
    queue_tasks: any[];
    last_active: string | null;
    total_completed: number;
    created_at: string;
    updated_at: string;
};

type FilterOption = 'all' | 'working' | 'idle' | 'blocked' | 'queued';
type SortOption = 'recent' | 'queue' | 'completions';

export default function TeamPage() {
    const [agents, setAgents] = useState<TeamAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterOption>('all');
    const [sort, setSort] = useState<SortOption>('recent');
    const [selectedAgent, setSelectedAgent] = useState<TeamAgent | null>(null);
    const [antigravityCapacity, setAntigravityCapacity] = useState({ active: 0, max: 2 });

    const supabase = createClient();

    // Fetch initial data
    useEffect(() => {
        fetchAgents();
    }, []);

    // Real-time subscription
    useEffect(() => {
        const subscription = supabase
            .channel('team-agents-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'team_agents',
                },
                (payload) => {
                    console.log('Team agent update:', payload);
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        setAgents((prev) => {
                            const existing = prev.find((a) => a.id === payload.new.id);
                            if (existing) {
                                return prev.map((a) =>
                                    a.id === payload.new.id ? (payload.new as TeamAgent) : a
                                );
                            }
                            return [...prev, payload.new as TeamAgent];
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setAgents((prev) => prev.filter((a) => a.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function fetchAgents() {
        try {
            const { data, error } = await supabase
                .from('team_agents')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setAgents(data || []);

            // Calculate Antigravity capacity from working agents
            const workingCount = (data || []).filter((a) => a.status === 'working').length;
            setAntigravityCapacity({ active: workingCount, max: 2 });
        } catch (error) {
            console.error('Error fetching team agents:', error);
        } finally {
            setLoading(false);
        }
    }

    // Filter agents
    const filteredAgents = agents.filter((agent) => {
        if (filter === 'all') return true;
        return agent.status === filter;
    });

    // Sort agents
    const sortedAgents = [...filteredAgents].sort((a, b) => {
        switch (sort) {
            case 'recent':
                return (
                    new Date(b.last_active || 0).getTime() -
                    new Date(a.last_active || 0).getTime()
                );
            case 'queue':
                return (b.queue_tasks?.length || 0) - (a.queue_tasks?.length || 0);
            case 'completions':
                return b.total_completed - a.total_completed;
            default:
                return 0;
        }
    });

    // Calculate summary stats
    const stats = {
        working: agents.filter((a) => a.status === 'working').length,
        queued: agents.filter((a) => a.status === 'queued').length,
        idle: agents.filter((a) => a.status === 'idle').length,
        blocked: agents.filter((a) => a.status === 'blocked').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-zinc-500">Loading team...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        Team
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        {agents.length} employee agents
                    </p>
                </div>

                <CapacityIndicator
                    active={antigravityCapacity.active}
                    max={antigravityCapacity.max}
                />
            </div>

            {/* Summary Stats */}
            <TeamSummary stats={stats} />

            {/* Filter & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Filter buttons */}
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'working', 'idle', 'queued', 'blocked'] as FilterOption[]).map(
                        (option) => (
                            <button
                                key={option}
                                onClick={() => setFilter(option)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${
                                        filter === option
                                            ? 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30'
                                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                    }
                                `}
                            >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                {option !== 'all' && (
                                    <span className="ml-1.5 opacity-60">
                                        ({stats[option]})
                                    </span>
                                )}
                            </button>
                        )
                    )}
                </div>

                {/* Sort dropdown */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                    <option value="recent">Recent Activity</option>
                    <option value="queue">Queue Depth</option>
                    <option value="completions">Total Completed</option>
                </select>
            </div>

            {/* Agent Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                layout
            >
                <AnimatePresence mode="popLayout">
                    {sortedAgents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onClick={() => setSelectedAgent(agent)}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty state */}
            {sortedAgents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 glass rounded-lg border border-white/5">
                    <Filter className="w-12 h-12 text-zinc-600 mb-3" />
                    <p className="text-zinc-400 text-sm">
                        No agents match the current filter
                    </p>
                </div>
            )}

            {/* Agent Details Modal */}
            <AgentDetailsModal
                agent={selectedAgent}
                onClose={() => setSelectedAgent(null)}
            />
        </div>
    );
}
