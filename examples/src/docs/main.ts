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

/* eslint-disable node/prefer-global/process */
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { DEFAULT_DOCUMENT_DATA_CN } from '../data';
import { enUS, ruRU, zhCN } from '../locales';

// package info
// eslint-disable-next-line no-console
console.table({
    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    GIT_REF_NAME: process.env.GIT_REF_NAME,
    BUILD_TIME: process.env.BUILD_TIME,
});

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
        [LocaleType.EN_US]: enUS,
        [LocaleType.RU_RU]: ruRU,
    },
});

// core plugins
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverDebuggerPlugin);
univer.registerPlugin(UniverUIPlugin, {
    container: 'app',
    footer: false,
});
univer.registerPlugin(UniverDrawingPlugin);
univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverDocsUIPlugin, {
    container: 'univerdoc',
    layout: {
        docContainerConfig: {
            innerLeft: false,
        },
    },
});

univer.registerPlugin(UniverDrawingUIPlugin);
univer.registerPlugin(UniverDocsDrawingPlugin);
univer.registerPlugin(UniverDocsDrawingUIPlugin);

univer.createUnit(UniverInstanceType.UNIVER_DOC, DEFAULT_DOCUMENT_DATA_CN);

// use for console test
declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
