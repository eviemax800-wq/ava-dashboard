'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { motion } from 'framer-motion';
import { FolderKanban, Plus } from 'lucide-react';
import { AddProjectModal } from '@/components/dashboard/AddProjectModal';

export default function ProjectsPage() {
    const supabase = createClient();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchProjects = useCallback(async () => {
        const { data } = await supabase
            .from('projects')
            .select('*')
            .order('last_activity', { ascending: false, nullsFirst: false });

        setProjects(data || []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchProjects();

        const channel = supabase
            .channel('projects-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects' },
                fetchProjects
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchProjects]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="shimmer h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-64 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Projects Portfolio
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Track project health, progress, and milestones
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors self-start"
                >
                    <Plus size={16} />
                    Add Project
                </button>
            </div>

            {projects.length === 0 ? (
                <motion.div
                    className="glass rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <FolderKanban size={40} className="text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400 mb-2">
                        No Projects Yet
                    </h3>
                    <p className="text-sm text-zinc-500 mb-4">
                        Add a project to start tracking its health and progress.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Create First Project
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <ProjectCard project={project} />
                        </motion.div>
                    ))}
                </div>
            )}

            <AddProjectModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />
        </div>
    );
}
