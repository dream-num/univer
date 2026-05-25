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

import { Disposable } from '@univerjs/core';

export interface IDocContentInsertRange {
    unitId: string;
    startOffset: number;
    endOffset: number;
    segmentId?: string;
}

export class DocContentInsertService extends Disposable {
    private _range: IDocContentInsertRange | null = null;

    setInsertRange(range: IDocContentInsertRange): void {
        this._range = range;
    }

    consumeInsertRange(unitId?: string): IDocContentInsertRange | null {
        if (!this._range) {
            return null;
        }

        if (unitId && this._range.unitId !== unitId) {
            return null;
        }

        const range = this._range;
        this._range = null;
        return range;
    }

    clearInsertRange(): void {
        this._range = null;
    }
}
