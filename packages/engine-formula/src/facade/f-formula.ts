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

import type { ICommandInfo, IDisposable } from '@univerjs/core';
import type { FormulaExecutedStateType, IExecutionInProgressParams, ISetFormulaCalculationNotificationMutation, ISetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import { FBase, ICommandService, Inject, Injector } from '@univerjs/core';
import { SetFormulaCalculationNotificationMutation, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';

/**
 * This interface class provides methods to modify the behavior of the operation formula.
 */
export class FFormula extends FBase {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    /**
     * Start the calculation of the formula.
     */
    executeCalculation(): void {
        this._commandService.executeCommand(SetFormulaCalculationStartMutation.id, { commands: [], forceCalculation: true }, { onlyLocal: true });
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
    calculationStart(callback: (forceCalculation: boolean) => void): IDisposable {
        return this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id === SetFormulaCalculationStartMutation.id) {
                const params = command.params as ISetFormulaCalculationStartMutation;
                callback(params.forceCalculation);
            }
        });
    }

    /**
     * Listening calculation ends.
     */
    calculationEnd(callback: (functionsExecutedState: FormulaExecutedStateType) => void): IDisposable {
        return this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetFormulaCalculationNotificationMutation.id) {
                return;
            }

            const params = command.params as ISetFormulaCalculationNotificationMutation;

            if (params.functionsExecutedState !== undefined) {
                callback(params.functionsExecutedState);
            }
        });
    }

    onCalculationEnd(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                // You should comment the above line to debug test.
                reject(new Error('Calculation end timeout'));
            }, 30_000);

            const disposable = this.calculationEnd(() => {
                clearTimeout(timer);
                disposable.dispose();

                resolve();
            });
        });
    }

    /**
     * Listening calculation processing.
     */
    calculationProcessing(callback: (stageInfo: IExecutionInProgressParams) => void): IDisposable {
        return this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetFormulaCalculationNotificationMutation.id) {
                return;
            }

            const params = command.params as ISetFormulaCalculationNotificationMutation;

            if (params.stageInfo !== undefined) {
                callback(params.stageInfo);
            }
        });
    }
}
