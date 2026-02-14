import { NextResponse } from 'next/server';
import fs from 'fs';

const SPEND_LOG = '/Users/evie/.openclaw/workspace/memory/spend-log.json';

export async function GET() {
    try {
        if (!fs.existsSync(SPEND_LOG)) {
            return NextResponse.json({
                balance: null,
                used: null,
                dailySpend: 0,
                projectedMonthly: 0,
                entries: [],
                lastChecked: null,
            });
        }

        const data = JSON.parse(fs.readFileSync(SPEND_LOG, 'utf8'));
        const entries = data.entries || [];
        const latest = entries[entries.length - 1] || {};

        // Calculate 7-day average
        const last7 = entries.slice(-7);
        const weeklyAvg = last7.length > 1
            ? last7.reduce((s: number, e: { dailySpend?: number }) => s + (e.dailySpend || 0), 0) / last7.length
            : (latest.dailySpend || 0);
        const projectedMonthly = weeklyAvg * 30;

        // Last 30 entries for chart
        const chartData = entries.slice(-30).map((e: { date: string; dailySpend?: number; balance?: number }) => ({
            date: e.date,
            spend: e.dailySpend || 0,
            balance: e.balance || 0,
        }));

        return NextResponse.json({
            balance: latest.balance ?? data.lastBalance ?? null,
            used: latest.used ?? null,
            dailySpend: latest.dailySpend || 0,
            weeklyAvg,
            projectedMonthly,
            chartData,
            lastChecked: data.lastChecked || null,
        });
    } catch (err) {
        return NextResponse.json(
            { error: 'Failed to read spend log', detail: (err as Error).message },
            { status: 500 }
        );
    }
}
