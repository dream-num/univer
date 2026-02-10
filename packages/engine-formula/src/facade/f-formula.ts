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
import type {
    FormulaExecutedStateType,
    IExecutionInProgressParams,
    IExprTreeNode,
    IFormulaDependencyTreeFullJson,
    IFormulaDependencyTreeJson,
    IFormulaDependentsAndInRangeResults,
    IFormulaExecuteResultMap,
    IFormulaStringMap,
    ISequenceNode,
    ISetCellFormulaDependencyCalculationResultMutation,
    ISetFormulaCalculationNotificationMutation,
    ISetFormulaCalculationStartMutation,
    ISetFormulaDependencyCalculationResultMutation,
    ISetFormulaStringBatchCalculationResultMutation,
    ISetQueryFormulaDependencyAllResultMutation,
} from '@univerjs/engine-formula';
import { ICommandService, IConfigService, Inject, Injector } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import {
    ENGINE_FORMULA_CYCLE_REFERENCE_COUNT,
    ENGINE_FORMULA_RETURN_DEPENDENCY_TREE,
    GlobalComputingStatusService,
    IDefinedNamesService,
    IFunctionService,
    ISuperTableService,
    LexerTreeBuilder,
    SetCellFormulaDependencyCalculationMutation,
    SetCellFormulaDependencyCalculationResultMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
    SetFormulaDependencyCalculationMutation,
    SetFormulaDependencyCalculationResultMutation,
    SetFormulaStringBatchCalculationMutation,
    SetFormulaStringBatchCalculationResultMutation,
    SetQueryFormulaDependencyAllMutation,
    SetQueryFormulaDependencyAllResultMutation,
    SetQueryFormulaDependencyMutation,
    SetQueryFormulaDependencyResultMutation,
    SetTriggerFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
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
        @IConfigService protected readonly _configService: IConfigService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @ISuperTableService private readonly _superTableService: ISuperTableService

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
        this._commandService.executeCommand(SetTriggerFormulaCalculationStartMutation.id, { commands: [], forceCalculation: true }, { onlyLocal: true });
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
     * @deprecated Use `onCalculationEnd` instead.
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
     * Waits for the formula calculation to complete.
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
     * @param {number} [timeout]
     *        Optional timeout in milliseconds. If no result is received within this
     *        period, the promise will be rejected.
     *
     * @returns {Promise<IFormulaExecuteResultMap>}
     *          A promise that resolves with the computed value map mirroring
     *          the input structure.
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
     * const result = await formulaEngine.executeFormulas(formulas);
     * console.log(result);
     * ```
     */
    executeFormulas(
        formulas: IFormulaStringMap,
        timeout = 30_000
    ): Promise<IFormulaExecuteResultMap> {
        return new Promise((resolve, reject) => {
            const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetFormulaStringBatchCalculationResultMutation.id) {
                    return;
                }

                const params = command.params as ISetFormulaStringBatchCalculationResultMutation;

                clearTimeout(timer);
                disposable.dispose();

                if (params.result != null) {
                    resolve(params.result);
                } else {
                    reject(new Error('Formula batch calculation returned no result'));
                }
            });

            const timer = setTimeout(() => {
                disposable.dispose();
                reject(new Error('Formula batch calculation timeout'));
            }, timeout);

            this._commandService.executeCommand(
                SetFormulaStringBatchCalculationMutation.id,
                { formulas },
                { onlyLocal: true }
            );
        });
    }

    /**
     * Retrieve all formula dependency trees that were produced during the latest
     * dependency-analysis run. This triggers a local dependency-calculation command
     * and returns the complete set of dependency trees once the calculation finishes.
     *
     * @param {number} [timeout]
     *        Optional timeout in milliseconds. If no result is received within this
     *        period, the promise will be rejected.
     *
     * @returns {Promise<IFormulaDependencyTreeJson[]>}
     *          A promise that resolves with the array of dependency trees.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Fetch all dependency trees generated for the current workbook.
     * const trees = await formulaEngine.getAllDependencyTrees();
     * console.log('All dependency trees:', trees);
     * ```
     */
    getAllDependencyTrees(timeout = 30_000): Promise<IFormulaDependencyTreeJson[]> {
        return new Promise((resolve, reject) => {
            const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetFormulaDependencyCalculationResultMutation.id) {
                    return;
                }

                const params = command.params as ISetFormulaDependencyCalculationResultMutation;

                clearTimeout(timer);
                disposable.dispose();

                if (params.result != null) {
                    resolve(params.result);
                } else {
                    resolve([]); // No trees found; return an empty array instead of failing
                }
            });

            const timer = setTimeout(() => {
                disposable.dispose();
                reject(new Error('Formula dependency calculation timeout'));
            }, timeout);

            this._commandService.executeCommand(
                SetFormulaDependencyCalculationMutation.id,
                undefined,
                { onlyLocal: true }
            );
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
     * @param {number} [timeout]
     *        Optional timeout in milliseconds. If no result is received within this
     *        period, the promise will be rejected.
     *
     * @returns {Promise<IFormulaDependencyTreeFullJson | undefined>}
     *          A promise that resolves with the dependency tree or `undefined`
     *          if no tree exists for that cell.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Query the dependency tree for cell B2 in a specific sheet.
     * const tree = await formulaEngine.getCellDependencyTree({
     *   unitId: 'workbook1',
     *   sheetId: 'sheet1',
     *   row: 1,
     *   column: 1,
     * });
     *
     * console.log('Cell dependency tree:', tree);
     * ```
     */
    getCellDependencyTree(
        param: { unitId: string; sheetId: string; row: number; column: number },
        timeout = 30_000
    ): Promise<IFormulaDependencyTreeFullJson | undefined> {
        return new Promise((resolve, reject) => {
            const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetCellFormulaDependencyCalculationResultMutation.id) {
                    return;
                }

                const params = command.params as ISetCellFormulaDependencyCalculationResultMutation;

                clearTimeout(timer);
                disposable.dispose();

                // `result` may be undefined if the cell has no dependency tree
                resolve(params.result);
            });

            const timer = setTimeout(() => {
                disposable.dispose();
                reject(new Error('Cell dependency calculation timeout'));
            }, timeout);

            this._commandService.executeCommand(
                SetCellFormulaDependencyCalculationMutation.id,
                param,
                { onlyLocal: true }
            );
        });
    }

    /**
     * Retrieve the full dependency trees for all formulas that *depend on* the
     * specified ranges. This triggers a local dependency-calculation command and
     * resolves once the calculation completes.
     *
     * @param unitRanges An array of workbook/sheet ranges to query. Each range
     *   includes:
     *   - `unitId`  The workbook ID.
     *   - `sheetId` The sheet ID.
     *   - `range`   The row/column boundaries.
     *
     * @param {number} [timeout]
     *        Optional timeout in milliseconds. If no result is received within this
     *        period, the promise will be rejected.
     *
     * @returns {Promise<IFormulaDependencyTreeJson[]>}
     *          A promise that resolves with an array of `IFormulaDependencyTreeJson`
     *          representing formulas and their relationships within the dependency graph.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Query all formulas that depend on A1:B10 in Sheet1.
     * const dependents = await formulaEngine.getRangeDependents([
     *   { unitId: 'workbook1', sheetId: 'sheet1', range: { startRow: 0, endRow: 9, startColumn: 0, endColumn: 1 } }
     * ]);
     *
     * console.log('Dependent formulas:', dependents);
     * ```
     */
    getRangeDependents(
        unitRanges: IUnitRange[],
        timeout = 30_000
    ): Promise<IFormulaDependencyTreeJson[]> {
        return new Promise((resolve, reject) => {
            const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetQueryFormulaDependencyResultMutation.id) {
                    return;
                }

                const params = command.params as ISetFormulaDependencyCalculationResultMutation;

                clearTimeout(timer);
                disposable.dispose();

                if (params.result != null) {
                    resolve(params.result);
                } else {
                    resolve([]);
                }
            });

            const timer = setTimeout(() => {
                disposable.dispose();
                reject(new Error('Range dependents calculation timeout'));
            }, timeout);

            this._commandService.executeCommand(
                SetQueryFormulaDependencyMutation.id,
                { unitRanges },
                { onlyLocal: true }
            );
        });
    }

    /**
     * Retrieve the dependency trees of all formulas *inside* the specified ranges.
     * Unlike `getRangeDependents`, this API only returns formulas whose definitions
     * physically reside within the queried ranges.
     *
     * Internally this triggers the same dependency-calculation command but with
     * `isInRange = true`, and the promise resolves when the results are ready.
     *
     * @param unitRanges An array of workbook/sheet ranges defining the lookup
     *   boundaries:
     *   - `unitId`  The workbook ID.
     *   - `sheetId` The sheet ID.
     *   - `range`   The zero-based grid range.
     *
     * @param {number} [timeout]
     *        Optional timeout in milliseconds. If no result is received within this
     *        period, the promise will be rejected.
     *
     * @returns {Promise<IFormulaDependencyTreeJson[]>}
     *          A promise that resolves with an array of `IFormulaDependencyTreeJson`
     *          describing every formula found in the provided ranges along with
     *          their parent/child relationships.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Query all formulas that lie within A1:D20 in Sheet1.
     * const formulasInRange = await formulaEngine.getInRangeFormulas([
     *   { unitId: 'workbook1', sheetId: 'sheet1', range: { startRow: 0, endRow: 19, startColumn: 0, endColumn: 3 } }
     * ]);
     *
     * console.log('Formulas inside range:', formulasInRange);
     * ```
     */
    getInRangeFormulas(
        unitRanges: IUnitRange[],
        timeout = 30_000
    ): Promise<IFormulaDependencyTreeJson[]> {
        return new Promise((resolve, reject) => {
            const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetQueryFormulaDependencyResultMutation.id) {
                    return;
                }

                const params = command.params as ISetFormulaDependencyCalculationResultMutation;

                clearTimeout(timer);
                disposable.dispose();

                if (params.result != null) {
                    resolve(params.result);
                } else {
                    resolve([]);
                }
            });

            const timer = setTimeout(() => {
                disposable.dispose();
                reject(new Error('In-range formulas calculation timeout'));
            }, timeout);

            this._commandService.executeCommand(
                SetQueryFormulaDependencyMutation.id,
                { unitRanges, isInRange: true },
                { onlyLocal: true }
            );
        });
    }

    /**
     * Enable or disable emitting formula dependency trees after each formula calculation.
     *
     * When enabled, the formula engine will emit the dependency trees produced by
     * each completed formula calculation through the internal command system.
     * Consumers can obtain the result by listening for the corresponding
     * calculation-result command.
     *
     * When disabled, dependency trees will not be emitted.
     *
     * This option only controls whether dependency trees are exposed.
     * It does not affect formula calculation behavior.
     *
     * @param {boolean} value
     *        Whether to emit formula dependency trees after calculation.
     *        - `true`: Emit dependency trees after each calculation.
     *        - `false`: Do not emit dependency trees (default behavior).
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * // Enable dependency tree emission
     * formulaEngine.setFormulaReturnDependencyTree(true);
     *
     * // Listen for dependency trees produced by formula calculation
     * const trees = await new Promise<IFormulaDependencyTreeJson[]>((resolve, reject) => {
     *   const timer = setTimeout(() => {
     *     disposable.dispose();
     *     reject(new Error('Timeout waiting for formula dependency trees'));
     *   }, 30_000);
     *
     *   const disposable = commandService.onCommandExecuted((command) => {
     *     if (command.id !== SetFormulaDependencyCalculationResultMutation.id) {
     *       return;
     *     }
     *
     *     clearTimeout(timer);
     *     disposable.dispose();
     *
     *     const params = command.params as ISetFormulaDependencyCalculationResultMutation;
     *     resolve(params.result ?? []);
     *   });
     * });
     *
     * console.log('Dependency trees:', trees);
     * ```
     */
    setFormulaReturnDependencyTree(value: boolean): void {
        this._configService.setConfig(ENGINE_FORMULA_RETURN_DEPENDENCY_TREE, value);
    }

    /**
     * Parse a formula string and return its **formula expression tree**.
     *
     * This API analyzes the syntactic structure of a formula and builds an
     * expression tree that reflects how the formula is composed (functions,
     * operators, ranges, and nested expressions), without performing calculation
     * or dependency evaluation.
     *
     * The returned tree is suitable for:
     * - Formula structure visualization
     * - Explaining complex formulas (e.g. LET / LAMBDA)
     * - Debugging or inspecting formula composition
     * - Building advanced formula tooling
     *
     * ---
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * const formula = '=LET(x,SUM(A1,B1,A1:B10),y,OFFSET(A1:B10,0,1),SUM(x,y)+x)+1';
     *
     * const exprTree = formulaEngine.getFormulaExpressTree(formula);
     *
     * console.log(exprTree);
     * ```
     *
     * Example output (simplified):
     *
     * ```json
     * {
     *   "value": "let(x,sum(A1,B1,A1:B10),y,offset(A1:B10,0,1),sum(x,y)+x)+1",
     *   "children": [
     *     {
     *       "value": "let(x,sum(A1,B1,A1:B10),y,offset(A1:B10,0,1),sum(x,y)+x)",
     *       "children": [
     *         {
     *           "value": "sum(A1,B1,A1:B10)",
     *           "children": [
     *             {
     *               "value": "A1:B10",
     *               "children": []
     *             }
     *           ]
     *         },
     *         {
     *           "value": "offset(A1:B10,0,1)",
     *           "children": [
     *             {
     *               "value": "A1:B10",
     *               "children": []
     *             }
     *           ]
     *         }
     *       ]
     *     }
     *   ]
     * }
     * ```
     *
     * @param formulaString The formula string to parse (with or without leading `=`)
     * @returns A formula expression tree describing the hierarchical structure of the formula
     */
    getFormulaExpressTree(formulaString: string, unitId: string): IExprTreeNode | null {
        return this._lexerTreeBuilder.getFormulaExprTree(formulaString, unitId, this._functionService.hasExecutor.bind(this._functionService), this._definedNamesService.getValueByName.bind(this._definedNamesService), this._superTableService.getTable.bind(this._superTableService));
    }

    /**
     * Retrieve **both**:
     * 1) the full dependency trees of all formulas that **depend on** the specified ranges, and
     * 2) the dependency trees of all formulas that **physically reside inside** the specified ranges.
     *
     * This is a convenience API that combines the behaviors of
     * `getRangeDependents` and `getInRangeFormulas` into a single call.
     *
     * Internally, it triggers a local dependency-calculation command once and
     * resolves when both result sets are available, avoiding duplicate
     * calculations and event listeners.
     *
     * @param unitRanges An array of workbook/sheet ranges to query. Each range
     *   includes:
     *   - `unitId`  The workbook ID.
     *   - `sheetId` The sheet ID.
     *   - `range`   The zero-based row/column boundaries.
     *
     * @param {number} [timeout]
     *        Optional timeout in milliseconds. If the dependency calculation does
     *        not complete within this period, the promise will be rejected.
     *
     * @returns {Promise<IFormulaDependentsAndInRangeResults>}
     *          A promise that resolves with an object containing:
     *          - `dependents`: Dependency trees of all formulas that depend on the
     *            specified ranges (upstream consumers).
     *          - `inRanges`: Dependency trees of all formulas whose definitions
     *            are located inside the specified ranges.
     *
     * @example
     * ```ts
     * const formulaEngine = univerAPI.getFormula();
     *
     * const result = await formulaEngine.getRangeDependentsAndInRangeFormulas([
     *   {
     *     unitId: 'workbook1',
     *     sheetId: 'sheet1',
     *     range: { startRow: 0, endRow: 9, startColumn: 0, endColumn: 1 },
     *   },
     * ]);
     *
     * console.log('Dependent formulas:', result.dependents);
     * console.log('Formulas inside range:', result.inRanges);
     * ```
     */
    getRangeDependentsAndInRangeFormulas(
        unitRanges: IUnitRange[],
        timeout = 30_000
    ): Promise<IFormulaDependentsAndInRangeResults> {
        return new Promise((resolve, reject) => {
            const disposable = this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetQueryFormulaDependencyAllResultMutation.id) {
                    return;
                }

                const params = command.params as ISetQueryFormulaDependencyAllResultMutation;

                clearTimeout(timer);
                disposable.dispose();

                if (params.result != null) {
                    resolve(params.result);
                } else {
                    resolve({ dependents: [], inRanges: [] });
                }
            });

            const timer = setTimeout(() => {
                disposable.dispose();
                reject(new Error('Range dependents calculation timeout'));
            }, timeout);

            this._commandService.executeCommand(
                SetQueryFormulaDependencyAllMutation.id,
                { unitRanges },
                { onlyLocal: true }
            );
        });
    }
}
