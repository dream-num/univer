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

import type { DocumentDataModel, ICommand, ICustomColumnGroup, ICustomTable, IDocumentBody } from '@univerjs/core';
import type { ISuccinctDocRangeParam } from '@univerjs/engine-render';
import { CommandType, DataStreamTreeTokenType, DOC_RANGE_TYPE, getParagraphContentStartOffsets, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';

interface ISelectAllCommandParams { }

export const DocSelectAllCommand: ICommand<ISelectAllCommandParams> = {
    id: 'doc.command.select-all',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const docRanges = docSelectionManagerService.getDocRanges();
        const activeRange = docRanges.find((range) => range.isActive) ?? docRanges[0];
        if (docDataModel == null || activeRange == null) {
            return false;
        }

        const { segmentId } = activeRange;
        const unitId = docDataModel.getUnitId();
        const body = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (body == null) {
            return false;
        }

        const { dataStream } = body;
        if (dataStream === '\r\n') {
            return true;
        }

        const scopes = getSelectAllScopes(body, activeRange);
        const currentScopeIndex = scopes.findIndex((scope) => isSameRanges(docRanges, scope));
        const textRanges = scopes[Math.min(currentScopeIndex + 1, scopes.length - 1)];

        docSelectionManagerService.replaceDocRanges(textRanges, {
            unitId,
            subUnitId: unitId,
        }, false);

        return true;
    },
};

function getWholeDocumentRanges(body: IDocumentBody): ISuccinctDocRangeParam[] {
    return getRangesForOffsets(body, 0, body.dataStream.length - 2);
}

function getRangesForOffsets(body: IDocumentBody, startOffset: number, endOffset: number): ISuccinctDocRangeParam[] {
    const columnGroups = [...(body.columnGroups ?? [])].sort((left, right) => left.startIndex - right.startIndex);
    const ranges: ISuccinctDocRangeParam[] = [];
    let offset = startOffset;

    for (const columnGroup of columnGroups) {
        if (columnGroup.endIndex < startOffset || columnGroup.startIndex > endOffset) {
            continue;
        }

        if (offset < columnGroup.startIndex) {
            ranges.push(...getRangesWithTables(body, offset, Math.min(endOffset, columnGroup.startIndex - 1)));
        }

        for (const column of getColumnRanges(body, columnGroup)) {
            const start = Math.max(startOffset, column.startOffset!);
            const end = Math.min(endOffset, column.endOffset!);
            if (start <= end) {
                ranges.push(...getRangesWithTables(body, start, end));
            }
        }

        offset = columnGroup.endIndex + 1;
    }

    if (offset <= endOffset) {
        ranges.push(...getRangesWithTables(body, offset, endOffset));
    }

    return ranges;
}

function getRangesWithTables(body: IDocumentBody, startOffset: number, endOffset: number): ISuccinctDocRangeParam[] {
    const ranges: ISuccinctDocRangeParam[] = [];
    let offset = startOffset;

    for (const table of [...(body.tables ?? [])].sort((left, right) => left.startIndex - right.startIndex)) {
        const { startIndex, endIndex } = table;
        if (startIndex < startOffset || endIndex > endOffset) {
            continue;
        }

        if (offset !== startIndex) {
            ranges.push(...getTextRangesByParagraphs(body, offset, startIndex - 1));
        }

        ranges.push(getTableRectRange(table));
        offset = endIndex;
    }

    if (offset <= endOffset) {
        ranges.push(...getTextRangesByParagraphs(body, offset, endOffset));
    }

    return ranges;
}

function getTextRangesByParagraphs(body: IDocumentBody, startOffset: number, endOffset: number): ISuccinctDocRangeParam[] {
    if (startOffset > endOffset) {
        return [];
    }

    const paragraphs = [...(body.paragraphs ?? [])].sort((left, right) => left.startIndex - right.startIndex);
    const ranges: ISuccinctDocRangeParam[] = [];
    let offset = startOffset;

    for (const paragraph of paragraphs) {
        if (paragraph.startIndex < offset) {
            continue;
        }

        if (paragraph.startIndex > endOffset) {
            break;
        }

        ranges.push({
            startOffset: offset,
            endOffset: paragraph.startIndex,
            rangeType: DOC_RANGE_TYPE.TEXT,
        });
        offset = paragraph.startIndex + 1;
    }

    if (offset <= endOffset) {
        ranges.push({
            startOffset: offset,
            endOffset,
            rangeType: DOC_RANGE_TYPE.TEXT,
        });
    }

    return ranges;
}

function getSelectAllScopes(body: IDocumentBody, activeRange: ISuccinctDocRangeParam): ISuccinctDocRangeParam[][] {
    const scopes: ISuccinctDocRangeParam[][] = [];
    const addScope = (scope: ISuccinctDocRangeParam[] | null) => {
        if (scope?.length && !scopes.some((existing) => isSameRanges(existing, scope))) {
            scopes.push(scope);
        }
    };
    const startOffset = activeRange.startOffset;
    const endOffset = activeRange.endOffset;
    if (startOffset == null || endOffset == null) {
        return [getWholeDocumentRanges(body)];
    }

    const table = (body.tables ?? []).find((item) => isRangeInside(startOffset, endOffset, item.startIndex, item.endIndex));
    const customBlock = (body.customBlocks ?? []).find((item) => item.startIndex >= startOffset && item.startIndex <= endOffset);
    const blockRange = (body.blockRanges ?? []).find((item) => isRangeInside(startOffset, endOffset, item.startIndex, item.endIndex));
    if (table) {
        addScope([getTableRectRange(table)]);
    } else if (customBlock) {
        addScope([{
            endOffset: customBlock.startIndex,
            rangeType: DOC_RANGE_TYPE.TEXT,
            startOffset: customBlock.startIndex,
        }]);
    } else if (blockRange) {
        addScope([{
            endOffset: Math.max(blockRange.startIndex + 1, blockRange.endIndex - 1),
            rangeType: DOC_RANGE_TYPE.TEXT,
            startOffset: blockRange.startIndex + 1,
        }]);
    } else {
        const paragraphRange = clampParagraphRangeByTables(getParagraphRangeAtOffset(body, startOffset), body.tables ?? [], startOffset);
        addScope(paragraphRange ? [{ ...paragraphRange, rangeType: DOC_RANGE_TYPE.TEXT }] : null);
    }

    const columnGroup = (body.columnGroups ?? []).find((item) => isRangeInside(startOffset, endOffset, item.startIndex, item.endIndex));
    if (columnGroup) {
        const columns = getColumnRanges(body, columnGroup);
        const column = columns.find((item) => isRangeInside(startOffset, endOffset, item.startOffset!, item.endOffset!));
        if (column) {
            addScope(getRangesForOffsets(body, column.startOffset!, column.endOffset!));
        }
        addScope(getRangesForOffsets(body, columnGroup.startIndex, columnGroup.endIndex));
    }

    addScope(getWholeDocumentRanges(body));
    return scopes;
}

function getColumnRanges(body: IDocumentBody, columnGroup: ICustomColumnGroup): ISuccinctDocRangeParam[] {
    const ranges: ISuccinctDocRangeParam[] = [];
    let startOffset: number | undefined;

    for (let index = columnGroup.startIndex; index <= columnGroup.endIndex; index++) {
        const token = body.dataStream[index];
        if (token === DataStreamTreeTokenType.COLUMN_START) {
            startOffset = index + 1;
        } else if (token === DataStreamTreeTokenType.COLUMN_END && startOffset != null) {
            ranges.push({ startOffset, endOffset: index - 1, rangeType: DOC_RANGE_TYPE.TEXT });
            startOffset = undefined;
        }
    }

    return ranges;
}

function clampParagraphRangeByTables(
    paragraphRange: Pick<ISuccinctDocRangeParam, 'endOffset' | 'startOffset'> | null,
    tables: ICustomTable[],
    activeOffset: number
): Pick<ISuccinctDocRangeParam, 'endOffset' | 'startOffset'> | null {
    if (!paragraphRange) {
        return null;
    }

    const nextRange = { ...paragraphRange };
    for (const table of tables) {
        if (activeOffset < table.startIndex && nextRange.startOffset! < table.startIndex && table.startIndex <= nextRange.endOffset!) {
            nextRange.endOffset = table.startIndex - 1;
        } else if (activeOffset >= table.endIndex && nextRange.startOffset! <= table.endIndex && table.endIndex < nextRange.endOffset!) {
            nextRange.startOffset = table.endIndex;
        }
    }

    return nextRange.startOffset! <= nextRange.endOffset! ? nextRange : null;
}

function getTableRectRange(table: ICustomTable): ISuccinctDocRangeParam {
    return {
        startOffset: table.startIndex + 3,
        endOffset: table.endIndex - 5,
        rangeType: DOC_RANGE_TYPE.RECT,
    };
}

function getParagraphRangeAtOffset(body: IDocumentBody, offset: number): Pick<ISuccinctDocRangeParam, 'endOffset' | 'startOffset'> | null {
    const sortedParagraphs = [...(body.paragraphs ?? [])].sort((left, right) => left.startIndex - right.startIndex);
    const paragraphStartOffsets = getParagraphContentStartOffsets(body);
    for (const paragraph of sortedParagraphs) {
        const startOffset = paragraphStartOffsets.get(paragraph.startIndex) ?? 0;
        if (startOffset <= offset && offset <= paragraph.startIndex) {
            return {
                endOffset: paragraph.startIndex,
                startOffset,
            };
        }
    }

    return null;
}

function isRangeInside(startOffset: number, endOffset: number, scopeStart: number, scopeEnd: number): boolean {
    return startOffset >= scopeStart && endOffset <= scopeEnd;
}

function isSameRanges(currentRanges: ISuccinctDocRangeParam[], nextRanges: ISuccinctDocRangeParam[]): boolean {
    if (currentRanges.length !== nextRanges.length) {
        return isSameTextRangeCoverage(currentRanges, nextRanges);
    }

    return currentRanges.every((currentRange, index) => {
        const nextRange = nextRanges[index];
        const sameType = getRangeType(currentRange) === getRangeType(nextRange);
        const sameTextEnd = sameType &&
            getRangeType(nextRange) === DOC_RANGE_TYPE.TEXT &&
            !(currentRange as ISuccinctDocRangeParam & { collapsed?: boolean }).collapsed &&
            currentRange.endOffset! + 1 === nextRange.endOffset;

        return currentRange.startOffset === nextRange.startOffset &&
            (currentRange.endOffset === nextRange.endOffset || sameTextEnd) &&
            sameType;
    });
}

function isSameTextRangeCoverage(currentRanges: ISuccinctDocRangeParam[], nextRanges: ISuccinctDocRangeParam[]): boolean {
    if (nextRanges.length !== 1 || getRangeType(nextRanges[0]) !== DOC_RANGE_TYPE.TEXT) {
        return false;
    }

    const targetRange = nextRanges[0];
    if (targetRange.startOffset == null || targetRange.endOffset == null) {
        return false;
    }

    if (currentRanges.some((range) => getRangeType(range) !== DOC_RANGE_TYPE.TEXT || range.startOffset == null || range.endOffset == null)) {
        return false;
    }

    const startOffset = Math.min(...currentRanges.map((range) => range.startOffset!));
    const endOffset = Math.max(...currentRanges.map((range) => range.endOffset!));
    return startOffset === targetRange.startOffset &&
        endOffset === targetRange.endOffset &&
        currentRanges.every((range) => range.startOffset! >= targetRange.startOffset! && range.endOffset! <= targetRange.endOffset!);
}

function getRangeType(range: ISuccinctDocRangeParam): DOC_RANGE_TYPE {
    return range.rangeType ?? DOC_RANGE_TYPE.TEXT;
}
