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

import type { IRange, Nullable } from '@univerjs/core';
import type { IFindComplete, IFindReplaceProvider } from '@univerjs/find-replace';
import { Inject, Injector } from '@univerjs/core';
import { createInitFindReplaceState, FindBy, FindReplaceModel, FindReplaceState, IFindReplaceService } from '@univerjs/find-replace';

export interface IFTextFinder {
    findAll(): Promise<IRange[]>;
    findNext(): Promise<Nullable<IRange>>;
    findPrevious(): Promise< Nullable<IRange>>;
    getCurrentMatch(): Promise<Nullable<IRange>>;
    matchCase(matchCase: boolean): Promise<IFTextFinder>;

    matchEntireCell(matchEntireCell: boolean): Promise<IFTextFinder>;
    matchFormulaText(matchFormulaText: boolean): Promise<IFTextFinder>;

    replaceAllWith(replaceText: string): Promise<number>;
    replaceWith(replaceText: string): Promise<boolean>;

    //startFrom(startRange: IRange): IFTextFinder;
    //useRegularExpression(useRegularExpression: boolean): IFTextFinder;

}

/**
 * This interface class provides methods to modify the filter settings of a worksheet.
 */
export class FTextFinder implements IFTextFinder {
    private readonly _providers = new Set<IFindReplaceProvider>();
    private readonly _state = new FindReplaceState();
    private _model: Nullable<FindReplaceModel>;
    private _complete: Nullable<IFindComplete>;
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(IFindReplaceService) private readonly _findReplaceService: IFindReplaceService
    ) {
        this._model = this._injector.createInstance(FindReplaceModel, this._state, this._providers);
        const newState = createInitFindReplaceState();
        this._state.changeState(newState);
        this.ensureComplete();
    }

    async findAll(): Promise<IRange[]> {
        const complete = await this.ensureComplete();
        if (!complete) {
            return [];
        }
        return complete.results.map((result) => {
            return result.range as IRange;
        });
    }

    async findNext(): Promise<Nullable<IRange>> {
        const complete = await this.ensureComplete();
        if (!complete) {
            return null;
        }
        return this._model?.moveToNextMatch()?.range as IRange ?? null;
    }

    async findPrevious(): Promise<Nullable<IRange>> {
        return this._model?.moveToPreviousMatch()?.range as IRange ?? null;
    }

    async getCurrentMatch(): Promise<Nullable<IRange>> {
        if (!this._state.findCompleted || !this._complete) {
            throw new Error('Find operation is not completed.');
        }
        return this._model?.currentMatch$.value?.range as IRange ?? null;
    }

    async matchCase(matchCase: boolean): Promise<IFTextFinder> {
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

    async matchEntireCell(matchEntireCell: boolean): Promise<IFTextFinder> {
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

    async matchFormulaText(matchFormulaText: boolean): Promise<IFTextFinder> {
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

    async replaceAllWith(replaceText: string): Promise<number> {
        await this._state.changeState({ replaceRevealed: true, replaceString: replaceText });
        const res = (await this._model?.replaceAll())?.success ?? 0;
        this._state.changeState({ replaceRevealed: false });
        return res;
    }

    async replaceWith(replaceText: string): Promise<boolean> {
        await this._state.changeState({ replaceRevealed: true, replaceString: replaceText });
        await this._model?.replace();
        this._state.changeState({ replaceRevealed: false });
        return true;
    }

    async ensureComplete(): Promise<Nullable<IFindComplete>> {
        if (!this._state.findCompleted || !this._complete) {
            this._complete = await this._model?.start();
        }
        return this._complete;
    };
}
