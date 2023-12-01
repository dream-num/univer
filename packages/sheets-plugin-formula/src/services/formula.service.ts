import type { BaseFunction } from '@univerjs/base-formula-engine';
import { FormulaEngineService } from '@univerjs/base-formula-engine';
import { LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { Ctor, IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import { functionArray } from './function-list/array/function-names';
import { functionCompatibility } from './function-list/compatibility/function-names';
import { functionCube } from './function-list/cube/function-names';
import { functionDatabase } from './function-list/database/function-names';
import { functionDate } from './function-list/date/function-names';
import { functionEngineering } from './function-list/engineering/function-names';
import { functionFinancial } from './function-list/financial/function-names';
import { functionInformation } from './function-list/information/function-names';
import { functionLogical } from './function-list/logical/function-names';
import { functionLookup } from './function-list/lookup/function-names';
import { functionMath } from './function-list/math/function-names';
import { functionStatistical } from './function-list/statistical/function-names';
import { functionText } from './function-list/text/function-names';
import { functionUniver } from './function-list/univer/function-names';
import { functionWeb } from './function-list/web/function-names';

export interface IFormulaService {}

export const IFormulaService = createIdentifier<IFormulaService>('formula-calculate.formula-service');

@OnLifecycle(LifecycleStages.Starting, FormulaService)
export class FormulaService implements IFormulaService, IDisposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService
    ) {}

    dispose(): void {}

    registerFunctions() {
        const functions: BaseFunction[] = [
            ...functionArray,
            ...functionCompatibility,
            ...functionCube,
            ...functionDatabase,
            ...functionDate,
            ...functionEngineering,
            ...functionFinancial,
            ...functionInformation,
            ...functionLogical,
            ...functionLookup,
            ...functionMath,
            ...functionStatistical,
            ...functionText,
            ...functionUniver,
            ...functionWeb,
        ].map((registerObject) => {
            const Func = registerObject[0] as Ctor<BaseFunction>;
            const name = registerObject[1] as string;

            return new Func(this._injector, name);
        });

        this._formulaEngineService.registerFunction(...functions);
    }
}
