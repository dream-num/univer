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

import type { IDisposable, Nullable } from '@univerjs/core';
import type { Subscription } from 'rxjs';
import { Disposable } from '@univerjs/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs';

export type ComputingStatus = boolean;

export class GlobalComputingStatusService extends Disposable {
    private _allSubjects: BehaviorSubject<ComputingStatus>[] = [];

    private readonly _computingStatus$ = new BehaviorSubject<ComputingStatus>(true);
    readonly computingStatus$ = this._computingStatus$.pipe(distinctUntilChanged());

    get computingStatus(): ComputingStatus { return this._computingStatus$.getValue(); }

    private _computingSubscription: Nullable<Subscription>;

    override dispose(): void {
        super.dispose();

        this._computingSubscription?.unsubscribe();

        this._computingStatus$.next(true);
        this._computingStatus$.complete();
        this._allSubjects.forEach((subject) => {
            subject.complete();
        });
    }

    pushComputingStatusSubject(subject: BehaviorSubject<ComputingStatus>): IDisposable {
        this._allSubjects.push(subject);
        this._updateComputingObservable();

        return {
            dispose: () => {
                const index = this._allSubjects.indexOf(subject);
                if (index !== -1) {
                    this._allSubjects.splice(index, 1);
                }

                this._updateComputingObservable();
            },
        };
    }

    private _updateComputingObservable(): void {
        this._computingSubscription?.unsubscribe();

        if (this._allSubjects.length === 0) {
            this._computingStatus$.next(true);
            return;
        }

        this._computingSubscription = combineLatest(this._allSubjects)
            .pipe(map((values) => values.every((v) => v)))
            .subscribe((computing) => this._computingStatus$.next(computing));
    }
}
