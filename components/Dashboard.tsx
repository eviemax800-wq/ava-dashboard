'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Agent {
  id: string
  label: string
  task: string
  status: 'running' | 'completed' | 'blocked' | 'failed'
  progress: number
  current_milestone: string
  last_update: string
  started_at: string
}

interface Task {
  id: string
  name: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'READY' | 'BLOCKED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  blockers: string[]
  time_estimate: string
  assigned_to: string | null
}

interface Blocker {
  id: number
  type: string
  resource: string
  discovered_at: string
  priority_impact: 'P0' | 'P1' | 'P2' | 'P3'
  impacts: string[]
  details: string
  status: 'active' | 'resolved'
}

interface SidebarItem {
  label: string
  sectionId: string
  badge?: string
}

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass surface card-border">
      <div className="h-4 w-32 rounded-full shimmer mb-4" />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-3 w-full rounded-full shimmer mb-3 last:mb-0" />
      ))}
    </div>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-24 h-24 rounded-3xl glass-strong card-border flex items-center justify-center mb-4">
        <svg
          viewBox="0 0 120 120"
          className="w-14 h-14 text-slate-200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          <path
            d="M35 62c10 8 20 12 25 12 8 0 18-4 28-12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="45" cy="50" r="4" fill="currentColor" opacity="0.8" />
          <circle cx="75" cy="50" r="4" fill="currentColor" opacity="0.8" />
        </svg>
      </div>
      <div className="text-lg font-semibold">{title}</div>
      <p className="text-muted text-sm mt-2 max-w-sm">{description}</p>
    </div>
  )
}

export default function Dashboard({ user }: { user: User }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()

    const agentsChannel = supabase
      .channel('agents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        fetchAgents()
      })
      .subscribe()

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    const blockersChannel = supabase
      .channel('blockers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blockers' }, () => {
        fetchBlockers()
      })
      .subscribe()

    return () => {
      agentsChannel.unsubscribe()
      tasksChannel.unsubscribe()
      blockersChannel.unsubscribe()
    }
  }, [])

  async function fetchData() {
    await Promise.all([fetchAgents(), fetchTasks(), fetchBlockers()])
    setLoading(false)
  }

  async function fetchAgents() {
    const { data } = await supabase
      .from('agents')
      .select('*')
      .order('last_update', { ascending: false })
    if (data) setAgents(data)
  }

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('priority')
    if (data) setTasks(data)
  }

  async function fetchBlockers() {
    const { data } = await supabase
      .from('blockers')
      .select('*')
      .eq('status', 'active')
      .order('discovered_at', { ascending: false })
    if (data) setBlockers(data)
  }

  const activeBlockers = blockers.filter(b => b.priority_impact === 'P0')
  const runningAgents = agents.filter(a => a.status === 'running')
  const readyTasks = tasks.filter(t => t.status === 'READY')
  const navItems: SidebarItem[] = [
    { label: 'Dashboard', sectionId: 'dashboard-overview' },
    { label: 'Agents', sectionId: 'agents-panel', badge: `${runningAgents.length}` },
    { label: 'Tasks', sectionId: 'tasks-panel', badge: `${tasks.length}` },
    { label: 'Blockers', sectionId: 'blockers-panel', badge: `${blockers.length}` },
    { label: 'Settings', sectionId: 'settings-panel' },
  ]
  const quickActions = ['Spawn Agent', 'Add Task', 'Sync Now', 'View Logs']

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setSidebarOpen(false)
  }

  async function handleQuickAction(action: string) {
    if (action === 'Spawn Agent') {
      scrollToSection('agents-panel')
      return
    }
    if (action === 'Add Task') {
      scrollToSection('tasks-panel')
      return
    }
    if (action === 'View Logs') {
      scrollToSection('logs-panel')
      return
    }
    if (action === 'Sync Now') {
      setIsSyncing(true)
      await fetchData()
      setIsSyncing(false)
      setSidebarOpen(false)
    }
  }

  function SidebarContent({ mobile = false }: { mobile?: boolean }) {
    return (
      <div className="glass-strong surface card-border elevate h-full flex flex-col">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted">AVA</div>
              <div className="text-lg font-semibold mt-2">Command Stack</div>
              <div className="text-xs text-muted mt-2">Realtime HQ</div>
            </div>
            {mobile && (
              <button
                type="button"
                className="text-xs text-muted hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                Close
              </button>
            )}
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map(item => (
            <button
              key={item.label}
              type="button"
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-left glass card-border elevate transition-all duration-300 hover:translate-x-1"
              onClick={() => scrollToSection(item.sectionId)}
            >
              <span>{item.label}</span>
              <span className="text-xs text-muted">{item.badge ?? 'Go'}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <div className="text-xs uppercase tracking-[0.3em] text-muted mb-4">Quick Actions</div>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map(action => (
              <button
                key={action}
                type="button"
                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold glass card-border elevate transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSyncing && action === 'Sync Now'}
                onClick={() => handleQuickAction(action)}
              >
                {action === 'Sync Now' && isSyncing ? 'Syncing...' : action}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-grid">
        <div className="flex">
          <aside className="hidden md:flex md:flex-col md:w-72 md:sticky md:top-0 md:h-screen md:p-6">
            <div className="glass-strong surface card-border elevate h-full flex flex-col gap-6">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted">AVA</div>
                <div className="text-lg font-semibold mt-2">Command Stack</div>
                <div className="text-xs text-muted mt-2">Realtime HQ</div>
              </div>
              <div className="space-y-2">
                {navItems.map(item => (
                  <div key={item.label} className="h-10 rounded-2xl shimmer" />
                ))}
              </div>
              <div className="mt-auto space-y-3">
                <div className="h-4 w-32 rounded-full shimmer" />
                <div className="grid grid-cols-1 gap-3">
                  {quickActions.map(action => (
                    <div key={action} className="h-10 rounded-2xl shimmer" />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 px-6 py-10">
            <div className="md:hidden mb-6 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.3em] text-muted">AVA</div>
              <div className="h-9 w-24 rounded-full shimmer" />
            </div>
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="glass-strong surface card-border">
                <div className="h-6 w-56 rounded-full shimmer mb-4" />
                <div className="h-4 w-96 max-w-full rounded-full shimmer" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonCard lines={5} />
                <SkeletonCard lines={6} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="flex">
        <aside className="hidden md:flex md:flex-col md:w-72 md:sticky md:top-0 md:h-screen md:p-6">
          <SidebarContent />
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm md:hidden"
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-40 h-full w-72 p-6 md:hidden transition-transform duration-300 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent mobile />
        </aside>

        <div className="flex-1 px-6 py-10">
          <div className="md:hidden mb-8 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted">AVA</div>
              <div className="text-lg font-semibold mt-2">Dashboard</div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="glass card-border px-4 py-2 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5"
            >
              Menu
            </button>
          </div>

          <div className="max-w-7xl mx-auto space-y-8">
        <div id="dashboard-overview" className="glass-strong surface card-border elevate scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                Mission Control
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold">AVA Dashboard</h1>
              <p className="text-muted mt-2">Premium visibility into your autonomous workforce.</p>
            </div>
            <div className="glass surface card-border px-5 py-4 min-w-[220px]">
              <div className="text-xs text-muted">Signed in</div>
              <div className="text-sm font-semibold truncate">{user.email}</div>
              <div className="text-xs text-muted mt-2">Realtime sync active</div>
            </div>
          </div>
        </div>

        <div id="blockers-panel" className="space-y-4 scroll-mt-24">
          {activeBlockers.length > 0 && (
            <>
              {activeBlockers.map(blocker => (
                <div key={blocker.id} className="glass-strong surface card-border elevate">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 text-red-300 text-sm font-semibold mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                        Priority Blocker (P0)
                      </div>
                      <div className="text-lg font-semibold">{blocker.resource}</div>
                      <div className="text-sm text-muted mt-2">{blocker.details}</div>
                    </div>
                    <div className="text-xs text-muted">
                      Impacts: {blocker.impacts.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass surface card-border elevate fade-in">
            <div className="text-xs text-muted">Agents Running</div>
            <div className="text-3xl font-semibold mt-3">{runningAgents.length}</div>
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, runningAgents.length * 12)}%`,
                  background: 'linear-gradient(90deg, rgba(110,231,255,0.9), rgba(124,92,255,0.9))',
                }}
              />
            </div>
          </div>
          <div className="glass surface card-border elevate fade-in">
            <div className="text-xs text-muted">Tasks Ready</div>
            <div className="text-3xl font-semibold mt-3">{readyTasks.length}</div>
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, readyTasks.length * 10)}%`,
                  background: 'linear-gradient(90deg, rgba(74,222,128,0.9), rgba(110,231,255,0.9))',
                }}
              />
            </div>
          </div>
          <div className="glass surface card-border elevate fade-in">
            <div className="text-xs text-muted">Active Blockers</div>
            <div className="text-3xl font-semibold mt-3">{blockers.length}</div>
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, blockers.length * 16)}%`,
                  background: 'linear-gradient(90deg, rgba(248,113,113,0.9), rgba(245,158,11,0.9))',
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="agents-panel" className="glass surface card-border elevate scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Active Agents</h2>
                <p className="text-muted text-sm">Realtime execution status</p>
              </div>
              <span className="text-xs text-muted">{runningAgents.length} running</span>
            </div>
            {runningAgents.length === 0 ? (
              <EmptyState
                title="No agents in motion"
                description="Spin up new assignments or wait for the next task wave."
              />
            ) : (
              <div className="space-y-4">
                {runningAgents.map(agent => (
                  <div
                    key={agent.id}
                    className="glass card-border rounded-2xl p-4 elevate"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted">{agent.label}</div>
                        <div className="text-base font-semibold mt-1">{agent.task}</div>
                      </div>
                      <div className="text-sm font-semibold">{agent.progress}%</div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${agent.progress}%`,
                          background: 'linear-gradient(90deg, rgba(110,231,255,0.9), rgba(124,92,255,0.9))',
                        }}
                      />
                    </div>
                    {agent.current_milestone && (
                      <div className="text-xs text-muted mt-3">Current: {agent.current_milestone}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div id="tasks-panel" className="glass surface card-border elevate scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Task Queue</h2>
                <p className="text-muted text-sm">Prioritized pipeline</p>
              </div>
              <span className="text-xs text-muted">Showing {Math.min(10, tasks.length)}</span>
            </div>
            {tasks.length === 0 ? (
              <EmptyState
                title="Queue is clear"
                description="When new tasks arrive, they will appear here with live status updates."
              />
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 10).map(task => (
                  <div key={task.id} className="glass card-border rounded-2xl p-4 elevate">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-muted">{task.assigned_to ?? 'Unassigned'}</div>
                        <div className="text-base font-semibold mt-1">{task.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full border border-white/10 ${
                            task.priority === 'P0'
                              ? 'text-red-200 bg-red-500/15'
                              : task.priority === 'P1'
                                ? 'text-orange-200 bg-orange-500/15'
                                : task.priority === 'P2'
                                  ? 'text-amber-200 bg-amber-500/15'
                                  : 'text-slate-200 bg-white/10'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full border border-white/10 ${
                            task.status === 'READY'
                              ? 'text-emerald-200 bg-emerald-500/15'
                              : task.status === 'BLOCKED'
                                ? 'text-red-200 bg-red-500/15'
                                : task.status === 'IN_PROGRESS'
                                  ? 'text-sky-200 bg-sky-500/15'
                                  : task.status === 'COMPLETED'
                                    ? 'text-slate-200 bg-white/10'
                                    : 'text-slate-200 bg-white/10'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted mt-3">
                      {task.time_estimate && <span>Est. {task.time_estimate}</span>}
                      {task.blockers?.length > 0 && <span>{task.blockers.length} blockers</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div id="logs-panel" className="glass surface card-border elevate scroll-mt-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Live Logs</h2>
            <span className="text-xs text-muted">Realtime subscriptions intact</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between glass card-border rounded-2xl px-4 py-3">
              <span>Agents stream</span>
              <span className="text-xs text-muted">Listening to `agents` changes</span>
            </div>
            <div className="flex items-center justify-between glass card-border rounded-2xl px-4 py-3">
              <span>Tasks stream</span>
              <span className="text-xs text-muted">Listening to `tasks` changes</span>
            </div>
            <div className="flex items-center justify-between glass card-border rounded-2xl px-4 py-3">
              <span>Blockers stream</span>
              <span className="text-xs text-muted">Listening to `blockers` changes</span>
            </div>
          </div>
        </div>

        <div id="settings-panel" className="glass surface card-border elevate scroll-mt-24">
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-muted text-sm mt-2">
            Workspace preferences and automation controls can be managed here in the next iteration.
          </p>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
