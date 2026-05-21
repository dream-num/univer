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
import { AbsoluteRefType } from '@univerjs/core';
import { serializeRangeToRefString, unquoteSheetName } from './reference';

const $relativeRegex = /[\[\]]/;
const $relativeReplaceRegex = /[\[\]]/g;
const $formulaR1C1ReferenceRegex = /(?:(?:'(?:(?:'')|[^'])+'|(?:\[[^\]\r\n]+\])?[A-Za-z_][A-Za-z0-9_.]*)!)?R(?:\[-?\d+\]|\d*)C(?:\[-?\d+\]|\d*)(?::R(?:\[-?\d+\]|\d*)C(?:\[-?\d+\]|\d*))?/iy;
const $workbookSheetPrefixRegex = /^\[([^\]\r\n]+)\](.*)$/;

function handleR1C1(rowOrColumnString: string, current: number) {
    if (rowOrColumnString === '') {
        return current;
    }

    if ($relativeRegex.test(rowOrColumnString)) {
        const index = Number(rowOrColumnString.replace($relativeReplaceRegex, ''));
        return current + index;
    }

    return Number(rowOrColumnString) - 1;
}

function getAbsoluteRefTypeForR1C1(rowString: string, columnString: string): AbsoluteRefType {
    const rowAbsolute = rowString !== '' && !$relativeRegex.test(rowString);
    const columnAbsolute = columnString !== '' && !$relativeRegex.test(columnString);

    if (rowAbsolute && columnAbsolute) {
        return AbsoluteRefType.ALL;
    }

    if (rowAbsolute) {
        return AbsoluteRefType.ROW;
    }

    if (columnAbsolute) {
        return AbsoluteRefType.COLUMN;
    }

    return AbsoluteRefType.NONE;
}

function splitR1C1RefString(refString: string) {
    let quoteOpened = false;
    let sheetNameIndex = -1;

    for (let index = 0; index < refString.length; index++) {
        const char = refString[index];
        if (char === "'") {
            if (quoteOpened && refString[index + 1] === "'") {
                index++;
                continue;
            }

            quoteOpened = !quoteOpened;
            continue;
        }

        if (char === '!' && !quoteOpened) {
            sheetNameIndex = index;
            break;
        }
    }

    if (sheetNameIndex === -1) {
        return {
            refBody: refString,
            sheetName: '',
            unitId: '',
        };
    }

    let prefix = refString.substring(0, sheetNameIndex);
    const refBody = refString.substring(sheetNameIndex + 1);
    if (prefix[0] === "'" && prefix[prefix.length - 1] === "'") {
        prefix = prefix.substring(1, prefix.length - 1);
    }

    prefix = unquoteSheetName(prefix);

    const unitMatch = $workbookSheetPrefixRegex.exec(prefix);
    if (unitMatch) {
        return {
            refBody,
            unitId: unquoteSheetName(unitMatch[1]),
            sheetName: unitMatch[2],
        };
    }

    return {
        refBody,
        sheetName: prefix,
        unitId: '',
    };
}

function singleReference(refBody: string, currentRow = 0, currentColumn = 0, preserveAbsoluteRefType = false) {
    const normalizedRefBody = refBody.toLocaleUpperCase();

    const refBodyArray = normalizedRefBody.split(/[RC]/);

    const rowString = refBodyArray[1];

    const columnString = refBodyArray[2];

    const row = handleR1C1(rowString, currentRow);

    const column = handleR1C1(columnString, currentColumn);

    return {
        row,
        column,
        absoluteRefType: preserveAbsoluteRefType ? getAbsoluteRefTypeForR1C1(rowString, columnString) : AbsoluteRefType.NONE,
    };
}

export function deserializeRangeForR1C1(refString: string, currentRow = 0, currentColumn = 0, preserveAbsoluteRefType = false): IUnitRangeName {
    const { refBody, sheetName, unitId } = splitR1C1RefString(refString);

    const colonIndex = refBody.indexOf(':');

    if (colonIndex === -1) {
        const grid = singleReference(refBody, currentRow, currentColumn, preserveAbsoluteRefType);

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

    const startGrid = singleReference(refStartString, currentRow, currentColumn, preserveAbsoluteRefType);

    const endGrid = singleReference(refEndString, currentRow, currentColumn, preserveAbsoluteRefType);

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

function isFormulaIdentifierPart(char: string | undefined): boolean {
    return char != null && /[A-Za-z0-9_.$]/.test(char);
}

function readDoubleQuotedString(formulaString: string, startIndex: number): number {
    let index = startIndex + 1;

    while (index < formulaString.length) {
        if (formulaString[index] !== '"') {
            index++;
            continue;
        }

        if (formulaString[index + 1] === '"') {
            index += 2;
            continue;
        }

        return index + 1;
    }

    return formulaString.length;
}

function readSquareBracketExpression(formulaString: string, startIndex: number): number {
    let index = startIndex + 1;

    while (index < formulaString.length) {
        if (formulaString[index] === ']') {
            return index + 1;
        }

        index++;
    }

    return formulaString.length;
}

/**
 * Normalizes R1C1 references in a formula string to A1 references for a target cell.
 *
 * This keeps formula strings executable by Univer's current A1 formula pipeline while
 * preserving R1C1 absolute/relative semantics against the supplied zero-based row/column.
 *
 * @param formulaString Formula text, with or without a leading equals sign.
 * @param currentRow Zero-based row of the target cell.
 * @param currentColumn Zero-based column of the target cell.
 * @returns Formula text with R1C1 references converted to A1 references.
 *
 * @example
 * ```ts
 * normalizeFormulaR1C1ToA1('=SUM(R[-1]C:R[-1]C[2])', 4, 1);
 * // '=SUM(B4:D4)'
 * ```
 */
export function normalizeFormulaR1C1ToA1(formulaString: string, currentRow = 0, currentColumn = 0): string {
    const chunks: string[] = [];
    let index = 0;

    while (index < formulaString.length) {
        const char = formulaString[index];

        if (char === '"') {
            const endIndex = readDoubleQuotedString(formulaString, index);
            chunks.push(formulaString.slice(index, endIndex));
            index = endIndex;
            continue;
        }

        $formulaR1C1ReferenceRegex.lastIndex = index;
        const matched = $formulaR1C1ReferenceRegex.exec(formulaString);
        if (!matched && char === '[') {
            const endIndex = readSquareBracketExpression(formulaString, index);
            chunks.push(formulaString.slice(index, endIndex));
            index = endIndex;
            continue;
        }

        if (matched) {
            const token = matched[0];
            const previousChar = formulaString[index - 1];
            const nextChar = formulaString[index + token.length];

            if (!isFormulaIdentifierPart(previousChar) && !isFormulaIdentifierPart(nextChar)) {
                const rangeName = deserializeRangeForR1C1(token, currentRow, currentColumn, true);
                chunks.push(serializeRangeToRefString(rangeName));
                index += token.length;
                continue;
            }
        }

        chunks.push(char);
        index++;
    }

    return chunks.join('');
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
    const oneBasedIndex = index + 1;
    switch (absoluteRefType) {
        case AbsoluteRefType.ALL:
            return `${oneBasedIndex}`;
        case AbsoluteRefType.ROW:
            return isRow ? `${oneBasedIndex}` : `[${oneBasedIndex}]`;
        case AbsoluteRefType.COLUMN:
            return isRow ? `[${oneBasedIndex}]` : `${oneBasedIndex}`;
        case AbsoluteRefType.NONE:
            return `[${oneBasedIndex}]`;
    }
}
