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

import { Disposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export interface IProgressCount {
    count: number;
}

export interface IProgressStep {
    step: number;
}

export interface IProgressService {
    progressChange$: Observable<IProgressStep>;
    progressVisible$: Observable<boolean>;

    /**
     * Append subtask quantity during loading, when the number of added subtasks reaches the total number of tasks, the loading is completed.
     * @param task
     */
    pushTask(task: IProgressCount): void;

    /**
     * Insert a new number of tasks, do not set the start loading mechanism, when insertTaskCount finds that the original number of tasks is 0, it starts loading
     * @param count
     */
    insertTaskCount(count: number): void;

    /**
     * Complete loading, hide the progress bar after automatically progressing to 100%
     */
    complete(): void;

    /**
     * Interrupt and hide the progress bar directly
     */
    stop(): void;

    /**
     * Get the total number of tasks
     */
    getTaskCount(): number;
}

export class ProgressService extends Disposable implements IProgressService, IDisposable {
    /**
     * The total number of tasks remaining
     */
    private _taskCount: number = 0;

    private readonly _progressChange$ = new Subject<IProgressStep>();

    private readonly _progressVisible$ = new Subject<boolean>();

    readonly progressChange$ = this._progressChange$.asObservable();

    readonly progressVisible$ = this._progressVisible$.asObservable();

    override dispose(): void {
        super.dispose();
        this._clear();
        this._progressChange$.complete();
        this._progressVisible$.complete();
    }

    pushTask(task: IProgressCount) {
        if (this._taskCount === 0) {
            return;
        }

        const { count } = task;
        if (count <= 0) {
            return;
        }

        const step = Math.min(1, count / this._taskCount);

        this._progressChange$.next({
            step,
        });

        this._taskCount -= count;

        if (this._taskCount < 0) {
            this._taskCount = 0;
        }

        if (this._taskCount === 0) {
            this._progressVisible$.next(false);
        }
    }

    insertTaskCount(count: number) {
        if (count <= 0) {
            return;
        }

        if (this._taskCount === 0) {
            this._progressVisible$.next(true);
        }

        this._taskCount += count;
    }

    complete() {
        if (this._taskCount === 0) {
            return;
        }

        this._progressChange$.next({
            step: 1,
        });

        this._clear();
        this._progressVisible$.next(false);
    }

    stop(): void {
        if (this._taskCount === 0) {
            return;
        }

        this._clear();
        this._progressVisible$.next(false);
    }

    getTaskCount(): number {
        return this._taskCount;
    }

    private _clear() {
        this._taskCount = 0;
    }
}

export const IProgressService = createIdentifier<IProgressService>(
    'univer.progress.service'
);
