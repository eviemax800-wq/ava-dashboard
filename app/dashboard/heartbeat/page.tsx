'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Brain,
  Timer,
  Hash,
  MessageSquare,
  Bot,
  Sun,
  ArrowUpDown,
  Send,
} from 'lucide-react';

interface HeartbeatState {
  lastRun: string;
  duration?: number;
  status: string;
  response?: string;
  error?: string;
  sessionId?: string;
  heartbeatVersion?: string;
}

interface SessionContext {
  session_id: string;
  started_at: string;
  last_heartbeat: string;
  metrics: {
    total_heartbeats: number;
    total_tasks_completed: number;
    total_errors: number;
  };
  findings: Array<{ timestamp: string; category: string; finding: string }>;
  decisions: Array<{ timestamp: string; decision: string; rationale?: string }>;
  blockers: Array<{ timestamp: string; blocker: string; status: string; task_id?: string }>;
  learnings: Array<{ timestamp: string; category: string; learning: string }>;
  in_progress_tasks: Array<{ task_id: string; progress: number; last_updated: string }>;
  completed_tasks: Array<{ task_id: string; completed_at: string; notes: string[] }>;
}

interface ErrorEntry {
  timestamp: string;
  type: string;
  severity: string;
  message: string;
  context?: Record<string, unknown>;
}

interface SystemJob {
  name: string;
  type: string;
  schedule: string;
  status: string;
  lastRun?: string;
  pid?: string;
  lastLog?: string;
}

export default function HeartbeatPage() {
  const [state, setState] = useState<HeartbeatState | null>(null);
  const [context, setContext] = useState<SessionContext | null>(null);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [jobs, setJobs] = useState<SystemJob[]>([]);
  const [jobsCollectedAt, setJobsCollectedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [tab, setTab] = useState<'jobs' | 'overview' | 'findings' | 'errors'>('jobs');

  async function fetchData() {
    try {
      const res = await fetch('/api/heartbeat');
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        setContext(data.context);
        setErrors(data.errors || []);
        setJobs(data.jobs || []);
        setJobsCollectedAt(data.jobsCollectedAt || null);
        setLastSync(data.lastSync);
      }
    } catch (e) {
      console.error('Failed to fetch heartbeat data:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function statusColor(status: string): string {
    if (status === 'ok') return 'text-emerald-400';
    if (status === 'error') return 'text-red-400';
    return 'text-amber-400';
  }

  function statusIcon(status: string) {
    if (status === 'ok') return <CheckCircle2 size={18} className="text-emerald-400" />;
    if (status === 'error') return <XCircle size={18} className="text-red-400" />;
    return <AlertTriangle size={18} className="text-amber-400" />;
  }

  function severityColor(sev: string): string {
    if (sev === 'CRITICAL') return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (sev === 'ERROR') return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (sev === 'WARN') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  const metrics = context?.metrics || { total_heartbeats: 0, total_tasks_completed: 0, total_errors: 0 };
  const activeBlockers = (context?.blockers || []).filter(b => b.status === 'active');
  const recentFindings = (context?.findings || []).slice(-10).reverse();
  const recentDecisions = (context?.decisions || []).slice(-5).reverse();
  const recentLearnings = (context?.learnings || []).slice(-5).reverse();
  const recentErrors = errors.slice(-15).reverse();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="text-violet-400" size={28} />
            Heartbeat Monitor
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            v5 — Session-persistent, lock-protected, smart context
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Status Banner */}
      {state && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-xl p-4 flex items-center justify-between border ${
            state.status === 'ok' ? 'border-emerald-500/20' : 'border-red-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            {statusIcon(state.status)}
            <div>
              <p className={`text-sm font-semibold ${statusColor(state.status)}`}>
                {state.status === 'ok' ? 'Heartbeat Healthy' : 'Heartbeat Error'}
              </p>
              <p className="text-xs text-zinc-500">
                Last run: {timeAgo(state.lastRun)} &middot; {state.duration ? `${Math.round(state.duration)}s` : ''} &middot; {state.heartbeatVersion || 'v4'}
              </p>
            </div>
          </div>
          {state.response && (
            <p className="text-xs text-zinc-400 max-w-md truncate hidden md:block">
              {state.response.substring(0, 120)}
            </p>
          )}
          {state.error && (
            <p className="text-xs text-red-400 max-w-md truncate hidden md:block">
              {state.error}
            </p>
          )}
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Hash size={18} className="text-violet-400" />}
          label="Total Heartbeats"
          value={metrics.total_heartbeats}
        />
        <MetricCard
          icon={<Zap size={18} className="text-emerald-400" />}
          label="Tasks Completed"
          value={metrics.total_tasks_completed}
        />
        <MetricCard
          icon={<AlertTriangle size={18} className="text-amber-400" />}
          label="Total Errors"
          value={metrics.total_errors}
        />
        <MetricCard
          icon={<Timer size={18} className="text-blue-400" />}
          label="Last Duration"
          value={state?.duration ? `${Math.round(state.duration)}s` : '—'}
        />
      </div>

      {/* Active Blockers */}
      {activeBlockers.length > 0 && (
        <div className="glass rounded-xl p-4 border border-red-500/20">
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} />
            Active Blockers ({activeBlockers.length})
          </h3>
          <div className="space-y-2">
            {activeBlockers.map((b, i) => (
              <div key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <span>{b.blocker} {b.task_id && <span className="text-zinc-600">({b.task_id})</span>}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-1">
        {(['jobs', 'overview', 'findings', 'errors'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
              tab === t
                ? 'text-white bg-white/10 font-medium'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'jobs' ? `System Jobs (${jobs.length})` : t === 'overview' ? 'Session' : t === 'findings' ? 'Findings' : `Errors (${recentErrors.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'jobs' && (
        <div className="space-y-4">
          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, i) => {
              const icon = jobIcon(job.name);
              const borderColor = job.status === 'running' || job.status === 'ok'
                ? 'border-emerald-500/20'
                : job.status === 'error' || job.status === 'down'
                ? 'border-red-500/20'
                : 'border-zinc-700/30';

              return (
                <motion.div
                  key={job.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass rounded-xl p-4 border ${borderColor}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="text-sm font-semibold text-white">{job.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.pid && (
                        <span className="text-[10px] font-mono text-zinc-600">PID {job.pid}</span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'running' || job.status === 'ok'
                          ? 'bg-emerald-400/10 text-emerald-400'
                          : job.status === 'error' || job.status === 'down'
                          ? 'bg-red-400/10 text-red-400'
                          : 'bg-zinc-400/10 text-zinc-400'
                      }`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Schedule</span>
                      <span className="text-zinc-400">{job.schedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Type</span>
                      <span className="text-zinc-400">{job.type}</span>
                    </div>
                    {job.lastRun && job.lastRun !== 'never' && job.lastRun !== '' && (
                      <div className="flex justify-between">
                        <span className="text-zinc-600">Last Run</span>
                        <span className="text-zinc-400">{timeAgo(job.lastRun)}</span>
                      </div>
                    )}
                  </div>

                  {job.lastLog && job.lastLog !== '(no log file)' && (
                    <div className="mt-3 pt-2 border-t border-white/5">
                      <p className="text-[10px] text-zinc-600 mb-1">Last log output:</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{job.lastLog}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {jobs.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-sm text-zinc-500">No job data yet. Run sync-memory.sh to populate.</p>
            </div>
          )}

          {jobsCollectedAt && (
            <div className="text-xs text-zinc-600 text-right">
              Job health collected: {timeAgo(jobsCollectedAt)}
            </div>
          )}
        </div>
      )}

      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Session Info */}
          {context && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <Brain size={16} className="text-violet-400" />
                Session Info
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-zinc-600 text-xs">Session ID</p>
                  <p className="text-zinc-300 font-mono text-xs">{context.session_id || '—'}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs">Started</p>
                  <p className="text-zinc-300">{context.started_at ? timeAgo(context.started_at) : '—'}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs">Last Heartbeat</p>
                  <p className="text-zinc-300">{context.last_heartbeat ? timeAgo(context.last_heartbeat) : '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Learnings */}
          {recentLearnings.length > 0 && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Recent Learnings</h3>
              <div className="space-y-2">
                {recentLearnings.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Brain size={14} className="text-violet-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-zinc-300">{l.learning}</span>
                      <span className="text-zinc-600 text-xs ml-2">[{l.category}]</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {(context?.completed_tasks || []).length > 0 && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Completed Tasks</h3>
              <div className="space-y-2">
                {(context?.completed_tasks || []).slice(-5).reverse().map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-zinc-300 font-mono text-xs">{t.task_id}</span>
                      <span className="text-zinc-600 text-xs ml-2">{timeAgo(t.completed_at)}</span>
                      {t.notes?.[0] && (
                        <p className="text-zinc-500 text-xs mt-0.5">{t.notes[0]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sync Info */}
          <div className="text-xs text-zinc-600 text-right">
            Dashboard synced: {lastSync ? timeAgo(lastSync) : 'never'}
          </div>
        </div>
      )}

      {tab === 'findings' && (
        <div className="space-y-4">
          {/* Findings */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Recent Findings</h3>
            <div className="space-y-2">
              {recentFindings.length === 0 && <p className="text-sm text-zinc-600">No findings yet</p>}
              {recentFindings.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-2 text-sm border-l-2 border-violet-500/30 pl-3 py-1"
                >
                  <div>
                    <span className="text-zinc-300">{f.finding}</span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">{f.category}</span>
                      <span className="text-zinc-600 text-[10px]">{timeAgo(f.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decisions */}
          {recentDecisions.length > 0 && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Decisions Made</h3>
              <div className="space-y-3">
                {recentDecisions.map((d, i) => (
                  <div key={i} className="border-l-2 border-emerald-500/30 pl-3 py-1">
                    <p className="text-sm text-zinc-300">{d.decision}</p>
                    {d.rationale && <p className="text-xs text-zinc-500 mt-1">Rationale: {d.rationale}</p>}
                    <p className="text-[10px] text-zinc-600 mt-1">{timeAgo(d.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'errors' && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Error Log (Last 15)</h3>
          <div className="space-y-2">
            {recentErrors.length === 0 && <p className="text-sm text-zinc-600">No errors logged</p>}
            {recentErrors.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`text-sm border rounded-lg p-3 ${severityColor(e.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-current/20">{e.severity}</span>
                    <span className="font-mono text-xs">{e.type}</span>
                  </div>
                  <span className="text-[10px] opacity-60">{timeAgo(e.timestamp)}</span>
                </div>
                <p className="mt-1 text-xs opacity-80">{e.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function jobIcon(name: string) {
  const size = 18;
  switch (name) {
    case 'Heartbeat': return <Activity size={size} className="text-violet-400" />;
    case 'Telegram Bot': return <Send size={size} className="text-blue-400" />;
    case 'Maya DMs': return <MessageSquare size={size} className="text-pink-400" />;
    case 'Reddit Karma': return <ArrowUpDown size={size} className="text-orange-400" />;
    case 'Morning Briefing': return <Sun size={size} className="text-amber-400" />;
    case 'Dashboard Sync': return <RefreshCw size={size} className="text-cyan-400" />;
    default: return <Bot size={size} className="text-zinc-400" />;
  }
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-zinc-500">{label}</span></div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}
