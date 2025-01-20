/**
 * Copyright 2023-present DreamNum Inc.
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

import type { BuildOptions, SameShape } from 'esbuild';
import esbuild from 'esbuild';

const config: SameShape<BuildOptions, BuildOptions> = {
    bundle: true,
    color: true,
    minify: false,
    target: 'chrome70',
    entryPoints: [
        './src/cases/basic.ts',
        './src/sdk/worker.ts',
    ],
    platform: 'node',
    outdir: './dist',
    define: {
        'process.env.NODE_ENV': '"production"',

    },
};

async function main() {
    await esbuild.build(config);
}

main();
