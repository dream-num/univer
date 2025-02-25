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
import process from 'node:process';
import JavaScriptObfuscator from 'javascript-obfuscator';

/**
 * Convert the package name to the library name.
 *
 * @param name
 * @returns Library name
 * @example
 * convertLibNameFromPackageName('@univerjs-pro/sheets-print') // UniverProSheetsPrint
 * convertLibNameFromPackageName('@univerjs/sheets-ui') // UniverSheetsUi
 * convertLibNameFromPackageName(''@univerjs/watermark/facade') // UniverWatermarkFacade
 */
export function convertLibNameFromPackageName(name: string) {
    return name
        .replace(/^@(univerjs(?:-pro)?)\//, (_, matchedPrefix) => {
            return matchedPrefix === 'univerjs-pro' ? 'univer-pro-' : 'univer-';
        })
        .replace('/facade', '-facade')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
};

/**
 * A plugin that obfuscates the @univerjs-pro/* packages.
 */
export function obfuscator(): Plugin {
    return {
        name: 'obfuscator',
        enforce: 'post',
        async generateBundle(_options, bundle) {
            if (process.env.NODE_ENV === 'development') {
                return;
            }

            for (const file in bundle) {
                if (bundle[file].type === 'chunk' && /\.js$/.test(file)) {
                    const code = bundle[file].code;
                    const obfuscationResult = JavaScriptObfuscator.obfuscate(code);
                    bundle[file].code = obfuscationResult.getObfuscatedCode();
                }
            }
        },
    };
};
