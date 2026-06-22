import { LocaleType, LogLevel, Univer } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import zhCN from '@univerjs/mockdata/locales/zh-CN';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverRemoteSheetsFormulaPlugin } from '@univerjs/sheets-formula';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.ZH_CN,
    logLevel: LogLevel.VERBOSE,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
    },
});

univer.registerPlugins([
    [UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true }],
    [UniverFormulaEnginePlugin],
    [UniverRPCWorkerThreadPlugin],
    [UniverRemoteSheetsFormulaPlugin],
    [UniverSheetsFilterPlugin],
]);

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer };
self.univer = univer;
