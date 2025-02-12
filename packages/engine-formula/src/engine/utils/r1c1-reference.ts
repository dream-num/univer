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

import { AbsoluteRefType } from '@univerjs/core';
import type { IRange, IUnitRangeName } from '@univerjs/core';

import { handleRefStringInfo } from './reference';

const $relativeRegex = /[\[\]]/g;

function handleR1C1(rowOrColumnString: string, current: number) {
    if ($relativeRegex.test(rowOrColumnString)) {
        const index = Number(rowOrColumnString.replace($relativeRegex, ''));
        return current + index;
    }

    return Number(rowOrColumnString) - 1;
}

function singleReference(refBody: string, currentRow = 0, currentColumn = 0) {
    refBody = refBody.toLocaleUpperCase();

    const refBodyArray = refBody.split(/[RC]/);

    const rowString = refBodyArray[1];

    const columnString = refBodyArray[2];

    const row = handleR1C1(rowString, currentRow);

    const column = handleR1C1(columnString, currentColumn);

    return {
        row,
        column,
        absoluteRefType: AbsoluteRefType.NONE,
    };
}

export function deserializeRangeForR1C1(refString: string, currentRow = 0, currentColumn = 0): IUnitRangeName {
    const { refBody, sheetName, unitId } = handleRefStringInfo(refString);

    const colonIndex = refBody.indexOf(':');

    if (colonIndex === -1) {
        const grid = singleReference(refBody, currentRow, currentColumn);

        const row = grid.row;

        const column = grid.column;

        const absoluteRefType = grid.absoluteRefType;

        const range: IRange = {
            startRow: row,

            startColumn: column,

            endRow: row,

            endColumn: column,

            startAbsoluteRefType: absoluteRefType,

            endAbsoluteRefType: absoluteRefType,
        };

        return {
            unitId,

            sheetName,

            range,
        };
    }

    const refStartString = refBody.substring(0, colonIndex);

    const refEndString = refBody.substring(colonIndex + 1);

    const startGrid = singleReference(refStartString, currentRow, currentColumn);

    const endGrid = singleReference(refEndString, currentRow, currentColumn);

    const startRow = startGrid.row;

    const startColumn = startGrid.column;

    const endRow = endGrid.row;

    const endColumn = endGrid.column;

    return {
        unitId,

        sheetName,

        range: {
            startRow,

            startColumn,

            endRow,

            endColumn,

            startAbsoluteRefType: startGrid.absoluteRefType,

            endAbsoluteRefType: endGrid.absoluteRefType,
        },
    };
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
