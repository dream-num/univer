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

import type { Workbook } from '@univerjs/core';
import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IRenderContext } from '@univerjs/engine-render';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Ready, SheetSkeletonRenderController)
export class SheetSkeletonRenderController extends Disposable {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();

        this._initRemoveSheet();
    }

    private _initRemoveSheet() {
        this.disposeWithMe(this._context.unit.sheetDisposed$.subscribe((sheet) => {
            this._sheetSkeletonManagerService.disposeSkeleton({
                sheetId: sheet.getSheetId(),
            });
        }));
    }
}
