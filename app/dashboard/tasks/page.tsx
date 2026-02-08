'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { TaskDetailPanel } from '@/components/dashboard/TaskDetailPanel';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { statusConfig } from '@/lib/design-tokens';

interface Task {
    id: string;
    name: string;
    description?: string;
    priority: string;
    status: string;
    assigned_to?: string | null;
    blockers?: string[];
    time_estimate?: string;
    created_at: string;
    updated_at?: string;
    completed_at?: string;
    source?: string;
    synced?: boolean;
    modified_by?: string;
    skip_auto_spawn?: boolean;
    context_type?: string;
    retry_count?: number;
}

const columns = [
    { id: 'READY', title: 'Ready' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'BLOCKED', title: 'Blocked' },
    { id: 'COMPLETED', title: 'Completed' },
];

function DroppableColumn({
    id,
    title,
    tasks,
    color,
    onTaskClick,
}: {
    id: string;
    title: string;
    tasks: Task[];
    color: string;
    onTaskClick: (task: Task) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <motion.div
            ref={setNodeRef}
            className={`rounded-xl p-4 min-h-[400px] transition-all duration-200 ${isOver
                ? 'bg-white/[0.04] ring-1 ring-violet-500/30'
                : 'bg-white/[0.02]'
                }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Column header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    <h2 className="font-medium text-sm text-zinc-300">{title}</h2>
                </div>
                <span className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full font-medium">
                    {tasks.length}
                </span>
            </div>

            {/* Tasks */}
            <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                </div>
            </SortableContext>

            {tasks.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-xs text-zinc-600">No tasks</p>
                </div>
            )}
        </motion.div>
    );
}

export default function TasksPage() {
    const supabase = createClient();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const fetchTasks = useCallback(async () => {
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        setTasks((data as Task[]) || []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchTasks();

        const channel = supabase
            .channel('tasks-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                fetchTasks
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchTasks]);

    function handleDragStart(event: DragStartEvent) {
        const taskId = event.active.id as string;
        const task = tasks.find((t) => t.id === taskId);
        // Prevent dragging IN_PROGRESS tasks
        if (task?.status === 'IN_PROGRESS') return;
        setActiveId(taskId);
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as string;
        const overId = over.id as string;

        // Check if dropped on a column
        const targetColumn = columns.find((c) => c.id === overId);
        if (!targetColumn) return;

        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === targetColumn.id) return;

        // Prevent moving IN_PROGRESS tasks
        if (task.status === 'IN_PROGRESS') return;

        // Optimistic update
        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId
                    ? {
                        ...t,
                        status: targetColumn.id,
                        completed_at:
                            targetColumn.id === 'COMPLETED'
                                ? new Date().toISOString()
                                : t.completed_at,
                    }
                    : t
            )
        );

        // Update database with modified_by
        const updatePayload: Record<string, unknown> = {
            status: targetColumn.id,
            updated_at: new Date().toISOString(),
            modified_by: 'human',
            synced: false,
        };
        if (targetColumn.id === 'COMPLETED') {
            updatePayload.completed_at = new Date().toISOString();
        }

        await supabase.from('tasks').update(updatePayload).eq('id', taskId);
    }

    // Filter tasks
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            !search ||
            task.name.toLowerCase().includes(search.toLowerCase()) ||
            task.assigned_to?.toLowerCase().includes(search.toLowerCase());
        const matchesPriority =
            filterPriority === 'all' || task.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });

    const activeTask = activeId
        ? tasks.find((t) => t.id === activeId)
        : null;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="shimmer h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="shimmer h-64 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Task Pipeline</h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Drag tasks between columns to update status • Click to view details
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors self-start"
                >
                    <Plus size={16} />
                    Add Task
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-zinc-500" />
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                        <option value="all">All Priorities</option>
                        <option value="P0">P0 — Critical</option>
                        <option value="P1">P1 — High</option>
                        <option value="P2">P2 — Medium</option>
                        <option value="P3">P3 — Low</option>
                    </select>
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {columns.map((column) => {
                        const columnTasks = filteredTasks.filter(
                            (t) => t.status === column.id
                        );
                        const config = statusConfig[column.id] || statusConfig.READY;

                        return (
                            <DroppableColumn
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                tasks={columnTasks}
                                color={config.color}
                                onTaskClick={setSelectedTask}
                            />
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="opacity-90 rotate-2 scale-105">
                            <TaskCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <AddTaskModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />

            {selectedTask && (
                <TaskDetailPanel
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={fetchTasks}
                />
            )}
        </div>
    );
}
