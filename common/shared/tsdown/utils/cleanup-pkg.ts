/* eslint-disable max-lines-per-function */
import type { IPackageJson } from '../types.ts';
import fs from 'node:fs';
import path from 'node:path';
import sortKeys from 'sort-keys';
import * as ts from 'typescript';
import { peerDepsMap } from '../data/peer-deps.ts';

type StringMap = Record<string, string>;
type PeerDepValue = (typeof peerDepsMap)[keyof typeof peerDepsMap] & { optional?: boolean };
type CleanupPackageJson = IPackageJson & {
    dependencies?: StringMap;
    devDependencies?: StringMap;
    exports?: Record<string, unknown>;
    optionalDependencies?: StringMap;
    peerDependencies?: StringMap;
    publishConfig?: {
        access: string;
        exports: Record<string, unknown>;
        main: string;
        module: string;
    };
};
interface IDerivedDependencyGroups {
    dependencies: StringMap;
    devDependencies: StringMap;
    optionalDependencies: StringMap;
    peerDependencies: StringMap;
}

const SOURCE_EXTS = new Set(['.ts', '.tsx']);
const TEST_FILE_RE = /\.(spec|test)\.[cm]?tsx?$/;
const IMMUTABLE_MANAGED_DEPENDENCIES = new Set(['@univerjs/icons', '@univerjs/icons-svg']);

function filterPackageName(packageName: string): string {
    if (packageName.startsWith('@univerjs/')) {
        return packageName.split('/').slice(0, 2).join('/');
    } else if (packageName.startsWith('@univerjs-pro/')) {
        return packageName.split('/').slice(0, 2).join('/');
    } else {
        return packageName;
    }
}

function isManagedUniverPackage(packageName: string) {
    return packageName.startsWith('@univerjs/') || packageName.startsWith('@univerjs-pro/');
}

function shouldPreserveExistingDependency(packageName: string) {
    return !isManagedUniverPackage(packageName) || IMMUTABLE_MANAGED_DEPENDENCIES.has(packageName);
}

function mergePreservingNonUniver(existing: StringMap | undefined, next: StringMap) {
    const preserved = Object.fromEntries(
        Object.entries(existing ?? {}).filter(([name]) => shouldPreserveExistingDependency(name))
    ) as StringMap;

    return sortKeys({ ...preserved, ...next });
}

function assignDependencyGroup(
    pkg: CleanupPackageJson,
    key: 'dependencies' | 'devDependencies' | 'optionalDependencies',
    next: StringMap
) {
    const merged = mergePreservingNonUniver(pkg[key], next);

    if (Object.keys(merged).length === 0) {
        delete pkg[key];
        return;
    }

    pkg[key] = merged;
}

function isTestSourceFile(filePath: string) {
    const normalized = filePath.split(path.sep).join('/');
    if (normalized.includes('/__tests__/')) {
        return true;
    }

    return TEST_FILE_RE.test(normalized);
}

function parseModuleSpecifiersFromCode(code: string, filePath: string) {
    const runtime = new Set<string>();
    const typeOnly = new Set<string>();
    const kind = path.extname(filePath) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, kind);

    function add(spec: string, isType: boolean) {
        if (!spec || spec.startsWith('\0') || spec.startsWith('.') || spec.startsWith('/')) {
            return;
        }
        (isType ? typeOnly : runtime).add(spec);
    }

    function addFromImportLike(moduleSpecifier: ts.Expression | undefined, isType: boolean) {
        if (moduleSpecifier && ts.isStringLiteralLike(moduleSpecifier)) {
            add(moduleSpecifier.text, isType);
        }
    }

    for (const stmt of sourceFile.statements) {
        if (ts.isImportDeclaration(stmt)) {
            const spec = stmt.moduleSpecifier;
            const clause = stmt.importClause;
            if (!clause) {
                addFromImportLike(spec, false);
                continue;
            }

            if (clause.isTypeOnly) {
                addFromImportLike(spec, true);
                continue;
            }

            let hasValue = Boolean(clause.name);
            if (clause.namedBindings) {
                if (ts.isNamespaceImport(clause.namedBindings)) {
                    hasValue = true;
                } else if (ts.isNamedImports(clause.namedBindings)) {
                    const allTypeOnly = clause.namedBindings.elements.length > 0
                        && clause.namedBindings.elements.every((el) => el.isTypeOnly);
                    const anyValue = clause.namedBindings.elements.some((el) => !el.isTypeOnly);
                    if (anyValue) {
                        hasValue = true;
                    } else if (allTypeOnly && !hasValue) {
                        addFromImportLike(spec, true);
                        continue;
                    }
                }
            }

            addFromImportLike(spec, !hasValue);
            continue;
        }

        if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier) {
            const spec = stmt.moduleSpecifier;
            if (stmt.isTypeOnly) {
                addFromImportLike(spec, true);
                continue;
            }

            if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
                const allTypeOnly = stmt.exportClause.elements.length > 0
                    && stmt.exportClause.elements.every((el) => el.isTypeOnly);
                addFromImportLike(spec, allTypeOnly);
                continue;
            }

            addFromImportLike(spec, false);
            continue;
        }
    }

    function visit(node: ts.Node) {
        if (ts.isImportTypeNode(node)) {
            const arg = node.argument;
            if (ts.isLiteralTypeNode(arg) && ts.isStringLiteralLike(arg.literal)) {
                add(arg.literal.text, true);
            }
        }

        if (ts.isCallExpression(node) && node.arguments.length === 1 && ts.isStringLiteralLike(node.arguments[0])) {
            const callee = node.expression;
            if (callee.kind === ts.SyntaxKind.ImportKeyword) {
                add(node.arguments[0].text, false);
            } else if (ts.isIdentifier(callee) && callee.text === 'require') {
                add(node.arguments[0].text, false);
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return { runtime, typeOnly };
}

function walkSourceFiles(dir: string, files: string[] = []) {
    if (!fs.existsSync(dir)) {
        return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'lib' || entry.name === 'coverage') {
                continue;
            }

            walkSourceFiles(fullPath, files);
            continue;
        }

        if (SOURCE_EXTS.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }

    return files;
}

function collectBareSpecifiersFromSource(packageDir: string) {
    const runtimeValueSpecifiers = new Set<string>();
    const runtimeTypeSpecifiers = new Set<string>();
    const testSpecifiers = new Set<string>();
    const srcDir = path.resolve(packageDir, 'src');

    for (const file of walkSourceFiles(srcDir)) {
        const code = fs.readFileSync(file, 'utf8');
        const isTest = isTestSourceFile(file);
        const { runtime, typeOnly } = parseModuleSpecifiersFromCode(code, file);

        for (const spec of runtime) {
            if (isTest) {
                testSpecifiers.add(spec);
            } else {
                runtimeValueSpecifiers.add(spec);
            }
        }

        for (const spec of typeOnly) {
            if (isTest) {
                testSpecifiers.add(spec);
            } else {
                runtimeTypeSpecifiers.add(spec);
            }
        }
    }

    return {
        runtimeValue: [...runtimeValueSpecifiers],
        runtimeType: [...runtimeTypeSpecifiers],
        test: [...testSpecifiers],
    };
}

function resolvePeerDepVersion(value: PeerDepValue): { name: string; version: string; optional: boolean } | null {
    let version = value.version;
    let name = value.name;
    const optional = Boolean(value.optional);
    const visited = new Set<string>();

    while (version in peerDepsMap) {
        if (visited.has(version)) {
            return null;
        }

        visited.add(version);
        const next = peerDepsMap[version as keyof typeof peerDepsMap] as PeerDepValue;
        name = next.name;
        version = next.version;
    }

    return { name, optional, version };
}

function resolveUniverDependencyVersion(name: string) {
    if (IMMUTABLE_MANAGED_DEPENDENCIES.has(name)) {
        return undefined;
    }

    return 'workspace:*';
}

function deriveDependencyGroups(packageDir: string, packageJson: IPackageJson): IDerivedDependencyGroups {
    const declaredDependencies = packageJson.dependencies ?? {};
    const declaredOptionalDependencies = (packageJson as CleanupPackageJson).optionalDependencies ?? {};
    const peerDeps: StringMap = {};
    const deps: StringMap = {};
    const optionalDeps: StringMap = {};
    const devDeps: StringMap = {};
    const { runtimeValue, runtimeType, test } = collectBareSpecifiersFromSource(packageDir);
    const runtimeUniver = new Set<string>();
    const runtimeTypeOnlyUniver = new Set<string>();
    const testOnlyUniver = new Set<string>();

    for (const source of runtimeValue) {
        if (Object.prototype.hasOwnProperty.call(peerDepsMap, source)) {
            const value = peerDepsMap[source as keyof typeof peerDepsMap] as PeerDepValue;
            const resolved = resolvePeerDepVersion(value);
            if (!resolved) {
                continue;
            }

            // Local package manifests win over the shared peer-dependency registry.
            if (resolved.name in declaredDependencies || resolved.name in declaredOptionalDependencies) {
                continue;
            }

            if (resolved.optional) {
                optionalDeps[resolved.name] = resolved.version;
            } else {
                peerDeps[resolved.name] = resolved.version;
            }
            continue;
        }

        if (source.startsWith('@univerjs')) {
            runtimeUniver.add(filterPackageName(source));
        }
    }

    for (const source of runtimeType) {
        if (source.startsWith('@univerjs')) {
            runtimeTypeOnlyUniver.add(filterPackageName(source));
        }
    }

    for (const source of test) {
        if (source.startsWith('@univerjs')) {
            testOnlyUniver.add(filterPackageName(source));
        }
    }

    for (const name of runtimeUniver) {
        if (name === packageJson.name) {
            continue;
        }

        const dependencyVersion = resolveUniverDependencyVersion(name);
        if (dependencyVersion) {
            deps[name] = dependencyVersion;
        }
    }

    for (const name of new Set([...testOnlyUniver, ...runtimeTypeOnlyUniver])) {
        if (runtimeUniver.has(name) || name === packageJson.name) {
            continue;
        }

        const dependencyVersion = resolveUniverDependencyVersion(name);
        if (dependencyVersion) {
            devDeps[name] = dependencyVersion;
        }
    }

    const declaredDevDependencies: Record<string, string> = (packageJson as CleanupPackageJson).devDependencies ?? {};
    if ('react' in declaredDevDependencies && !('react' in peerDeps)) {
        const reactPeerDep = peerDepsMap.react;
        if (reactPeerDep) {
            peerDeps.react = reactPeerDep.version;
        }
    }

    return {
        dependencies: deps,
        devDependencies: devDeps,
        optionalDependencies: optionalDeps,
        peerDependencies: peerDeps,
    };
}

function applyPublishManifest(pkg: CleanupPackageJson, packageDir: string) {
    const hasLocales = fs.existsSync(path.resolve(packageDir, 'src/locale'));
    const hasFacade = fs.existsSync(path.resolve(packageDir, 'src/facade/index.ts'));

    pkg.publishConfig = {
        access: 'public',
        main: './lib/es/index.js',
        module: './lib/es/index.js',
        exports: {
            '.': {
                import: './lib/es/index.js',
                require: './lib/cjs/index.js',
                types: './lib/types/index.d.ts',
            },
            './*': {
                import: './lib/es/*',
                require: './lib/cjs/*',
                types: './lib/types/index.d.ts',
            },
        },
    };

    pkg.exports ||= {};

    if (hasLocales) {
        pkg.exports['./locale/*'] = './src/locale/*.ts';
        pkg.publishConfig.exports['./locale/*'] = {
            import: './lib/es/locale/*.js',
            require: './lib/cjs/locale/*.js',
            types: './lib/types/locale/*.d.ts',
        };
    }

    if (hasFacade) {
        pkg.exports['./facade'] = './src/facade/index.ts';
        pkg.publishConfig.exports['./facade'] = {
            import: './lib/es/facade.js',
            require: './lib/cjs/facade.js',
            types: './lib/types/facade/index.d.ts',
        };
        pkg.publishConfig.exports['./lib/facade'] = pkg.publishConfig.exports['./facade'];
    }

    pkg.publishConfig.exports['./lib/*'] = './lib/*';
}

function assignPeerDependencies(pkg: CleanupPackageJson, peerDeps: StringMap) {
    const managedPeerDepNames = [...new Set(Object.values(peerDepsMap).map((value) => value.name))];
    const existing = { ...pkg.peerDependencies };
    for (const key of managedPeerDepNames) {
        delete existing[key];
    }

    const merged = Object.keys(peerDeps).length > 0 ? sortKeys({ ...existing, ...peerDeps }) : sortKeys(existing);
    if (Object.keys(merged).length === 0) {
        delete pkg.peerDependencies;
        return;
    }

    pkg.peerDependencies = merged;
}

function readJsonFile<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function writeJsonFile(filePath: string, value: unknown) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`);
}

export function cleanupPackageJson(packageDir: string, packageJson: IPackageJson) {
    const pkgPath = path.resolve(packageDir, 'package.json');
    const pkg = readJsonFile<CleanupPackageJson>(pkgPath);
    const dependencyGroups = deriveDependencyGroups(packageDir, packageJson);

    applyPublishManifest(pkg, packageDir);
    assignDependencyGroup(pkg, 'optionalDependencies', dependencyGroups.optionalDependencies);
    assignPeerDependencies(pkg, dependencyGroups.peerDependencies);
    assignDependencyGroup(pkg, 'dependencies', dependencyGroups.dependencies);
    // This rewrite only owns @univerjs-managed entries; unrelated dev deps stay intact.
    assignDependencyGroup(pkg, 'devDependencies', dependencyGroups.devDependencies);

    writeJsonFile(pkgPath, pkg);
}
