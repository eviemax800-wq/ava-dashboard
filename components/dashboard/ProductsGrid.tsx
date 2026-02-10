'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    status: string;
    health: number;
    progress: number;
    mrr: number;
    type: string;
    is_product: boolean;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    planning: { bg: 'rgba(161,161,170,0.15)', text: '#a1a1aa', label: 'Planning' },
    'in-progress': { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', label: 'Building' },
    building: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', label: 'Building' },
    deployed: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Deployed' },
    live: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', label: 'Live' },
    active: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', label: 'Active' },
    'on-hold': { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'On Hold' },
    paused: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Paused' },
};

const productIcons: Record<string, string> = {
    InvoiceFlow: '📄',
    WealthStack: '🏠',
    'Persona Studio': '🎨',
    ReviewFlow: '⭐',
    DealFlow: '💼',
    TrustKit: '🛡️',
};

export function ProductsGrid() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('is_product', true)
                .order('name');

            if (data) {
                setProducts(data as Product[]);
            }
            setLoading(false);
        }
        fetchProducts();
    }, [supabase]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <motion.div
                className="glass rounded-xl p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Package size={18} className="text-blue-400" />
                    <h2 className="text-lg font-semibold">Products</h2>
                </div>
                <div className="text-center py-8 text-zinc-500 text-sm">
                    No products tracked yet
                </div>
            </motion.div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-blue-400" />
                <h2 className="text-lg font-semibold">Products</h2>
                <Link
                    href="/dashboard/projects"
                    className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                    View all <ExternalLink size={10} />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((product, i) => {
                    const status = statusColors[product.status] || statusColors.planning;
                    const icon = productIcons[product.name] || '📦';

                    return (
                        <motion.div
                            key={product.id}
                            className="glass rounded-xl p-5 card-glow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">{icon}</span>
                                    <span className="font-semibold text-sm">{product.name}</span>
                                </div>
                                <span
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: status.bg,
                                        color: status.text,
                                    }}
                                >
                                    {status.label}
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-bold tracking-tight">
                                    ${(product.mrr || 0).toLocaleString()}
                                </span>
                                <span className="text-[10px] text-zinc-500">MRR</span>
                            </div>
                            {/* Health bar */}
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-zinc-500">Health</span>
                                    <span className="text-[10px] text-zinc-400">{product.health || 0}%</span>
                                </div>
                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{
                                            background:
                                                (product.health || 0) > 70
                                                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                    : (product.health || 0) > 40
                                                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${product.health || 0}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
