/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import type { FormulaExecutedStateType, IExecutionInProgressParams, IFormulaExecuteResultMap, IFormulaStringMap, ISequenceNode, ISetFormulaCalculationNotificationMutation, ISetFormulaCalculationStartMutation, ISetFormulaStringBatchCalculationResultMutation } from '@univerjs/engine-formula';
import { ICommandService, IConfigService, Inject, Injector } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { ENGINE_FORMULA_CYCLE_REFERENCE_COUNT, GlobalComputingStatusService, LexerTreeBuilder, SetFormulaCalculationNotificationMutation, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation, SetFormulaStringBatchCalculationMutation, SetFormulaStringBatchCalculationResultMutation } from '@univerjs/engine-formula';
import { filter, firstValueFrom, map, race, timer } from 'rxjs';

/**
 * This interface class provides methods to modify the behavior of the operation formula.
 * @hideconstructor
 */
export class FFormula extends FBase {
    constructor(
        @Inject(ICommandService) protected readonly _commandService: ICommandService,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LexerTreeBuilder) private _lexerTreeBuilder: LexerTreeBuilder,
        @IConfigService protected readonly _configService: IConfigService
    ) {
        super();
        this._initialize();
    }

    /**
     * @ignore
     */
    _initialize(): void {
        // do nothing
    }

    /**
     * The tree builder for formula string.
     * @type {LexerTreeBuilder}
     */
    get lexerTreeBuilder(): LexerTreeBuilder {
        return this._lexerTreeBuilder;
    }

    /**
     * Offsets the formula
     * @param {string} formulaString - The formula string to offset
     * @param {number} refOffsetX - The offset column
     * @param {number} refOffsetY - The offset row
     * @param {boolean} [ignoreAbsolute] - Whether to ignore the absolute reference
     * @returns {string} The offset formula string
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     * const result = formulaEngine.moveFormulaRefOffset('=SUM(A1,B2)', 1, 1);
     * console.log(result);
     * ```
     */
    moveFormulaRefOffset(formulaString: string, refOffsetX: number, refOffsetY: number, ignoreAbsolute?: boolean): string {
        return this._lexerTreeBuilder.moveFormulaRefOffset(formulaString, refOffsetX, refOffsetY, ignoreAbsolute);
    }

    /**
     * Resolves the formula string to a 'node' node
     * @param {string} formulaString - The formula string to resolve
     * @returns {Array<ISequenceNode | string>} The nodes of the formula string
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     * const nodes = formulaEngine.sequenceNodesBuilder('=SUM(A1,B2)');
     * console.log(nodes);
     * ```
     */
    sequenceNodesBuilder(formulaString: string): (string | ISequenceNode)[] {
        return this._lexerTreeBuilder.sequenceNodesBuilder(formulaString) || [];
    }

    /**
     * Start the calculation of the formula.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     * formulaEngine.executeCalculation();
     * ```
     */
    executeCalculation(): void {
        this._commandService.executeCommand(SetFormulaCalculationStartMutation.id, { commands: [], forceCalculation: true }, { onlyLocal: true });
    }

    /**
     * Stop the calculation of the formula.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     * formulaEngine.stopCalculation();
     * ```
     */
    stopCalculation(): void {
        this._commandService.executeCommand(SetFormulaCalculationStopMutation.id, {});
    }

    /**
     * Listening calculation starts.
     * @param {Function} callback - The callback function to be called when the formula calculation starts.
     * @returns {IDisposable} The disposable instance.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     * formulaEngine.calculationStart((forceCalculation) => {
     *   console.log('Calculation start', forceCalculation);
     * });
     * ```
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
     * @param {Function} callback - The callback function to be called when the formula calculation ends.
     * @returns {IDisposable} The disposable instance.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     * formulaEngine.calculationEnd((functionsExecutedState) => {
     *   console.log('Calculation end', functionsExecutedState);
     * });
     * ```
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

    /**
     * Wait for computing in the Univer instance to complete. Please note that this does not only include formula calculation,
     * but also other computing tasks, e.g. pivot table calculation.
     * @param {number} [timeout] The maximum time to wait for the computing to complete, in milliseconds. The default
     * value is 30,000 milliseconds.
     * @returns {Promise<boolean>} This method returns `true` if the computing is complete. If the timeout is reached, this
     * method returns `false`.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     * formulaEngine.whenComputingCompleteAsync(3000).then((isComplete) => {
     *   console.log('Computing complete:', isComplete);
     * });
     * ```
     */
    whenComputingCompleteAsync(timeout?: number): Promise<boolean> {
        const gcss = this._injector.get(GlobalComputingStatusService);
        if (gcss.computingStatus) return Promise.resolve(true);

        return firstValueFrom(race(
            gcss.computingStatus$.pipe(filter((computing) => computing)),
            timer(timeout ?? 30_000).pipe(map(() => false))
        ));
    }

    /**
     * @deprecated Use `whenComputingCompleteAsync` instead.
     * @returns {Promise<void>} This method returns a promise that resolves when the calculation is complete.
     */
    onCalculationEnd(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
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
     * @param {Function} callback - The callback function to be called when the formula calculation is in progress.
     * @returns {IDisposable} The disposable instance.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     * formulaEngine.calculationProcessing((stageInfo) => {
     *   console.log('Calculation processing', stageInfo);
     * });
     * ```
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

    /**
     * When a formula contains a circular reference, set the maximum number of iterations for the formula calculation.
     * @param {number} maxIteration The maximum number of iterations. The default value is 1.
     *
     * @example
     * ```ts
     * // Set the maximum number of iterations for the formula calculation to 5.
     * // The default value is 1.
     * const formulaEngine = univerAPI.getFormula();
     * formulaEngine.setMaxIteration(5);
     * ```
     */
    setMaxIteration(maxIteration: number): void {
        this._configService.setConfig(ENGINE_FORMULA_CYCLE_REFERENCE_COUNT, maxIteration);
    }

    /**
     * Execute a batch of formulas asynchronously and receive computed results.
     *
     * Each formula cell is represented as a string array:
     *   [fullFormula, ...subFormulas]
     *
     * Where:
     *   - fullFormula (index 0) is the complete formula expression written in the cell.
     *     Example: "=SUM(A1:A10) + SQRT(D7)".
     *
     *   - subFormulas (index 1+) are **optional decomposed expressions** extracted from
     *     the full formula. Each of them can be independently computed by the formula engine.
     *
     *     These sub-expressions can include:
     *       - Single-cell references:  "A2", "B2", "C5"
     *       - Range references:        "A1:A10"
     *       - Function calls:          "SQRT(D7)", "ABS(A2-B2)"
     *       - Any sub-formula that was parsed out of the original formula and can be
     *         evaluated on its own.
     *
     *     The batch execution engine may use these sub-formulas for dependency resolution,
     *     incremental computation, or performance optimizations.
     *
     * @param {IFormulaStringMap} formulas
     *        Nested structure (unit → sheet → row → column) describing formulas and
     *        their decomposed sub-expressions.
     *
     * @param {(result: IFormulaExecuteResultMap) => void} callback
     *        Receives the computed value map mirroring the input structure.
     *
     * @returns {IDisposable}
     *          A disposer to stop listening for batch results.
     *
     * @example
     * ```ts
     * const formulas = {
     *   Book1: {
     *     Sheet1: {
     *       2: {
     *         3: [
     *           // Full formula:
     *           "=SUM(A1:A10) + SQRT(D7)",
     *
     *           // Decomposed sub-formulas (each one can be evaluated independently):
     *           "SUM(A1:A10)",   // sub-formula 1
     *           "SQRT(D7)",      // sub-formula 2
     *           "A1:A10",        // range reference
     *           "D7",            // single-cell reference
     *         ],
     *       },
     *       4: {
     *         5: [
     *           "=A2 + B2 + SQRT(C5)",
     *           "A2",
     *           "B2",
     *           "SQRT(C5)",
     *         ],
     *       }
     *     },
     *   },
     * };
     *
     * const disposer = formulaEngine.executeFormulas(formulas, (result) => {
     *   console.log(result);
     * });
     *
     * // Stop listening when done.
     * disposer.dispose();
     * ```
     */
    executeFormulas(formulas: IFormulaStringMap, callback: (result: IFormulaExecuteResultMap) => void): IDisposable {
        this._commandService.executeCommand(SetFormulaStringBatchCalculationMutation.id, { formulas }, { onlyLocal: true });
        return this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetFormulaStringBatchCalculationResultMutation.id) {
                return;
            }

            const params = command.params as ISetFormulaStringBatchCalculationResultMutation;

            if (params.result != null) {
                callback(params.result);
            }
        });
    }
}
