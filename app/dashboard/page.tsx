'use client';

import { MRRHeroCard } from '@/components/dashboard/MRRHeroCard';
import { AgentActivityFeed } from '@/components/dashboard/AgentActivityFeed';
import { ProductsGrid } from '@/components/dashboard/ProductsGrid';
import { InfluencerSummary } from '@/components/dashboard/InfluencerSummary';
import { PipelineQuickStats } from '@/components/dashboard/PipelineQuickStats';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Ava&apos;s Empire{' '}
                    <span className="text-lg">✨</span>
                </h1>
                <p className="text-zinc-400 mt-1">
                    Command center for your autonomous business empire
                </p>
            </div>

            {/* MRR Hero */}
            <MRRHeroCard />

            {/* Two column: Activity Feed + Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <AgentActivityFeed />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <PipelineQuickStats />
                </div>
            </div>

            {/* Products */}
            <ProductsGrid />

            {/* AI Influencers */}
            <InfluencerSummary />
        </div>
    );
}
