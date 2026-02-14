'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  Rocket, TrendingUp, Zap, AlertTriangle, CheckCircle2, Clock,
  DollarSign, Users, Target, Activity, RefreshCw, Upload, Shield
} from 'lucide-react';
import { ActionButton } from '@/components/dashboard/ActionButton';

interface LaunchStatus {
  countdown_hours: number;
  products: {
    toolkit: { status: string; readiness: number; expected_revenue: { min: number; max: number } };
    invoiceflow: { status: string; readiness: number; blocker: string };
    trustkit: { status: string; readiness: number; blocker: string };
  };
  blockers: Array<{
    id: string;
    title: string;
    priority: string;
    time_estimate: string;
    impact: string;
  }>;
}

interface Revenue {
  current_mrr: number;
  goals: {
    week_1: { target: number; actual: number; percentage: number };
    month_1: { target: number; actual: number; percentage: number };
  };
}

interface SystemHealth {
  processes: Record<string, { status: string; error?: string }>;
  uptime_7d: number;
  errors_24h: { critical: number; warning: number };
}

export default function CommandCenterPage() {
  const [launch, setLaunch] = useState<LaunchStatus | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      // Load from state files via API or directly
      // For now, using mock data - will connect to real data sources
      setLaunch({
        countdown_hours: 38,
        products: {
          toolkit: { status: 'ready', readiness: 100, expected_revenue: { min: 145, max: 735 } },
          invoiceflow: { status: 'blocked', readiness: 75, blocker: 'Stripe setup (2-3h)' },
          trustkit: { status: 'blocked', readiness: 85, blocker: 'Stripe setup (30m)' },
        },
        blockers: [
          {
            id: 'maya-2fa',
            title: 'Fix Maya 2FA',
            priority: 'high',
            time_estimate: '15 min',
            impact: 'Blocking $480/mo Fanvue growth',
          },
          {
            id: 'invoiceflow-stripe',
            title: 'InvoiceFlow Stripe Setup',
            priority: 'high',
            time_estimate: '2-3h',
            impact: 'Blocks $29/mo MRR launch',
          },
        ],
      });

      setRevenue({
        current_mrr: 120,
        goals: {
          week_1: { target: 500, actual: 120, percentage: 24 },
          month_1: { target: 3000, actual: 120, percentage: 4 },
        },
      });

      setSystemHealth({
        processes: {
          heartbeat: { status: 'ok' },
          telegram: { status: 'ok' },
          maya: { status: 'down', error: '2FA required' },
          'dashboard-sync': { status: 'ok' },
        },
        uptime_7d: 94.2,
        errors_24h: { critical: 1, warning: 2 },
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading mission control...</p>
        </div>
      </div>
    );
  }

  const systemHealthy = systemHealth ?
    Object.values(systemHealth.processes).filter(p => p.status === 'ok').length : 0;
  const systemTotal = systemHealth ? Object.keys(systemHealth.processes).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Mission Control 🎯
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Real-time empire status • Launch countdown • Critical blockers
        </p>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <ActionButton
            action="sync-dashboard"
            label="Sync Dashboard"
            icon={RefreshCw}
            variant="primary"
            size="sm"
          />
          <ActionButton
            action="deploy-vercel"
            label="Deploy to Vercel"
            icon={Upload}
            variant="secondary"
            size="sm"
          />
          <ActionButton
            action="fix-maya-2fa"
            label="Fix Maya 2FA"
            icon={Shield}
            variant="danger"
            size="sm"
          />
          <ActionButton
            action="run-heartbeat"
            label="Run Heartbeat"
            icon={Zap}
            variant="secondary"
            size="sm"
          />
        </div>
      </motion.div>

      {/* Hero Metric - This Week's Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
      >
        <div className="text-center">
          <p className="text-sm text-zinc-400 uppercase tracking-wide font-medium mb-2">
            Current MRR
          </p>
          <div className="text-6xl font-bold mb-2">
            ${revenue?.current_mrr || 0}
          </div>
          <p className="text-zinc-500 text-sm mb-4">
            Target: ${revenue?.goals.month_1.target.toLocaleString()} (Month 1)
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Progress</span>
              <span>{revenue?.goals.month_1.percentage}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: 0 }}
                animate={{ width: `${revenue?.goals.month_1.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-zinc-600 mt-2">
              Need ${(revenue?.goals.month_1.target || 0) - (revenue?.current_mrr || 0)} more to hit Month 1 target
            </p>
          </div>
        </div>
      </motion.div>

      {/* The 3 Next Moves */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-400" />
          Top 3 Priorities
        </h2>

        <div className="space-y-3">
          {launch?.blockers.slice(0, 3).map((blocker, i) => (
            <div
              key={blocker.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm text-white mb-1">{blocker.title}</h3>
                <p className="text-xs text-zinc-500 mb-2">{blocker.impact}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-600">⏱️  {blocker.time_estimate}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    blocker.priority === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {blocker.priority} impact
                  </span>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded transition-colors">
                Fix Now
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Launch Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6 border border-amber-500/20 bg-amber-500/5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Rocket className="w-5 h-5 text-amber-400" />
            Launch Weekend
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">
              T-{launch?.countdown_hours}h
            </div>
            <p className="text-xs text-zinc-500">Sat Feb 21, 6pm AEDT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Toolkit */}
          <div className={`p-4 rounded-lg border ${
            launch?.products.toolkit.status === 'ready'
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-white/10 bg-white/[0.02]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">Freelancer AI Toolkit</h3>
              {launch?.products.toolkit.status === 'ready' && (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              )}
            </div>
            <div className="space-y-1 text-xs text-zinc-500">
              <div>Readiness: {launch?.products.toolkit.readiness}%</div>
              <div>Expected: ${launch?.products.toolkit.expected_revenue.min}-${launch?.products.toolkit.expected_revenue.max}</div>
              <div className="text-green-400 font-medium">✅ Ready to launch</div>
            </div>
          </div>

          {/* InvoiceFlow */}
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">InvoiceFlow</h3>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1 text-xs text-zinc-500">
              <div>Readiness: {launch?.products.invoiceflow.readiness}%</div>
              <div className="text-amber-400 font-medium">⚠️  {launch?.products.invoiceflow.blocker}</div>
            </div>
          </div>

          {/* TrustKit */}
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">TrustKit</h3>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1 text-xs text-zinc-500">
              <div>Readiness: {launch?.products.trustkit.readiness}%</div>
              <div className="text-amber-400 font-medium">⚠️  {launch?.products.trustkit.blocker}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">MRR</span>
          </div>
          <div className="text-2xl font-bold">${revenue?.current_mrr}</div>
          <div className="text-xs text-zinc-600 mt-1">+$0 this week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Customers</span>
          </div>
          <div className="text-2xl font-bold">10</div>
          <div className="text-xs text-zinc-600 mt-1">+0 this week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Systems</span>
          </div>
          <div className="text-2xl font-bold">{systemHealthy}/{systemTotal}</div>
          <div className="text-xs text-zinc-600 mt-1">
            {systemHealth?.uptime_7d.toFixed(1)}% uptime
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Blockers</span>
          </div>
          <div className="text-2xl font-bold">{launch?.blockers.length || 0}</div>
          <div className="text-xs text-amber-400 mt-1">Need attention</div>
        </motion.div>
      </div>

      {/* System Health Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Autonomous Systems
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {systemHealth && Object.entries(systemHealth.processes).map(([name, process]) => (
            <div
              key={name}
              className={`p-3 rounded-lg border ${
                process.status === 'ok'
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {process.status === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm font-medium capitalize">{name.replace('-', ' ')}</span>
              </div>
              {process.error && (
                <p className="text-xs text-red-400">{process.error}</p>
              )}
            </div>
          ))}
        </div>

        {systemHealth && systemHealth.errors_24h.critical > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              {systemHealth.errors_24h.critical} critical error(s) in last 24h
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
