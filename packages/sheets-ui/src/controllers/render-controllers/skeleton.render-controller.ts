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

import type { Nullable, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { ISheetSkeletonManagerParam } from '../../services/sheet-skeleton-manager.service';
import { Disposable, Inject } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';

export class SheetSkeletonRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this.disposeWithMe(this._context.unit.sheetDisposed$.subscribe((sheet) => {
            this._sheetSkeletonManagerService.disposeSkeleton(sheet.getSheetId());
        }));

        this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param: Nullable<ISheetSkeletonManagerParam>) => {
            this._updateSceneSize(param);
        });
    }

    private _updateSceneSize(param: Nullable<ISheetSkeletonManagerParam>) {
        if (param == null) {
            return;
        }

        const { unitId } = this._context;
        const { skeleton } = param;
        const scene = this._renderManagerService.getRenderById(unitId)?.scene;

        if (skeleton == null || scene == null) {
            return;
        }

        const { rowTotalHeight, columnTotalWidth, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } =
            skeleton;
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;

        scene?.transformByState({
            width: rowHeaderWidthAndMarginLeft + columnTotalWidth,
            height: columnHeaderHeightAndMarginTop + rowTotalHeight,
        });
    }
}
