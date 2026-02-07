'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    CheckSquare,
    Bot,
    FolderKanban,
    AlertCircle,
    FileText,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
    { href: '/dashboard/agents', icon: Bot, label: 'Agents' },
    { href: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/dashboard/blockers', icon: AlertCircle, label: 'Blockers' },
    { href: '/dashboard/logs', icon: FileText, label: 'Logs' },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [mobileOpen, setMobileOpen] = useState(false);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    const NavContent = () => (
        <>
            {/* Logo */}
            <div className="px-6 py-6">
                <h1 className="text-xl font-bold gradient-text tracking-tight">
                    ✨ AVA DASHBOARD
                </h1>
                <p className="text-xs text-zinc-500 mt-1">Mission Control</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                        >
                            <motion.div
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 text-sm
                  ${isActive
                                        ? 'active-nav text-white font-semibold'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }
                `}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center ring-1 ring-violet-500/30">
                        <span className="text-xs font-semibold text-violet-400">AV</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300 truncate">
                            eviemax800
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <LogOut size={14} />
                    Sign out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden md:flex h-full w-60 flex-col glass-strong flex-shrink-0">
                <NavContent />
            </div>

            {/* Mobile hamburger */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            className="md:hidden fixed inset-0 bg-black/60 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col glass-strong"
                            initial={{ x: -288 }}
                            animate={{ x: 0 }}
                            exit={{ x: -288 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <NavContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
