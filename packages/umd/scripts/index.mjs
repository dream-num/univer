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

/**
 * TODO: @jikkai
 * 1. monaco-editor is not included in the build. User may not able to use uniscript by default.
 * 2. lodash is not included in the build.
 * 3. vue is not included in the build. User may not able to extend the UI with Vue.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { merge } from 'lodash-es';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeModulesPath = path.resolve(__dirname, '../node_modules');

function generateUMDTemplate(code) {
    return `(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UniverUMD = root.UniverUMD || {};
    Object.assign(root.UniverUMD, factory());
  }
}(typeof self !== 'undefined' ? self : this, function () {
  var exports = ${code};
  return exports;
}));`;
}

async function generateLocale() {
    const libs = [
        '@univerjs/design',
        '@univerjs/docs-drawing-ui',
        '@univerjs/docs-ui',
        '@univerjs/docs-hyper-link-ui',
        '@univerjs/drawing-ui',
        '@univerjs/find-replace',
        '@univerjs/sheets',
        '@univerjs/sheets-conditional-formatting-ui',
        '@univerjs/sheets-data-validation',
        '@univerjs/sheets-drawing-ui',
        '@univerjs/sheets-filter-ui',
        '@univerjs/sheets-sort-ui',
        '@univerjs/sheets-find-replace',
        '@univerjs/sheets-formula',
        '@univerjs/sheets-hyper-link-ui',
        '@univerjs/sheets-numfmt',
        '@univerjs/sheets-thread-comment',
        '@univerjs/sheets-ui',
        '@univerjs/sheets-zen-editor',
        '@univerjs/slides-ui',
        '@univerjs/thread-comment-ui',
        '@univerjs/ui',
        '@univerjs/uniscript',
        '@univerjs/sheets-crosshair-highlight',
    ];

    const languages = [{
        key: 'en-US',
        dayjsKey: 'en',
    }, {
        key: 'ru-RU',
        dayjsKey: 'ru',
    }, {
        key: 'zh-CN',
        dayjsKey: 'zh-cn',
    }, {
        key: 'vi-VN',
        dayjsKey: 'vi',
    }, {
        key: 'zh-TW',
        dayjsKey: 'zh-tw',
    }];

    const outputDir = path.resolve(__dirname, '../lib/locale');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const lang of languages) {
        let output = {};
        for (const lib of libs) {
            const file = path.resolve(nodeModulesPath, lib, `lib/locale/${lang.key}.json`);
            if (!fs.existsSync(file)) {
                throw new Error(`File not found: ${file}`);
            }

            const data = fs.readFileSync(file, 'utf-8');
            output = merge(JSON.parse(data), output);
        }

        let result = generateUMDTemplate(`{
            "${lang.key}": ${JSON.stringify(output)}
        }`);

        // append dayjs locale
        const dayjsFile = path.resolve(nodeModulesPath, 'dayjs/locale', `${lang.dayjsKey}.js`);
        if (fs.existsSync(dayjsFile)) {
            result += fs.readFileSync(dayjsFile, 'utf-8');
        }

        fs.writeFileSync(path.resolve(outputDir, `${lang.key}.js`), result, 'utf-8');
    }
};

function buildCSS() {
    const libs = [
        '@univerjs/design',
        '@univerjs/ui',
        '@univerjs/drawing-ui',
        '@univerjs/docs-ui',
        '@univerjs/docs-drawing-ui',
        '@univerjs/sheets-ui',
        '@univerjs/sheets-formula',
        '@univerjs/sheets-numfmt',
        '@univerjs/sheets-zen-editor',
        '@univerjs/sheets-data-validation',
        '@univerjs/sheets-drawing-ui',
        '@univerjs/sheets-conditional-formatting-ui',
        '@univerjs/sheets-filter-ui',
        '@univerjs/sheets-sort-ui',
        '@univerjs/thread-comment-ui',
        '@univerjs/sheets-hyper-link-ui',
        '@univerjs/docs-hyper-link-ui',
        '@univerjs/slides-ui',
        '@univerjs/find-replace',
        '@univerjs/uniscript',
        '@univerjs/sheets-crosshair-highlight',
    ];

    const output = libs.map((lib) => {
        const file = path.resolve(nodeModulesPath, lib, 'lib/index.css');

        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }

        return fs.readFileSync(file, 'utf-8');
    });

    return output.join('\n');
}

function buildExternalLib({ react, rxjs }) {
    const libs = [
        'clsx/dist/clsx.min.js',
        'dayjs/dayjs.min.js',
    ];
    if (react) {
        libs.unshift(
            'react/umd/react.production.min.js',
            'react-dom/umd/react-dom.production.min.js'
        );
    }
    if (rxjs) {
        libs.unshift('rxjs/dist/bundles/rxjs.umd.min.js');
    }

    const output = libs.map((lib) => {
        const file = path.resolve(nodeModulesPath, lib);

        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }

        return fs.readFileSync(file, 'utf-8');
    });

    return output.join('\n');
}

function buildJS() {
    const libs = [
        '@univerjs/protocol',
        '@univerjs/core',
        '@univerjs/telemetry',
        '@univerjs/rpc',
        '@univerjs/design',
        '@univerjs/engine-render',
        '@univerjs/engine-numfmt',
        '@univerjs/engine-formula',
        '@univerjs/ui',
        '@univerjs/docs',
        '@univerjs/docs-ui',
        '@univerjs/sheets',
        '@univerjs/sheets-ui',
        '@univerjs/sheets-formula',
        '@univerjs/sheets-numfmt',
        '@univerjs/sheets-zen-editor',
        '@univerjs/sheets-conditional-formatting',
        '@univerjs/sheets-conditional-formatting-ui',
        '@univerjs/find-replace',
        '@univerjs/sheets-find-replace',
        '@univerjs/data-validation',
        '@univerjs/sheets-data-validation',
        '@univerjs/sheets-filter',
        '@univerjs/sheets-filter-ui',
        '@univerjs/sheets-sort',
        '@univerjs/sheets-sort-ui',
        '@univerjs/thread-comment',
        '@univerjs/thread-comment-ui',
        '@univerjs/sheets-thread-comment-base',
        '@univerjs/sheets-thread-comment',
        '@univerjs/docs-thread-comment-ui',
        '@univerjs/drawing',
        '@univerjs/drawing-ui',
        '@univerjs/sheets-hyper-link',
        '@univerjs/sheets-hyper-link-ui',
        '@univerjs/sheets-drawing',
        '@univerjs/sheets-drawing-ui',
        '@univerjs/docs-drawing',
        '@univerjs/docs-drawing-ui',
        '@univerjs/docs-hyper-link',
        '@univerjs/docs-hyper-link-ui',
        '@univerjs/slides',
        '@univerjs/slides-ui',
        '@univerjs/network',
        '@univerjs/facade',
        '@univerjs/uniscript',
        '@univerjs/sheets-crosshair-highlight',
    ];

    const output = libs.map((lib) => {
        const file = path.resolve(nodeModulesPath, lib, 'lib/umd/index.js');

        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }

        return fs.readFileSync(file, 'utf-8');
    });

    return output.join('\n');
}

function generateOutput(filename, output) {
    const outputFile = path.resolve(__dirname, `../lib/${filename}`);

    if (!fs.existsSync(outputFile)) {
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }

    fs.writeFileSync(outputFile, output, 'utf-8');
}

async function main() {
    generateOutput('univer.css', buildCSS());

    const outputJS = buildJS();

    const fullLib = buildExternalLib({
        react: true,
        rxjs: true,
    });
    generateOutput('univer.full.umd.js', `${fullLib}\n${outputJS}`);

    const slimLib = buildExternalLib({
        react: false,
        rxjs: false,
    });
    generateOutput('univer.slim.umd.js', `${slimLib}\n${outputJS}`);

    await generateLocale();

    console.log('\u001B[32m[@univerjs/umd] Build completed.');
}

main();

