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
    const { data: research } = await supabase
        .from('research')
        .select('report_path')
        .eq('id', id)
        .single();

    // 2. Update the database
    const { error: updateError } = await supabase
        .from('research')
        .update({ 
            archived_at: new Date().toISOString(),
            archived_reason: reason
        })
        .eq('id', id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. Delete the file from storage if it exists
    if (research?.report_path) {
        await supabase.storage
            .from('reports')
            .remove([research.report_path]);
    }

    return NextResponse.json({ success: true });
}
