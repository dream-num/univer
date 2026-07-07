import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

interface IWorkspacePackage {
    dir: string;
    name: string;
    testFiles: number;
}

const workspaceRoots = [
    'common',
    'examples',
    'mockdata',
    'presets',
    'presets/packages',
    'packages',
    'tests',
];

function parseArgs() {
    const args = new Map<string, string | boolean>();

    for (const arg of process.argv.slice(2)) {
        if (arg.startsWith('--') && arg.includes('=')) {
            const [key, value] = arg.slice(2).split(/=(.*)/s);
            args.set(key, value);
        } else if (arg.startsWith('--')) {
            args.set(arg.slice(2), true);
        }
    }

    const shardIndex = Number(args.get('shard-index') ?? process.env.COVERAGE_SHARD_INDEX ?? 1);
    const shardTotal = Number(args.get('shard-total') ?? process.env.COVERAGE_SHARD_TOTAL ?? 1);
    const concurrency = String(args.get('concurrency') ?? process.env.COVERAGE_TURBO_CONCURRENCY ?? 2);

    if (!Number.isInteger(shardIndex) || !Number.isInteger(shardTotal) || shardIndex < 1 || shardTotal < 1 || shardIndex > shardTotal) {
        throw new Error(`Invalid shard arguments: shard-index=${shardIndex}, shard-total=${shardTotal}`);
    }

    return {
        shardIndex,
        shardTotal,
        concurrency,
        dryRun: args.has('dry-run'),
        listOnly: args.has('list-only'),
    };
}

function readPackageJson(dir: string) {
    try {
        return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    } catch {
        return null;
    }
}

function listPackageDirs(root: string) {
    const packageDirs: string[] = [];

    for (const workspaceRoot of workspaceRoots) {
        let rootStat;
        try {
            rootStat = statSync(workspaceRoot);
        } catch {
            continue;
        }

        if (!rootStat.isDirectory()) {
            continue;
        }

        const rootPackageJson = readPackageJson(workspaceRoot);
        if (rootPackageJson) {
            packageDirs.push(workspaceRoot);
        }

        for (const entry of readdirSync(workspaceRoot)) {
            const dir = join(workspaceRoot, entry);
            try {
                if (statSync(dir).isDirectory() && readPackageJson(dir)) {
                    packageDirs.push(dir);
                }
            } catch {
                // Ignore entries that disappear or cannot be read.
            }
        }
    }

    return [...new Set(packageDirs)].map((dir) => relative(root, dir) || '.').sort();
}

function countTestFiles(dir: string) {
    let count = 0;

    function walk(currentDir: string) {
        for (const entry of readdirSync(currentDir)) {
            if (entry === 'node_modules' || entry === 'coverage' || entry === 'dist' || entry === 'lib') {
                continue;
            }

            const fullPath = join(currentDir, entry);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (/[.-](spec|test)\.[cm]?[jt]sx?$/.test(entry)) {
                count += 1;
            }
        }
    }

    walk(dir);
    return count;
}

function getCoveragePackages() {
    const root = process.cwd();

    return listPackageDirs(root)
        .map((dir): IWorkspacePackage | null => {
            const packageJson = readPackageJson(dir);
            if (!packageJson?.scripts?.coverage || !packageJson.name) {
                return null;
            }

            return {
                dir,
                name: packageJson.name,
                testFiles: countTestFiles(dir),
            };
        })
        .filter((pkg): pkg is IWorkspacePackage => pkg !== null)
        .sort((a, b) => a.name.localeCompare(b.name));
}

function assignShards(packages: IWorkspacePackage[], shardTotal: number) {
    const shards = Array.from({ length: shardTotal }, () => ({
        weight: 0,
        packages: [] as IWorkspacePackage[],
    }));

    for (const pkg of [...packages].sort((a, b) => b.testFiles - a.testFiles || a.name.localeCompare(b.name))) {
        const target = shards.reduce((lowest, shard, index) => {
            if (shard.weight < shards[lowest].weight) {
                return index;
            }

            return lowest;
        }, 0);

        shards[target].packages.push(pkg);
        shards[target].weight += Math.max(pkg.testFiles, 1);
    }

    return shards.map((shard) => ({
        ...shard,
        packages: shard.packages.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

const { shardIndex, shardTotal, concurrency, dryRun, listOnly } = parseArgs();
const packages = getCoveragePackages();
const totalTestFiles = packages.reduce((total, pkg) => total + pkg.testFiles, 0);
const heavyPackageThreshold = Math.ceil(totalTestFiles / shardTotal);
const heavyPackages = packages.filter((pkg) => pkg.testFiles > heavyPackageThreshold);
const regularPackages = packages.filter((pkg) => !heavyPackages.includes(pkg));
const shards = assignShards(regularPackages, shardTotal);
const selected = shards[shardIndex - 1].packages;

console.log(`Coverage shard ${shardIndex}/${shardTotal}: ${selected.length}/${regularPackages.length} regular packages, ${shards[shardIndex - 1].weight} regular test files`);
for (const pkg of heavyPackages) {
    console.log(`- ${pkg.name} (${pkg.dir}, ${pkg.testFiles} test files, vitest shard ${shardIndex}/${shardTotal})`);
}
for (const pkg of selected) {
    console.log(`- ${pkg.name} (${pkg.dir}, ${pkg.testFiles} test files)`);
}

if (heavyPackages.length === 0 && selected.length === 0) {
    process.exit(0);
}

if (listOnly) {
    process.exit(0);
}

function runPnpm(args: string[]) {
    const result = spawnSync('pnpm', args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

for (const pkg of heavyPackages) {
    const args = [
        '--dir',
        pkg.dir,
        'exec',
        'vitest',
        'run',
        '--coverage',
        `--shard=${shardIndex}/${shardTotal}`,
        '--passWithNoTests',
    ];

    if (dryRun) {
        console.log(`[dry-run] pnpm ${args.join(' ')}`);
    } else {
        runPnpm(args);
    }
}

if (selected.length > 0) {
    runPnpm([
        'turbo',
        `--concurrency=${concurrency}`,
        'coverage',
        ...selected.map((pkg) => `--filter=${pkg.name}`),
        ...(dryRun ? ['--dry=json'] : []),
        '--',
        '--passWithNoTests',
    ]);
}

process.exit(0);
