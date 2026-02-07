'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    color?: string;
    trend?: number;
}

export function StatCard({
    icon: Icon,
    label,
    value,
    color = '#8b5cf6',
    trend,
}: StatCardProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (value === 0) {
            setCount(0);
            return;
        }
        const duration = 1000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div
            className="glass rounded-xl p-6 card-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-4">
                <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon size={22} style={{ color }} />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-zinc-400 font-medium">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold tracking-tight">{count}</p>
                        {trend !== undefined && trend !== 0 && (
                            <span
                                className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}
                            >
                                {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
