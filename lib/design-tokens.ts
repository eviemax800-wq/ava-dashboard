export const colors = {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceHover: '#222222',
    border: '#2a2a2a',
    borderHover: '#3a3a3a',
    accentPrimary: '#8b5cf6',
    accentSecondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    textTertiary: '#71717a',
};

export const glassmorphism = {
    background: 'rgba(26, 26, 26, 0.6)',
    backdropBlur: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
};

export const animations = {
    pageTransition: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.2, ease: 'easeOut' },
    },
    cardHover: {
        scale: 1.02,
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
    },
    staggerContainer: {
        animate: { transition: { staggerChildren: 0.05 } },
    },
    staggerItem: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    },
};

export const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
    P0: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Critical' },
    P1: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'High' },
    P2: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Medium' },
    P3: { color: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.15)', label: 'Low' },
};

export const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    READY: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Ready' },
    IN_PROGRESS: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', label: 'In Progress' },
    BLOCKED: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Blocked' },
    COMPLETED: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Completed' },
    PENDING: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending' },
};

export const agentStatusConfig: Record<string, { color: string; label: string }> = {
    running: { color: '#10b981', label: 'Working' },
    completed: { color: '#a1a1aa', label: 'Idle' },
    blocked: { color: '#ef4444', label: 'Blocked' },
    failed: { color: '#ef4444', label: 'Failed' },
    idle: { color: '#a1a1aa', label: 'Idle' },
};

export const projectTypeConfig: Record<string, { color: string; bg: string }> = {
    'ai-influencer': { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    saas: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    platform: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
};
