import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="h-screen flex bg-[#0a0a0a] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
