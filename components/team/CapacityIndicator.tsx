'use client';

import { Zap } from 'lucide-react';

interface CapacityIndicatorProps {
    active: number;
    max: number;
}

export function CapacityIndicator({ active, max }: CapacityIndicatorProps) {
    const percentage = (active / max) * 100;
    const isAtCapacity = active >= max;

    return (
        <div className="glass rounded-lg px-4 py-3 border border-white/5 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-500/10 ring-1 ring-violet-500/20">
                <Zap className={`w-5 h-5 ${isAtCapacity ? 'text-amber-400' : 'text-violet-400'}`} />
            </div>

            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white">
                        {active}/{max}
                    </span>
                    <span className="text-xs text-zinc-500">Antigravity slots</span>
                </div>

                {/* Progress bar */}
                <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${isAtCapacity ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {isAtCapacity && (
                <div className="px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    At capacity
                </div>
            )}
        </div>
    );
}
