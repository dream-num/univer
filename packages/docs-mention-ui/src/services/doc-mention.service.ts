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

import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export class DocMentionService extends Disposable {
    private readonly _editing$ = new BehaviorSubject<Nullable<{ unitId: string; index: number }>>(undefined);
    readonly editing$ = this._editing$.asObservable();

    get editing() {
        return this._editing$.value;
    }

    constructor() {
        super();

        this.disposeWithMe(() => {
            this._editing$.complete();
        });
    }

    startEditing(item: { unitId: string; index: number }) {
        this._editing$.next(item);
    }

    endEditing() {
        this._editing$.next(undefined);
    }
}
