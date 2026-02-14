'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Microscope, TrendingUp, AlertCircle, CheckCircle2,
  Clock, Lightbulb, Target
} from 'lucide-react';

export default function ExperimentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
    const interval = setInterval(loadExperiments, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadExperiments() {
    try {
      const mockData = {
        active_experiments: [
          {
            id: "maya-dm-automation",
            name: "Maya Instagram DM Automation",
            hypothesis: "Automating Instagram DMs will increase Fanvue conversion rate from 2% to 8%",
            status: "blocked",
            blocker: "2FA login required",
            progress: 75,
            learnings: [
              "DM automation critical for Fanvue funnel",
              "80% of revenue comes from DM conversations"
            ]
          },
          {
            id: "toolkit-reddit-launch",
            name: "Reddit Launch Strategy",
            hypothesis: "Launching on 3 subreddits will generate $145-735 in first week sales",
            status: "in_progress",
            progress: 90
          }
        ],
        pipeline: [
          {
            id: "ppv-content-strategy",
            name: "PPV Content Strategy for Fanvue",
            hypothesis: "Sending 2 PPV messages per week will 4x subscription revenue",
            estimated_impact: "$240/mo additional MRR"
          }
        ]
      };
      setData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading experiments:', error);
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
          R&D Experiments 🔬
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Active experiments • Hypotheses • Learnings
        </p>
      </div>

      {/* Active Experiments */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Microscope className="w-5 h-5 text-violet-400" />
          Active Experiments ({data?.active_experiments.length})
        </h2>

        {data?.active_experiments.map((exp: any, i: number) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass rounded-xl p-6 border ${
              exp.status === 'blocked' ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white mb-2">{exp.name}</h3>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-zinc-400 italic">{exp.hypothesis}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {exp.status === 'blocked' && (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    BLOCKED
                  </span>
                )}
                {exp.status === 'in_progress' && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    IN PROGRESS
                  </span>
                )}
              </div>
            </div>

            {exp.blocker && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-400">⚠️  {exp.blocker}</p>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span>Progress</span>
                <span>{exp.progress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                  style={{ width: `${exp.progress}%` }}
                />
              </div>
            </div>

            {exp.learnings && exp.learnings.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">Key Learnings:</p>
                <ul className="space-y-1">
                  {exp.learnings.map((learning: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{learning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pipeline */}
      {data?.pipeline && data.pipeline.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Pipeline ({data.pipeline.length})
          </h2>

          {data.pipeline.map((exp: any, i: number) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <h3 className="font-bold text-white mb-2">{exp.name}</h3>
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-zinc-400 italic">{exp.hypothesis}</p>
              </div>
              {exp.estimated_impact && (
                <p className="text-sm text-green-400 font-medium">
                  💰 Estimated Impact: {exp.estimated_impact}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
