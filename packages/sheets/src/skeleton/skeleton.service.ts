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

import type { Nullable, SheetSkeleton } from '@univerjs/core';
import { Disposable, Inject, Injector } from '@univerjs/core';

export class SheetSkeletonService extends Disposable {
    private _sheetSkeletonStore: Map<string, Map<string, SheetSkeleton>> = new Map();

    constructor(
        @Inject(Injector) readonly _injector: Injector
    ) {
        // empty
        super();

        this.disposeWithMe(() => {
            this._sheetSkeletonStore = new Map();
        });
    }

    getSkeleton(unitId: string, subUnitId: string): Nullable<SheetSkeleton> {
        if (!this._sheetSkeletonStore.has(unitId)) {
            return undefined;
        }
        return this._sheetSkeletonStore.get(unitId)!.get(subUnitId);
    }

    setSkeleton(unitId: string, subUnitId: string, skeleton: SheetSkeleton) {
        if (!this._sheetSkeletonStore.has(unitId)) {
            this._sheetSkeletonStore.set(unitId, new Map());
        }
        this._sheetSkeletonStore.get(unitId)!.set(subUnitId, skeleton);
    }

    deleteSkeleton(unitId: string, subUnitId: string) {
        if (!this._sheetSkeletonStore.has(unitId)) {
            return;
        }
        this._sheetSkeletonStore.get(unitId)!.delete(subUnitId);
    }
}
