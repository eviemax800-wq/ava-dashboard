import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const supabase = createClient(supabaseUrl, serviceKey);

  // Fetch heartbeat-related memory files
  const keys = ['heartbeat-state', 'session-context', 'error-log'];
  const { data: files, error } = await supabase
    .from('memory_files')
    .select('key, content, updated_at')
    .in('key', keys);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Parse JSON content from each file
  const result: Record<string, unknown> = {};
  for (const file of files || []) {
    try {
      result[file.key] = JSON.parse(file.content || '{}');
    } catch {
      result[file.key] = { raw: file.content, parseError: true };
    }
  }

  return NextResponse.json({
    state: result['heartbeat-state'] || null,
    context: result['session-context'] || null,
    errors: Array.isArray(result['error-log']) ? result['error-log'] : [],
    lastSync: files?.[0]?.updated_at || null,
  });
}

export async function POST(request: Request) {
  const supabase = createClient(supabaseUrl, serviceKey);
  const body = await request.json();

  // Accept heartbeat state push from sync script
  const { state, context, errors } = body;

  const upserts = [];
  if (state) {
    upserts.push({
      key: 'heartbeat-state',
      label: 'Heartbeat State',
      description: 'Current heartbeat execution status',
      content: JSON.stringify(state),
      lines: 1,
      size_bytes: JSON.stringify(state).length,
      last_modified: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  if (context) {
    upserts.push({
      key: 'session-context',
      label: 'Session Context',
      description: 'Heartbeat session continuity data',
      content: JSON.stringify(context),
      lines: 1,
      size_bytes: JSON.stringify(context).length,
      last_modified: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  if (errors) {
    upserts.push({
      key: 'error-log',
      label: 'Error Log',
      description: 'Recent error entries',
      content: JSON.stringify(errors),
      lines: Array.isArray(errors) ? errors.length : 1,
      size_bytes: JSON.stringify(errors).length,
      last_modified: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (upserts.length > 0) {
    const { error } = await supabase
      .from('memory_files')
      .upsert(upserts, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ synced: upserts.length });
}
