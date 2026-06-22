import { LocaleType, LogLevel, Univer } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.ZH_CN,
    logLevel: LogLevel.VERBOSE,
});

univer.registerPlugin(UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true });
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverRPCWorkerThreadPlugin);

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer };
self.univer = univer;
