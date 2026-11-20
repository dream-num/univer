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

import type { IRange, IUnitRangeName } from '@univerjs/core';
import { AbsoluteRefType, MAX_COLUMN_COUNT, MAX_ROW_COUNT, RANGE_TYPE } from '@univerjs/core';
import { handleRefStringInfo } from './reference';

function handleR1C1(rowOrColumnString: string, current: number, limit: number) {
    if (rowOrColumnString === '') {
        return current;
    }
    if (rowOrColumnString.startsWith('[')) {
        const offset = Number(rowOrColumnString.slice(1, -1));
        return Math.abs(offset) < limit ? ((current + offset) % limit + limit) % limit : Number.NaN;
    }

    return Number(rowOrColumnString) - 1;
}

function singleReference(refBody: string, currentRow: number, currentColumn: number) {
    const match = /^(?:R(\d*|\[[+-]?\d+\])(?:C(\d*|\[[+-]?\d+\]))?|C(\d*|\[[+-]?\d+\]))$/i.exec(refBody.trim());
    if (!match) {
        return { row: Number.NaN, column: Number.NaN };
    }
    const [, row, columnWithRow, columnOnly] = match;
    const column = columnWithRow ?? columnOnly;
    return {
        row: row == null ? Number.NaN : handleR1C1(row, currentRow, MAX_ROW_COUNT),
        column: column == null ? Number.NaN : handleR1C1(column, currentColumn, MAX_COLUMN_COUNT),
        rangeType: row == null ? RANGE_TYPE.COLUMN : column == null ? RANGE_TYPE.ROW : RANGE_TYPE.NORMAL,
    };
}

export function deserializeRangeForR1C1(refString: string, currentRow = 0, currentColumn = 0): IUnitRangeName {
    // The R1C1 offset brackets belong to the reference, not the workbook qualifier.
    const qualifierEnd = refString.lastIndexOf('!');
    const { sheetName, unitQualifier } = qualifierEnd < 0
        ? { sheetName: '', unitQualifier: '' }
        : handleRefStringInfo(refString.slice(0, qualifierEnd + 1));
    const refBody = refString.slice(qualifierEnd + 1);
    const colonIndex = refBody.indexOf(':');
    const start = singleReference(colonIndex < 0 ? refBody : refBody.slice(0, colonIndex), currentRow, currentColumn);
    const end = colonIndex < 0 ? start : singleReference(refBody.slice(colonIndex + 1), currentRow, currentColumn);
    const type = start.rangeType === end.rangeType ? start.rangeType : undefined;
    const range: IRange = {
        startRow: Math.min(start.row, end.row),
        startColumn: Math.min(start.column, end.column),
        endRow: Math.max(start.row, end.row),
        endColumn: Math.max(start.column, end.column),
        startAbsoluteRefType: AbsoluteRefType.NONE,
        endAbsoluteRefType: AbsoluteRefType.NONE,
    };
    if (type === RANGE_TYPE.ROW || type === RANGE_TYPE.COLUMN) {
        range.rangeType = type;
    }
    return { unitId: unitQualifier, sheetName, range };
}

export function serializeRangeToR1C1(range: IRange): string {
    const startRowRef = getR1C1Ref(range.startRow, range.startAbsoluteRefType, true);
    const startColumnRef = getR1C1Ref(range.startColumn, range.startAbsoluteRefType, false);
    const endRowRef = getR1C1Ref(range.endRow, range.endAbsoluteRefType, true);
    const endColumnRef = getR1C1Ref(range.endColumn, range.endAbsoluteRefType, false);

    if (startRowRef === endRowRef && startColumnRef === endColumnRef) {
        return `R${startRowRef}C${startColumnRef}`;
    }

    return `R${startRowRef}C${startColumnRef}:R${endRowRef}C${endColumnRef}`;
}

function getR1C1Ref(index: number, absoluteRefType: AbsoluteRefType = AbsoluteRefType.ALL, isRow: boolean): string {
    index += 1;
    switch (absoluteRefType) {
        case AbsoluteRefType.ALL:
            return `${index}`;
        case AbsoluteRefType.ROW:
            return isRow ? `${index}` : `[${index}]`;
        case AbsoluteRefType.COLUMN:
            return isRow ? `[${index}]` : `${index}`;
        case AbsoluteRefType.NONE:
            return `[${index}]`;
    }
}
