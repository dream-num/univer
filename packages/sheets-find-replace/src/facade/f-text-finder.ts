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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import type { IFindComplete, IFindMatch, IFindReplaceState } from '@univerjs/find-replace';
import { Disposable, Inject, Injector, IUniverInstanceService } from '@univerjs/core';
import { createInitFindReplaceState, FindBy, FindReplaceModel, FindReplaceState, IFindReplaceService } from '@univerjs/find-replace';
import { FRange } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFTextFinder {
    /**
     * Get all the matched cells of the current sheet, the current matched cell is the last matched cell.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @returns {FRange[]} All the matched cells.
     * @throws If the find operation is not completed.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13]
     * ]);
     *
     * // Create a text-finder to find the text '5'.
     * const textFinder = await univerAPI.createTextFinderAsync('5');
     *
     * // Find all cells that contain the text '5'.
     * const matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation()); // D2, C3, B4, A5
     * });
     * ```
     */
    findAll(): FRange[];

    /**
     * Get the next matched cell of the current sheet, if exists return the next matched cell and move the current matched cell to the next matched cell.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @returns {Nullable<FRange>} The next matched cell.
     * @throws If the find operation is not completed.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13]
     * ]);
     *
     * // Create a text-finder to find the text '5'.
     * const textFinder = await univerAPI.createTextFinderAsync('5');
     * console.log(textFinder.getCurrentMatch().getA1Notation()); // current match cell is A5
     *
     * // Find the next matched range
     * const nextMatch = textFinder.findNext();
     * console.log(nextMatch.getA1Notation()); // D2
     * console.log(textFinder.getCurrentMatch().getA1Notation()); // current match cell is D2
     * ```
     */
    findNext(): Nullable<FRange>;

    /**
     * Get the previous matched cell of the current sheet, if exists return the previous matched cell and move the current matched cell to the previous matched cell.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @returns {Nullable<FRange>} The previous matched cell.
     * @throws If the find operation is not completed.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13]
     * ]);
     *
     * // Create a text-finder to find the text '5'.
     * const textFinder = await univerAPI.createTextFinderAsync('5');
     * console.log(textFinder.getCurrentMatch().getA1Notation()); // current match cell is A5
     *
     * // Find the previous matched range.
     * const previousMatch = textFinder.findPrevious();
     * console.log(previousMatch.getA1Notation()); // B4
     * console.log(textFinder.getCurrentMatch().getA1Notation()); // current match cell is B4
     * ```
     */
    findPrevious(): Nullable<FRange>;

    /**
     * Get the current matched cell of the current sheet.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @returns {Nullable<FRange>} The current matched cell.
     * @throws If the find operation is not completed.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13]
     * ]);
     *
     * // Create a text-finder to find the text '5'.
     * const textFinder = await univerAPI.createTextFinderAsync('5');
     *
     * // Get the current matched range.
     * const currentMatch = textFinder.getCurrentMatch();
     * console.log(currentMatch.getA1Notation()); // A5
     * ```
     */
    getCurrentMatch(): Nullable<FRange>;

    /**
     * Set the match case option, if true, the find operation will match case, otherwise, the find operation will ignore case.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @param {boolean} matchCase - Whether to match case.
     * @returns {Promise<IFTextFinder>} The text-finder instance.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D1');
     * fRange.setValues([
     *   ['hello univer', 'hello UNIVER', 'HELLO UNIVER', 'HELLO univer'],
     * ]);
     *
     * // Create a text-finder to find the text 'univer'.
     * const textFinder = await univerAPI.createTextFinderAsync('univer');
     * let matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation()); // A1, B1, C1, D1
     * });
     *
     * // Set the match case.
     * await textFinder.matchCaseAsync(true);
     * matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation()); // A1, D1
     * });
     * ```
     */
    matchCaseAsync(matchCase: boolean): Promise<IFTextFinder>;

    /**
     * Set the match entire cell option, if true, the find operation will match entire cell value, otherwise, the find operation will match part of the cell value.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @param {boolean} matchEntireCell - Whether to match entire cell value.
     * @returns {Promise<IFTextFinder>} The text-finder instance.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D1');
     * fRange.setValues([
     *   ['hello univer', 'hello univer 1', 'hello univer 2', 'hello univer 3'],
     * ]);
     *
     * // Create a text-finder to find the text 'hello univer'.
     * const textFinder = await univerAPI.createTextFinderAsync('hello univer');
     * let matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation()); // A1, B1, C1, D1
     * });
     *
     * // Set the match entire cell.
     * await textFinder.matchEntireCellAsync(true);
     * matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation()); // A1
     * });
     * ```
     */
    matchEntireCellAsync(matchEntireCell: boolean): Promise<IFTextFinder>;

    /**
     * Set the match formula text option, if true, the find operation will match formula text, otherwise, the find operation will match value.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @param {boolean} matchFormulaText - Whether to match formula text.
     * @returns {Promise<IFTextFinder>} The text-finder instance.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D1');
     * fRange.setValues([
     *   ['sum', '1', '=SUM(2)', '3'],
     * ]);
     *
     * // Create a text-finder to find the text 'sum'.
     * const textFinder = await univerAPI.createTextFinderAsync('sum');
     * let matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation()); // A1
     * });
     *
     * // Set the match entire cell.
     * await textFinder.matchFormulaTextAsync(true);
     * matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation()); // A1, C1
     * });
     * ```
     */
    matchFormulaTextAsync(matchFormulaText: boolean): Promise<IFTextFinder>;

    /**
     * Replace all the matched text with the given text.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @param {string} replaceText - The text to replace.
     * @returns {Promise<number>} The count of replaced text.
     * @throws If the find operation is not completed.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D1');
     * fRange.setValues([
     *   ['hello', 'hello', 'hello', 'hello'],
     * ]);
     *
     * // Create a text-finder to find the text 'hello'.
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     *
     * // Replace all the matched text with 'hello univer'.
     * const count = await textFinder.replaceAllWithAsync('hello univer');
     * console.log(count); // 4
     * console.log(fRange.getValues()); // [['hello univer', 'hello univer', 'hello univer', 'hello univer']]
     * ```
     */
    replaceAllWithAsync(replaceText: string): Promise<number>;

    /**
     * Replace the current matched text with the given text.
     * If current sheet changed, use `await textFinder.ensureCompleteAsync()` to ensure the find operation is completed.
     * @param {string} replaceText - The text to replace.
     * @returns {Promise<boolean>} Whether the replace is successful.
     * @throws If the find operation is not completed.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('B1:E1');
     * fRange.setValues([
     *   ['hello', 'hello', 'hello', 'hello'],
     * ]);
     *
     * // Create a text-finder to find the text 'hello'.
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     *
     * // Replace the current matched text with 'hello univer'.
     * const replaced = await textFinder.replaceWithAsync('hello univer');
     * console.log(replaced); // true
     * console.log(fRange.getValues()); // [['hello', 'hello', 'hello', 'hello univer']]
     * ```
     */
    replaceWithAsync(replaceText: string): Promise<boolean>;

    /**
     * Ensure the find operation is completed. Especially when the current sheet changed use this method to ensure the find operation is completed.
     * @returns {Promise<Nullable<IFindComplete>>} The find complete result.
     * @example
     * ```typescript
     * // Create a text-finder to find the text '1'.
     * const textFinder = await univerAPI.createTextFinderAsync('1');
     *
     * // Find all cells that contain the text '1'.
     * const matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation());
     * });
     *
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const sheets = fWorkbook.getSheets();
     *
     * // Change the current sheet to the second sheet.
     * sheets[1]?.activate();
     *
     * // Ensure the find operation is completed of the current sheet.
     * await textFinder.ensureCompleteAsync();
     * const matchCells2 = textFinder.findAll();
     * matchCells2.forEach((cell) => {
     *   console.log(cell.getA1Notation());
     * });
     * ```
     */
    ensureCompleteAsync(): Promise<Nullable<IFindComplete>>;
}

/**
 * This interface class provides methods to find and replace text in the univer.
 * @hideconstructor
 */
export class FTextFinder extends Disposable implements IFTextFinder {
    private readonly _state = new FindReplaceState();
    private _model: Nullable<FindReplaceModel>;
    private _complete: Nullable<IFindComplete>;
    constructor(
        _initialState: Partial<IFindReplaceState>,
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IFindReplaceService private readonly _findReplaceService: IFindReplaceService
    ) {
        super();
        const providers = this._findReplaceService.getProviders();
        this._model = this._injector.createInstance(FindReplaceModel, this._state, providers);
        const newState = {
            ...createInitFindReplaceState(),
            ..._initialState,
        };
        this._state.changeState(newState);
    }

    findAll(): FRange[] {
        if (!this._state.findCompleted || !this._complete) {
            return [];
        }
        return this._complete.results.map((result) => {
            return this._findMatchToFRange(result);
        });
    }

    findNext(): Nullable<FRange> {
        if (!this._state.findCompleted || !this._complete) {
            return null;
        }
        const match = this._model?.moveToNextMatch();
        if (!match) {
            return null;
        }
        return this._findMatchToFRange(match);
    }

    findPrevious(): Nullable<FRange> {
        const match = this._model?.moveToPreviousMatch();
        if (!match) {
            return null;
        }
        return this._findMatchToFRange(match);
    }

    getCurrentMatch(): Nullable<FRange> {
        if (!this._state.findCompleted || !this._complete) {
            throw new Error('Find operation is not completed.');
        }
        const match = this._model?.currentMatch$.value;
        if (!match) {
            return null;
        }
        return this._findMatchToFRange(match);
    }

    async matchCaseAsync(matchCase: boolean): Promise<IFTextFinder> {
        this._state.changeState({ caseSensitive: matchCase, findCompleted: false });
        return new Promise((resolve) => {
            const subscribe = this._state.stateUpdates$.subscribe(async (state) => {
                if (state.findCompleted === true) {
                    subscribe.unsubscribe();
                    await this.ensureCompleteAsync();
                    resolve(this);
                }
            });
        });
    }

    async matchEntireCellAsync(matchEntireCell: boolean): Promise<IFTextFinder> {
        this._state.changeState({ matchesTheWholeCell: matchEntireCell, findCompleted: false });
        return new Promise((resolve) => {
            const subscribe = this._state.stateUpdates$.subscribe(async (state) => {
                if (state.findCompleted === true) {
                    subscribe.unsubscribe();
                    await this.ensureCompleteAsync();
                    resolve(this);
                }
            });
        });
    }

    async matchFormulaTextAsync(matchFormulaText: boolean): Promise<IFTextFinder> {
        this._state.changeState({ findBy: matchFormulaText ? FindBy.FORMULA : FindBy.VALUE, findCompleted: false });
        return new Promise((resolve) => {
            const subscribe = this._state.stateUpdates$.subscribe(async (state) => {
                if (state.findCompleted === true) {
                    subscribe.unsubscribe();
                    await this.ensureCompleteAsync();
                    resolve(this);
                }
            });
        });
    }

    async replaceAllWithAsync(replaceText: string): Promise<number> {
        await this._state.changeState({ replaceRevealed: true, replaceString: replaceText });
        const res = (await this._model?.replaceAll())?.success ?? 0;
        this._state.changeState({ replaceRevealed: false });
        return res;
    }

    async replaceWithAsync(replaceText: string): Promise<boolean> {
        await this._state.changeState({ replaceRevealed: true, replaceString: replaceText });
        await this._model?.replace();
        this._state.changeState({ replaceRevealed: false });
        return true;
    }

    async ensureCompleteAsync(): Promise<Nullable<IFindComplete>> {
        this._complete = await this._model?.start();
    };

    private _findMatchToFRange(match: IFindMatch): FRange {
        const { unitId } = match;
        const { subUnitId, range } = match.range as { subUnitId: string; range: IRange };
        const workbook = this._univerInstanceService.getUnit(unitId) as Workbook;
        const worksheet = workbook.getSheetBySheetId(subUnitId)!;
        return this._injector.createInstance(FRange, workbook, worksheet, range);
    }
}
