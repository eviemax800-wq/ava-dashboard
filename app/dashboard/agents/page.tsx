'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AgentCard } from '@/components/dashboard/AgentCard';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function AgentsPage() {
    const supabase = createClient();
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAgents = useCallback(async () => {
        const { data } = await supabase
            .from('agents')
            .select('*')
            .order('label');

        setAgents(data || []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchAgents();

        const channel = supabase
            .channel('agents-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'agents' },
                fetchAgents
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchAgents]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="shimmer h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-48 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Agent Workload</h1>
                <p className="text-zinc-400 mt-1 text-sm">
                    Monitor your AI workforce in real-time
                </p>
            </div>

            {agents.length === 0 ? (
                <motion.div
                    className="glass rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Bot size={40} className="text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400 mb-2">
                        No Agents Found
                    </h3>
                    <p className="text-sm text-zinc-500">
                        Agents will appear here when they are registered.
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent, i) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <AgentCard agent={agent} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
