#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROUTES_MANIFEST_RELATIVE = 'scripts/lighthouse-routes.json';
const REDACTED = '[REDACTED]';

function hasFlag(flag) {
    return process.argv.includes(flag);
}

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

function withFallbackRole(user, fallbackRole) {
    if (!user || typeof user !== 'object') return user;
    const hasIdentity = ['user_id', 'email', 'first_name', 'last_name']
        .every((key) => typeof user[key] === 'string' && user[key].trim().length > 0);
    const hasRole = typeof user.role_type === 'string' && user.role_type.trim().length > 0;

    if (!hasIdentity || hasRole || typeof fallbackRole !== 'string' || fallbackRole.trim().length === 0) {
        return user;
    }

    return {
        ...user,
        role_type: fallbackRole.trim().toUpperCase(),
    };
}

function redactValue(value) {
    if (value == null) return value;
    if (Array.isArray(value)) return value.map((item) => redactValue(item));

    if (typeof value === 'object') {
        const out = {};
        const sensitiveKey = /token|authorization|password|secret|jwt|cookie/i;
        for (const [key, item] of Object.entries(value)) {
            if (sensitiveKey.test(key)) {
                out[key] = REDACTED;
            } else {
                out[key] = redactValue(item);
            }
        }
        return out;
    }

    if (typeof value === 'string') {
        const looksLikeJwt = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value);
        return looksLikeJwt ? REDACTED : value;
    }

    return value;
}

function sanitizeUrl(rawUrl) {
    if (typeof rawUrl !== 'string' || rawUrl.length === 0) return rawUrl;
    try {
        const parsed = new URL(rawUrl);
        const sensitiveParams = [
            'cfg',
            'authstate',
            'expiresat',
            'token',
            'access_token',
            'auth-token',
            'jwt',
            'password',
            'email',
        ];
        for (const param of sensitiveParams) {
            parsed.searchParams.delete(param);
        }
        return parsed.toString();
    } catch {
        return rawUrl;
    }
}

function parseUserJson(userJson) {
    if (!userJson) return null;
    try {
        const parsed = JSON.parse(userJson);
        return parsed;
    } catch (error) {
        throw new Error(`Invalid --auth-user-json payload: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function parseUserFile(userFileArg) {
    if (!userFileArg) return null;
    const userFilePath = path.resolve(process.cwd(), userFileArg);
    const parsed = readJsonFile(userFilePath, 'auth user file');
    return parsed;
}

function resolveApiUrl(baseUrl, maybeRelative) {
    try {
        return new URL(maybeRelative, baseUrl).toString();
    } catch {
        throw new Error(`Invalid URL: ${maybeRelative}`);
    }
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const text = await response.text();
    let body = {};
    if (text.length > 0) {
        try {
            body = JSON.parse(text);
        } catch {
            body = { raw: text };
        }
    }

    if (!response.ok) {
        const message = typeof body?.message === 'string' && body.message.length > 0
            ? body.message
            : `HTTP ${response.status}`;
        throw new Error(`${message} (${url})`);
    }

    return body;
}

function normalizeAuthPayload(payload) {
    const root = payload && typeof payload === 'object' ? payload : {};
    const data = root.data && typeof root.data === 'object' ? root.data : root;
    const user = data.user && typeof data.user === 'object' ? data.user : data;
    const token = typeof data.token === 'string'
        ? data.token
        : (typeof data.access_token === 'string' ? data.access_token : null);

    return { user, token };
}

async function resolveAuthContext({
    authMode,
    baseUrl,
    authToken,
    authUserJson,
    authUserFile,
    authLoginUrl,
    authMeUrl,
    authEmail,
    authPassword,
    authFallbackRole,
    dryRun,
}) {
    const fromUserJson = parseUserJson(authUserJson);
    const fromUserFile = parseUserFile(authUserFile);

    const hasToken = typeof authToken === 'string' && authToken.trim().length > 0;
    const hasLoginCreds = typeof authEmail === 'string' && authEmail.trim().length > 0
        && typeof authPassword === 'string' && authPassword.trim().length > 0;

    let effectiveMode = authMode;
    if (authMode === 'auto') {
        if (hasToken) {
            effectiveMode = 'token';
        } else if (hasLoginCreds) {
            effectiveMode = 'real-login';
        } else {
            effectiveMode = 'none';
        }
    }

    if (effectiveMode === 'none') {
        return { mode: 'none', user: null, token: null };
    }

    if (effectiveMode === 'token') {
        if (!hasToken) {
            throw new Error('auth-mode=token requires --auth-token (or A11Y_AUTH_TOKEN).');
        }

        let user = fromUserJson || fromUserFile;
        if (!user && authMeUrl) {
            if (dryRun) {
                user = {
                    user_id: 'A11Y_DRY_RUN',
                    email: 'dry-run@localhost',
                    first_name: 'Dry',
                    last_name: 'Run',
                    role_type: 'ADMIN',
                };
            } else {
                const meUrl = resolveApiUrl(baseUrl, authMeUrl);
                const meBody = await fetchJson(meUrl, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                const normalized = normalizeAuthPayload(meBody);
                user = normalized.user;
            }
        }

        user = withFallbackRole(user, authFallbackRole);

        if (!isValidUser(user)) {
            throw new Error('Unable to resolve a valid user for auth-mode=token. Provide --auth-user-json or --auth-user-file, or ensure --auth-me-url returns a user object.');
        }

        return {
            mode: 'token',
            user,
            token: authToken,
        };
    }

    if (effectiveMode === 'real-login') {
        if (!hasLoginCreds) {
            throw new Error('auth-mode=real-login requires --auth-email and --auth-password (or env vars).');
        }

        if (dryRun) {
            return {
                mode: 'real-login',
                user: fromUserJson || fromUserFile || {
                    user_id: 'A11Y_DRY_RUN',
                    email: authEmail,
                    first_name: 'Dry',
                    last_name: 'Run',
                    role_type: 'ADMIN',
                },
                token: authToken || 'dry-run-token',
            };
        }

        const loginUrl = resolveApiUrl(baseUrl, authLoginUrl);
        const loginBody = await fetchJson(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ email: authEmail, password: authPassword }),
        });

        const normalized = normalizeAuthPayload(loginBody);
        let user = {
            ...(normalized.user && typeof normalized.user === 'object' ? normalized.user : {}),
            ...(fromUserJson && typeof fromUserJson === 'object' ? fromUserJson : {}),
            ...(fromUserFile && typeof fromUserFile === 'object' ? fromUserFile : {}),
        };
        const token = normalized.token;

        // Some login endpoints return partial user payload (without role_type).
        // In that case, resolve full user from /me using the freshly issued token.
        if (!isValidUser(user) && typeof token === 'string' && token.trim().length > 0 && authMeUrl) {
            const meUrl = resolveApiUrl(baseUrl, authMeUrl);
            const meBody = await fetchJson(meUrl, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const normalizedMe = normalizeAuthPayload(meBody);
            user = {
                ...(normalizedMe.user && typeof normalizedMe.user === 'object' ? normalizedMe.user : {}),
                ...(fromUserJson && typeof fromUserJson === 'object' ? fromUserJson : {}),
                ...(fromUserFile && typeof fromUserFile === 'object' ? fromUserFile : {}),
            };
        }

        user = withFallbackRole(user, authFallbackRole);

        if (!isValidUser(user)) {
            throw new Error('real-login succeeded but returned an invalid user payload.');
        }
        if (typeof token !== 'string' || token.trim().length === 0) {
            throw new Error('real-login succeeded but returned an empty token.');
        }

        return {
            mode: 'real-login',
            user,
            token,
        };
    }

    throw new Error(`Unknown auth mode: ${effectiveMode}`);
}

function npxBin() {
    return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function runLighthouse(url, outFile, chromeFlags, outDir, dryRun) {
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

function extractPathname(rawUrl) {
    if (typeof rawUrl !== 'string' || rawUrl.length === 0) return null;
    try {
        return new URL(rawUrl).pathname;
    } catch {
        return null;
    }
}

function parseReport(outFile) {
    const raw = fs.readFileSync(outFile, 'utf8');
    const report = JSON.parse(raw);
    const failedAudits = Object.entries(report.audits ?? {})
        .filter(([, value]) => value && value.score === 0)
        .map(([id]) => id);

    const requestedUrl = sanitizeUrl(report.requestedUrl);
    const finalDisplayedUrl = sanitizeUrl(report.finalDisplayedUrl);

    return {
        requestedUrl,
        finalDisplayedUrl,
        finalPathname: extractPathname(finalDisplayedUrl),
        score: report.categories?.accessibility?.score ?? null,
        failedCount: failedAudits.length,
        failedAudits,
    };
}

function routeToBootstrapUrl(baseUrl, bootstrapConfig) {
    const encodedCfg = encodeURIComponent(JSON.stringify(bootstrapConfig));
    return `${baseUrl.replace(/\/$/, '')}/lighthouse-auth-bootstrap.html?cfg=${encodedCfg}`;
}

function buildBootstrapConfig({ route, mode, uiTheme, uiHighContrast, authContext }) {
    const useAuth = mode === 'auth' && authContext && authContext.mode !== 'none';

    return {
        target: route,
        ui: {
            themeMode: uiTheme,
            highContrast: uiHighContrast,
        },
        auth: useAuth
            ? {
                enabled: true,
                user: authContext.user,
                token: authContext.token,
            }
            : { enabled: false },
    };
}

async function main() {
    const dryRun = hasFlag('--dry-run');
    const baseUrl = getArg('--base-url=', 'http://localhost:5173');
    const chromeFlags = getArg('--chrome-flags=', '--headless=new --disable-gpu --no-sandbox');
    const onlyRoutesArg = getArg('--only-routes=', process.env.A11Y_ONLY_ROUTES ?? '');
    const uiHighContrast = parseBoolean(getArg('--ui-high-contrast=', process.env.A11Y_UI_HIGH_CONTRAST ?? 'false'));
    const uiTheme = getArg('--ui-theme=', process.env.A11Y_UI_THEME ?? 'light') === 'dark' ? 'dark' : 'light';
    const routesManifestPath = path.resolve(process.cwd(), getArg('--routes-manifest=', ROUTES_MANIFEST_RELATIVE));
    const outRootDir = path.resolve(process.cwd(), getArg('--out-dir=', '../lighthouse/a11y-batch-reports'));
    const runId = slug(getArg('--run-id=', process.env.A11Y_RUN_ID ?? formatRunId())) || formatRunId();

    const authModeArg = getArg('--auth-mode=', process.env.A11Y_AUTH_MODE ?? 'auto').trim().toLowerCase();
    const authMode = ['auto', 'none', 'token', 'real-login'].includes(authModeArg) ? authModeArg : 'auto';
    const authToken = getArg('--auth-token=', process.env.A11Y_AUTH_TOKEN ?? '');
    const authUserJson = getArg('--auth-user-json=', process.env.A11Y_AUTH_USER_JSON ?? '');
    const authUserFile = getArg('--auth-user-file=', process.env.A11Y_AUTH_USER_FILE ?? '');
    const authLoginUrl = getArg('--auth-login-url=', process.env.A11Y_AUTH_LOGIN_URL ?? '/api/auth/login');
    const authMeUrl = getArg('--auth-me-url=', process.env.A11Y_AUTH_ME_URL ?? '/api/auth/me');
    const authEmail = getArg('--auth-email=', process.env.A11Y_AUTH_EMAIL ?? '');
    const authPassword = getArg('--auth-password=', process.env.A11Y_AUTH_PASSWORD ?? '');
    const authFallbackRole = getArg('--auth-fallback-role=', process.env.A11Y_AUTH_FALLBACK_ROLE ?? 'ADMIN');

    const onlyRoutes = new Set(
        onlyRoutesArg
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
    );

    const { publicRoutes, protectedRoutes } = loadRoutes(routesManifestPath);

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

    const hasProtectedRun = runsToExecute.some((run) => run.mode === 'auth');
    const authContext = await resolveAuthContext({
        authMode,
        baseUrl,
        authToken,
        authUserJson,
        authUserFile,
        authLoginUrl,
        authMeUrl,
        authEmail,
        authPassword,
        authFallbackRole,
        dryRun,
    });

    if (hasProtectedRun && authContext.mode === 'none' && !dryRun) {
        console.error('Protected routes were selected but no auth context is available. Configure --auth-mode=token or --auth-mode=real-login.');
        process.exit(1);
    }

    if (hasProtectedRun && authContext.mode === 'none' && dryRun) {
        console.warn('Warning: protected routes are selected without auth context (dry-run continues).');
    }

    const authLabel = authContext.mode;
    const profileLabel = `${uiTheme}-${uiHighContrast ? 'hc' : 'normal'}-${authLabel}`;
    const outDir = path.join(outRootDir, `${runId}_${slug(profileLabel)}`);

    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(outRootDir, { recursive: true });

    const summary = [];

    for (const run of runsToExecute) {
        const outputFile = path.join(outDir, `${run.mode}_${safeName(run.route)}.json`);
        const bootstrapConfig = buildBootstrapConfig({
            route: run.route,
            mode: run.mode,
            uiTheme,
            uiHighContrast,
            authContext,
        });
        const url = routeToBootstrapUrl(baseUrl, bootstrapConfig);

        console.log(`\n==> Auditing ${run.mode.toUpperCase()} ${run.route}`);
        runLighthouse(url, outputFile, chromeFlags, outDir, dryRun);

        if (dryRun) continue;

        const parsed = parseReport(outputFile);
        summary.push({
            route: run.route,
            mode: run.mode,
            reportFile: path.relative(process.cwd(), outputFile).replaceAll('\\', '/'),
            requestedUrl: parsed.requestedUrl,
            finalDisplayedUrl: parsed.finalDisplayedUrl,
            finalPathname: parsed.finalPathname,
            matchedTargetRoute: parsed.finalPathname === run.route,
            score: parsed.score,
            failedCount: parsed.failedCount,
            failedAudits: parsed.failedAudits,
        });
    }

    if (!dryRun) {
        const summaryJsonPath = path.join(outDir, 'summary.json');
        const sanitizedSummary = redactValue(summary);
        fs.writeFileSync(summaryJsonPath, `${JSON.stringify(sanitizedSummary, null, 2)}\n`, 'utf8');

        const markdownLines = [
            '# Lighthouse Accessibility Batch Summary',
            '',
            `- Generated at: ${new Date().toISOString()}`,
            `- Base URL: ${baseUrl}`,
            `- Chrome flags: ${chromeFlags}`,
            `- UI theme: ${uiTheme}`,
            `- UI high contrast: ${uiHighContrast}`,
            `- Auth mode: ${authContext.mode}`,
            `- Run ID: ${runId}`,
            '',
            '| Mode | Route | Final Path | Match Target | Score | Failed Audits |',
            '|---|---|---|---|---:|---|',
            ...summary.map((row) => {
                const failed = row.failedAudits.length ? row.failedAudits.join(', ') : 'none';
                const match = row.matchedTargetRoute ? 'yes' : 'no';
                return `| ${row.mode} | ${row.route} | ${row.finalPathname ?? 'n/a'} | ${match} | ${row.score} | ${failed} |`;
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
        const latestMetadata = {
            runDir: path.relative(process.cwd(), outDir).replaceAll('\\', '/'),
            summaryJson: path.relative(process.cwd(), summaryJsonPath).replaceAll('\\', '/'),
            summaryMd: path.relative(process.cwd(), summaryMdPath).replaceAll('\\', '/'),
            generatedAt: new Date().toISOString(),
            authMode: authContext.mode,
            uiTheme,
            uiHighContrast,
            runId,
        };
        fs.writeFileSync(latestMetadataPath, `${JSON.stringify(redactValue(latestMetadata), null, 2)}\n`, 'utf8');

        console.log('\nBatch completed.');
        console.log(`- Run directory: ${path.relative(process.cwd(), outDir)}`);
        console.log(`- JSON summary: ${path.relative(process.cwd(), summaryJsonPath)}`);
        console.log(`- Markdown summary: ${path.relative(process.cwd(), summaryMdPath)}`);
        console.log(`- Latest pointer: ${path.relative(process.cwd(), latestMetadataPath)}`);
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
