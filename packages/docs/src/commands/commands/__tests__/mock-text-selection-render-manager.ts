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
import type { ITextSelectionInnerParam } from '@univerjs/engine-render';
import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export class TextSelectionRenderManager {
    private readonly _textSelectionInner$ = new BehaviorSubject<Nullable<ITextSelectionInnerParam>>(null);

    readonly textSelectionInner$ = this._textSelectionInner$.asObservable();

    removeAllTextRanges() {
        // empty
    }

    addTextRanges() {
        // empty
    }
}

export const ITextSelectionRenderManager = createIdentifier<TextSelectionRenderManager>(
    'mock.univer.doc.text-selection-render-manager'
);
