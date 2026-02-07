import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/Users/evie/.openclaw/workspace';

// Helper functions (same as sync-dashboard.js)
async function readJSON(filepath: string) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function readFile(filepath: string) {
  try {
    return await fs.readFile(filepath, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function listFiles(dir: string, pattern: RegExp) {
  try {
    const files = await fs.readdir(dir);
    return files.filter(f => f.match(pattern)).map(f => path.join(dir, f));
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function parseBlockersMd(content: string | null) {
  if (!content) return [];
  
  const blockers = [];
  const activeSectionMatch = content.match(/## Active Blockers\s*\n([\s\S]*?)(?=\n## |$)/);
  if (!activeSectionMatch) return [];
  
  const activeContent = activeSectionMatch[1];
  const entries = activeContent.split(/\n---\n/);
  
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed || trimmed.includes('<!--') || !trimmed.includes('###')) continue;
    
    const titleMatch = trimmed.match(/###\s*(.+?)$/m);
    const title = titleMatch ? titleMatch[1].trim() : null;
    if (!title || title.includes('[Blocker Title]')) continue;
    
    const extractField = (name: string) => {
      const regex = new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+?)$`, 'm');
      const match = entry.match(regex);
      return match ? match[1].trim() : null;
    };
    
    const extractSection = (name: string) => {
      const regex = new RegExp(`\\*\\*${name}:\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n---|$)`, 'm');
      const match = entry.match(regex);
      return match ? match[1].trim() : null;
    };
    
    const impactText = extractSection('Affected Tasks');
    const impacts = impactText 
      ? impactText.split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
      : [];
    
    blockers.push({
      type: extractField('Type') || 'other',
      resource: title,
      discovered_at: extractField('Discovered'),
      discovered_by: extractField('Discovered By'),
      alerted_user: extractField('User Alerted')?.toLowerCase().includes('yes') || false,
      priority_impact: extractField('Priority Impact'),
      impacts: impacts,
      details: extractSection('Details'),
      resolution: extractSection('Resolution Required'),
      status: 'active'
    });
  }
  
  return blockers;
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
    
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const stats = { agents: 0, tasks: 0, blockers: 0, heartbeat: 0 };
    
    // Sync agents
    const agentFiles = await listFiles(path.join(WORKSPACE_DIR, 'memory'), /^agent-.*\.json$/);
    const agents = [];
    
    for (const filepath of agentFiles) {
      const data = await readJSON(filepath);
      if (!data || data.label === '_template' || data._instructions) continue;
      
      let status = data.status || 'running';
      if (!['running', 'completed', 'blocked', 'failed'].includes(status)) {
        status = 'running';
      }
      
      agents.push({
        id: data.label || path.basename(filepath, '.json').replace('agent-', ''),
        label: data.label,
        task: data.task,
        status,
        progress: data.progress || 0,
        current_milestone: data.currentMilestone,
        last_update: data.lastUpdate || data.startedAt || new Date().toISOString(),
        started_at: data.startedAt,
        completed_at: data.completedAt,
        error: data.error,
        discoveries: data.discoveries || [],
        blockers: data.blockers || []
      });
    }
    
    if (agents.length > 0) {
      await client.from('agents').upsert(agents, { onConflict: 'id' });
      stats.agents = agents.length;
    }
    
    // Sync tasks
    const queueData = await readJSON(path.join(WORKSPACE_DIR, 'tasks', 'queue.json'));
    if (queueData?.tasks) {
      const tasks = queueData.tasks.map((task: any) => ({
        id: task.id,
        name: task.name,
        priority: task.priority,
        status: task.status,
        blockers: task.blockers || [],
        dependencies: task.dependencies || [],
        time_estimate: task.timeEstimate,
        description: task.description,
        deliverables: task.deliverables || [],
        assigned_to: task.assignedTo,
        context_type: task.contextType,
        notes: task.notes,
        independent: task.independent !== false,
        updated_at: queueData.lastUpdated || new Date().toISOString()
      }));
      
      await client.from('tasks').upsert(tasks, { onConflict: 'id' });
      stats.tasks = tasks.length;
    }
    
    // Sync blockers
    const blockersContent = await readFile(path.join(WORKSPACE_DIR, 'tasks', 'BLOCKERS.md'));
    const blockers = parseBlockersMd(blockersContent);
    
    if (blockers.length > 0) {
      await client.from('blockers').delete().eq('status', 'active');
      await client.from('blockers').insert(blockers);
      stats.blockers = blockers.length;
    }
    
    // Sync heartbeat
    const heartbeatData = await readJSON(path.join(WORKSPACE_DIR, 'memory', 'heartbeat-state.json'));
    if (heartbeatData) {
      await client.from('heartbeat_status').insert([{
        call: heartbeatData.call,
        rotation_index: heartbeatData.rotationIndex,
        last_category: heartbeatData.lastCategory,
        last_run: heartbeatData.lastRun,
        last_user_message: heartbeatData.lastUserMessage,
        idle_since: heartbeatData.idleSince
      }]);
      stats.heartbeat = 1;
    }
    
    // Log activity
    await client.from('activity_log').insert([{
      event_type: 'sync_complete',
      message: 'Dashboard sync completed',
      metadata: stats
    }]);
    
    return NextResponse.json({ success: true, stats });
    
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
