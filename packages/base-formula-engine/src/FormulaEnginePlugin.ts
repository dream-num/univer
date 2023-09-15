import { Plugin, SheetContext } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FormulaEnginePluginObserver } from './Analysis/LexerNode';

interface IFormulaEnginePlugin {}

export class FormulaEnginePlugin extends Plugin<FormulaEnginePluginObserver> {
    constructor(config: IFormulaEnginePlugin, @Inject(Injector) private readonly _sheetInjector: Injector) {
        super('formulaEngine');
    }

    initialize(): void {}

    override onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    override onDestroy(): void {}
}
