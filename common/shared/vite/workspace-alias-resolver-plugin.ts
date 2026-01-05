/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Plugin } from 'vite';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Plugin to resolve @/ aliases in workspace packages.
 * When a file from a workspace package (e.g., engine-render) uses @/ imports,
 * this plugin resolves them relative to that package's src directory.
 */
export function workspaceAliasResolverPlugin(): Plugin {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const packagesDir = path.resolve(__dirname, '../../../packages');

    return {
        name: 'workspace-alias-resolver',
        enforce: 'pre',
        resolveId(source, importer) {
            if (!importer || !source.startsWith('@/')) {
                return null;
            }

            // Check if the importer is from a workspace package
            const match = importer.match(/\/packages\/([^\/]+)\//);
            if (!match) {
                return null;
            }

            const packageName = match[1];
            const packageSrcDir = path.resolve(packagesDir, packageName, 'src');

            // Check if this package has a tsconfig with @/ alias
            const tsconfigPath = path.resolve(packagesDir, packageName, 'tsconfig.json');
            if (!fs.existsSync(tsconfigPath)) {
                return null;
            }

            try {
                const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
                const paths = tsconfig?.compilerOptions?.paths;

                if (paths && paths['@/*']) {
                    // Resolve @/ to the package's src directory
                    const relativePath = source.slice(2); // Remove '@/'
                    const resolved = path.resolve(packageSrcDir, relativePath);

                    // Try with and without extensions, prioritizing index files for directories
                    const extensions = ['/index.ts', '/index.tsx', '/index.js', '.ts', '.tsx', '.js', '.jsx'];
                    for (const ext of extensions) {
                        const fullPath = resolved + ext;
                        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
                            return fullPath;
                        }
                    }
                }
            } catch (e) {
                // Ignore errors reading tsconfig
            }

            return null;
        },
    };
}
