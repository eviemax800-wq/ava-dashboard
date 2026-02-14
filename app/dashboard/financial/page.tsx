'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, PieChart,
  CreditCard, AlertCircle, ArrowRight
} from 'lucide-react';

export default function FinancialPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
    const interval = setInterval(loadFinancialData, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadFinancialData() {
    try {
      const mockData = {
        profit_loss: {
          revenue: 0,
          expenses: 0,
          profit: 0,
          margin_percent: 0
        },
        expenses: {
          infrastructure: { supabase: 0, vercel: 0, claude_api: 0, total: 0 },
          marketing: { ads: 0, tools: 0, total: 0 },
          operations: { software: 0, services: 0, total: 0 },
          total_monthly: 0
        },
        runway: {
          cash_on_hand: 0,
          burn_rate_monthly: 0,
          months_remaining: Infinity
        },
        projections: {
          month_1: { revenue: 0, expenses: 0, profit: 0 },
          month_3: { revenue: 7500, expenses: 500, profit: 7000 },
          month_6: { revenue: 15000, expenses: 1000, profit: 14000 }
        }
      };
      setData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading financial data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Financial Overview 💰
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          P&L • Expenses • Runway • Projections
        </p>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm text-zinc-500 uppercase tracking-wide">Revenue</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">${data?.profit_loss.revenue}</div>
          <p className="text-xs text-zinc-600">This month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-lg p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-red-400" />
            <span className="text-sm text-zinc-500 uppercase tracking-wide">Expenses</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">${data?.profit_loss.expenses}</div>
          <p className="text-xs text-zinc-600">This month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-3">
            {data?.profit_loss.profit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm text-zinc-500 uppercase tracking-wide">Profit</span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${
            data?.profit_loss.profit >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${data?.profit_loss.profit}
          </div>
          <p className="text-xs text-zinc-600">{data?.profit_loss.margin_percent}% margin</p>
        </motion.div>
      </div>

      {/* Expense Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-bold">Monthly Expenses</h2>
        </div>

        <div className="space-y-4">
          {/* Infrastructure */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Infrastructure</span>
              <span className="text-sm font-bold text-white">${data?.expenses.infrastructure.total}</span>
            </div>
            <div className="space-y-1 pl-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Supabase</span>
                <span className="text-zinc-500">${data?.expenses.infrastructure.supabase}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Vercel</span>
                <span className="text-zinc-500">${data?.expenses.infrastructure.vercel}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Claude API</span>
                <span className="text-zinc-500">${data?.expenses.infrastructure.claude_api}</span>
              </div>
            </div>
          </div>

          {/* Marketing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Marketing</span>
              <span className="text-sm font-bold text-white">${data?.expenses.marketing.total}</span>
            </div>
          </div>

          {/* Operations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Operations</span>
              <span className="text-sm font-bold text-white">${data?.expenses.operations.total}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Total Monthly</span>
              <span className="text-lg font-bold text-white">${data?.expenses.total_monthly}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Runway */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold">Runway</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Cash on Hand</p>
            <p className="text-2xl font-bold text-white">${data?.runway.cash_on_hand}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Burn Rate</p>
            <p className="text-2xl font-bold text-white">${data?.runway.burn_rate_monthly}/mo</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Months Remaining</p>
            <p className="text-2xl font-bold text-green-400">
              {data?.runway.months_remaining === Infinity ? '∞' : data?.runway.months_remaining}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Projections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-xl p-6 border border-white/10"
      >
        <h2 className="text-lg font-bold mb-4">Revenue Projections</h2>

        <div className="space-y-3">
          {[
            { label: 'Month 1', data: data?.projections.month_1 },
            { label: 'Month 3', data: data?.projections.month_3 },
            { label: 'Month 6', data: data?.projections.month_6 },
          ].map((proj, i) => (
            <div key={proj.label} className="flex items-center gap-4">
              <div className="w-20 text-sm text-zinc-400">{proj.label}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="text-sm text-zinc-500">Revenue: ${proj.data?.revenue}</div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
                <div className="text-sm text-zinc-500">Expenses: ${proj.data?.expenses}</div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
                <div className={`text-sm font-bold ${proj.data?.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Profit: ${proj.data?.profit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
