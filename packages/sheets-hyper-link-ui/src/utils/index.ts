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

import type { DocumentDataModel, IAccessor, Workbook, Worksheet } from '@univerjs/core';
import { DataValidationType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetDataValidationModel } from '@univerjs/sheets-data-validation';

export const getShouldDisableCellLink = (accessor: IAccessor, worksheet: Worksheet, row: number, col: number) => {
    const cell = worksheet.getCell(row, col);
    if (cell?.f || cell?.si) {
        return true;
    }
    const disables = [
        DataValidationType.CHECKBOX,
        DataValidationType.LIST,
        DataValidationType.LIST_MULTIPLE,
    ];
    const dataValidationModel = accessor.has(SheetDataValidationModel) ? accessor.get(SheetDataValidationModel) : null;
    const rule = dataValidationModel?.getRuleByLocation(worksheet.getUnitId(), worksheet.getSheetId(), row, col);
    if (rule && disables.includes(rule.type)) {
        return true;
    }

    return false;
};

export const getShouldDisableCurrentCellLink = (accessor: IAccessor) => {
    const unit = accessor.get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    if (!unit) {
        return true;
    }
    const worksheet = unit.getActiveSheet();
    const selections = accessor.get(SheetsSelectionsService).getCurrentSelections();
    if (!selections.length) {
        return true;
    }
    const row = selections[0].range.startRow;
    const col = selections[0].range.startColumn;
    return getShouldDisableCellLink(accessor, worksheet, row, col);
};

export const shouldDisableAddLink = (accessor: IAccessor) => {
    const textSelectionService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textRanges = textSelectionService.getTextRanges();
    if (!textRanges?.length) {
        return true;
    }

    const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!doc || textRanges.every((range) => range.collapsed)) {
        return true;
    }

    const body = doc.getSelfOrHeaderFooterModel(textRanges[0].segmentId).getBody();
    if (!body) {
        return true;
    }

    return false;
};
