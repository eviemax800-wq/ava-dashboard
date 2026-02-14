import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Read all state files to provide context
function getEmpireContext() {
  const workspacePath = process.env.WORKSPACE_PATH || '/Users/evie/.openclaw/workspace';
  const memoryPath = path.join(workspacePath, 'memory');

  const context: any = {};

  try {
    // Revenue data
    const revenuePath = path.join(memoryPath, 'revenue.json');
    if (fs.existsSync(revenuePath)) {
      context.revenue = JSON.parse(fs.readFileSync(revenuePath, 'utf-8'));
    }

    // System health
    const healthPath = path.join(memoryPath, 'system-health.json');
    if (fs.existsSync(healthPath)) {
      context.system_health = JSON.parse(fs.readFileSync(healthPath, 'utf-8'));
    }

    // Launch status
    const launchPath = path.join(memoryPath, 'launch-status.json');
    if (fs.existsSync(launchPath)) {
      context.launch_status = JSON.parse(fs.readFileSync(launchPath, 'utf-8'));
    }

    // Influencer metrics
    const influencersPath = path.join(memoryPath, 'influencer-metrics.json');
    if (fs.existsSync(influencersPath)) {
      context.influencers = JSON.parse(fs.readFileSync(influencersPath, 'utf-8'));
    }

    // Marketing data
    const marketingPath = path.join(memoryPath, 'marketing.json');
    if (fs.existsSync(marketingPath)) {
      context.marketing = JSON.parse(fs.readFileSync(marketingPath, 'utf-8'));
    }

    // Experiments
    const experimentsPath = path.join(memoryPath, 'experiments.json');
    if (fs.existsSync(experimentsPath)) {
      context.experiments = JSON.parse(fs.readFileSync(experimentsPath, 'utf-8'));
    }

    // Financial data
    const financialPath = path.join(memoryPath, 'financial.json');
    if (fs.existsSync(financialPath)) {
      context.financial = JSON.parse(fs.readFileSync(financialPath, 'utf-8'));
    }

    // Autonomous queue
    const queuePath = path.join(memoryPath, 'autonomous-queue.json');
    if (fs.existsSync(queuePath)) {
      context.queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading empire context:', error);
  }

  return context;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get current empire data
    const context = getEmpireContext();

    // Create prompt for Claude
    const systemPrompt = `You are Ava, Ashan's AI co-founder and empire orchestrator. You have access to real-time data about Ashan's business empire.

Your role:
- Answer questions about empire metrics, tasks, revenue, experiments, etc.
- Be concise but helpful (2-3 sentences max unless asked for details)
- Use specific numbers from the data when available
- Be encouraging and strategic
- If data is missing, say so honestly

Current Empire Data:
${JSON.stringify(context, null, 2)}

Guidelines:
- For revenue questions: Check context.revenue.current_mrr and product breakdowns
- For task questions: Check context.queue for autonomous queue tasks
- For influencer questions: Check context.influencers (Margot & Luna)
- For launch questions: Check context.launch_status
- For experiment questions: Check context.experiments
- For financial questions: Check context.financial (runway, expenses, P&L)
- For marketing questions: Check context.marketing

Keep responses natural, conversational, and focused on what matters most.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const assistantResponse =
      response.content[0].type === 'text'
        ? response.content[0].text
        : 'Sorry, I had trouble processing that.';

    return NextResponse.json({ response: assistantResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
