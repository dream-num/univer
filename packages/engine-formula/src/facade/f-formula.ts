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

import type { ICommandInfo, IDisposable, IUnitRange } from '@univerjs/core';
import type { FormulaExecutedStateType, IExecutionInProgressParams, IFormulaDependencyTreeFullJson, IFormulaDependencyTreeJson, IFormulaExecuteResultMap, IFormulaStringMap, ISequenceNode, ISetCellFormulaDependencyCalculationResultMutation, ISetFormulaCalculationNotificationMutation, ISetFormulaCalculationStartMutation, ISetFormulaDependencyCalculationResultMutation, ISetFormulaStringBatchCalculationResultMutation } from '@univerjs/engine-formula';
import { ICommandService, IConfigService, Inject, Injector } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { ENGINE_FORMULA_CYCLE_REFERENCE_COUNT, GlobalComputingStatusService, LexerTreeBuilder, SetCellFormulaDependencyCalculationMutation, SetCellFormulaDependencyCalculationResultMutation, SetFormulaCalculationNotificationMutation, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation, SetFormulaDependencyCalculationMutation, SetFormulaDependencyCalculationResultMutation, SetFormulaStringBatchCalculationMutation, SetFormulaStringBatchCalculationResultMutation, SetQueryFormulaDependencyMutation, SetQueryFormulaDependencyResultMutation } from '@univerjs/engine-formula';
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
            let started = false;
            let finished = false;

            // Global timeout: reject if the whole calculation hangs
            const mainTimer = setTimeout(() => {
                cleanup();
                reject(new Error('Calculation end timeout'));
            }, 60_000);

            // Watchdog: if no "calculation started" signal is received within 500ms,
            // assume there is no real calculation running and resolve immediately.
            const startWatchdog = setTimeout(() => {
                if (!started) {
                    cleanup();
                    resolve();
                }
            }, 500);

            // Listen for "calculation in progress" signal (stageInfo)
            const processingDisposable = this.calculationProcessing(() => {
                if (started) return;
                started = true;

                // A start signal is received → no need for the watchdog anymore
                clearTimeout(startWatchdog);
            });

            // Listen for the "calculation completed" signal
            const endDisposable = this.calculationEnd(() => {
                if (finished) return;
                finished = true;

                cleanup();
                resolve();
            });

            const cleanup = (): void => {
                clearTimeout(mainTimer);
                clearTimeout(startWatchdog);
                processingDisposable.dispose();
                endDisposable.dispose();
            };
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
     * const formulaEngine = univerAPI.getFormula();
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
     * ```
     */
    executeFormulas(formulas: IFormulaStringMap, callback: (result: IFormulaExecuteResultMap) => void): void {
        this._commandService.executeCommand(SetFormulaStringBatchCalculationMutation.id, { formulas }, { onlyLocal: true });
        const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetFormulaStringBatchCalculationResultMutation.id) {
                return;
            }

            const params = command.params as ISetFormulaStringBatchCalculationResultMutation;

            if (params.result != null) {
                callback(params.result);
            }
            disposable.dispose();
        });
    }

    /**
     * Retrieve all formula dependency trees that were produced during the latest
     * dependency-analysis run. This triggers a local dependency-calculation command
     * and returns the complete set of dependency trees once the calculation finishes.
     *
     * @param callback A function invoked with the resulting array of dependency trees.
     *
     * @returns {IDisposable} An object that disposes the internal event listener.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Fetch all dependency trees generated for the current workbook.
     * const disposable = formulaEngine.getAllDependencyTrees((trees) => {
     *     console.log('All dependency trees:', trees);
     * });
     *
     * ```
     */
    getAllDependencyTrees(callback: (result: IFormulaDependencyTreeJson[]) => void): void {
        this._commandService.executeCommand(SetFormulaDependencyCalculationMutation.id, undefined, { onlyLocal: true });
        const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetFormulaDependencyCalculationResultMutation.id) {
                return;
            }

            const params = command.params as ISetFormulaDependencyCalculationResultMutation;

            if (params.result != null) {
                callback(params.result);
            }

            disposable.dispose();
        });
    }

    /**
     * Retrieve the dependency tree of a specific cell. This triggers a local
     * dependency-calculation command for the given unit, sheet, and cell location,
     * and returns the computed dependency tree when the calculation is completed.
     *
     * @param param The target cell location:
     *   - `unitId`  The workbook ID.
     *   - `sheetId` The sheet ID.
     *   - `row`     The zero-based row index.
     *   - `column`  The zero-based column index.
     *
     * @param callback A function invoked with the resulting dependency tree or
     * `undefined` if no dependency tree exists for that cell.
     *
     * @returns {IDisposable} An object that disposes the internal event listener.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Query the dependency tree for cell B2 in a specific sheet.
     * const disposable = formulaEngine.getCellDependencyTree(
     *     { unitId: 'workbook1', sheetId: 'sheet1', row: 1, column: 1 },
     *     (tree) => {
     *         console.log('Cell dependency tree:', tree);
     *     }
     * );
     *
     * ```
     */
    getCellDependencyTree(param: { unitId: string; sheetId: string; row: number; column: number }, callback: (result: IFormulaDependencyTreeFullJson | undefined) => void): void {
        this._commandService.executeCommand(SetCellFormulaDependencyCalculationMutation.id, param, { onlyLocal: true });
        const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetCellFormulaDependencyCalculationResultMutation.id) {
                return;
            }

            const params = command.params as ISetCellFormulaDependencyCalculationResultMutation;

            if (params.result !== undefined) {
                callback(params.result);
            }

            disposable.dispose();
        });
    }

    /**
     * Retrieve the full dependency trees for all formulas that *depend on* the
     * specified ranges. This triggers a local dependency-calculation command and
     * invokes the callback once the calculation completes.
     *
     * @param unitRanges An array of workbook/sheet ranges to query. Each range
     *   includes:
     *   - `unitId`  The workbook ID.
     *   - `sheetId` The sheet ID.
     *   - `range`   The row/column boundaries.
     *
     * @param callback A function invoked with an array of `IFormulaDependencyTreeJson`
     * results. Each entry represents a formula node and its parent/child
     * relationships within the dependency graph.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Query all formulas that depend on A1:B10 in Sheet1.
     * formulaEngine.getRangeDependents(
     *     [{ unitId: 'workbook1', sheetId: 'sheet1', range: { startRow: 0, endRow: 9, startColumn: 0, endColumn: 1 } }],
     *     (result) => {
     *         console.log('Dependent formulas:', result);
     *     }
     * );
     * ```
     */
    getRangeDependents(unitRanges: IUnitRange[], callback: (result: IFormulaDependencyTreeJson[]) => void): void {
        this._commandService.executeCommand(SetQueryFormulaDependencyMutation.id, { unitRanges }, { onlyLocal: true });

        const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetQueryFormulaDependencyResultMutation.id) {
                return;
            }

            const params = command.params as ISetFormulaDependencyCalculationResultMutation;

            if (params.result != null) {
                callback(params.result);
            }

            disposable.dispose();
        });
    }

    /**
     * Retrieve the dependency trees of all formulas *inside* the specified ranges.
     * Unlike `getRangeDependents`, this API only returns formulas whose definitions
     * physically reside within the queried ranges.
     *
     * Internally this triggers the same dependency-calculation command but with
     * `isInRange = true`, and the callback is invoked when the results are ready.
     *
     * @param unitRanges An array of workbook/sheet ranges defining the lookup
     *   boundaries:
     *   - `unitId`  The workbook ID.
     *   - `sheetId` The sheet ID.
     *   - `range`   The zero-based grid range.
     *
     * @param callback Receives an array of `IFormulaDependencyTreeJson` describing
     * every formula found in the provided ranges along with their parent/child
     * relationships.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Query all formulas that lie within A1:D20 in Sheet1.
     * formulaEngine.getInRangeFormulas(
     *     [{ unitId: 'workbook1', sheetId: 'sheet1', range: { startRow: 0, endRow: 19, startColumn: 0, endColumn: 3 } }],
     *     (result) => {
     *         console.log('Formulas inside range:', result);
     *     }
     * );
     * ```
     */
    getInRangeFormulas(unitRanges: IUnitRange[], callback: (result: IFormulaDependencyTreeJson[]) => void): void {
        this._commandService.executeCommand(SetQueryFormulaDependencyMutation.id, { unitRanges, isInRange: true }, { onlyLocal: true });

        const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetQueryFormulaDependencyResultMutation.id) {
                return;
            }

            const params = command.params as ISetFormulaDependencyCalculationResultMutation;

            if (params.result != null) {
                callback(params.result);
            }

            disposable.dispose();
        });
    }
}
