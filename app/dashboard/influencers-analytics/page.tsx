'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, DollarSign, Heart, Instagram,
  MessageCircle, Image, Zap, AlertCircle, Shield, RefreshCw
} from 'lucide-react';
import { ActionButton } from '@/components/dashboard/ActionButton';

export default function InfluencersAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [selectedPersona, setSelectedPersona] = useState('margot');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInfluencerData();
    const interval = setInterval(loadInfluencerData, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadInfluencerData() {
    try {
      // Using the existing influencer-metrics.json structure
      const mockData = {
        personas: {
          margot: {
            name: "Margot St. Clair",
            instagram_handle: "@margot.monde",
            instagram: {
              followers: 847,
              followers_change_7d: 12,
              engagement_rate: 0.032,
              posts_7d: 7,
              stories_7d: 14
            },
            fanvue: {
              subscribers: 0,
              mrr: 0,
              churn_rate: 0,
              posts_30d: 24
            },
            automation: {
              maya_status: "down",
              maya_error: "2FA required",
              dms_received_7d: 22,
              dms_responded_7d: 0
            }
          },
          luna: {
            name: "Luna Rivera",
            instagram_handle: "@itsluna.rivera",
            instagram: {
              followers: 634,
              followers_change_7d: 8,
              engagement_rate: 0.028,
              posts_7d: 5
            },
            fanvue: {
              setup: false
            }
          }
        }
      };
      setData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading influencer data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading influencer analytics...</p>
        </div>
      </div>
    );
  }

  const persona = data?.personas[selectedPersona];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          AI Influencers 💋
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Deep analytics for Margot & Luna • Instagram • Fanvue • Automation
        </p>
      </div>

      {/* Persona Selector */}
      <div className="flex gap-3">
        {Object.entries(data?.personas || {}).map(([key, p]: [string, any]) => (
          <button
            key={key}
            onClick={() => setSelectedPersona(key)}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              selectedPersona === key
                ? 'bg-violet-600 text-white'
                : 'glass text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Automation Quick Actions */}
      {selectedPersona === 'margot' && persona?.automation?.maya_status === 'down' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 border border-red-500/20 bg-red-500/5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white">Maya Automation Down</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                {persona.automation.maya_error} - {persona.automation.dms_received_7d} DMs waiting for response
              </p>
            </div>
            <div className="flex gap-2">
              <ActionButton
                action="fix-maya-2fa"
                label="Fix 2FA Now"
                icon={Shield}
                variant="danger"
                size="sm"
              />
              <ActionButton
                action="check-maya-dms"
                label="Check DMs"
                icon={RefreshCw}
                variant="secondary"
                size="sm"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Instagram</span>
          </div>
          <div className="text-2xl font-bold">{persona?.instagram.followers}</div>
          <div className="text-xs text-green-400 mt-1">+{persona?.instagram.followers_change_7d} this week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Engagement</span>
          </div>
          <div className="text-2xl font-bold">{(persona?.instagram.engagement_rate * 100).toFixed(1)}%</div>
          <div className="text-xs text-zinc-600 mt-1">Avg engagement rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Fanvue MRR</span>
          </div>
          <div className="text-2xl font-bold">${persona?.fanvue?.mrr || 0}</div>
          <div className="text-xs text-zinc-600 mt-1">{persona?.fanvue?.subscribers || 0} subscribers</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">DMs (7d)</span>
          </div>
          <div className="text-2xl font-bold">{persona?.automation?.dms_received_7d || 0}</div>
          <div className="text-xs text-zinc-600 mt-1">{persona?.automation?.dms_responded_7d || 0} responded</div>
        </motion.div>
      </div>

      {/* Instagram Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Instagram className="w-5 h-5 text-pink-400" />
          <h2 className="text-lg font-bold">Instagram Performance</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Posts (7d)</p>
            <p className="text-2xl font-bold text-white">{persona?.instagram.posts_7d}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Stories (7d)</p>
            <p className="text-2xl font-bold text-white">{persona?.instagram.stories_7d || 0}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Growth Rate</p>
            <p className="text-2xl font-bold text-green-400">
              +{((persona?.instagram.followers_change_7d / persona?.instagram.followers) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Automation Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold">Automation Status</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                persona?.automation?.maya_status === 'down' ? 'bg-red-500' : 'bg-green-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-white">Maya (DM Bot)</p>
                <p className="text-xs text-zinc-500">Instagram DM automation</p>
              </div>
            </div>
            {persona?.automation?.maya_status === 'down' && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4" />
                {persona?.automation?.maya_error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <div>
                <p className="text-sm font-medium text-white">Riley (Content Generator)</p>
                <p className="text-xs text-zinc-500">Manual mode</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <div>
                <p className="text-sm font-medium text-white">Pam (Posting Automation)</p>
                <p className="text-xs text-zinc-500">Idle</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fanvue Stats */}
      {persona?.fanvue && !persona?.fanvue.setup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 border border-amber-500/20 bg-amber-500/5"
        >
          <p className="text-amber-400 font-medium">⚠️  Fanvue not set up yet</p>
          <p className="text-sm text-zinc-400 mt-1">Estimated $120/mo MRR opportunity</p>
        </motion.div>
      )}

      {persona?.fanvue?.mrr > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-lg font-bold mb-4">Fanvue Revenue</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Subscribers</p>
              <p className="text-2xl font-bold text-white">{persona?.fanvue.subscribers}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">MRR</p>
              <p className="text-2xl font-bold text-green-400">${persona?.fanvue.mrr}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Churn</p>
              <p className="text-2xl font-bold text-white">{(persona?.fanvue.churn_rate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
