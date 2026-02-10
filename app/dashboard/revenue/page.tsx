'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface RevenueSummary {
    total_mrr: number;
    phase: string;
    phase_name: string;
    phase_progress_pct: number;
}

interface RevenueBySource {
    id: string;
    source: string;
    source_type: string;
    mrr: number;
    month: string;
    notes: string;
}

export default function RevenuePage() {
    const supabase = createClient();
    const [summary, setSummary] = useState<RevenueSummary | null>(null);
    const [sources, setSources] = useState<RevenueBySource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [summaryRes, sourcesRes] = await Promise.all([
                supabase.from('revenue_summary').select('*').limit(1).single(),
                supabase.from('revenue_by_source').select('*').order('mrr', { ascending: false }),
            ]);

            if (summaryRes.data) setSummary(summaryRes.data as RevenueSummary);

            // If revenue_by_source table doesn't exist, try to construct from other data
            if (sourcesRes.data) {
                setSources(sourcesRes.data as RevenueBySource[]);
            }
            setLoading(false);
        }
        fetchData();
    }, [supabase]);

    const totalMRR = summary?.total_mrr || 0;

    // Mock chart data showing the MRR journey (will populate as real data comes in)
    const chartData = [
        { month: 'Sep', mrr: 0 },
        { month: 'Oct', mrr: 0 },
        { month: 'Nov', mrr: 0 },
        { month: 'Dec', mrr: 0 },
        { month: 'Jan', mrr: 0 },
        { month: 'Feb', mrr: totalMRR },
    ];

    // Revenue sources in a simulated table (honest $0 values)
    const revenueItems = [
        { name: 'InvoiceFlow', type: 'SaaS Product', mrr: 0, status: 'Building', change: 0 },
        { name: 'WealthStack', type: 'SaaS Product', mrr: 0, status: 'Deployed', change: 0 },
        { name: 'Persona Studio', type: 'SaaS Product', mrr: 0, status: 'Deployed', change: 0 },
        { name: 'Margot (Fanvue)', type: 'AI Influencer', mrr: 0, status: 'Launched', change: 0 },
        { name: 'Luna (Instagram)', type: 'AI Influencer', mrr: 0, status: 'Pre-launch', change: 0 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <DollarSign className="text-emerald-400" size={28} />
                    Revenue
                </h1>
                <p className="text-zinc-400 mt-1">Track empire revenue across all sources</p>
            </div>

            {/* MRR Hero */}
            <motion.div
                className="glass rounded-2xl p-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent" />
                <div className="relative">
                    <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                        Monthly Recurring Revenue
                    </span>
                    <div className="flex items-baseline gap-3 mt-2 mb-4">
                        <span className="text-6xl font-bold tracking-tight">
                            ${totalMRR.toLocaleString()}
                        </span>
                        <span className="text-zinc-500 text-lg">/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-xs">
                            Phase {summary?.phase?.replace('phase_', '') || '1'}
                        </span>
                        <span className="text-zinc-400">{summary?.phase_name || 'First Dollar'}</span>
                    </div>
                </div>
            </motion.div>

            {/* MRR Chart */}
            <motion.div
                className="glass rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-lg font-semibold mb-4">MRR Trend</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                            <XAxis
                                dataKey="month"
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                labelStyle={{ color: '#a1a1aa' }}
                                formatter={(value: number | undefined) => [`$${value ?? 0}`, 'MRR']}
                            />
                            <Area
                                type="monotone"
                                dataKey="mrr"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#mrrGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Revenue by Source */}
            <motion.div
                className="glass rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-lg font-semibold mb-4">Revenue by Source</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs text-zinc-500 font-medium pb-3 pr-4">Source</th>
                                <th className="text-left text-xs text-zinc-500 font-medium pb-3 pr-4">Type</th>
                                <th className="text-right text-xs text-zinc-500 font-medium pb-3 pr-4">MRR</th>
                                <th className="text-left text-xs text-zinc-500 font-medium pb-3 pr-4">Status</th>
                                <th className="text-right text-xs text-zinc-500 font-medium pb-3">Change</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {revenueItems.map((item, i) => (
                                <motion.tr
                                    key={item.name}
                                    className="hover:bg-white/5 transition-colors"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                >
                                    <td className="py-3 pr-4 text-sm font-medium">{item.name}</td>
                                    <td className="py-3 pr-4 text-xs text-zinc-500">{item.type}</td>
                                    <td className="py-3 pr-4 text-sm text-right font-bold">
                                        ${item.mrr.toLocaleString()}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right">
                                        {item.change > 0 ? (
                                            <span className="text-xs text-emerald-400 flex items-center justify-end gap-0.5">
                                                <ArrowUpRight size={12} />+{item.change}%
                                            </span>
                                        ) : item.change < 0 ? (
                                            <span className="text-xs text-red-400 flex items-center justify-end gap-0.5">
                                                <ArrowDownRight size={12} />{item.change}%
                                            </span>
                                        ) : (
                                            <span className="text-xs text-zinc-600 flex items-center justify-end gap-0.5">
                                                <Minus size={12} />—
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-white/10">
                                <td className="py-3 pr-4 text-sm font-bold">Total</td>
                                <td />
                                <td className="py-3 pr-4 text-sm text-right font-bold text-emerald-400">
                                    ${totalMRR.toLocaleString()}
                                </td>
                                <td />
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
