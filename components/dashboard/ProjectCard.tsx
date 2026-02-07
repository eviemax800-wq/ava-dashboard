'use client';

import { motion } from 'framer-motion';
import { FolderKanban, ExternalLink } from 'lucide-react';
import { projectTypeConfig } from '@/lib/design-tokens';
import { formatDate } from '@/lib/utils';

interface ProjectData {
    id: string;
    name: string;
    type: string;
    health_score: number;
    progress_percent: number;
    next_milestone?: string;
    milestone_eta?: string;
    last_activity?: string;
    metrics?: Record<string, unknown>;
    created_at: string;
    primary_url?: string | null;
    secondary_url?: string | null;
    primary_url_label?: string | null;
    secondary_url_label?: string | null;
    status?: string | null;
}

interface ProjectCardProps {
    project: ProjectData;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const typeCfg = projectTypeConfig[project.type] || projectTypeConfig.platform;

    const healthColor =
        project.health_score >= 80
            ? '#10b981'
            : project.health_score >= 50
                ? '#f59e0b'
                : '#ef4444';

    return (
        <motion.div
            className="glass rounded-xl p-6 card-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
                <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: typeCfg.bg }}
                >
                    <FolderKanban size={22} style={{ color: typeCfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                    <span
                        className="inline-block text-[10px] px-1.5 py-0.5 rounded font-medium mt-1 uppercase tracking-wider"
                        style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}
                    >
                        {project.type}
                    </span>
                </div>
            </div>

            {/* Health & Progress */}
            <div className="space-y-3 mb-5">
                <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">Health</span>
                        <span className="font-medium" style={{ color: healthColor }}>
                            {project.health_score}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: healthColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${project.health_score}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">Progress</span>
                        <span className="font-medium text-zinc-300">
                            {project.progress_percent}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress_percent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        />
                    </div>
                </div>
            </div>

            {/* Next milestone */}
            {project.next_milestone && (
                <div className="mb-4">
                    <p className="text-xs text-zinc-500 mb-1">Next Milestone</p>
                    <p className="text-sm font-medium text-zinc-200">
                        {project.next_milestone}
                    </p>
                    {project.milestone_eta && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Due: {formatDate(project.milestone_eta)}
                        </p>
                    )}
                </div>
            )}

            {/* Metrics */}
            {project.metrics && Object.keys(project.metrics).length > 0 && (
                <div className="pt-3 border-t border-white/5">
                    <p className="text-xs text-zinc-500 mb-2">Metrics</p>
                    <ul className="space-y-1">
                        {Object.entries(project.metrics)
                            .slice(0, 4)
                            .map(([key, value]) => (
                                <li
                                    key={key}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <span className="text-zinc-500">{key}</span>
                                    <span className="text-zinc-300 font-medium">
                                        {String(value)}
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {/* Link Buttons */}
            {(project.primary_url || project.secondary_url) && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                    {project.primary_url && (
                        <a
                            href={project.primary_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            {project.primary_url_label || 'Visit'}
                        </a>
                    )}
                    {project.secondary_url && (
                        <a
                            href={project.secondary_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg text-violet-400 text-sm font-medium transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            {project.secondary_url_label || 'View'}
                        </a>
                    )}
                </div>
            )}
        </motion.div>
    );
}
