// The entry of web worker scripts

import { LocaleType, Univer } from '@univerjs/core';
import { BaseFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { SheetsPlugin } from '@univerjs/sheets';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.ZH_CN,
});

univer.registerPlugin(SheetsPlugin);
univer.registerPlugin(BaseFormulaEnginePlugin);
univer.registerPlugin(UniverRPCWorkerThreadPlugin);
// univer.registerPlugin(FormulaPlugin);

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer };
self.univer = univer;
