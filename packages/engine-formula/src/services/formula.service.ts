import { LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { Ctor, IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import { functionArray } from '../functions/array/function-names';
import type { BaseFunction } from '../functions/base-function';
import { functionCompatibility } from '../functions/compatibility/function-names';
import { functionCube } from '../functions/cube/function-names';
import { functionDatabase } from '../functions/database/function-names';
import { functionDate } from '../functions/date/function-names';
import { functionEngineering } from '../functions/engineering/function-names';
import { functionFinancial } from '../functions/financial/function-names';
import { functionInformation } from '../functions/information/function-names';
import { functionLogical } from '../functions/logical/function-names';
import { functionLookup } from '../functions/lookup/function-names';
import { functionMath } from '../functions/math/function-names';
import { functionStatistical } from '../functions/statistical/function-names';
import { functionText } from '../functions/text/function-names';
import { functionUniver } from '../functions/univer/function-names';
import { functionWeb } from '../functions/web/function-names';
import { FormulaEngineService } from './formula-engine.service';

export interface IFormulaService {
    registerFunctions(): void;
}

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

export const IFormulaService = createIdentifier<FormulaService>('formula-calculate.formula-service');
