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

import { createIdentifier } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import type { IDisposable, Nullable } from '@univerjs/core';
import type { Observable } from 'rxjs';

export interface IZenEditorManagerService {
    position$: Observable<Nullable<DOMRect>>;

    dispose(): void;
    setPosition(param: DOMRect): void;
    getPosition(): Readonly<Nullable<DOMRect>>;
}

export class ZenEditorManagerService implements IDisposable {
    private _position: Nullable<DOMRect> = null;

    private readonly _position$ = new BehaviorSubject<Nullable<DOMRect>>(null);
    readonly position$ = this._position$.asObservable();

    dispose(): void {
        this._position$.complete();
        this._position = null;
    }

    setPosition(param: DOMRect) {
        this._position = param;

        this._refresh(param);
    }

    getPosition(): Readonly<Nullable<DOMRect>> {
        return this._position;
    }

    private _refresh(param: DOMRect): void {
        this._position$.next(param);
    }
}

export const IZenEditorManagerService = createIdentifier<ZenEditorManagerService>(
    'univer.sheet-zen-editor-manager.service'
);
