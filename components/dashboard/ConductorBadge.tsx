'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Zap } from 'lucide-react';

interface ConductorStatus {
    last_run: string;
    cycle_count: number;
    active_slots: number;
    max_slots: number;
    ready_tasks: number;
    blocked_tasks: number;
    completions_today: number;
    spawns_today: number;
    status: string;
}

export function ConductorBadge() {
    const supabase = createClient();
    const [status, setStatus] = useState<ConductorStatus | null>(null);
    const [syncing, setSyncing] = useState(false);

    const fetchStatus = useCallback(async () => {
        const { data } = await supabase
            .from('conductor_status')
            .select('*')
            .eq('id', 1)
            .single();

        setStatus(data as ConductorStatus);
    }, [supabase]);

    useEffect(() => {
        fetchStatus();

        // Poll every 30s (matches Conductor cycle)
        const interval = setInterval(fetchStatus, 30_000);

        // Also listen for realtime updates
        const channel = supabase
            .channel('conductor-status')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conductor_status' },
                fetchStatus
            )
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchStatus]);

    async function handleSyncNow() {
        setSyncing(true);
        // Write a wake flag via Supabase — Conductor polls this
        // Since we can't write files from the browser, we create a special task
        // that Conductor checks. But actually, the wake flag is a FILE on the local
        // system. The "Sync Now" button should trigger an API route or use an alternative.
        // For now, we'll use a Supabase flag that Conductor checks.
        await supabase.from('conductor_status').update({
            status: 'wake-requested',
        }).eq('id', 1);

        // Visual feedback
        setTimeout(() => {
            setSyncing(false);
            fetchStatus();
        }, 2000);
    }

    if (!status) return null;

    const isStale = status.last_run
        ? (Date.now() - new Date(status.last_run).getTime()) > 120_000 // 2 min
        : true;

    const isHalted = status.status === 'halted';
    const isActive = !isStale && !isHalted;

    return (
        <div className="px-4 py-3 border-t border-white/5">
            {/* Header with pulse */}
            <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                    <Activity size={13} className={isActive ? 'text-emerald-400' : isHalted ? 'text-red-400' : 'text-zinc-600'} />
                    {isActive && (
                        <motion.div
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    )}
                </div>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    Conductor
                </span>
                <span
                    className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-medium ${isActive
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : isHalted
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-zinc-700 text-zinc-500'
                        }`}
                >
                    {isHalted ? 'Halted' : isActive ? 'Active' : 'Stale'}
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] mb-2.5">
                <div className="flex justify-between text-zinc-500">
                    <span>Slots</span>
                    <span className="text-zinc-400">{status.active_slots}/{status.max_slots}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                    <span>Ready</span>
                    <span className="text-zinc-400">{status.ready_tasks}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                    <span>Done today</span>
                    <span className="text-emerald-400/70">{status.completions_today}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                    <span>Spawned</span>
                    <span className="text-violet-400/70">{status.spawns_today}</span>
                </div>
            </div>

            {/* Sync Now button */}
            <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] rounded-md transition-all border border-white/5"
            >
                <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync Now'}
            </button>

            {/* Last run */}
            {status.last_run && (
                <p className="text-[9px] text-zinc-600 mt-1.5 text-center">
                    Last: {new Date(status.last_run).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}Cycle #{status.cycle_count}
                </p>
            )}
        </div>
    );
}
