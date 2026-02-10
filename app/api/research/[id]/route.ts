import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { id } = await params;

    // 1. Get the report_path before deleting
    const { data: research } = await supabase
        .from('research')
        .select('report_path')
        .eq('id', id)
        .single();

    // 2. Delete from database
    const { error: deleteError } = await supabase
        .from('research')
        .delete()
        .eq('id', id);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 3. Delete from storage if exists
    if (research?.report_path) {
        await supabase.storage
            .from('reports')
            .remove([research.report_path]);
    }

    return NextResponse.json({ success: true });
}
