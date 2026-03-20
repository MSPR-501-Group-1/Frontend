#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PUBLIC_ROUTES = ['/login', '/403'];
const PROTECTED_ROUTES = [
    '/',
    '/data/pipeline',
    '/data/quality',
    '/data/anomalies',
    '/data/validation',
    '/analytics/nutrition',
    '/analytics/fitness',
    '/analytics/biometric',
    '/analytics/business',
    '/partners',
    '/admin/users',
    '/admin/audit',
    '/admin/config',
];

function getArg(prefix, defaultValue) {
    const hit = process.argv.find((arg) => arg.startsWith(prefix));
    if (!hit) return defaultValue;
    const value = hit.slice(prefix.length);
    return value.length > 0 ? value : defaultValue;
}

const dryRun = process.argv.includes('--dry-run');
const baseUrl = getArg('--base-url=', 'http://localhost:5173');
const chromeFlags = getArg('--chrome-flags=', '--headless=new --disable-gpu --no-sandbox');
const onlyRoutesArg = getArg('--only-routes=', process.env.A11Y_ONLY_ROUTES ?? '');
const uiHighContrast = getArg('--ui-high-contrast=', process.env.A11Y_UI_HIGH_CONTRAST ?? 'false') === 'true';
const uiTheme = getArg('--ui-theme=', process.env.A11Y_UI_THEME ?? 'light') === 'dark' ? 'dark' : 'light';
const outDir = path.resolve(process.cwd(), getArg('--out-dir=', '../documentation/lighthouse/batch'));
const onlyRoutes = new Set(
    onlyRoutesArg
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
);

const bootstrapPath = path.resolve(process.cwd(), 'public/lighthouse-auth-bootstrap.html');
if (!fs.existsSync(bootstrapPath)) {
    console.error('Missing bootstrap page:', bootstrapPath);
    process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

function npxBin() {
    return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function runLighthouse(url, outFile) {
    const urlArg = process.platform === 'win32' ? `"${url}"` : url;
    const args = [
        '-y',
        'lighthouse',
        urlArg,
        '--only-categories=accessibility',
        '--output=json',
        `--output-path=${outFile}`,
        `--chrome-flags=${chromeFlags}`,
    ];

    if (dryRun) {
        console.log(`[dry-run] ${npxBin()} ${args.join(' ')}`);
        return;
    }

    const result = spawnSync(npxBin(), args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
    if (result.error) {
        throw new Error(`Lighthouse process error for ${url}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        throw new Error(`Lighthouse failed for ${url} (exit ${result.status ?? 'unknown'})`);
    }
}

function safeName(route) {
    const cleaned = route.trim().replace(/^\//, '').replaceAll('/', '_');
    return cleaned.length > 0 ? cleaned : 'root';
}

function parseReport(outFile) {
    const raw = fs.readFileSync(outFile, 'utf8');
    const report = JSON.parse(raw);
    const failedAudits = Object.entries(report.audits ?? {})
        .filter(([, value]) => value && value.score === 0)
        .map(([id]) => id);

    return {
        requestedUrl: report.requestedUrl,
        finalDisplayedUrl: report.finalDisplayedUrl,
        score: report.categories?.accessibility?.score ?? null,
        failedCount: failedAudits.length,
        failedAudits,
    };
}

function routeToUrl(route, mode) {
    const target = encodeURIComponent(route);
    const auth = mode === 'auth' ? '1' : '0';
    const highContrast = uiHighContrast ? '1' : '0';
    return `${baseUrl}/lighthouse-auth-bootstrap.html?target=${target}&auth=${auth}&highContrast=${highContrast}&theme=${uiTheme}`;
}

const allRuns = [
    ...PUBLIC_ROUTES.map((route) => ({ route, mode: 'public' })),
    ...PROTECTED_ROUTES.map((route) => ({ route, mode: 'auth' })),
];

const runsToExecute = onlyRoutes.size > 0
    ? allRuns.filter((run) => onlyRoutes.has(run.route))
    : allRuns;

if (onlyRoutes.size > 0) {
    const unknownRoutes = [...onlyRoutes].filter((route) => !allRuns.some((run) => run.route === route));
    if (unknownRoutes.length > 0) {
        console.error(`Unknown route(s) in --only-routes: ${unknownRoutes.join(', ')}`);
        process.exit(1);
    }
}

const summary = [];

for (const run of runsToExecute) {
    const outputFile = path.join(outDir, `${run.mode}_${safeName(run.route)}.json`);
    const url = routeToUrl(run.route, run.mode);

    console.log(`\n==> Auditing ${run.mode.toUpperCase()} ${run.route}`);
    runLighthouse(url, outputFile);

    if (dryRun) continue;

    const parsed = parseReport(outputFile);
    summary.push({
        route: run.route,
        mode: run.mode,
        reportFile: path.relative(process.cwd(), outputFile).replaceAll('\\\\', '/'),
        requestedUrl: parsed.requestedUrl,
        finalDisplayedUrl: parsed.finalDisplayedUrl,
        score: parsed.score,
        failedCount: parsed.failedCount,
        failedAudits: parsed.failedAudits,
    });
}

if (!dryRun) {
    const summaryJsonPath = path.join(outDir, 'summary.json');
    fs.writeFileSync(summaryJsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

    const markdownLines = [
        '# Lighthouse Accessibility Batch Summary',
        '',
        `- Generated at: ${new Date().toISOString()}`,
        `- Base URL: ${baseUrl}`,
        `- Chrome flags: ${chromeFlags}`,
        `- UI theme: ${uiTheme}`,
        `- UI high contrast: ${uiHighContrast}`,
        '',
        '| Mode | Route | Score | Failed Audits |',
        '|---|---|---:|---|',
        ...summary.map((row) => {
            const failed = row.failedAudits.length ? row.failedAudits.join(', ') : 'none';
            return `| ${row.mode} | ${row.route} | ${row.score} | ${failed} |`;
        }),
        '',
    ];

    const summaryMdPath = path.join(outDir, 'summary.md');
    fs.writeFileSync(summaryMdPath, markdownLines.join('\n'), 'utf8');

    console.log('\nBatch completed.');
    console.log(`- JSON summary: ${path.relative(process.cwd(), summaryJsonPath)}`);
    console.log(`- Markdown summary: ${path.relative(process.cwd(), summaryMdPath)}`);
}
