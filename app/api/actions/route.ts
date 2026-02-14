import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { TelegramAlerts } from '@/lib/telegram';

const execAsync = promisify(exec);

const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/Users/evie/.openclaw/workspace';

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json();

    let result: any = { success: false, message: '' };

    switch (action) {
      case 'sync-dashboard':
        result = await syncDashboard();
        break;

      case 'deploy-vercel':
        result = await deployToVercel();
        break;

      case 'fix-maya-2fa':
        result = await fixMaya2FA();
        break;

      case 'check-maya-dms':
        result = await checkMayaDMs();
        break;

      case 'launch-product':
        result = await launchProduct(params?.productId);
        break;

      case 'clear-blockers':
        result = await clearBlockers();
        break;

      case 'run-heartbeat':
        result = await runHeartbeat();
        break;

      case 'generate-report':
        result = await generateWeeklyReport();
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Action API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action', details: String(error) },
      { status: 500 }
    );
  }
}

async function syncDashboard() {
  try {
    const { stdout, stderr } = await execAsync('node sync-dashboard.js', {
      cwd: WORKSPACE_PATH,
    });
    return {
      success: true,
      message: 'Dashboard synced successfully',
      output: stdout,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Sync failed',
      error: error.message,
    };
  }
}

async function deployToVercel() {
  try {
    const dashboardPath = path.join(WORKSPACE_PATH, 'ava-dashboard');
    const { stdout, stderr } = await execAsync('vercel --prod', {
      cwd: dashboardPath,
    });
    return {
      success: true,
      message: 'Deployment initiated',
      output: stdout,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Deployment failed',
      error: error.message,
    };
  }
}

async function fixMaya2FA() {
  // This would trigger a manual 2FA flow
  // For now, we'll create a task in the queue
  try {
    const queuePath = path.join(WORKSPACE_PATH, 'memory/autonomous-queue.json');
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));

    const newTask = {
      id: `maya-2fa-${Date.now()}`,
      title: 'Fix Maya 2FA Login',
      priority: 1,
      status: 'pending',
      timeAllocation: '30min',
      description: 'Manual 2FA required for Maya Instagram automation',
      createdAt: new Date().toISOString(),
    };

    queue.tasks.push(newTask);
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));

    return {
      success: true,
      message: 'Maya 2FA task created - check autonomous queue',
      taskId: newTask.id,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to create Maya 2FA task',
      error: error.message,
    };
  }
}

async function checkMayaDMs() {
  try {
    const { stdout, stderr } = await execAsync(
      'python3 lib/maya_dms.py',
      { cwd: WORKSPACE_PATH }
    );
    return {
      success: true,
      message: 'Maya DM check completed',
      output: stdout,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Maya DM check failed',
      error: error.message,
    };
  }
}

async function launchProduct(productId?: string) {
  try {
    const launchPath = path.join(WORKSPACE_PATH, 'memory/launch-status.json');
    const launchStatus = JSON.parse(fs.readFileSync(launchPath, 'utf-8'));

    // Update status to launched
    launchStatus.status = 'live';
    launchStatus.launched_at = new Date().toISOString();

    fs.writeFileSync(launchPath, JSON.stringify(launchStatus, null, 2));

    // Send Telegram alert
    await TelegramAlerts.productLaunched(productId || 'Product');

    return {
      success: true,
      message: 'Product launch status updated to LIVE',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Launch failed',
      error: error.message,
    };
  }
}

async function clearBlockers() {
  try {
    const queuePath = path.join(WORKSPACE_PATH, 'memory/autonomous-queue.json');
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));

    // Mark all blocked tasks as pending
    let clearedCount = 0;
    queue.tasks.forEach((task: any) => {
      if (task.status === 'blocked') {
        task.status = 'pending';
        task.blocker = undefined;
        clearedCount++;
      }
    });

    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));

    return {
      success: true,
      message: `Cleared ${clearedCount} blockers`,
      clearedCount,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to clear blockers',
      error: error.message,
    };
  }
}

async function runHeartbeat() {
  try {
    // Run heartbeat in background
    exec('python3 ava-heartbeat.py', { cwd: WORKSPACE_PATH });

    return {
      success: true,
      message: 'Heartbeat started in background',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to start heartbeat',
      error: error.message,
    };
  }
}

async function generateWeeklyReport() {
  try {
    const { stdout, stderr } = await execAsync(
      'python3 lib/weekly_report.py',
      { cwd: WORKSPACE_PATH }
    );
    return {
      success: true,
      message: 'Weekly report generated',
      output: stdout,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Report generation failed',
      error: error.message,
    };
  }
}
