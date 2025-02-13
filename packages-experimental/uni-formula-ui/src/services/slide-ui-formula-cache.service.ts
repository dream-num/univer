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

import { CustomRangeType, Disposable } from '@univerjs/core';
import { ISlideEditorBridgeService } from '@univerjs/slides-ui';
import { IUniFormulaService } from '@univerjs/uni-formula';
import type { RichText } from '@univerjs/engine-render';
import type { IAddSlideUniFormulaCommandParams } from '../commands/commands/slide.command';
import type { UniFormulaService } from './uni-formula.service';

export class SlideUIFormulaCacheService extends Disposable {
    private readonly _caches: Map<string, IAddSlideUniFormulaCommandParams> = new Map();

    constructor(
        @ISlideEditorBridgeService private readonly _editorBridgeService: ISlideEditorBridgeService,
        @IUniFormulaService private readonly _uniFormulaService: UniFormulaService
    ) {
        super();

        this._editorBridgeService.endEditing$.subscribe((richText) => this._checkApplyCache(richText));
    }

    writeCache(rangeId: string, params: IAddSlideUniFormulaCommandParams) {
        if (this._caches.size && this._caches.values().next().value?.unitId !== params.unitId) {
            this.clearCache();
        }

        this._caches.set(rangeId, params);
    }

    private _checkApplyCache(richText: RichText) {
        const document = richText.documentData;
        const customRanges = document.body?.customRanges;
        if (!customRanges || customRanges.length === 0) {
            this.clearCache();
            return;
        };

        // Check if there are custom ranges in the rich text. If there are, we would write apply the cache
        // to the uni formula service
        customRanges.forEach((range) => {
            if (range.rangeType === CustomRangeType.UNI_FORMULA) {
                const cache = this._caches.get(range.rangeId);
                if (cache) {
                    this._applyCache(range.rangeId, cache);
                } else {
                    throw new Error('[SlideUIFormulaCacheService]: cache not found!');
                }
            }
        });

        this.clearCache();
    }

    private _applyCache(rangeId: string, cache: IAddSlideUniFormulaCommandParams) {
        const { unitId, pageId, elementId, f } = cache;
        this._uniFormulaService.registerSlideFormula(unitId, pageId, elementId, rangeId, f);
    }

    clearCache() {
        this._caches.clear();
    }
}
