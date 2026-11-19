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

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { conditionalFormattingIconPresets } from '../src/models/conditional-formatting-icon-presets.ts';

// The Facade exposes standalone image URLs for consumers outside React and Canvas.
const urls: Record<string, string> = {};
for (const [key, preset] of Object.entries(conditionalFormattingIconPresets)) {
    const group = preset.name.endsWith('-double-icon') ? 'double' : 'single';
    const asset = import.meta.resolve(`@univerjs/icons-svg/${group}/${preset.name}.svg`);
    let svg = readFileSync(new URL(asset), 'utf8');
    if ('colors' in preset) {
        for (const [original, color] of Object.entries(preset.colors)) {
            svg = svg.replaceAll(`"${original}"`, `"${color}"`);
        }
    }
    urls[key] = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const assetDirectory = new URL('../src/assets/', import.meta.url);
mkdirSync(assetDirectory, { recursive: true });
writeFileSync(new URL('icon-map.ts', assetDirectory), `export const iconUrls = ${JSON.stringify(urls, null, 4)};\n`);
