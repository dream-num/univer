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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import type { IFindComplete, IFindMatch, IFindReplaceState } from '@univerjs/find-replace';
import { Disposable, Inject, Injector, IUniverInstanceService } from '@univerjs/core';
import { createInitFindReplaceState, FindBy, FindReplaceModel, FindReplaceState, IFindReplaceService } from '@univerjs/find-replace';
import { FRange } from '@univerjs/sheets/facade';

export interface IFTextFinder {
    /**
     * get all the matched range in the univer
     * @returns all the matched range
     * @throws if the find operation is not completed
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * const ranges = textFinder.findAll();
     * ranges.forEach((range) => {
     *    console.log(range.getA1Notation());
     * });
     * ```
     */
    findAll(): FRange[];
    /**
     * find the next matched range in the univer
     * @returns the next matched range
     * @throws if the find operation is not completed
     * @returns null if no more match
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * const range = textFinder.findNext();
     * if (range) {
     *   console.log(range.getA1Notation());
     * }
     * ```
     */
    findNext(): Nullable<FRange>;
    /**
     * find the previous matched range in the univer
     * @returns the previous matched range
     * @throws if the find operation is not completed
     * @returns null if no more match
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * const range = textFinder.findPrevious();
     * if (range) {
     *  console.log(range.getA1Notation());
     * }
     * ```
     */
    findPrevious(): Nullable<FRange>;
    /**
     * get the current matched range in the univer
     * @returns the current matched range
     * @throws if the find operation is not completed
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * const range = textFinder.getCurrentMatch();
     * if (range) {
     * console.log(range.getA1Notation());
     * }
     * ```
     */
    getCurrentMatch(): Nullable<FRange>;

    /**
     * set the match case option
     * @param {boolean} matchCase whether to match case
     * @returns text-finder instance
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * await textFinder.matchCaseAsync(true);
     * ```
     */
    matchCaseAsync(matchCase: boolean): Promise<IFTextFinder>;
    /**
     * set the match entire cell option
     * @param {boolean} matchEntireCell whether to match entire cell
     * @returns text-finder instance
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * await textFinder.matchEntireCellAsync(true);
     * ```
     */
    matchEntireCellAsync(matchEntireCell: boolean): Promise<IFTextFinder>;
    /**
     * set the match formula text option
     * @param {boolean} matchFormulaText whether to match formula text
     * @returns text-finder instance
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * await textFinder.matchFormulaTextAsync(true);
     * ```
     */
    matchFormulaTextAsync(matchFormulaText: boolean): Promise<IFTextFinder>;
    /**
     * replace all the matched text with the given text
     * @param {string} replaceText the text to replace
     * @returns the number of replaced text
     * @throws if the find operation is not completed
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * const replacedCount = await textFinder.replaceAllWithAsync('world');
     * console.log(replacedCount);
     * ```
     */
    replaceAllWithAsync(replaceText: string): Promise<number>;
    /**
     * replace the current matched text with the given text
     * @param {string} replaceText the text to replace
     * @returns whether the replace is successful
     * @throws if the find operation is not completed
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * const replaced = await textFinder.replaceWithAsync('world');
     * console.log(replaced);
     * ```
     */
    replaceWithAsync(replaceText: string): Promise<boolean>;
    /**
     * ensure the find operation is completed
     * @returns the find complete result
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('hello');
     * const complete = await textFinder.ensureCompleteAsync();
     * console.log(complete);
     * ```
     */
    ensureCompleteAsync(): Promise<Nullable<IFindComplete>>;
}

/**
 * This interface class provides methods to find and replace text in the univer.
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
        this._state.changeState({ caseSensitive: matchCase });
        return new Promise((resolve) => {
            const subscribe = this._state.stateUpdates$.subscribe((state) => {
                if (state.findCompleted === true) {
                    subscribe.unsubscribe();
                    resolve(this);
                }
            });
        });
    }

    async matchEntireCellAsync(matchEntireCell: boolean): Promise<IFTextFinder> {
        this._state.changeState({ matchesTheWholeCell: matchEntireCell });
        return new Promise((resolve) => {
            const subscribe = this._state.stateUpdates$.subscribe((state) => {
                if (state.findCompleted === true) {
                    subscribe.unsubscribe();
                    resolve(this);
                }
            });
        });
    }

    async matchFormulaTextAsync(matchFormulaText: boolean): Promise<IFTextFinder> {
        this._state.changeState({ findBy: matchFormulaText ? FindBy.FORMULA : FindBy.VALUE });
        return new Promise((resolve) => {
            const subscribe = this._state.stateUpdates$.subscribe((state) => {
                if (state.findCompleted === true) {
                    subscribe.unsubscribe();
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
        if (!this._state.findCompleted || !this._complete) {
            this._complete = await this._model?.start();
        }
        return this._complete;
    };

    private _findMatchToFRange(match: IFindMatch): FRange {
        const { unitId } = match;
        const { subUnitId, range } = match.range as { subUnitId: string; range: IRange };
        const workbook = this._univerInstanceService.getUnit(unitId) as Workbook;
        const worksheet = workbook.getSheetBySheetId(subUnitId)!;
        return this._injector.createInstance(FRange, workbook, worksheet, range);
    }
}

