'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, DollarSign, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface InfluencerData {
    id: string;
    name: string;
    handle: string;
    platform: string;
    avatar_emoji: string;
    followers: number;
    engagement_rate: number;
    weekly_content_status: string;
    fanvue_subscribers: number;
    fanvue_mrr: number;
    last_updated: string;
}

export function InfluencerSummary() {
    const supabase = createClient();
    const [influencers, setInfluencers] = useState<InfluencerData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInfluencers() {
            const { data } = await supabase
                .from('influencer_metrics')
                .select('*')
                .order('name');

            if (data) {
                setInfluencers(data as InfluencerData[]);
            }
            setLoading(false);
        }
        fetchInfluencers();
    }, [supabase]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="shimmer h-40 rounded-xl" />
                ))}
            </div>
        );
    }

    if (influencers.length === 0) return null;

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Heart size={18} className="text-pink-400" />
                <h2 className="text-lg font-semibold">AI Influencers</h2>
                <Link
                    href="/dashboard/influencers"
                    className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                    Details <ExternalLink size={10} />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {influencers.map((inf, i) => (
                    <motion.div
                        key={inf.id}
                        className="glass rounded-xl p-5 card-glow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 flex items-center justify-center text-lg border border-pink-500/20">
                                {inf.avatar_emoji}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">{inf.name}</h3>
                                <p className="text-xs text-zinc-500">{inf.handle} · {inf.platform}</p>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div>
                                <div className="flex items-center gap-1 mb-0.5">
                                    <Users size={11} className="text-zinc-500" />
                                    <span className="text-[10px] text-zinc-500">Followers</span>
                                </div>
                                <span className="text-lg font-bold">{inf.followers.toLocaleString()}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-0.5">
                                    <Heart size={11} className="text-zinc-500" />
                                    <span className="text-[10px] text-zinc-500">Engagement</span>
                                </div>
                                <span className="text-lg font-bold">{inf.engagement_rate}%</span>
                            </div>
                            {inf.platform === 'instagram' && inf.name.includes('Margot') ? (
                                <div>
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <DollarSign size={11} className="text-zinc-500" />
                                        <span className="text-[10px] text-zinc-500">Fanvue</span>
                                    </div>
                                    <span className="text-lg font-bold">${inf.fanvue_mrr || 0}</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <MessageCircle size={11} className="text-zinc-500" />
                                        <span className="text-[10px] text-zinc-500">DMs</span>
                                    </div>
                                    <span className="text-lg font-bold">—</span>
                                </div>
                            )}
                        </div>

                        {/* Content status */}
                        {inf.weekly_content_status && (
                            <div className="bg-white/5 rounded-lg px-3 py-2">
                                <span className="text-[10px] text-zinc-500 block mb-0.5">Content Status</span>
                                <span className="text-xs text-zinc-300">{inf.weekly_content_status}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
