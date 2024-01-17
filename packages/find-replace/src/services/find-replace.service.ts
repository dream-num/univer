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
import { Inject, Injector, createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type FindProgressFn = () => void;

export interface IFindComplete {
    results: IFindResult[];
}

export interface IFindResult<T = unknown> {
    provider: string;
    range: T;
}

/**
 * FindResult is constructed per unit. When the content changes, the
 * find results could emit this event.
 */
export class FindResult {

}

export interface IFindProgressItem { }

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
    readonly stateUpdates$: Observable<Partial<IFindReplaceState>>;
    readonly state$: Observable<IFindReplaceState>;

    /**
     * Register a find replace provider to the service. The provider is the actual bearer to
     * perform the find in different kinds of documents or different environments.
     *
     * @param provider the find replace provider
     */
    registerFindReplaceProvider(provider: IFindReplaceProvider): IDisposable;

    /**
     * Start a find & replace session.
     *
     * @returns if the find & replace session is created and user could start find replace
     */
    start(): boolean;

    end(): boolean;

    revealReplace(): void;
    changeFindString(value: string): void;
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
 * This class stores find replace results and provides methods to perform replace or something.
 */
export class FindReplaceModel extends Disposable {
    constructor(
        private readonly _state: FindReplaceState,
        private readonly _providers: Set<IFindReplaceProvider>,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this._state.stateUpdates$.subscribe((newState) => {
            // Should restart
            if (newState.findString) {
                this.find().then((results) => {
                    this._logService.debug('debug', newState.findString, results);
                });
            }
        });
    }

    async find(): Promise<IFindComplete> {
        this._cancelFinding();

        // TODO: support async search in the future
        const providers = Array.from(this._providers);
        const promises = await Promise.all(
            providers.map((provider) =>
                provider.find({
                    text: this._state.findString,
                })
            )
        );

        return {
            results: promises.map((c) => c.results).flat(),
        };
    }

    private _cancelFinding(): void {
        // Cancel finding in progress. This method is not empty because all finding now is synchronous.
    }
}

export interface IFindReplaceState {
    revealed: boolean;

    /** The string user inputs in the input box. */
    findString: string;
    replaceString?: string;

    /** Indicates if is in replacing mode. */
    replaceRevealed: boolean;

    /** The currently focused match's index (1-based). */
    matchesPosition: number;
    matchesCount: number;
}

function createInitFindReplaceState(): IFindReplaceState {
    return {
        revealed: true,
        findString: '',
        replaceRevealed: false,
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
    private readonly _stateUpdates$ = new Subject<Partial<IFindReplaceState>>();
    readonly stateUpdates$: Observable<Partial<IFindReplaceState>> = this._stateUpdates$.asObservable();

    private readonly _state$ = new BehaviorSubject<IFindReplaceState>(createInitFindReplaceState());
    readonly state$ = this._state$.asObservable();
    get state(): IFindReplaceState {
        return this._state$.getValue();
    }

    // TODO@wzhudev: put all state properties here
    private _findString: string = '';
    private _revealed = false;
    private _replaceRevealed = false;
    private _matchesPosition = 0;
    private _matchesCount = 0;

    get findString(): string {
        return this._findString;
    }

    changeState(changes: Partial<IFindReplaceState>): void {
        let changed = false;
        const changedState: Partial<IFindReplaceState> = {};

        if (typeof changes.findString !== 'undefined' && changes.findString !== this._findString) {
            this._findString = changes.findString;
            changedState.findString = this._findString;
            changed = true;
        }

        if (typeof changes.revealed !== 'undefined' && changes.revealed !== this._revealed) {
            this._revealed = changes.revealed;
            changedState.revealed = changes.revealed;
            changed = true;
        }

        if (typeof changes.replaceRevealed !== 'undefined' && changes.replaceRevealed !== this._replaceRevealed) {
            this._replaceRevealed = changes.replaceRevealed;
            changedState.replaceRevealed = changes.replaceRevealed;
            changed = true;
        }

        if (changed) {
            this._stateUpdates$.next(changedState);
            this._state$.next({
                findString: this._findString,
                revealed: this._revealed,
                replaceRevealed: this._replaceRevealed,
                matchesCount: this._matchesCount,
                matchesPosition: this._matchesPosition,
            });
        }
    }
}

// Since Univer' Find&Replace features works in a plugin manner,
// each `IFind&Replace` provider should have their own implementations
// of 'state' and 'model'.

export class FindReplaceService extends Disposable implements IFindReplaceService {
    private readonly _providers = new Set<IFindReplaceProvider>();
    private readonly _state = new FindReplaceState();
    private _model: Nullable<FindReplaceModel>;

    get stateUpdates$() {
        return this._state.stateUpdates$;
    }
    get state$() {
        return this._state.state$;
    }

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();
    }

    changeFindString(value: string): void {
        this._state.changeState({
            findString: value,
        });
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

    revealReplace(): void {
        this._state.changeState({ replaceRevealed: true });
    }

    disposeModel(): void {
        this._model?.dispose();
        this._model = null;
    }

    start(): boolean {
        if (this._providers.size === 0) {
            return false;
        }

        this._model = this._injector.createInstance(FindReplaceModel, this._state, this._providers);

        const newState = createInitFindReplaceState();
        newState.revealed = true;

        this._state.changeState(newState);

        return true;
    }

    end(): boolean {
        this._state.changeState({ revealed: false, replaceRevealed: false });
        return true;
    }

    registerFindReplaceProvider(provider: IFindReplaceProvider): IDisposable {
        this._providers.add(provider);
        return toDisposable(() => this._providers.delete(provider));
    }
}
