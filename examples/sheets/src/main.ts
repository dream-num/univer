import { LocaleType, LogLevel, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { RichTextEditingMutation, UniverDocs } from '@univerjs/docs';
import { UniverFormulaEngine } from '@univerjs/engine-formula';
import { UniverRenderEngine } from '@univerjs/engine-render';
import type { IUniverRPCMainThreadConfig } from '@univerjs/rpc';
import { UniverRPCMainThread } from '@univerjs/rpc';
import { UniverSheets } from '@univerjs/sheets';
import { UniverSheetsFormula } from '@univerjs/sheets-formula';
import { UniverSheetsNumfmt } from '@univerjs/sheets-numfmt';
import { UniverSheetsUI } from '@univerjs/sheets-ui';
import { UniverUI } from '@univerjs/ui';
import type { IUniscriptConfig } from '@univerjs/uniscript';
import { UniverUniscript } from '@univerjs/uniscript';
import { DEFAULT_WORKBOOK_DATA_DEMO } from 'data';

import { locales } from './locales';
import { DebuggerPlugin } from './sheets-plugin-debugger';

// package info
console.table({
    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    GIT_REF_NAME: process.env.GIT_REF_NAME,
    BUILD_TIME: process.env.BUILD_TIME,
});

// univer
const univer = new Univer({
    theme: greenTheme,
    locale: LocaleType.ZH_CN,
    locales,
    logLevel: LogLevel.VERBOSE,
});

// core plugins
univer.registerPlugin(UniverDocs, {
    hasScroll: false,
});
univer.registerPlugin(UniverRenderEngine);
univer.registerPlugin(UniverUI, {
    container: 'app',
    header: true,
    toolbar: true,
    footer: true,
});
univer.registerPlugin(UniverSheets, {
    notExecuteFormula: true,
});
univer.registerPlugin(UniverSheetsUI);

// sheet feature plugins

univer.registerPlugin(UniverSheetsNumfmt);
univer.registerPlugin(DebuggerPlugin);
univer.registerPlugin(UniverFormulaEngine, {
    notExecuteFormula: true,
});
univer.registerPlugin(UniverSheetsFormula);
univer.registerPlugin(UniverRPCMainThread, {
    workerURL: './worker.js',
    unsyncMutations: new Set([RichTextEditingMutation.id]),
} as IUniverRPCMainThreadConfig);

univer.registerPlugin(UniverUniscript, {
    getWorkerUrl(moduleID, label) {
        if (label === 'typescript' || label === 'javascript') {
            return './vs/language/typescript/ts.worker.js';
        }

        return './vs/editor/editor.worker.js';
    },
} as IUniscriptConfig);

// create univer sheet instance
univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);

declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
