#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROUTES_MANIFEST_RELATIVE = 'scripts/lighthouse-routes.json';
const AUTH_PROFILES_RELATIVE = 'scripts/lighthouse-auth-profiles.json';
const BOOTSTRAP_TEMPLATE_RELATIVE = 'scripts/lighthouse-auth-bootstrap.template.html';
const BOOTSTRAP_PUBLIC_RELATIVE = 'public/lighthouse-auth-bootstrap.html';

function getArg(prefix, defaultValue) {
    const hit = process.argv.find((arg) => arg.startsWith(prefix));
    if (!hit) return defaultValue;
    const value = hit.slice(prefix.length);
    return value.length > 0 ? value : defaultValue;
}

function parseBoolean(value, defaultValue = false) {
    if (typeof value !== 'string') return defaultValue;
    return value.trim().toLowerCase() === 'true';
}

function formatRunId(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
        '-',
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
    ].join('');
}

function slug(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function readJsonFile(filePath, label) {
    if (!fs.existsSync(filePath)) {
        console.error(`Missing ${label}: ${filePath}`);
        process.exit(1);
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Invalid JSON in ${label}: ${filePath}`);
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

function loadRoutes(manifestPath) {
    const manifest = readJsonFile(manifestPath, 'routes manifest');
    const publicRoutes = Array.isArray(manifest.public) ? manifest.public : [];
    const protectedRoutes = Array.isArray(manifest.protected) ? manifest.protected : [];

    const invalid = [...publicRoutes, ...protectedRoutes].filter((route) => typeof route !== 'string' || !route.startsWith('/'));
    if (invalid.length > 0) {
        console.error(`Invalid route(s) in manifest: ${invalid.join(', ')}`);
        process.exit(1);
    }

    const allRoutes = [...publicRoutes, ...protectedRoutes];
    const duplicateRoutes = allRoutes.filter((route, index) => allRoutes.indexOf(route) !== index);
    if (duplicateRoutes.length > 0) {
        console.error(`Duplicate route(s) in manifest: ${[...new Set(duplicateRoutes)].join(', ')}`);
        process.exit(1);
    }

    return { publicRoutes, protectedRoutes };
}

function isValidUser(user) {
    if (!user || typeof user !== 'object') return false;
    const requiredKeys = ['user_id', 'email', 'first_name', 'last_name', 'role_type'];
    return requiredKeys.every((key) => typeof user[key] === 'string' && user[key].trim().length > 0);
}

function loadAuthProfile(profilesPath, requestedProfileName) {
    const config = readJsonFile(profilesPath, 'auth profiles');
    const profiles = config && typeof config === 'object' ? config.profiles : null;
    const defaultProfile = typeof config.defaultProfile === 'string' ? config.defaultProfile : null;

    if (!profiles || typeof profiles !== 'object') {
        console.error('Auth profiles file must expose an object under "profiles".');
        process.exit(1);
    }

    const profileName = requestedProfileName || defaultProfile;
    if (!profileName) {
        console.error('No auth profile selected. Provide --auth-profile or set defaultProfile in auth profiles JSON.');
        process.exit(1);
    }

    const profile = profiles[profileName];
    if (!profile) {
        console.error(`Unknown auth profile "${profileName}".`);
        process.exit(1);
    }

    if (!isValidUser(profile.user)) {
        console.error(`Invalid user payload in auth profile "${profileName}".`);
        process.exit(1);
    }

    const tokenPrefix = typeof profile.tokenPrefix === 'string' && profile.tokenPrefix.trim().length > 0
        ? profile.tokenPrefix.trim()
        : 'lighthouse-token';

    return {
        name: profileName,
        user: profile.user,
        tokenPrefix,
    };
}

function ensureBootstrapPage(templatePath, bootstrapPath) {
    if (!fs.existsSync(templatePath)) {
        console.error(`Missing bootstrap template: ${templatePath}`);
        process.exit(1);
    }

    const template = fs.readFileSync(templatePath, 'utf8');
    fs.mkdirSync(path.dirname(bootstrapPath), { recursive: true });
    fs.writeFileSync(bootstrapPath, template, 'utf8');

    return () => {
        try {
            if (fs.existsSync(bootstrapPath)) {
                fs.unlinkSync(bootstrapPath);
            }
        } catch (error) {
            console.warn(`Warning: failed to cleanup temporary bootstrap page (${bootstrapPath}).`);
            console.warn(error instanceof Error ? error.message : String(error));
        }
    };
}

const dryRun = process.argv.includes('--dry-run');
const baseUrl = getArg('--base-url=', 'http://localhost:5173');
const chromeFlags = getArg('--chrome-flags=', '--headless=new --disable-gpu --no-sandbox');
const onlyRoutesArg = getArg('--only-routes=', process.env.A11Y_ONLY_ROUTES ?? '');
const uiHighContrast = parseBoolean(getArg('--ui-high-contrast=', process.env.A11Y_UI_HIGH_CONTRAST ?? 'false'));
const uiTheme = getArg('--ui-theme=', process.env.A11Y_UI_THEME ?? 'light') === 'dark' ? 'dark' : 'light';
const auditSessionTtlSec = Number.parseInt(getArg('--auth-ttl-sec=', process.env.A11Y_AUTH_TTL_SEC ?? '900'), 10);
const routesManifestPath = path.resolve(process.cwd(), getArg('--routes-manifest=', ROUTES_MANIFEST_RELATIVE));
const authProfilesPath = path.resolve(process.cwd(), getArg('--auth-profiles-file=', AUTH_PROFILES_RELATIVE));
const requestedAuthProfile = getArg('--auth-profile=', process.env.A11Y_AUTH_PROFILE ?? '');
const outRootDir = path.resolve(process.cwd(), getArg('--out-dir=', '../lighthouse/a11y-batch-reports'));
const runId = slug(getArg('--run-id=', process.env.A11Y_RUN_ID ?? formatRunId())) || formatRunId();
const onlyRoutes = new Set(
    onlyRoutesArg
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
);

if (!Number.isFinite(auditSessionTtlSec) || auditSessionTtlSec <= 0) {
    console.error(`Invalid --auth-ttl-sec value: ${auditSessionTtlSec}`);
    process.exit(1);
}

const { publicRoutes, protectedRoutes } = loadRoutes(routesManifestPath);
const authProfile = loadAuthProfile(authProfilesPath, requestedAuthProfile);
const profileLabel = `${uiTheme}-${uiHighContrast ? 'hc' : 'normal'}-${authProfile.name}`;
const outDir = path.join(outRootDir, `${runId}_${slug(profileLabel)}`);

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(outRootDir, { recursive: true });

const bootstrapTemplatePath = path.resolve(process.cwd(), BOOTSTRAP_TEMPLATE_RELATIVE);
const bootstrapPath = path.resolve(process.cwd(), BOOTSTRAP_PUBLIC_RELATIVE);
const cleanupBootstrap = ensureBootstrapPage(bootstrapTemplatePath, bootstrapPath);

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
        cwd: outDir,
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

    function sanitizeUrl(rawUrl) {
        if (typeof rawUrl !== 'string' || rawUrl.length === 0) return rawUrl;
        try {
            const parsed = new URL(rawUrl);
            parsed.searchParams.delete('authState');
            parsed.searchParams.delete('expiresAt');
            return parsed.toString();
        } catch {
            return rawUrl;
        }
    }

    return {
        requestedUrl: sanitizeUrl(report.requestedUrl),
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
    const expiresAt = new Date(Date.now() + auditSessionTtlSec * 1000).toISOString();
    const authStatePayload = {
        user: authProfile.user,
        token: `${authProfile.tokenPrefix}-${Date.now()}`,
        expiresAt,
    };
    const authState = encodeURIComponent(JSON.stringify(authStatePayload));

    return `${baseUrl}/lighthouse-auth-bootstrap.html?target=${target}&auth=${auth}&highContrast=${highContrast}&theme=${uiTheme}&authState=${authState}&expiresAt=${encodeURIComponent(expiresAt)}`;
}

const allRuns = [
    ...publicRoutes.map((route) => ({ route, mode: 'public' })),
    ...protectedRoutes.map((route) => ({ route, mode: 'auth' })),
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

try {
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
            reportFile: path.relative(process.cwd(), outputFile).replaceAll('\\', '/'),
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
            `- Auth profile: ${authProfile.name}`,
            `- Auth session TTL (s): ${auditSessionTtlSec}`,
            `- Run ID: ${runId}`,
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

        const latestDir = path.join(outRootDir, 'latest');
        fs.rmSync(latestDir, { recursive: true, force: true });
        fs.mkdirSync(latestDir, { recursive: true });
        fs.copyFileSync(summaryJsonPath, path.join(latestDir, 'summary.json'));
        fs.copyFileSync(summaryMdPath, path.join(latestDir, 'summary.md'));

        const latestMetadataPath = path.join(outRootDir, 'latest.json');
        fs.writeFileSync(latestMetadataPath, `${JSON.stringify({
            runDir: path.relative(process.cwd(), outDir).replaceAll('\\', '/'),
            summaryJson: path.relative(process.cwd(), summaryJsonPath).replaceAll('\\', '/'),
            summaryMd: path.relative(process.cwd(), summaryMdPath).replaceAll('\\', '/'),
            generatedAt: new Date().toISOString(),
            authProfile: authProfile.name,
            uiTheme,
            uiHighContrast,
            runId,
        }, null, 2)}\n`, 'utf8');

        console.log('\nBatch completed.');
        console.log(`- Run directory: ${path.relative(process.cwd(), outDir)}`);
        console.log(`- JSON summary: ${path.relative(process.cwd(), summaryJsonPath)}`);
        console.log(`- Markdown summary: ${path.relative(process.cwd(), summaryMdPath)}`);
        console.log(`- Latest pointer: ${path.relative(process.cwd(), latestMetadataPath)}`);
    }
} finally {
    cleanupBootstrap();
}
