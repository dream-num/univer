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

import type { IExecutionInProgressParams, ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { Disposable } from '@univerjs/core';
import { FormulaExecutedStateType, FormulaExecuteStageType } from '@univerjs/engine-formula';
import { BehaviorSubject, Subject } from 'rxjs';

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

    markResultEmitted(result: ISetFormulaCalculationResultMutation, hasResultToApply: boolean): void {
        if (this._currentResult !== result) {
            this._hasEmittedCurrentResultApplied = false;
        }

        this._currentResult = result;
        const resultApplied = this.state.resultApplied || !hasResultToApply;
        this._emit({
            ...this.state,
            resultEmitted: true,
            resultApplied,
        });

        if (resultApplied) {
            this._emitResultApplied();
        }
    }

    markResultApplied(): void {
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
                subscription.unsubscribe();
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

            let startTimer: ReturnType<typeof setTimeout> | null = null;

            const clearStartTimer = () => {
                if (startTimer != null) {
                    clearTimeout(startTimer);
                    startTimer = null;
                }
            };

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

            const subscription = this.state$.subscribe((state) => {
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
