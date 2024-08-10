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
import { IUniFormulaService } from '@univerjs/uni-formula';
import type { IAddSlideUniFormulaCommandParams } from '../commands/commands/slide.command';
import type { UniFormulaService } from './uni-formula.service';

export class SlideUIFormulaCacheService extends Disposable {
    private readonly _caches: IAddSlideUniFormulaCommandParams[] = [];

    constructor(
        @IUniFormulaService private readonly _uniFormulaService: UniFormulaService
    ) {
        super();
    }

    writeCache(params: IAddSlideUniFormulaCommandParams) {
        if (this._caches.length && this._caches[this._caches.length - 1].elementId === params.elementId) {
            this._caches.length = 0;
        }

        this._caches.push(params);
    }

    applyCache() {

    }

    abortCache() {
        this._caches.length = 0;
    }
}
