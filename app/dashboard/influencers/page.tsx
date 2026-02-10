'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    Users,
    MessageCircle,
    DollarSign,
    Camera,
    TrendingUp,
    Globe,
    Eye,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatTimeAgo } from '@/lib/utils';

interface InfluencerData {
    id: string;
    name: string;
    handle: string;
    platform: string;
    avatar_emoji: string;
    followers: number;
    engagement_rate: number;
    avg_likes: number;
    avg_comments: number;
    weekly_content_status: string;
    fanvue_subscribers: number;
    fanvue_mrr: number;
    notes: string;
    last_updated: string;
}

const platformColors: Record<string, { bg: string; text: string }> = {
    instagram: { bg: 'rgba(236,72,153,0.15)', text: '#ec4899' },
    fanvue: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' },
    twitter: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    tiktok: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
};

export default function InfluencersPage() {
    const supabase = createClient();
    const [influencers, setInfluencers] = useState<InfluencerData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const { data } = await supabase
                .from('influencer_metrics')
                .select('*')
                .order('name');

            if (data) setInfluencers(data as InfluencerData[]);
            setLoading(false);
        }
        fetchData();
    }, [supabase]);

    // Group by name
    const grouped = influencers.reduce(
        (acc, inf) => {
            if (!acc[inf.name]) acc[inf.name] = [];
            acc[inf.name].push(inf);
            return acc;
        },
        {} as Record<string, InfluencerData[]>
    );

    const personas = Object.entries(grouped);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Heart className="text-pink-400" size={28} />
                    AI Influencers
                </h1>
                <p className="text-zinc-400 mt-1">
                    Luna &amp; Margot — Performance, content, and monetization
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="shimmer h-96 rounded-xl" />
                    ))}
                </div>
            ) : personas.length === 0 ? (
                <motion.div
                    className="glass rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Heart size={32} className="text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500">No influencer data yet</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {personas.map(([name, platforms], i) => {
                        const primary = platforms[0];
                        const hasFanvue = platforms.some((p) => p.platform === 'fanvue');
                        const fanvueData = platforms.find((p) => p.platform === 'fanvue');

                        return (
                            <motion.div
                                key={name}
                                className="glass rounded-xl overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.15 }}
                            >
                                {/* Header with gradient */}
                                <div className="relative p-6 pb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 via-violet-600/5 to-transparent" />
                                    <div className="relative flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/30 to-violet-500/30 flex items-center justify-center text-3xl border-2 border-pink-500/20">
                                            {primary.avatar_emoji}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{name}</h2>
                                            <p className="text-sm text-zinc-500">{primary.handle}</p>
                                            <div className="flex gap-2 mt-1.5">
                                                {platforms.map((p) => {
                                                    const colors = platformColors[p.platform] || platformColors.instagram;
                                                    return (
                                                        <span
                                                            key={p.platform}
                                                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                                            style={{
                                                                backgroundColor: colors.bg,
                                                                color: colors.text,
                                                            }}
                                                        >
                                                            {p.platform}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="px-6 py-4 grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Users size={13} className="text-zinc-500" />
                                            <span className="text-[10px] text-zinc-500">Followers</span>
                                        </div>
                                        <span className="text-xl font-bold">{primary.followers.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <TrendingUp size={13} className="text-zinc-500" />
                                            <span className="text-[10px] text-zinc-500">Engagement</span>
                                        </div>
                                        <span className="text-xl font-bold">{primary.engagement_rate}%</span>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Heart size={13} className="text-zinc-500" />
                                            <span className="text-[10px] text-zinc-500">Avg Likes</span>
                                        </div>
                                        <span className="text-xl font-bold">{primary.avg_likes || 0}</span>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <MessageCircle size={13} className="text-zinc-500" />
                                            <span className="text-[10px] text-zinc-500">Avg Comments</span>
                                        </div>
                                        <span className="text-xl font-bold">{primary.avg_comments || 0}</span>
                                    </div>
                                </div>

                                {/* Fanvue section */}
                                {hasFanvue && fanvueData && (
                                    <div className="px-6 py-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <DollarSign size={16} className="text-violet-400" />
                                            <span className="text-sm font-semibold">Fanvue Monetization</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <span className="text-[10px] text-zinc-500 block">Subscribers</span>
                                                <span className="text-lg font-bold">{fanvueData.fanvue_subscribers}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-zinc-500 block">Revenue</span>
                                                <span className="text-lg font-bold text-emerald-400">
                                                    ${fanvueData.fanvue_mrr || 0}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-zinc-500 block">Conv. Rate</span>
                                                <span className="text-lg font-bold">
                                                    {primary.followers > 0
                                                        ? ((fanvueData.fanvue_subscribers / primary.followers) * 100).toFixed(1)
                                                        : '0'}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Content status */}
                                <div className="px-6 py-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Camera size={14} className="text-zinc-500" />
                                        <span className="text-xs font-semibold text-zinc-400">
                                            Content Status
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300">
                                        {primary.weekly_content_status || 'No status available'}
                                    </p>
                                </div>

                                {/* Notes */}
                                {primary.notes && (
                                    <div className="px-6 py-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Eye size={14} className="text-zinc-500" />
                                            <span className="text-xs font-semibold text-zinc-400">
                                                Notes
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400">{primary.notes}</p>
                                    </div>
                                )}

                                {/* Updated at */}
                                <div className="px-6 py-3 bg-white/[0.02] text-right">
                                    <span className="text-[10px] text-zinc-600">
                                        Updated {formatTimeAgo(primary.last_updated)}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
