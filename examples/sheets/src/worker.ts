// The entry of web worker scripts

import { LocaleType, Univer } from '@univerjs/core';
import { UniverFormulaEngine } from '@univerjs/engine-formula';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { UniverSheets } from '@univerjs/sheets';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.ZH_CN,
});

univer.registerPlugin(UniverSheets);
univer.registerPlugin(UniverFormulaEngine);
univer.registerPlugin(UniverRPCWorkerThreadPlugin);

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer };
self.univer = univer;
