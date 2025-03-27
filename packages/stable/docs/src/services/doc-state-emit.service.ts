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

import type { JSONXActions, Nullable } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { RxDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

interface IDocChangeState {
    actions: JSONXActions;
    textRanges: Nullable<ITextRangeWithStyle[]>;
}

export interface IDocStateChangeParams {
    commandId: string;
    unitId: string;
    trigger: Nullable<string>;
    redoState: IDocChangeState;
    undoState: IDocChangeState;
    segmentId?: string;
    noHistory?: boolean;
    debounce?: boolean;
}

export interface IDocStateChangeInfo extends IDocStateChangeParams {
    isCompositionEnd?: boolean;
    isSync?: boolean;
    syncer?: string;
}

export class DocStateEmitService extends RxDisposable {
    private readonly _docStateChangeParams$ = new BehaviorSubject<Nullable<IDocStateChangeInfo>>(null);
    readonly docStateChangeParams$ = this._docStateChangeParams$.asObservable();

    constructor() {
        super();
    }

    emitStateChangeInfo(params: IDocStateChangeInfo) {
        this._docStateChangeParams$.next(params);
    }

    override dispose(): void {
        super.dispose();

        this._docStateChangeParams$.complete();
    }
}
