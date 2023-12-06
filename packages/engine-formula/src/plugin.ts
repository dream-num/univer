import { Plugin } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import {
    DirtyConversionManagerService,
    IDirtyConversionManagerService,
} from './services/dirty-conversion-manager.service';
import { FormulaEngineService } from './services/formula-engine.service';

const PLUGIN_NAME = 'base-formula-engine';

export class BaseFormulaEnginePlugin extends Plugin {
    constructor(
        _config: undefined,
        @Inject(Injector) protected override _injector: Injector
    ) {
        super(PLUGIN_NAME);
    }

    override onStarting(injector: Injector): void {
        injector.add([FormulaEngineService]);
        injector.add([IDirtyConversionManagerService, { useClass: DirtyConversionManagerService }]);
    }
}
