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

const process = require('node:process');
const JavaScriptObfuscator = require('javascript-obfuscator');

exports.obfuscator = function obfuscator() {
    return {
        name: 'obfuscator',
        enforce: 'post',
        async generateBundle(_options, bundle) {
            if (process.env.BUNDLE_TYPE === 'lite') {
                for (const file in bundle) {
                    if (bundle[file].type === 'chunk' && /\.js$/.test(file)) {
                        const code = bundle[file].code;
                        const obfuscationResult = JavaScriptObfuscator.obfuscate(code);
                        bundle[file].code = obfuscationResult.getObfuscatedCode();
                    }
                }
            }
        },
    };
};
