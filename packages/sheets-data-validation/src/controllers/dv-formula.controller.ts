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

import type { ICellDataForSheetInterceptor, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { Disposable, Inject, IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { deserializeRangeWithSheetWithCache, LexerTreeBuilder } from '@univerjs/engine-formula';
import { UnitAction } from '@univerjs/protocol';
import { type ICellPermission, WorksheetViewPermission } from '@univerjs/sheets';

export class DataValidationFormulaController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();
    }

    getFormulaRefCheck(formulaString: string) {
        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formulaString);
        if (!sequenceNodes) {
            return true;
        }
        for (let i = 0; i < sequenceNodes.length; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }
            const { token } = node;
            const sequenceGrid = deserializeRangeWithSheetWithCache(token);
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            let targetSheet: Nullable<Worksheet> = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            if (sequenceGrid.sheetName) {
                targetSheet = workbook.getSheetBySheetName(sequenceGrid.sheetName);
                if (!targetSheet) {
                    return false;
                }
                const subUnitId = targetSheet?.getSheetId();
                const viewPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id);
                if (!viewPermission) return false;
            }
            if (!targetSheet) {
                return false;
            }
            const { startRow, endRow, startColumn, endColumn } = sequenceGrid.range;
            for (let i = startRow; i <= endRow; i++) {
                for (let j = startColumn; j <= endColumn; j++) {
                    const permission = (targetSheet.getCell(i, j) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                    if (permission?.[UnitAction.View] === false) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}
