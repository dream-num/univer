// The entry of web worker scripts

import { FormulaEngineService } from '@univerjs/base-formula-engine';
import { SheetPlugin } from '@univerjs/base-sheets';
import { LocaleType, Plugin, Univer } from '@univerjs/core';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { FormulaPlugin } from '@univerjs/sheets-plugin-formula';
import { Inject, Injector } from '@wendellhu/redi';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.EN_US,
});
class WorkerFormulaPlugin extends Plugin {
    constructor(@Inject(Injector) protected override _injector: Injector) {
        super('worker-formula');
    }

    override onStarting(injector: Injector): void {
        injector.add([FormulaEngineService]);
    }
}

univer.registerPlugin(SheetPlugin);
univer.registerPlugin(UniverRPCWorkerThreadPlugin);
univer.registerPlugin(WorkerFormulaPlugin);
univer.registerPlugin(FormulaPlugin, {});

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer };
self.univer = univer;
