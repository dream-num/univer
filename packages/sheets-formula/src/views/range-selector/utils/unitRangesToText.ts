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

import { serializeRange, serializeRangeWithSheet, serializeRangeWithSpreadsheet } from '@univerjs/engine-formula';
import type { IUnitRangeName, IUniverInstanceService, Workbook } from '@univerjs/core';

export function getSheetIdByName(univerInstanceService: IUniverInstanceService, unitId: string, name: string) {
    return univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetName(name)?.getSheetId() || '';
}
export function getSheetNameById(univerInstanceService: IUniverInstanceService, unitId: string, sheetId: string) {
    return univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(sheetId)?.getName() || '';
}

export const unitRangesToText = (ranges: IUnitRangeName[], unitId: string, subUnitId: string, univerInstanceService: IUniverInstanceService) => {
    return ranges.map((item) => {
        if (item.unitId === unitId || !item.unitId) {
            const sheetId = getSheetIdByName(univerInstanceService, unitId, item.sheetName);
            if (sheetId === subUnitId || !sheetId) {
                return serializeRange(item.range);
            } else {
                return serializeRangeWithSheet(item.sheetName, item.range);
            }
        } else {
            return serializeRangeWithSpreadsheet(item.unitId, item.sheetName, item.range);
        }
    });
};
