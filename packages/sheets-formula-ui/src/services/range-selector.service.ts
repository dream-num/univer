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

import type { IUnitRangeName } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export interface IShowRangeSelectorDialogOptions {
    unitId: string;
    subUnitId: string;
    initialValue?: IUnitRangeName[];
    maxRangeCount?: number;
    supportAcrossSheet?: boolean;
    callback: (ranges: IUnitRangeName[]) => void;
}

export class GlobalRangeSelectorService extends Disposable {
    private _currentSelector$ = new BehaviorSubject<IShowRangeSelectorDialogOptions | null>(null);

    currentSelector$ = this._currentSelector$.asObservable();

    constructor() {
        super();
        this.disposeWithMe(() => {
            this._currentSelector$.getValue()?.callback([]);
            this._currentSelector$.complete();
        });
    }

    showRangeSelectorDialog(opts: IShowRangeSelectorDialogOptions) {
        const callback = opts.callback;
        const request = { ...opts };
        let completed = false;
        const promise = new Promise<IUnitRangeName[]>((resolve) => {
            request.callback = (ranges) => {
                if (completed) {
                    return;
                }
                completed = true;
                // Release this request before its callback can open another selector.
                if (this._currentSelector$.getValue() === request) {
                    this._currentSelector$.next(null);
                }
                resolve(ranges);
                callback(ranges);
            };
        });

        this._currentSelector$.next(request);
        return promise;
    }
}
