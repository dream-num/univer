/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDisposable } from '@univerjs/core';
import { ICommandService, Inject, toDisposable } from '@univerjs/core';
import type { IAllRuntimeData, IExecutionInProgressParams } from '@univerjs/engine-formula';
import { CalculateFormulaService, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';

/**
 * This interface class provides methods to modify the behavior of the operation formula.
 */
export class FFormula {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(CalculateFormulaService) private readonly _calculateFormulaService: CalculateFormulaService
    ) {
        // empty
    }

    /**
     * Start the calculation of the formula.
     */
    executeCalculation(): void {
        this._commandService.executeCommand(
            SetFormulaCalculationStartMutation.id,
            {
                commands: [],
                forceCalculation: true,
            },
            {
                onlyLocal: true,
            }
        );
    }

    /**
     * Stop the calculation of the formula.
     */
    stopCalculation(): void {
        this._commandService.executeCommand(SetFormulaCalculationStopMutation.id, {});
    }

    /**
     * Listening calculation starts.
     */
    calculationStart(callback: () => void): IDisposable {
        const subscribe = this._calculateFormulaService.executionStartListener$.subscribe(() => {
            callback();
        });

        return toDisposable(() => {
            subscribe.unsubscribe();
        });
    }

    /**
     * Listening calculation ends.
     */
    calculationEnd(callback: (allRuntimeData: IAllRuntimeData) => void): IDisposable {
        const subscribe = this._calculateFormulaService.executionCompleteListener$.subscribe((allRuntimeData) => {
            callback(allRuntimeData);
        });

        return toDisposable(() => {
            subscribe.unsubscribe();
        });
    }

    /**
     * Listening calculation processing.
     */
    calculationProcessing(callback: (params: IExecutionInProgressParams) => void): IDisposable {
        const subscribe = this._calculateFormulaService.executionInProgressListener$.subscribe((params) => {
            callback(params);
        });

        return toDisposable(() => {
            subscribe.unsubscribe();
        });
    }
}
