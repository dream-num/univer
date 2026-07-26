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

import type { Subscription } from 'rxjs';
import type { ISetFormulaCalculationResultMutation } from '../../commands/mutations/set-formula-calculation.mutation';
import type { IExecutionInProgressParams } from '../runtime.service';
import { Disposable } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { FormulaExecutedStateType, FormulaExecuteStageType } from '../runtime.service';

export interface IFormulaCalculationSessionState {
    id: number;
    initialized: boolean;
    started: boolean;
    progress: IExecutionInProgressParams | null;
    stopped: boolean;
    completed: boolean;
    resultEmitted: boolean;
    resultApplied: boolean;
}

export enum FormulaResultApplicationType {
    SHEET = 'sheet',
    BASE = 'base',
    OTHER_FORMULA = 'other-formula',
}

const INITIAL_SESSION_STATE: IFormulaCalculationSessionState = {
    id: 0,
    initialized: false,
    started: false,
    progress: null,
    stopped: false,
    completed: false,
    resultEmitted: false,
    resultApplied: true,
};

export class FormulaCalculationSessionService extends Disposable {
    private readonly _state$ = new BehaviorSubject<IFormulaCalculationSessionState>(INITIAL_SESSION_STATE);

    private readonly _resultApplied$ = new Subject<ISetFormulaCalculationResultMutation>();

    private _currentResult: ISetFormulaCalculationResultMutation | null = null;

    private _hasEmittedCurrentResultApplied = false;

    private _pendingResultApplicationTypes = new Set<FormulaResultApplicationType>();

    private _preAppliedSessionTypes = new Set<FormulaResultApplicationType>();

    private readonly _preAppliedResultTypes = new WeakMap<
        ISetFormulaCalculationResultMutation,
        Set<FormulaResultApplicationType>
    >();

    readonly state$ = this._state$.asObservable();

    readonly resultApplied$ = this._resultApplied$.asObservable();

    get state(): IFormulaCalculationSessionState {
        return this._state$.getValue();
    }

    override dispose(): void {
        super.dispose();
        this._state$.complete();
        this._resultApplied$.complete();
    }

    initialize(): void {
        this._emit({
            ...this.state,
            initialized: true,
        });
    }

    start(): void {
        this._emit({
            id: this.state.id + 1,
            initialized: this.state.initialized,
            started: true,
            progress: null,
            stopped: false,
            completed: false,
            resultEmitted: false,
            resultApplied: false,
        });
        this._currentResult = null;
        this._hasEmittedCurrentResultApplied = false;
        this._pendingResultApplicationTypes.clear();
        this._preAppliedSessionTypes.clear();
    }

    updateProgress(progress: IExecutionInProgressParams): void {
        if (!this.state.started) {
            this.start();
        }

        const noCalculation = (
            progress.stage === FormulaExecuteStageType.START_CALCULATION ||
            progress.stage === FormulaExecuteStageType.START_CALCULATION_ARRAY_FORMULA
        ) && progress.totalFormulasToCalculate + progress.totalArrayFormulasToCalculate === 0;

        this._emit({
            ...this.state,
            progress,
            completed: this.state.completed || progress.stage === FormulaExecuteStageType.CALCULATION_COMPLETED || noCalculation,
            resultApplied: this.state.resultApplied || noCalculation,
        });
    }

    markStopped(): void {
        this._emit({
            ...this.state,
            stopped: true,
            completed: true,
            resultApplied: true,
        });
    }

    markCompleted(state: FormulaExecutedStateType): void {
        const noResultToApply = state === FormulaExecutedStateType.NOT_EXECUTED || state === FormulaExecutedStateType.INITIAL;
        this._emit({
            ...this.state,
            stopped: state === FormulaExecutedStateType.STOP_EXECUTION,
            completed: state !== FormulaExecutedStateType.INITIAL,
            resultApplied: this.state.resultApplied || noResultToApply || state === FormulaExecutedStateType.STOP_EXECUTION,
        });
    }

    markResultEmitted(
        result: ISetFormulaCalculationResultMutation,
        pendingApplications: boolean | Iterable<FormulaResultApplicationType>
    ): void {
        if (this._currentResult !== result) {
            this._hasEmittedCurrentResultApplied = false;
        }

        this._currentResult = result;
        this._pendingResultApplicationTypes = typeof pendingApplications === 'boolean'
            ? new Set(pendingApplications ? [FormulaResultApplicationType.SHEET] : [])
            : new Set(pendingApplications);
        const preAppliedTypes = this._preAppliedResultTypes.get(result);
        this._preAppliedSessionTypes.forEach((type) => this._pendingResultApplicationTypes.delete(type));
        preAppliedTypes?.forEach((type) => this._pendingResultApplicationTypes.delete(type));
        this._preAppliedSessionTypes.clear();
        const resultApplied = this._pendingResultApplicationTypes.size === 0;
        this._emit({
            ...this.state,
            resultEmitted: true,
            resultApplied,
        });

        if (resultApplied) {
            this._emitResultApplied();
        }
    }

    markResultApplied(
        type = FormulaResultApplicationType.SHEET,
        result?: ISetFormulaCalculationResultMutation
    ): void {
        if (result && this._currentResult !== result) {
            const types = this._preAppliedResultTypes.get(result) ?? new Set<FormulaResultApplicationType>();
            types.add(type);
            this._preAppliedResultTypes.set(result, types);
            return;
        }

        if (!this._currentResult) {
            this._preAppliedSessionTypes.add(type);
            return;
        }

        this._pendingResultApplicationTypes.delete(type);
        if (this._pendingResultApplicationTypes.size > 0) {
            return;
        }

        this._emit({
            ...this.state,
            resultApplied: true,
        });
        this._emitResultApplied();
    }

    // eslint-disable-next-line max-lines-per-function
    waitForLatestApplied(timeout?: number, startWatchdog = 500): Promise<void> {
        const initialState = this.state;
        const initialId = initialState.id;
        const waitForInitialization = !initialState.initialized;
        const waitForExistingSession = initialState.started && !this._isAppliedTerminalState(initialState);

        // eslint-disable-next-line max-lines-per-function
        return new Promise((resolve, reject) => {
            let settled = false;
            let pendingResolveId: number | null = null;
            let stoppedResolveTimer: ReturnType<typeof setTimeout> | null = null;
            let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
            let startTimer: ReturnType<typeof setTimeout> | null = null;
            let subscription: Subscription | null = null;

            const clearStartTimer = () => {
                if (startTimer != null) {
                    clearTimeout(startTimer);
                    startTimer = null;
                }
            };

            const cleanup = () => {
                if (timeoutTimer != null) {
                    clearTimeout(timeoutTimer);
                    timeoutTimer = null;
                }
                clearStartTimer();
                if (stoppedResolveTimer != null) {
                    clearTimeout(stoppedResolveTimer);
                    stoppedResolveTimer = null;
                }
                subscription?.unsubscribe();
            };

            const settleResolve = () => {
                if (settled) return;
                settled = true;
                cleanup();
                resolve();
            };

            const settleReject = (error: Error) => {
                if (settled) return;
                settled = true;
                cleanup();
                reject(error);
            };

            const scheduleResolveIfApplied = (state: IFormulaCalculationSessionState) => {
                if (!this._isAppliedTerminalState(state)) {
                    return;
                }

                const resolvingId = state.id;
                pendingResolveId = resolvingId;

                const resolveIfStillLatest = () => {
                    if (settled || pendingResolveId !== resolvingId || this.state.id !== resolvingId || !this._isAppliedTerminalState(this.state)) {
                        return;
                    }

                    settleResolve();
                };

                if (state.stopped && !state.resultEmitted) {
                    if (stoppedResolveTimer != null) {
                        clearTimeout(stoppedResolveTimer);
                    }

                    stoppedResolveTimer = setTimeout(resolveIfStillLatest, 0);
                    return;
                }

                Promise.resolve().then(resolveIfStillLatest);
            };

            if (timeout != null) {
                timeoutTimer = setTimeout(() => {
                    settleReject(new Error('Calculation end timeout'));
                }, timeout);
            }

            const scheduleStartTimer = () => {
                clearStartTimer();
                startTimer = setTimeout(() => {
                    if (this.state.id === initialId && !waitForExistingSession) {
                        settleResolve();
                    }
                }, startWatchdog);
            };

            if (!waitForExistingSession && !waitForInitialization) {
                scheduleStartTimer();
            }

            subscription = this.state$.subscribe((state) => {
                if (state.id !== initialId || waitForExistingSession) {
                    clearStartTimer();
                }

                if (waitForInitialization && state.initialized && state.id === initialId && !state.started) {
                    scheduleStartTimer();
                    return;
                }

                if (state.id === initialId && !waitForExistingSession) {
                    return;
                }

                if (pendingResolveId !== state.id) {
                    pendingResolveId = null;
                }

                if (stoppedResolveTimer != null && pendingResolveId !== state.id) {
                    clearTimeout(stoppedResolveTimer);
                    stoppedResolveTimer = null;
                }

                scheduleResolveIfApplied(state);
            });

            if (waitForExistingSession) {
                scheduleResolveIfApplied(this.state);
            }
        });
    }

    private _emit(state: IFormulaCalculationSessionState): void {
        this._state$.next(state);
    }

    private _emitResultApplied(): void {
        if (this._currentResult == null || this._hasEmittedCurrentResultApplied) {
            return;
        }

        this._hasEmittedCurrentResultApplied = true;
        this._resultApplied$.next(this._currentResult);
    }

    private _isAppliedTerminalState(state: IFormulaCalculationSessionState): boolean {
        if (!state.started || !state.resultApplied) {
            return false;
        }

        return state.stopped || state.completed || state.resultEmitted;
    }
}
