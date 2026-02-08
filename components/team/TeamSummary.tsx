'use client';

import { motion } from 'framer-motion';

interface TeamSummaryProps {
    stats: {
        working: number;
        queued: number;
        idle: number;
        blocked: number;
    };
}

export function TeamSummary({ stats }: TeamSummaryProps) {
    const items = [
        { label: 'Working', count: stats.working, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Queued', count: stats.queued, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Idle', count: stats.idle, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
        ...(stats.blocked > 0
            ? [{ label: 'Blocked', count: stats.blocked, color: 'text-red-400', bg: 'bg-red-500/10' }]
            : []),
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {items.map((item, idx) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`glass rounded-lg p-4 border border-white/5 ${item.bg}`}
                >
                    <p className={`text-3xl font-bold ${item.color}`}>{item.count}</p>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">
                        {item.label}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}
