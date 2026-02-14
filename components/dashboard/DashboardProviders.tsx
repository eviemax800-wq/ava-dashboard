'use client';

import { ToastProvider } from '@/components/ui/Toast';

export function DashboardProviders({ children }: { children: React.ReactNode }) {
    return <ToastProvider>{children}</ToastProvider>;
}
