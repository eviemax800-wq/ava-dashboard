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

export default function Dashboard({ user }: { user: User }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
    
    // Subscribe to real-time changes
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">✨ AVA DASHBOARD</h1>
            <p className="text-gray-400">Mission control for your AI workforce</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Logged in as</div>
            <div className="font-medium">{user.email}</div>
          </div>
        </div>
      </div>

      {/* P0 Blocker Alert */}
      {activeBlockers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          {activeBlockers.map(blocker => (
            <div key={blocker.id} className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚨</span>
                    <span className="font-bold text-red-400">BLOCKER (P0)</span>
                  </div>
                  <div className="text-lg font-medium mb-1">{blocker.resource}</div>
                  <div className="text-sm text-gray-300 mb-2">{blocker.details}</div>
                  <div className="text-sm text-gray-400">
                    Impacts: {blocker.impacts.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-3xl font-bold mb-1">{runningAgents.length}</div>
          <div className="text-gray-400">Agents Working</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-3xl font-bold mb-1">{readyTasks.length}</div>
          <div className="text-gray-400">Tasks Ready</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="text-3xl mb-2">🚨</div>
          <div className="text-3xl font-bold mb-1">{blockers.length}</div>
          <div className="text-gray-400">Active Blockers</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Agents */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">👥 Active Agents ({runningAgents.length})</h2>
          {runningAgents.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No agents currently working</div>
          ) : (
            <div className="space-y-4">
              {runningAgents.map(agent => (
                <div key={agent.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{agent.label}</span>
                    <span className="text-sm text-gray-400">{agent.progress}%</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{agent.task}</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                  {agent.current_milestone && (
                    <div className="text-xs text-gray-400 mt-2">
                      Current: {agent.current_milestone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Queue */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">📋 Task Queue</h2>
          <div className="space-y-3">
            {tasks.slice(0, 10).map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{task.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'P0' ? 'bg-red-900 text-red-300' :
                    task.priority === 'P1' ? 'bg-orange-900 text-orange-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.status === 'READY' ? 'bg-green-900 text-green-300' :
                    task.status === 'BLOCKED' ? 'bg-red-900 text-red-300' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-900 text-blue-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {task.status}
                  </span>
                  {task.time_estimate && (
                    <span className="text-xs text-gray-400">{task.time_estimate}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
