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

import { Subject } from 'rxjs';

import { Disposable } from '../../shared/lifecycle';

export interface IError {
    errorKey: string;
}

export class ErrorService extends Disposable {
    private readonly _error$ = new Subject<IError>();
    error$ = this._error$.asObservable();

    override dispose(): void {
        this._error$.complete();
    }

    emit(key: string): void {
        this._error$.next({ errorKey: key });
    }
}
