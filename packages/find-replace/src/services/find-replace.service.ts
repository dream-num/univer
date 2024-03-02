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
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

export type FindProgressFn = () => void;

export interface IFindComplete<T extends IFindMatch = IFindMatch> {
    results: T[];
}

export interface IFindMatch<T = unknown> {
    provider: string;
    unitId: string;
    range: T;
}

export abstract class FindModel extends Disposable {
    abstract readonly unitId: string;

    abstract getMatches(): IFindMatch[];

    abstract moveToNextMatch(loop?: boolean): IFindMatch | null;
    abstract moveToPreviousMatch(loop?: boolean): IFindMatch | null;
}

/**
 * A provider should be implemented by a business to provide the find results.
 */
export interface IFindReplaceProvider {
    find(query: IFindQuery): Promise<FindModel[]>;
    cancel(): void;
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
    moveToNextMatch(): void;
    moveToPreviousMatch(): void;
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

        if (typeof changes.matchesCount !== 'undefined' && changes.matchesCount !== this._matchesCount) {
            this._matchesCount = changes.matchesCount;
            changedState.matchesCount = changes.matchesCount;
            changed = true;
        }

        if (typeof changes.matchesPosition !== 'undefined' && changes.matchesPosition !== this._matchesPosition) {
            this._matchesPosition = changes.matchesPosition;
            changedState.matchesPosition = changes.matchesPosition;
            changed = true;
            // TODO@wzhudev: maybe we should recalc matches position according to the current selections position
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

/**
 * This class stores find replace results and provides methods to perform replace or something.
 */
export class FindReplaceModel extends Disposable {
    private _matchPositionFindModel?: Nullable<FindModel> = null;
    private _findModels: FindModel[] = [];
    private _matches: IFindMatch[] = [];
    private _positionModel: FindModel | null = null;

    constructor(
        private readonly _state: FindReplaceState,
        private readonly _providers: Set<IFindReplaceProvider>,
        @ILogService private readonly _logService: ILogService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        // Should restart finding when the following conditions changed
        this._state.stateUpdates$.subscribe((newState) => {
            if (typeof newState.findString !== 'undefined') {
                if (newState.findString) {
                    this.find();
                } else {
                    this._cancelFinding();
                }
            }
        });
    }

    async find(): Promise<IFindComplete> {
        this._cancelFinding();

        const providers = Array.from(this._providers);
        const findModels = (this._findModels = (
            await Promise.all(providers.map((provider) => provider.find({ text: this._state.findString })))
        ).flat());

        const matches = findModels.map((c) => c.getMatches()).flat();
        this._matches = matches;

        if (!matches.length) {
            return {
                results: [],
            };
        }

        const index = this._moveToInitialMatch(findModels, matches);
        this._state.changeState({
            matchesCount: matches.length,
            matchesPosition: index + 1, //  the matches position start from 1
        });

        return {
            results: matches,
        };
    }

    moveToNextMatch(): void {
        if (!this._positionModel) {
            return;
        }

        const loopInCurrentUnit = this._findModels.length === 1;
        const nextMatch = this._positionModel.moveToNextMatch(loopInCurrentUnit);
        if (nextMatch) {
            const index = this._matches.findIndex((value) => value === nextMatch);
            this._state.changeState({
                matchesPosition: index + 1,
            });
        } else {
            // search in the next find model
            const indexOfPositionModel = this._findModels.findIndex((m) => m === this._positionModel);
            const nextPositionModel = this._findModels[(indexOfPositionModel + 1) % this._findModels.length]; // TODO: always loop or not
            const nextMatch = nextPositionModel.moveToNextMatch();
            const index = this._matches.findIndex((value) => value === nextMatch);
            this._positionModel = nextPositionModel;
            this._state.changeState({
                matchesPosition: index + 1,
            });
        }
    }

    moveToPreviousMatch(): void {
        if (!this._positionModel) {
            return;
        }

        const loopInCurrentUnit = this._findModels.length === 1;
        const nextMatch = this._positionModel.moveToPreviousMatch(loopInCurrentUnit);
        if (nextMatch) {
            const index = this._matches.findIndex((value) => value === nextMatch);
            this._state.changeState({
                matchesPosition: index + 1,
            });
        } else {
            const indexOfPositionModel = this._findModels.findIndex((m) => m === this._positionModel);
            const nextPositionModel =
                this._findModels[(indexOfPositionModel - 1 + this._findModels.length) % this._findModels.length];
            const nextMatch = nextPositionModel.moveToPreviousMatch();
            const index = this._matches.findIndex((value) => value === nextMatch);
            this._positionModel = nextPositionModel;
            this._state.changeState({
                matchesPosition: index + 1,
            });
        }
    }

    // TODO@wzhudev: some cold could definitely be reused. Reuse them.

    private _moveToInitialMatch(findModels: FindModel[], results: IFindMatch[]): number {
        const focusedUnitId = this._univerInstanceService.getFocusedUniverInstance()?.getUnitId();
        if (!focusedUnitId) {
            return -1;
        }

        const findModelOnFocusUnit = findModels.find((model) => model.unitId === focusedUnitId);
        if (findModelOnFocusUnit) {
            this._positionModel = findModelOnFocusUnit;
            const result = findModelOnFocusUnit.moveToNextMatch();
            const index = results.findIndex((value) => value === result);
            return index;
        }

        // otherwise we just simply match the first result
        this._positionModel = findModels[0];
        const nextMatch = this._positionModel.moveToNextMatch();
        const matchPosition = this._matches.findIndex((m) => m === nextMatch);
        return matchPosition;
    }

    private _cancelFinding(): void {
        this._providers.forEach((provider) => provider.cancel());
        this._state.changeState({
            matchesCount: 0,
            matchesPosition: 0,
        });
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

    moveToNextMatch(): void {
        if (this._model) {
            this._model?.moveToNextMatch();
        }
    }

    moveToPreviousMatch(): void {
        if (this._model) {
            this._model?.moveToPreviousMatch();
        }
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
