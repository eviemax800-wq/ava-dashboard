'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, DollarSign, Target, Mail, ExternalLink,
  Twitter, Linkedin, Globe, BarChart3
} from 'lucide-react';

interface MarketingData {
  campaigns: any;
  traffic: any;
  funnel: any;
  email_list: any;
  performance: any;
}

export default function MarketingPage() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketingData();
    const interval = setInterval(loadMarketingData, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadMarketingData() {
    try {
      // TODO: Load from API/Supabase once synced
      const mockData = {
        campaigns: {
          launch_weekend: {
            name: "Launch Weekend - Feb 21",
            status: "active",
            channels: {
              reddit: { posts_scheduled: 3, karma_current: 12, karma_required: 100 },
              twitter: { thread_ready: true, followers: 0 },
              linkedin: { post_ready: true, connections: 0 },
              producthunt: { kit_complete: true, expected_upvotes: 50 },
              indiehackers: { post_ready: true }
            },
            expected_revenue: { min: 145, max: 735 }
          }
        },
        traffic: {
          sources: { organic: 0, social: 0, direct: 0, referral: 0 },
          total_visits_30d: 0
        },
        funnel: {
          visitors: 0,
          signups: 0,
          trials: 0,
          paying: 0
        },
        email_list: {
          subscribers: 0,
          growth_30d: 0
        },
        performance: {
          cac: 0,
          ltv: 0,
          roi: 0
        }
      };
      setData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading marketing data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  const campaign = data?.campaigns.launch_weekend;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Marketing & Sales 📈
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Campaign performance • Traffic • Conversion funnel
        </p>
      </div>

      {/* Active Campaign */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 border border-amber-500/20 bg-amber-500/5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              {campaign?.name}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Expected: ${campaign?.expected_revenue.min}-${campaign?.expected_revenue.max}</p>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
            ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Reddit */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-zinc-400">Reddit</span>
            </div>
            <p className="text-sm text-white font-semibold">
              {campaign?.channels.reddit.karma_current}/{campaign?.channels.reddit.karma_required} karma
            </p>
            <p className="text-xs text-zinc-600 mt-1">{campaign?.channels.reddit.posts_scheduled} posts ready</p>
          </div>

          {/* Twitter */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Twitter className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-zinc-400">Twitter</span>
            </div>
            <p className="text-sm text-white font-semibold">
              {campaign?.channels.twitter.thread_ready ? '✅ Ready' : '⏳ Pending'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">{campaign?.channels.twitter.followers} followers</p>
          </div>

          {/* LinkedIn */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Linkedin className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-zinc-400">LinkedIn</span>
            </div>
            <p className="text-sm text-white font-semibold">
              {campaign?.channels.linkedin.post_ready ? '✅ Ready' : '⏳ Pending'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">{campaign?.channels.linkedin.connections} connections</p>
          </div>

          {/* Product Hunt */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-zinc-400">Product Hunt</span>
            </div>
            <p className="text-sm text-white font-semibold">
              {campaign?.channels.producthunt.kit_complete ? '✅ Ready' : '⏳ Pending'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">~{campaign?.channels.producthunt.expected_upvotes} upvotes</p>
          </div>

          {/* Indie Hackers */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-medium text-zinc-400">Indie Hackers</span>
            </div>
            <p className="text-sm text-white font-semibold">
              {campaign?.channels.indiehackers.post_ready ? '✅ Ready' : '⏳ Pending'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">Draft ready</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Traffic</span>
          </div>
          <div className="text-2xl font-bold">{data?.traffic.total_visits_30d}</div>
          <div className="text-xs text-zinc-600 mt-1">Last 30 days</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Email List</span>
          </div>
          <div className="text-2xl font-bold">{data?.email_list.subscribers}</div>
          <div className="text-xs text-zinc-600 mt-1">+{data?.email_list.growth_30d} this month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Conversion</span>
          </div>
          <div className="text-2xl font-bold">0%</div>
          <div className="text-xs text-zinc-600 mt-1">Visitor → Customer</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">ROI</span>
          </div>
          <div className="text-2xl font-bold">${data?.performance.roi}</div>
          <div className="text-xs text-zinc-600 mt-1">Return on investment</div>
        </motion.div>
      </div>

      {/* Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-lg font-bold mb-4">Conversion Funnel</h2>
        <div className="space-y-3">
          {[
            { label: 'Visitors', value: data?.funnel.visitors, color: 'bg-blue-500' },
            { label: 'Signups', value: data?.funnel.signups, color: 'bg-violet-500' },
            { label: 'Trials', value: data?.funnel.trials, color: 'bg-purple-500' },
            { label: 'Paying', value: data?.funnel.paying, color: 'bg-green-500' },
          ].map((stage, i) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-zinc-400">{stage.label}</span>
                <span className="text-sm font-bold text-white">{stage.value}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} transition-all duration-500`}
                  style={{ width: `${stage.value || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
