'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

interface SpendData {
    balance: number | null;
    used: number | null;
    dailySpend: number;
    weeklyAvg: number;
    projectedMonthly: number;
    chartData: { date: string; spend: number; balance: number }[];
    lastChecked: string | null;
}

export function SpendTracker() {
    const [data, setData] = useState<SpendData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSpend() {
            try {
                const res = await fetch('/api/spend');
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setData(json);
            } catch (e) {
                setError((e as Error).message);
            }
        }
        fetchSpend();
        // Refresh every 5 minutes
        const interval = setInterval(fetchSpend, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (error) {
        return (
            <div className="glass rounded-2xl p-6 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle size={16} />
                    <span className="text-sm">Spend tracking unavailable</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
                <div className="h-8 bg-zinc-800 rounded w-1/2" />
            </div>
        );
    }

    const balanceColor = data.balance !== null
        ? data.balance > 50 ? 'text-emerald-400' : data.balance > 10 ? 'text-amber-400' : 'text-red-400'
        : 'text-zinc-400';

    const balanceRingColor = data.balance !== null
        ? data.balance > 50 ? 'ring-emerald-500/30' : data.balance > 10 ? 'ring-amber-500/30' : 'ring-red-500/30'
        : 'ring-zinc-500/30';

    // Calculate bar chart max for scaling
    const maxSpend = Math.max(...data.chartData.map(d => d.spend), 0.01);

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            {/* Subtle gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-transparent to-amber-600/5" />

            <div className="relative glass rounded-2xl p-6 border border-white/5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-emerald-500/10 ring-1 ${balanceRingColor}`}>
                            <Wallet size={14} className={balanceColor} />
                        </div>
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                            OpenRouter Spend
                        </span>
                    </div>
                    {data.lastChecked && (
                        <span className="text-[10px] text-zinc-600">
                            Updated {new Date(data.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    {/* Balance */}
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Balance</p>
                        <p className={`text-2xl font-bold tracking-tight ${balanceColor}`}>
                            ${data.balance?.toFixed(2) ?? '—'}
                        </p>
                    </div>

                    {/* Today */}
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Today</p>
                        <div className="flex items-center gap-1.5">
                            <p className="text-2xl font-bold tracking-tight text-white">
                                ${data.dailySpend.toFixed(2)}
                            </p>
                            {data.dailySpend > 5 ? (
                                <TrendingUp size={14} className="text-red-400" />
                            ) : (
                                <TrendingDown size={14} className="text-emerald-400" />
                            )}
                        </div>
                    </div>

                    {/* Projected */}
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Projected</p>
                        <p className="text-2xl font-bold tracking-tight text-zinc-300">
                            ${data.projectedMonthly.toFixed(0)}
                            <span className="text-sm text-zinc-500 font-normal">/mo</span>
                        </p>
                    </div>
                </div>

                {/* Mini Bar Chart */}
                {data.chartData.length > 1 && (
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Activity size={12} className="text-zinc-500" />
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                Daily Spend (last {data.chartData.length} days)
                            </span>
                        </div>
                        <div className="flex items-end gap-[2px] h-12">
                            {data.chartData.map((d, i) => {
                                const height = Math.max((d.spend / maxSpend) * 100, 4);
                                const isToday = i === data.chartData.length - 1;
                                return (
                                    <motion.div
                                        key={d.date}
                                        className={`flex-1 rounded-t-sm ${isToday
                                                ? 'bg-violet-500'
                                                : d.spend > 5
                                                    ? 'bg-amber-500/60'
                                                    : 'bg-emerald-500/40'
                                            }`}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.03 }}
                                        title={`${d.date}: $${d.spend.toFixed(2)}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Weekly avg footer */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600">
                        7-day avg: ${data.weeklyAvg.toFixed(2)}/day
                    </span>
                    <span className="text-[10px] text-zinc-600">
                        via OpenRouter
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
