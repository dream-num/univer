import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { brotliCompressSync, gzipSync } from 'node:zlib';

type OutputBucketKey = 'cjs' | 'es' | 'types' | 'umd';

interface IPackageJson {
    name: string;
}

interface IFileSizeSummary {
    brotliBytes: number;
    bucket: OutputBucketKey;
    gzipBytes: number;
    path: string;
    rawBytes: number;
}

interface IDirectorySizeSummary {
    brotliBytes: number;
    fileCount: number;
    gzipBytes: number;
    largestFile: IFileSizeSummary | null;
    rawBytes: number;
}

interface IWorkspacePackage {
    dir: string;
    packageJson: IPackageJson;
}

interface IPackageSizeEntry {
    built: boolean;
    name: string;
    outputs: Record<OutputBucketKey, IDirectorySizeSummary | null>;
    path: string;
    totals: IDirectorySizeSummary;
}

const ROOT_DIR = process.cwd();
const ARTIFACTS_DIR = path.join(ROOT_DIR, 'artifacts');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const OUTPUT_DIRECTORIES: Record<OutputBucketKey, string> = {
    cjs: path.join('lib', 'cjs'),
    es: path.join('lib', 'es'),
    types: path.join('lib', 'types'),
    umd: path.join('lib', 'umd'),
};

function createEmptySummary(): IDirectorySizeSummary {
    return {
        brotliBytes: 0,
        fileCount: 0,
        gzipBytes: 0,
        largestFile: null,
        rawBytes: 0,
    };
}

function measureFile(filePath: string, bucket: OutputBucketKey): IFileSizeSummary {
    const fileBuffer = fs.readFileSync(filePath);

    return {
        brotliBytes: brotliCompressSync(fileBuffer).byteLength,
        bucket,
        gzipBytes: gzipSync(fileBuffer).byteLength,
        path: path.relative(ROOT_DIR, filePath),
        rawBytes: fileBuffer.byteLength,
    };
}

function summarizeFiles(files: IFileSizeSummary[]): IDirectorySizeSummary {
    const summary = createEmptySummary();

    for (const file of files) {
        summary.fileCount += 1;
        summary.rawBytes += file.rawBytes;
        summary.gzipBytes += file.gzipBytes;
        summary.brotliBytes += file.brotliBytes;

        if (!summary.largestFile || file.rawBytes > summary.largestFile.rawBytes) {
            summary.largestFile = file;
        }
    }

    return summary;
}

function summarizeDirectoryTotals(summaries: IDirectorySizeSummary[]): IDirectorySizeSummary {
    const merged = createEmptySummary();

    for (const summary of summaries) {
        merged.fileCount += summary.fileCount;
        merged.rawBytes += summary.rawBytes;
        merged.gzipBytes += summary.gzipBytes;
        merged.brotliBytes += summary.brotliBytes;

        if (!merged.largestFile || (summary.largestFile && summary.largestFile.rawBytes > merged.largestFile.rawBytes)) {
            merged.largestFile = summary.largestFile;
        }
    }

    return merged;
}

function listFiles(targetDir: string, bucket: OutputBucketKey): IFileSizeSummary[] {
    if (!fs.existsSync(targetDir)) {
        return [];
    }

    const files: IFileSizeSummary[] = [];

    function walk(currentDir: string) {
        for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
            const entryPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                walk(entryPath);
                continue;
            }

            files.push(measureFile(entryPath, bucket));
        }
    }

    walk(targetDir);
    return files;
}

function readWorkspacePackages(): IWorkspacePackage[] {
    if (!fs.existsSync(PACKAGES_DIR)) {
        return [];
    }

    return fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(PACKAGES_DIR, entry.name))
        .map((dir) => {
            const packageJsonPath = path.join(dir, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                return null;
            }

            return {
                dir,
                packageJson: JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as IPackageJson,
            };
        })
        .filter((pkg): pkg is IWorkspacePackage => Boolean(pkg))
        .sort((left, right) => left.packageJson.name.localeCompare(right.packageJson.name));
}

function analyzePackage(pkg: IWorkspacePackage): IPackageSizeEntry {
    const outputFiles = Object.fromEntries(
        Object.entries(OUTPUT_DIRECTORIES).map(([bucket, relativeDir]) => {
            return [bucket, listFiles(path.join(pkg.dir, relativeDir), bucket as OutputBucketKey)];
        })
    ) as Record<OutputBucketKey, IFileSizeSummary[]>;
    const outputs = Object.fromEntries(
        Object.entries(outputFiles).map(([bucket, files]) => {
            return [bucket, files.length > 0 ? summarizeFiles(files) : null];
        })
    ) as Record<OutputBucketKey, IDirectorySizeSummary | null>;
    const files = Object.values(outputFiles).flat();

    return {
        built: files.length > 0,
        name: pkg.packageJson.name,
        outputs,
        path: path.relative(ROOT_DIR, pkg.dir),
        totals: summarizeFiles(files),
    };
}

function buildPackageSizesReport(packages: IWorkspacePackage[]) {
    const entries = packages.map(analyzePackage);

    return {
        generatedAt: new Date().toISOString(),
        packages: entries,
        scope: 'packages/*',
        summary: {
            builtPackageCount: entries.filter((entry) => entry.built).length,
            totalPackageCount: entries.length,
            totals: summarizeDirectoryTotals(entries.map((entry) => entry.totals)),
        },
    };
}

function formatBytes(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB'];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function buildVisualizationHtml(report: ReturnType<typeof buildPackageSizesReport>) {
    const rows = [...report.packages].sort((left, right) => right.totals.rawBytes - left.totals.rawBytes);
    const maxBytes = Math.max(...rows.map((row) => row.totals.rawBytes), 1);

    const cards = rows.map((row) => {
        const width = `${(row.totals.rawBytes / maxBytes) * 100}%`;
        const outputs = (Object.entries(row.outputs) as Array<[OutputBucketKey, IDirectorySizeSummary | null]>)
            .filter(([, summary]) => Boolean(summary))
            .map(([bucket, summary]) => {
                return `<span class="chip">${bucket}: ${formatBytes(summary?.rawBytes ?? 0)}</span>`;
            })
            .join('');

        return `
            <article class="card">
                <div class="card-head">
                    <div>
                        <h2>${row.name}</h2>
                        <p>${row.path}</p>
                    </div>
                    <strong>${formatBytes(row.totals.rawBytes)}</strong>
                </div>
                <div class="bar"><span style="width:${width}"></span></div>
                <div class="meta">
                    <span>${row.totals.fileCount} files</span>
                    <span>gzip ${formatBytes(row.totals.gzipBytes)}</span>
                    <span>brotli ${formatBytes(row.totals.brotliBytes)}</span>
                </div>
                <div class="chips">${outputs}</div>
            </article>
        `;
    }).join('');

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Package Sizes</title>
    <style>
        :root {
            --bg: #f4efe7;
            --panel: #fffdf8;
            --ink: #1d1a16;
            --muted: #6f665c;
            --line: #d9d0c4;
            --bar: #0b7a75;
            --bar-soft: #d6ecea;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "IBM Plex Sans", "Helvetica Neue", sans-serif;
            background:
                radial-gradient(circle at top left, #fff8ec 0, transparent 28%),
                linear-gradient(180deg, #efe6d7 0%, var(--bg) 100%);
            color: var(--ink);
        }
        main {
            width: min(1120px, calc(100vw - 32px));
            margin: 0 auto;
            padding: 40px 0 64px;
        }
        h1 {
            margin: 0;
            font-size: clamp(32px, 5vw, 56px);
            line-height: 0.95;
            letter-spacing: -0.04em;
        }
        .intro {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin: 24px 0 32px;
        }
        .stat {
            padding: 16px 18px;
            border: 1px solid var(--line);
            border-radius: 18px;
            background: rgba(255, 253, 248, 0.9);
            backdrop-filter: blur(8px);
        }
        .stat strong {
            display: block;
            font-size: 24px;
            margin-bottom: 4px;
        }
        .stat span {
            color: var(--muted);
            font-size: 13px;
        }
        .grid {
            display: grid;
            gap: 14px;
        }
        .card {
            padding: 18px;
            border: 1px solid var(--line);
            border-radius: 20px;
            background: var(--panel);
            box-shadow: 0 12px 30px rgba(29, 26, 22, 0.06);
        }
        .card-head {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: baseline;
        }
        .card-head h2 {
            margin: 0;
            font-size: 20px;
            letter-spacing: -0.03em;
        }
        .card-head p {
            margin: 6px 0 0;
            color: var(--muted);
            font-size: 13px;
        }
        .bar {
            height: 12px;
            margin: 14px 0 12px;
            background: var(--bar-soft);
            border-radius: 999px;
            overflow: hidden;
        }
        .bar span {
            display: block;
            height: 100%;
            background: linear-gradient(90deg, var(--bar), #16a394);
            border-radius: inherit;
        }
        .meta, .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 10px;
        }
        .meta {
            color: var(--muted);
            font-size: 13px;
            margin-bottom: 10px;
        }
        .chip {
            padding: 6px 10px;
            border-radius: 999px;
            background: #f2ebe0;
            color: #463d35;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <main>
        <h1>Package Size Report</h1>
        <section class="intro">
            <div class="stat">
                <strong>${report.summary.totalPackageCount}</strong>
                <span>packages in scope</span>
            </div>
            <div class="stat">
                <strong>${report.summary.builtPackageCount}</strong>
                <span>packages with build output</span>
            </div>
            <div class="stat">
                <strong>${report.generatedAt}</strong>
                <span>generated at</span>
            </div>
        </section>
        <section class="grid">
            ${cards}
        </section>
    </main>
</body>
</html>`;
}

function main() {
    const report = buildPackageSizesReport(readWorkspacePackages());

    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'package-sizes.json'), `${JSON.stringify(report, null, 4)}\n`);
    fs.writeFileSync(
        path.join(ARTIFACTS_DIR, 'package-sizes.html'),
        buildVisualizationHtml(report),
        'utf8'
    );

    console.log(`Wrote ${path.relative(ROOT_DIR, path.join(ARTIFACTS_DIR, 'package-sizes.json'))}`);
    console.log(`Wrote ${path.relative(ROOT_DIR, path.join(ARTIFACTS_DIR, 'package-sizes.html'))}`);
}

main();
