import { NextResponse } from 'next/server';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';

const MEMORY_DIR = '/Users/evie/.claude/projects/-Users-evie--openclaw-workspace/memory';
const WORKSPACE = '/Users/evie/.openclaw/workspace';

const MEMORY_FILES = [
    { key: 'soul', path: join(WORKSPACE, 'SOUL.md'), label: 'Soul', description: 'Identity, mission, vision' },
    { key: 'index', path: join(MEMORY_DIR, 'MEMORY.md'), label: 'Memory Index', description: 'Auto-loaded every session' },
    { key: 'products', path: join(MEMORY_DIR, 'products.md'), label: 'Products', description: 'All products, portfolios, blockers' },
    { key: 'strategy', path: join(MEMORY_DIR, 'strategy.md'), label: 'Strategy', description: 'Active strategy doc index' },
    { key: 'architecture', path: join(MEMORY_DIR, 'architecture.md'), label: 'Architecture', description: 'Stack, credentials, tools' },
    { key: 'marketing', path: join(MEMORY_DIR, 'marketing.md'), label: 'Marketing', description: 'Channels, campaigns, go-to-market' },
    { key: 'personas', path: join(MEMORY_DIR, 'personas.md'), label: 'Personas', description: 'Margot, Luna, Maya DM automation' },
    { key: 'market-research', path: join(MEMORY_DIR, 'market-research.md'), label: 'Market Research', description: 'Competitors, pricing, projections' },
    { key: 'debugging', path: join(MEMORY_DIR, 'debugging.md'), label: 'Debugging', description: 'Mistakes, gotchas, known issues' },
];

export async function GET() {
    const files = MEMORY_FILES.map((file) => {
        try {
            const content = readFileSync(file.path, 'utf-8');
            const stats = statSync(file.path);
            const lines = content.split('\n').length;

            return {
                key: file.key,
                label: file.label,
                description: file.description,
                content,
                lines,
                sizeBytes: stats.size,
                lastModified: stats.mtime.toISOString(),
            };
        } catch {
            return {
                key: file.key,
                label: file.label,
                description: file.description,
                content: '(file not found)',
                lines: 0,
                sizeBytes: 0,
                lastModified: null,
            };
        }
    });

    return NextResponse.json({ files });
}
