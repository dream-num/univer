// The entry of web worker scripts

import { BaseFormulaEnginePlugin } from '@univerjs/base-formula-engine';
import { SheetPlugin } from '@univerjs/base-sheets';
import { LocaleType, Univer } from '@univerjs/core';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { FormulaPlugin } from '@univerjs/sheets-plugin-formula';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.EN_US,
});

univer.registerPlugin(SheetPlugin);
univer.registerPlugin(BaseFormulaEnginePlugin);
univer.registerPlugin(UniverRPCWorkerThreadPlugin);
univer.registerPlugin(FormulaPlugin);

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer };
self.univer = univer;
