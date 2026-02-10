import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { id } = await params;
    const body = await request.json();
    const reason = body.reason || null;

    // 1. Get the report_path before updating
    const { data: proposal } = await supabase
        .from('proposals')
        .select('report_path')
        .eq('id', id)
        .single();

    // 2. Update the database
    const { error: updateError } = await supabase
        .from('proposals')
        .update({ 
            status: 'rejected',
            archived_at: new Date().toISOString(),
            archived_reason: reason
        })
        .eq('id', id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. Delete the file from storage if it exists
    if (proposal?.report_path) {
        await supabase.storage
            .from('reports')
            .remove([proposal.report_path]);
    }

    return NextResponse.json({ success: true });
}
