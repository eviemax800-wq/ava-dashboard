import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type ActionType = 'approve' | 'reject' | 'archive' | 'unarchive' | 'delete';

export async function POST(request: Request) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { type, id, action, reason } = (await request.json()) as {
        type: 'proposals' | 'research';
        id: string;
        action: ActionType;
        reason?: string;
    };

    if (!type || !id || !action) {
        return NextResponse.json({ error: 'Missing type, id, or action' }, { status: 400 });
    }

    if (!['proposals', 'research'].includes(type)) {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    try {
        switch (action) {
            case 'approve': {
                const { error } = await supabase
                    .from(type)
                    .update({ status: 'approved', archived_at: null })
                    .eq('id', id);
                if (error) throw error;
                return NextResponse.json({ success: true, action: 'approved' });
            }

            case 'reject': {
                // Get the report_path to delete from storage
                const { data: item } = await supabase
                    .from(type)
                    .select('report_path')
                    .eq('id', id)
                    .single();

                // Delete .html from storage if exists
                if (item?.report_path) {
                    await supabase.storage.from('reports').remove([item.report_path]);
                }

                // Update status and archive
                const { error } = await supabase
                    .from(type)
                    .update({
                        status: 'rejected',
                        archived_at: new Date().toISOString(),
                        archived_reason: reason || 'Rejected',
                        report_path: null,
                    })
                    .eq('id', id);
                if (error) throw error;
                return NextResponse.json({ success: true, action: 'rejected' });
            }

            case 'archive': {
                const { error } = await supabase
                    .from(type)
                    .update({
                        archived_at: new Date().toISOString(),
                        archived_reason: reason || 'Archived',
                    })
                    .eq('id', id);
                if (error) throw error;
                return NextResponse.json({ success: true, action: 'archived' });
            }

            case 'unarchive': {
                const { error } = await supabase
                    .from(type)
                    .update({ archived_at: null, archived_reason: null })
                    .eq('id', id);
                if (error) throw error;
                return NextResponse.json({ success: true, action: 'unarchived' });
            }

            case 'delete': {
                // Get report_path first
                const { data: item } = await supabase
                    .from(type)
                    .select('report_path')
                    .eq('id', id)
                    .single();

                // Delete from storage
                if (item?.report_path) {
                    await supabase.storage.from('reports').remove([item.report_path]);
                }

                // Delete from DB
                const { error } = await supabase.from(type).delete().eq('id', id);
                if (error) throw error;
                return NextResponse.json({ success: true, action: 'deleted' });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
