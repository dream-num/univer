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

import type { Nullable } from '@univerjs/core';
import { Disposable, ILogService, IUniverInstanceService, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export type FindProgressFn = () => void;

export interface IFindComplete {
    results: IFindResult[];
}

export interface IFindResult<T = unknown> {
    provider: string;
    range: T;
}

export interface IFindProgressItem {}

/**
 * A provider should be implemented by a business to provide the find results.
 */
export interface IFindReplaceProvider {
    find(query: IFindQuery, onProgress?: (p: IFindProgressItem) => void): Promise<IFindComplete>;

    activateFindResult(result: IFindResult): void;
}

/**
 * This service works as a core of the find & replace feature.
 */
export interface IFindReplaceService {
    /**
     * Register a find replace provider to the service. The provider is the actual bearer to
     * perform the find in different kinds of documents or different environments.
     *
     * @param provider the find replace provider
     */
    registerFindReplaceProvider(provider: IFindReplaceProvider): IDisposable;

    /**
     * Start a find & replace session.
     */
    start(): void;

    moveToNextMatch(): boolean;
    moveToPreviousMatch(): boolean;
    replace(): boolean;
    replaceAll(): boolean;

    // /**
    //  * Call this method to start find.
    //  *
    //  * @param query The query object.
    //  * @param onProgress The callback function to report the progress.
    //  */
    // find(query: IFindQuery, onProgress?: FindProgressFn): void;
}

export const IFindReplaceService = createIdentifier<IFindReplaceService>('univer.find-replace.service');

/**
 * The find query object with finding options.
 */
export interface IFindQuery {
    text: string;

    isRegex?: boolean;
    ignoreCase?: boolean;

    /** Other possible options set by business. */
    [key: string]: boolean | string | number | undefined;
}

/**
 * This class stores find replace results.
 */
export class FindReplaceModel extends Disposable {
    constructor(private readonly _state: FindReplaceState) {
        super();

        this._state.state$.subscribe((newState) => {});
    }

    async research(providers: IFindReplaceProvider[], query: IFindQuery): Promise<IFindComplete> {
        // TODO: support async search in the future
        const completes = await Promise.all(providers.map((provider) => provider.find(query)));
        return {
            results: completes.map((c) => c.results).flat(),
        };
    }
}

export interface IFindReplaceState {
    /** The string user inputs in the input box. */
    findString: string;
    replaceString?: string;

    /** The currently focused match's index (1-based). */
    matchesPosition: number;
    matchesCount: number;
}

function createInitFindReplaceState(): IFindReplaceState {
    return {
        findString: '',
        matchesPosition: 0,
        matchesCount: 0,
    };
}

/**
 * This class stores find replace options state. These state are stored
 * here instead of the React component so we can change state from
 * operations.
 */
export class FindReplaceState {
    private readonly _state$ = new BehaviorSubject<IFindReplaceState>(createInitFindReplaceState());
    readonly state$ = this._state$.asObservable(); // TODO@wzhudev: state or stateChange? Only emits changed properties.

    changeState(changes: Partial<IFindReplaceState>): void {}
}

// Since Univer' Find&Replace features works in a plugin manner,
// each `IFind&Replace` provider should have their own implementations
// of 'state' and 'model'.

export class FindReplaceService extends Disposable implements IFindReplaceService {
    private readonly _providers = new Set<IFindReplaceProvider>();
    private readonly _state = new FindReplaceState();
    private _model: Nullable<FindReplaceModel>;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();
    }

    moveToNextMatch(): boolean {
        throw new Error('Method not implemented.');
    }

    moveToPreviousMatch(): boolean {
        return true;
    }

    replace(): boolean {
        return true;
    }

    replaceAll(): boolean {
        return true;
    }

    disposeModel(): void {
        this._model?.dispose();
        this._model = null;
    }

    start(): void {
        // init find & replace state
        this._model = new FindReplaceModel(this._state);
    }

    registerFindReplaceProvider(provider: IFindReplaceProvider): IDisposable {
        this._providers.add(provider);
        return toDisposable(() => this._providers.delete(provider));
    }

    // TODO@wzhudev: this method should be move to Find Model
    async research(query: IFindQuery, onProgress?: FindProgressFn): Promise<void> {
        if (this._providers.size === 0) {
            this._logService.warn(
                '[FindReplaceService]',
                'no find replace provider registered hance cannot perform searching.'
            );

            return;
        }

        const complete = await this._findWithProviders(query, onProgress);
    }

    private _findWithProviders(query: IFindQuery, onProgress?: FindProgressFn): Promise<IFindComplete> {
        return Promise.all(Array.from(this._providers).map((provider) => provider.find(query, onProgress))).then(
            (completes) => {
                return {
                    results: completes.map((c) => c.results).flat(),
                };
            }
        );
    }
}
