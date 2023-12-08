import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { Ctor } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FUNCTION_NAMES } from '../basics/function';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import {
    Average,
    Compare,
    Concatenate,
    Count,
    Divided,
    Indirect,
    Max,
    Min,
    Minus,
    Multiply,
    Offset,
    Plus,
    Power,
    Sum,
    Union,
} from '../functions';
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
import { IFunctionService } from '../services/function.service';

@OnLifecycle(LifecycleStages.Ready, FormulaController)
export class FormulaController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(Injector) private readonly _injector: Injector,
        @IFunctionService private readonly _functionService: IFunctionService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerCommands();

        this._registerFunctions();

        this._initializeFunctions();
    }

    private _registerCommands(): void {
        [
            SetFormulaDataMutation,
            SetArrayFormulaDataMutation,
            SetFormulaCalculationStartMutation,
            SetFormulaCalculationStopMutation,
            SetFormulaCalculationNotificationMutation,
            SetFormulaCalculationResultMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _registerFunctions() {
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

        this._functionService.registerExecutors(...functions);
    }

    private _initializeFunctions() {
        // new Sum(this._injector, FUNCTION_NAMES.SUM)
        const functions: BaseFunction[] = [
            // base function
            [Compare, FUNCTION_NAMES.COMPARE],
            [Divided, FUNCTION_NAMES.DIVIDED],
            [Minus, FUNCTION_NAMES.MINUS],
            [Multiply, FUNCTION_NAMES.MULTIPLY],
            [Plus, FUNCTION_NAMES.PLUS],
            [Union, FUNCTION_NAMES.UNION],

            // static
            [Average, FUNCTION_NAMES.AVERAGE],
            [Concatenate, FUNCTION_NAMES.CONCATENATE],
            [Count, FUNCTION_NAMES.COUNT],
            [Indirect, FUNCTION_NAMES.INDIRECT],
            [Max, FUNCTION_NAMES.MAX],
            [Min, FUNCTION_NAMES.MIN],
            [Offset, FUNCTION_NAMES.OFFSET],
            [Power, FUNCTION_NAMES.POWER],
            [Sum, FUNCTION_NAMES.SUM],
        ].map((registerObject) => {
            const Func = registerObject[0] as Ctor<BaseFunction>;
            const name = registerObject[1] as string;

            return new Func(this._injector, name);
        });

        this._functionService.registerExecutors(...functions);
    }
}
