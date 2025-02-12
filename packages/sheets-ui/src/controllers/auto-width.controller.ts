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

import type { IColAutoWidthInfo, IObjectArrayPrimitiveType, Nullable, Worksheet } from '@univerjs/core';
import type { RenderManagerService } from '@univerjs/engine-render';
import type {
    ISetWorksheetColWidthMutationParams,
} from '@univerjs/sheets';
import type { ISetWorksheetColIsAutoWidthCommandParams } from '../commands/commands/set-worksheet-auto-col-width.command';
import { Disposable, Inject, IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    getSheetCommandTarget,
    SetWorksheetColWidthMutation,
} from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

export const AFFECT_LAYOUT_STYLES = ['ff', 'fs', 'tr', 'tb'];

export const createAutoColWidthUndoMutationsByRedos = (
    params: ISetWorksheetColWidthMutationParams,
    worksheet: Worksheet
): ISetWorksheetColWidthMutationParams => {
    const { unitId, subUnitId, ranges } = params;
    const colWidthObj: IObjectArrayPrimitiveType<Nullable<number>> = {};
    const manager = worksheet.getColumnManager();

    for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        for (let j = range.startColumn; j < range.endColumn + 1; j++) {
            const col = manager.getColumnOrCreate(j);
            colWidthObj[j] = col.w;
        }
    }

    return {
        unitId,
        subUnitId,
        ranges,
        colWidth: colWidthObj,
    };
};

export class AutoWidthController extends Disposable {
    constructor(
        @IRenderManagerService private readonly _renderManagerService: RenderManagerService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    getUndoRedoParamsOfColWidth(params: Required<ISetWorksheetColIsAutoWidthCommandParams>) {
        const defaultValue = { redos: [], undos: [] };
        const { _univerInstanceService: univerInstanceService } = this;

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return defaultValue;

        const { unitId, subUnitId, worksheet } = target;
        const sheetSkeletonService = this._renderManagerService.getRenderById(unitId)!.with<SheetSkeletonManagerService>(SheetSkeletonManagerService);

        if (!sheetSkeletonService.getCurrentParam()) return defaultValue;

        const { skeleton } = sheetSkeletonService.getCurrentParam()!;
        const colsAutoWidthInfo: IColAutoWidthInfo[] = skeleton.calculateAutoWidthInRange(params.ranges);

        const colWidthObject: IObjectArrayPrimitiveType<Nullable<number>> = {};
        for (const { col, width } of colsAutoWidthInfo) {
            colWidthObject[col] = width;
        }
        const redoParams: ISetWorksheetColWidthMutationParams = {
            subUnitId,
            unitId,
            ranges: params.ranges,
            colWidth: colWidthObject,
        };
        const undoParams: ISetWorksheetColWidthMutationParams = createAutoColWidthUndoMutationsByRedos(redoParams, worksheet);
        return {
            undos: [
                {
                    id: SetWorksheetColWidthMutation.id,
                    params: undoParams,
                },
            ],
            redos: [
                {
                    id: SetWorksheetColWidthMutation.id,
                    params: redoParams,
                },
            ],
        };
    }
}
