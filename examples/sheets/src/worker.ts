// The entry of web worker scripts

import { BaseFormulaEnginePlugin } from '@univerjs/engine-formula';
import { SheetsPlugin } from '@univerjs/sheets';
import { LocaleType, Univer } from '@univerjs/core';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { FormulaPlugin } from '@univerjs/formula';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.EN_US,
});

univer.registerPlugin(SheetsPlugin);
univer.registerPlugin(BaseFormulaEnginePlugin);
univer.registerPlugin(UniverRPCWorkerThreadPlugin);
univer.registerPlugin(FormulaPlugin);

univer.start();

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer };
self.univer = univer;
