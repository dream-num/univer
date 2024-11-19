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

import type { DocumentDataModel, IAccessor, ITextRange, Workbook, Worksheet } from '@univerjs/core';
import { BuildTextUtils, CustomRangeType, DataValidationType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { SheetsSelectionsService } from '@univerjs/sheets';

export enum DisableLinkType {
    ALLOWED = 0,
    DISABLED_BY_CELL = 1,
    ALLOW_ON_EDITING = 2,
}

export const getShouldDisableCellLink = (worksheet: Worksheet, row: number, col: number) => {
    const cell = worksheet.getCell(row, col);
    if (cell?.f || cell?.si) {
        return DisableLinkType.DISABLED_BY_CELL;
    }
    const disables = [
        DataValidationType.CHECKBOX,
        DataValidationType.LIST,
        DataValidationType.LIST_MULTIPLE,
    ];

    if (cell?.dataValidation && disables.includes(cell.dataValidation.rule.type)) {
        return DisableLinkType.DISABLED_BY_CELL;
    }

    if (cell?.p?.drawingsOrder?.length) {
        return DisableLinkType.ALLOW_ON_EDITING;
    }

    return DisableLinkType.ALLOWED;
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
    return getShouldDisableCellLink(worksheet, row, col) === DisableLinkType.DISABLED_BY_CELL;
};

export const shouldDisableAddLink = (accessor: IAccessor) => {
    const textSelectionService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textRanges = textSelectionService.getDocRanges();
    if (!textRanges.length || textRanges.length > 1) {
        return true;
    }

    const activeRange = textRanges[0];
    const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!doc || !activeRange || activeRange.collapsed) {
        return true;
    }

    const body = doc.getSelfOrHeaderFooterModel(activeRange.segmentId).getBody();
    if (!body) {
        return true;
    }
    const paragraphs = body?.paragraphs ?? [];

    for (let i = 0, len = paragraphs.length; i < len; i++) {
        const p = paragraphs[i];
        if (activeRange.startOffset! <= p.startIndex && activeRange.endOffset! > p.startIndex) {
            return true;
        }

        if (p.startIndex > activeRange.endOffset!) {
            break;
        }
    }

    const customBlock = body.customBlocks?.find((block) => block.startIndex >= activeRange.startOffset! && block.startIndex < activeRange.endOffset!);
    if (customBlock) {
        return true;
    }

    const insertCustomRanges = BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(activeRange as ITextRange, body.customRanges ?? []);
    // can't insert hyperlink in range contains other custom ranges
    return !insertCustomRanges.every((range) => range.rangeType === CustomRangeType.HYPERLINK);
};
