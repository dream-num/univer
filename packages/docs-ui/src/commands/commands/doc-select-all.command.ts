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

import type { DocumentDataModel, ICommand, ICustomTable, IDocumentBody } from '@univerjs/core';
import type { ISuccinctDocRangeParam } from '@univerjs/engine-render';
import { CommandType, DOC_RANGE_TYPE, getParagraphContentStartOffsets, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
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

        const wholeDocRanges = getWholeDocumentRanges(body);
        const scopedRange = getScopedSelectAllRange(body, activeRange);
        const textRanges = scopedRange && !isSameRanges(docRanges, scopedRange) ? scopedRange : wholeDocRanges;

        docSelectionManagerService.replaceDocRanges(textRanges, {
            unitId,
            subUnitId: unitId,
        }, false);

        return true;
    },
};

function getWholeDocumentRanges(body: IDocumentBody): ISuccinctDocRangeParam[] {
    const textRanges: ISuccinctDocRangeParam[] = [];
    let offset = 0;

    for (const table of body.tables ?? []) {
        const { startIndex, endIndex } = table;
        if (offset !== startIndex) {
            textRanges.push(...getTextRangesByParagraphs(body, offset, startIndex - 1));
        }

        textRanges.push(getTableRectRange(table));
        offset = endIndex;
    }

    if (offset !== body.dataStream.length - 2) {
        textRanges.push(...getTextRangesByParagraphs(body, offset, body.dataStream.length - 2));
    }

    return textRanges;
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

function getScopedSelectAllRange(body: IDocumentBody, activeRange: ISuccinctDocRangeParam): ISuccinctDocRangeParam[] | null {
    const startOffset = activeRange.startOffset;
    const endOffset = activeRange.endOffset;
    if (startOffset == null || endOffset == null) {
        return null;
    }

    const table = (body.tables ?? []).find((item) => isRangeInside(startOffset, endOffset, item.startIndex, item.endIndex));
    if (table) {
        return [getTableRectRange(table)];
    }

    const customBlock = (body.customBlocks ?? []).find((item) => item.startIndex >= startOffset && item.startIndex <= endOffset);
    if (customBlock) {
        return [{
            endOffset: customBlock.startIndex,
            rangeType: DOC_RANGE_TYPE.TEXT,
            startOffset: customBlock.startIndex,
        }];
    }

    const blockRange = (body.blockRanges ?? []).find((item) => isRangeInside(startOffset, endOffset, item.startIndex, item.endIndex));
    if (blockRange) {
        return [{
            endOffset: Math.max(blockRange.startIndex + 1, blockRange.endIndex - 1),
            rangeType: DOC_RANGE_TYPE.TEXT,
            startOffset: blockRange.startIndex + 1,
        }];
    }

    const paragraphRange = clampParagraphRangeByTables(getParagraphRangeAtOffset(body, startOffset), body.tables ?? [], startOffset);
    return paragraphRange
        ? [{
            ...paragraphRange,
            rangeType: DOC_RANGE_TYPE.TEXT,
        }]
        : null;
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
        return currentRange.startOffset === nextRange.startOffset &&
            currentRange.endOffset === nextRange.endOffset &&
            getRangeType(currentRange) === getRangeType(nextRange);
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
