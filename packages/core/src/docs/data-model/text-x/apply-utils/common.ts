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

import type { Nullable } from '../../../../shared/types';
import type {
    ICustomBlock,
    ICustomColumnGroup,
    ICustomDecoration,
    ICustomRange,
    ICustomTable,
    IDocumentBlockRange,
    IDocumentBody,
    IParagraph,
    ISectionBreak,
    ITextRun,
} from '../../../../types/interfaces';
import { shallowEqual } from '../../../../common/equal';
import { horizontalLineSegmentsSubtraction, sortRulesFactory, Tools } from '../../../../shared';
import { isSameStyleTextRun } from '../../../../shared/compare';
import { cloneParagraphWithId } from '../../../paragraph-id';
import { cloneSectionBreakWithId } from '../../../section-break-id';
import { DataStreamTreeTokenType } from '../../types';
import { PRESERVE_INSERTED_PARAGRAPH_IDS } from '../action-types';
import {
    shiftExclusiveRangeOnDelete,
    shiftExclusiveRangeOnInsert,
    shiftInclusiveRangeOnDelete,
    shiftInclusiveRangeOnInsert,
} from '../build-utils/range-interval';
import { getBodySlice } from '../utils';

// Internal TextX undo marker: restored delete bodies keep their captured paragraph ids.
export const RESTORE_INSERTED_PARAGRAPH_IDS = '__textXRestoreParagraphIds';

export function normalizeTextRuns(textRuns: ITextRun[], reserveEmptyTextRun = false): ITextRun[] {
    const results: ITextRun[] = [];

    for (const textRun of textRuns) {
        const { st, ed, ts } = textRun;

        if (textRun.sId === undefined) {
            delete textRun.sId;
        }

        if (st === ed) {
            continue;
        }

        // Delete textRun if it has no style(ts is empty or has no sId)
        if (!reserveEmptyTextRun && Tools.isEmptyObject(ts) && textRun.sId == null) {
            continue;
        }

        if (results.length === 0) {
            results.push(textRun);
            continue;
        }

        const peak = results.pop()!;
        if (
            isSameStyleTextRun(textRun, peak) &&
            Tools.hasIntersectionBetweenTwoRanges(peak.st, peak.ed, textRun.st, textRun.ed)
        ) {
            results.push({
                ...textRun,
                st: peak.st,
                ed,
            });
        } else {
            results.push(peak, textRun);
        }
    }

    return results;
}

/**
 * Inserting styled text content into the current document model.
 * @param body The current content object of the document model.
 * @param insertBody The newly added content object that includes complete text and textRun style information.
 * @param textLength The length of the inserted content text.
 * @param currentIndex Determining the index where the content will be inserted into the current content.
 */

export function insertTextRuns(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { textRuns } = body;

    if (textRuns == null) {
        return;
    }

    const newTextRuns: ITextRun[] = [];
    const len = textRuns.length;
    let hasInserted = false;

    const insertTextRuns = insertBody.textRuns ?? [];
    if (insertTextRuns.length) {
        for (const insertTextRun of insertTextRuns) {
            insertTextRun.st += currentIndex;
            insertTextRun.ed += currentIndex;
        }
    }

    for (let i = 0; i < len; i++) {
        const textRun = textRuns[i];
        // const nextRun = textRuns[i + 1];
        const { st, ed } = textRun;

        if (ed <= currentIndex) {
            newTextRuns.push(textRun);
        } else if (currentIndex > st && currentIndex < ed) {
            hasInserted = true;

            const firstSplitTextRun = {
                ...textRun,
                ed: currentIndex,
            };

            newTextRuns.push(firstSplitTextRun);

            if (insertTextRuns.length) {
                newTextRuns.push(...insertTextRuns);
            }

            const lastSplitTextRun = {
                ...textRun,
                st: currentIndex + textLength,
                ed: ed + textLength,
            };

            newTextRuns.push(lastSplitTextRun);
        } else {
            // currentIndex < st
            textRun.st += textLength;
            textRun.ed += textLength;

            if (!hasInserted) {
                hasInserted = true;
                newTextRuns.push(...insertTextRuns);
            }

            newTextRuns.push(textRun);
        }
    }

    if (!hasInserted) {
        hasInserted = true;
        newTextRuns.push(...insertTextRuns);
    }

    body.textRuns = normalizeTextRuns(newTextRuns);
}

/**
 * Based on the insertBody parameter, which includes a paragraph object,
 * you can add and adjust the position of paragraphs.
 * @param body The current content object of the document model.
 * @param insertBody The newly added content object that includes paragraph information.
 * @param textLength The length of the inserted content text.
 * @param currentIndex Determining the index where the content will be inserted into the current content.
 */
export function insertParagraphs(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number,
    preserveMissingParagraphIds = false,
    originalDataStream = body.dataStream
) {
    if (!body.paragraphs && !insertBody.paragraphs?.length) {
        return;
    }

    body.paragraphs ??= [];
    const { paragraphs } = body;

    const { paragraphs: insertParagraphs } = insertBody;
    normalizeInsertedParagraphIdsForDocument(paragraphs, insertParagraphs, currentIndex, {
        freshenSplitParagraph: true,
        preserveMissingParagraphIds,
        preserveExplicitSplitParagraphIds: Boolean((insertBody as unknown as Record<string, unknown>)[RESTORE_INSERTED_PARAGRAPH_IDS]),
        preserveExplicitParagraphIds: Boolean((insertBody as unknown as Record<string, unknown>)[PRESERVE_INSERTED_PARAGRAPH_IDS]),
        dataStream: originalDataStream,
    });

    const paragraphIndexList = [];
    let firstInsertParagraphNextIndex = -1;

    for (let i = 0, len = paragraphs.length; i < len; i++) {
        const paragraph = paragraphs[i];
        const { startIndex } = paragraph;

        if (startIndex >= currentIndex) {
            paragraph.startIndex += textLength;
        }

        if (firstInsertParagraphNextIndex === -1 && startIndex >= currentIndex) {
            firstInsertParagraphNextIndex = i;
        }

        paragraphIndexList.push(paragraph.startIndex);
    }

    let deleteReptIndex = -1;

    if (insertParagraphs) {
        for (let i = 0, len = insertParagraphs.length; i < len; i++) {
            const insertParagraph = insertParagraphs[i];
            insertParagraph.startIndex += currentIndex;
            const insertIndex = insertParagraph.startIndex;
            deleteReptIndex = paragraphIndexList.indexOf(insertIndex);
        }

        if (deleteReptIndex !== -1) {
            paragraphs.splice(deleteReptIndex, 1);
        }

        paragraphs.push(...insertParagraphs);
        paragraphs.sort(sortRulesFactory('startIndex'));
    }
}

export function normalizeInsertedParagraphIdsForDocument(
    paragraphs: IParagraph[] | undefined,
    insertParagraphs: IParagraph[] | undefined,
    currentIndex: number,
    options: {
        freshenSplitParagraph: boolean;
        preserveExplicitSplitParagraphIds?: boolean;
        preserveExplicitParagraphIds?: boolean;
        preserveMissingParagraphIds?: boolean;
        reservedParagraphIds?: Set<string>;
        dataStream?: string;
    }
) {
    if (!paragraphs || !insertParagraphs?.length) {
        return;
    }

    const splitParagraph = getParagraphSplitByInsert(paragraphs, currentIndex, options.dataStream);
    const firstSplitInsertIndex = splitParagraph ? getFirstInsertedParagraphIndex(insertParagraphs) : -1;
    const splitParagraphId = splitParagraph?.paragraphId;
    const firstInsertedParagraphId = firstSplitInsertIndex === -1 ? undefined : insertParagraphs[firstSplitInsertIndex].paragraphId;
    const shouldPreserveExplicitSplitParagraphId = (options.preserveExplicitSplitParagraphIds || options.preserveExplicitParagraphIds) && firstInsertedParagraphId != null && firstInsertedParagraphId !== splitParagraphId;
    const existingParagraphIds = collectParagraphIds(paragraphs);
    const preservedInsertedParagraphIds = new Set<string>();

    if (splitParagraphId) {
        existingParagraphIds.delete(splitParagraphId);
    }

    for (const paragraphId of options.reservedParagraphIds ?? []) {
        existingParagraphIds.add(paragraphId);
    }

    let splitRemainderParagraph: IParagraph | undefined;

    if (splitParagraphId && firstSplitInsertIndex !== -1 && !shouldPreserveExplicitSplitParagraphId) {
        const firstInsertParagraph = insertParagraphs[firstSplitInsertIndex];
        splitRemainderParagraph = firstInsertedParagraphId != null && firstInsertedParagraphId !== splitParagraphId
            ? cloneInsertedParagraphWithId(firstInsertParagraph, existingParagraphIds, options.preserveMissingParagraphIds ?? false)
            : cloneParagraphWithId(firstInsertParagraph, existingParagraphIds, false);

        if (options.freshenSplitParagraph && splitRemainderParagraph.paragraphId) {
            splitParagraph.paragraphId = splitRemainderParagraph.paragraphId;
        }
    }

    for (let i = 0, len = insertParagraphs.length; i < len; i++) {
        const explicitParagraphId = insertParagraphs[i].paragraphId;
        if (options.preserveExplicitParagraphIds && explicitParagraphId && !preservedInsertedParagraphIds.has(explicitParagraphId)) {
            // The corresponding old paragraph is deleted later in the same TextX
            // operation. A temporary id collision is therefore intentional.
            insertParagraphs[i] = { ...insertParagraphs[i] };
            preservedInsertedParagraphIds.add(explicitParagraphId);
            continue;
        }

        if (i !== firstSplitInsertIndex || splitParagraphId == null || shouldPreserveExplicitSplitParagraphId) {
            insertParagraphs[i] = cloneInsertedParagraphWithId(insertParagraphs[i], existingParagraphIds, options.preserveMissingParagraphIds ?? false);
            continue;
        }

        insertParagraphs[i] = options.freshenSplitParagraph || firstInsertedParagraphId == null || firstInsertedParagraphId === splitParagraphId
            ? cloneParagraphWithId({
                ...insertParagraphs[i],
                paragraphId: splitParagraphId,
            }, existingParagraphIds)
            : splitRemainderParagraph!;
    }

    for (const insertParagraph of insertParagraphs) {
        if (insertParagraph.paragraphId) {
            options.reservedParagraphIds?.add(insertParagraph.paragraphId);
        }
    }
}

function collectParagraphIds(paragraphs: IParagraph[] | undefined): Set<string> {
    const paragraphIds = new Set<string>();

    for (const paragraph of paragraphs ?? []) {
        if (paragraph.paragraphId) {
            paragraphIds.add(paragraph.paragraphId);
        }
    }

    return paragraphIds;
}

function cloneInsertedParagraphWithId(
    insertParagraph: IParagraph,
    existingParagraphIds: Set<string>,
    preserveMissingParagraphIds: boolean
): IParagraph {
    if (preserveMissingParagraphIds && insertParagraph.paragraphId == null) {
        return Tools.deepClone(insertParagraph);
    }

    return cloneParagraphWithId(insertParagraph, existingParagraphIds);
}

const PARAGRAPH_CONTAINER_TOKENS = new Set<string>([
    DataStreamTreeTokenType.SECTION_BREAK,
    DataStreamTreeTokenType.TABLE_START,
    DataStreamTreeTokenType.TABLE_ROW_START,
    DataStreamTreeTokenType.TABLE_CELL_START,
    DataStreamTreeTokenType.TABLE_CELL_END,
    DataStreamTreeTokenType.TABLE_ROW_END,
    DataStreamTreeTokenType.TABLE_END,
    DataStreamTreeTokenType.COLUMN_GROUP_START,
    DataStreamTreeTokenType.COLUMN_START,
    DataStreamTreeTokenType.COLUMN_END,
    DataStreamTreeTokenType.COLUMN_GROUP_END,
    DataStreamTreeTokenType.BLOCK_START,
    DataStreamTreeTokenType.BLOCK_END,
]);

function getParagraphSplitByInsert(paragraphs: IParagraph[], currentIndex: number, dataStream?: string): IParagraph | undefined {
    const sortedParagraphs = [...paragraphs].sort((left, right) => left.startIndex - right.startIndex);

    for (let i = 0; i < sortedParagraphs.length; i++) {
        const paragraph = sortedParagraphs[i];
        let paragraphStart = i > 0 ? sortedParagraphs[i - 1].startIndex + 1 : 0;
        while (paragraphStart < paragraph.startIndex) {
            const token = dataStream?.[paragraphStart];
            if (!token || !PARAGRAPH_CONTAINER_TOKENS.has(token)) {
                break;
            }
            paragraphStart++;
        }

        if (currentIndex > paragraphStart && currentIndex < paragraph.startIndex) {
            return paragraph;
        }
    }
}

function getFirstInsertedParagraphIndex(insertParagraphs: IParagraph[]): number {
    let index = 0;

    for (let i = 1; i < insertParagraphs.length; i++) {
        if (insertParagraphs[i].startIndex < insertParagraphs[index].startIndex) {
            index = i;
        }
    }

    return index;
}

export function insertSectionBreaks(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    if (!body.sectionBreaks && !insertBody.sectionBreaks?.length) {
        return;
    }

    body.sectionBreaks ??= [];
    const { sectionBreaks } = body;
    const insertSectionBreaks = insertBody.sectionBreaks;
    normalizeInsertedSectionIdsForDocument(sectionBreaks, insertSectionBreaks);

    for (let i = 0, len = sectionBreaks.length; i < len; i++) {
        const sectionBreak = sectionBreaks[i];
        const { startIndex } = sectionBreak;
        if (startIndex >= currentIndex) {
            /**
             * Here, startIndex >= currentIndex means that the starting index of
             * the new paragraph should be greater than or equal to the current index.
             * This ensures that the paragraph is inserted at a position after the current paragraph.
             * However, the accuracy of this condition depends on the specific context and
             * implementation details, so it would be best to validate it further in your specific scenario.
             */
            sectionBreak.startIndex += textLength;
        }
    }

    if (insertSectionBreaks) {
        for (let i = 0, len = insertSectionBreaks.length; i < len; i++) {
            const sectionBreak = insertSectionBreaks[i];
            sectionBreak.startIndex += currentIndex;
        }

        sectionBreaks.push(...insertSectionBreaks);
        sectionBreaks.sort(sortRulesFactory('startIndex'));
    }
}

export function normalizeInsertedSectionIdsForDocument(
    sectionBreaks: ISectionBreak[] | undefined,
    insertSectionBreaks: ISectionBreak[] | undefined,
    reservedSectionIds: Set<string> = new Set()
): void {
    if (!insertSectionBreaks?.length) {
        return;
    }

    const existingSectionIds = new Set(sectionBreaks?.map((sectionBreak) => sectionBreak.sectionId) ?? []);
    for (const sectionId of reservedSectionIds) {
        existingSectionIds.add(sectionId);
    }

    for (let i = 0; i < insertSectionBreaks.length; i++) {
        insertSectionBreaks[i] = cloneSectionBreakWithId(insertSectionBreaks[i], existingSectionIds);
        reservedSectionIds.add(insertSectionBreaks[i].sectionId);
    }
}

export function insertCustomBlocks(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { customBlocks = [] } = body;

    for (let i = 0, len = customBlocks.length; i < len; i++) {
        const customBlock = customBlocks[i];
        const { startIndex } = customBlock;
        if (startIndex >= currentIndex) {
            customBlock.startIndex += textLength;
        }
    }

    const insertCustomBlocks = insertBody.customBlocks;
    if (insertCustomBlocks) {
        for (let i = 0, len = insertCustomBlocks.length; i < len; i++) {
            const customBlock = insertCustomBlocks[i];
            customBlock.startIndex += currentIndex;
        }

        customBlocks.push(...insertCustomBlocks);
        customBlocks.sort(sortRulesFactory('startIndex'));
    }

    if (customBlocks.length && !body.customBlocks) {
        body.customBlocks = customBlocks;
    }
}

export function insertTables(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
    if (!body.tables && !insertBody.tables?.length) {
        return;
    }

    if (!body.tables) {
        body.tables = [];
    }

    const { tables } = body;
    for (let i = 0, len = tables.length; i < len; i++) {
        const table = tables[i];
        Object.assign(table, shiftExclusiveRangeOnInsert(table, currentIndex, textLength));
    }

    const insertTables = insertBody.tables;
    if (insertTables) {
        for (let i = 0, len = insertTables.length; i < len; i++) {
            const table = insertTables[i];
            table.startIndex += currentIndex;
            table.endIndex += currentIndex;
        }

        tables.push(...insertTables);
        tables.sort(sortRulesFactory('startIndex'));
    }
}

export function insertColumnGroups(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
    if (!body.columnGroups && !insertBody.columnGroups?.length) {
        return;
    }

    if (!body.columnGroups) {
        body.columnGroups = [];
    }

    const { columnGroups } = body;
    for (let i = 0, len = columnGroups.length; i < len; i++) {
        const columnGroup = columnGroups[i];
        Object.assign(columnGroup, shiftInclusiveRangeOnInsert(columnGroup, currentIndex, textLength));
    }

    const insertColumnGroups = insertBody.columnGroups;
    if (insertColumnGroups) {
        for (let i = 0, len = insertColumnGroups.length; i < len; i++) {
            const columnGroup = insertColumnGroups[i];
            columnGroup.startIndex += currentIndex;
            columnGroup.endIndex += currentIndex;
        }

        columnGroups.push(...insertColumnGroups);
        columnGroups.sort(sortRulesFactory('startIndex'));
    }
}

export function insertBlockRanges(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
    if (!body.blockRanges && !insertBody.blockRanges?.length) {
        return;
    }

    if (!body.blockRanges) {
        body.blockRanges = [];
    }

    const { blockRanges } = body;
    for (let i = 0, len = blockRanges.length; i < len; i++) {
        const blockRange = blockRanges[i];
        Object.assign(blockRange, shiftInclusiveRangeOnInsert(blockRange, currentIndex, textLength));
    }

    const insertBlockRanges = insertBody.blockRanges;
    if (insertBlockRanges) {
        for (let i = 0, len = insertBlockRanges.length; i < len; i++) {
            const blockRange = insertBlockRanges[i];
            blockRange.startIndex += currentIndex;
            blockRange.endIndex += currentIndex;
        }

        blockRanges.push(...insertBlockRanges);
        blockRanges.sort(sortRulesFactory('startIndex'));
    }
}

export function sliceByParagraph(body: IDocumentBody) {
    const { dataStream, paragraphs = [] } = body;
    const ranges = [];

    let cursor = 0;
    for (let i = 0, len = paragraphs.length; i < len; i++) {
        const paragraph = paragraphs[i];
        const { startIndex } = paragraph;
        if (cursor < startIndex) {
            ranges.push({
                startOffset: cursor,
                endOffset: startIndex,
            });
            cursor = startIndex;
        }
        ranges.push({
            startOffset: startIndex,
            endOffset: startIndex + 1,
        });
        cursor = startIndex + 1;
    }

    if (cursor < dataStream.length) {
        ranges.push({
            startOffset: cursor,
            endOffset: dataStream.length,
        });
    }

    return ranges.map((range) => getBodySlice(body, range.startOffset, range.endOffset));
}

const ID_SPLIT_SYMBOL = '$';
const getRootId = (id: string) => id.split(ID_SPLIT_SYMBOL)[0];

export function mergeContinuousRanges(ranges: ICustomRange[]): ICustomRange[] {
    if (ranges.length <= 1) return ranges;
    ranges.sort((a, b) => a.startIndex - b.startIndex);

    const mergedRanges: ICustomRange[] = [];
    let currentRange = { ...ranges[0] };
    currentRange.rangeId = getRootId(currentRange.rangeId);

    for (let i = 1; i < ranges.length; i++) {
        const nextRange = ranges[i];
        nextRange.rangeId = getRootId(nextRange.rangeId);
        if (
            nextRange.rangeId === currentRange.rangeId &&
            shallowEqual(currentRange.properties, nextRange.properties) &&
            currentRange.endIndex + 1 >= nextRange.startIndex
        ) {
            // Merge continuous ranges with same rangeId
            currentRange.endIndex = nextRange.endIndex;
        } else {
            // Push current range and start a new one
            mergedRanges.push(currentRange);
            currentRange = { ...nextRange };
        }
    }
    // Push the last range
    mergedRanges.push(currentRange);

    const idMap: Record<string, number> = Object.create(null);
    for (let i = 0, len = mergedRanges.length; i < len; i++) {
        const range = mergedRanges[i];
        const id = range.rangeId;
        if (idMap[id]) {
            range.rangeId = `${id}${ID_SPLIT_SYMBOL}${idMap[id]}`;
            idMap[id] = idMap[id] + 1;
        } else {
            idMap[id] = 1;
        }
    }

    return mergedRanges;
}

export function splitCustomRangesByIndex(customRanges: ICustomRange[], currentIndex: number) {
    const matchedCustomRangeIndex = customRanges.findIndex((c) => c.startIndex < currentIndex && c.endIndex >= currentIndex);
    const matchedCustomRange = customRanges[matchedCustomRangeIndex];

    if (matchedCustomRange) {
        customRanges.splice(matchedCustomRangeIndex, 1, {
            rangeId: matchedCustomRange.rangeId,
            rangeType: matchedCustomRange.rangeType,
            startIndex: matchedCustomRange.startIndex,
            endIndex: currentIndex - 1,
            properties: { ...matchedCustomRange.properties },
        }, {
            rangeId: matchedCustomRange.rangeId,
            rangeType: matchedCustomRange.rangeType,
            startIndex: currentIndex,
            endIndex: matchedCustomRange.endIndex,
            properties: { ...matchedCustomRange.properties },
        });
    }
}

export function mergeContinuousDecorations(ranges: ICustomDecoration[]): ICustomDecoration[] {
    if (ranges.length <= 1) return ranges;
    ranges.sort((a, b) => a.startIndex - b.startIndex);

    const mergedRanges: ICustomDecoration[] = [];
    let currentRange = { ...ranges[0] };

    for (let i = 1; i < ranges.length; i++) {
        const nextRange = ranges[i];
        if (
            nextRange.id === currentRange.id &&
            currentRange.endIndex + 1 >= nextRange.startIndex
        ) {
            // Merge continuous ranges with same rangeId
            currentRange.endIndex = nextRange.endIndex;
        } else {
            // Push current range and start a new one
            mergedRanges.push(currentRange);
            currentRange = { ...nextRange };
        }
    }
    // Push the last range
    mergedRanges.push(currentRange);

    return mergedRanges;
}

export function splitCustomDecoratesByIndex(customDecorations: ICustomDecoration[], currentIndex: number) {
    const matches = customDecorations.filter((c) => c.startIndex < currentIndex && c.endIndex >= currentIndex);

    matches.forEach((matched) => {
        const index = customDecorations.indexOf(matched);
        customDecorations.splice(index, 1, {
            id: matched.id,
            type: matched.type,
            startIndex: matched.startIndex,
            endIndex: currentIndex - 1,
        }, {
            id: matched.id,
            type: matched.type,
            startIndex: currentIndex,
            endIndex: matched.endIndex,
        });
    });
}

export function insertCustomRanges(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    if (!body.customRanges) {
        body.customRanges = [];
    }

    const { customRanges } = body;
    splitCustomRangesByIndex(customRanges, currentIndex);

    for (let i = 0, len = customRanges.length; i < len; i++) {
        const customRange = customRanges[i];
        const { startIndex } = customRange;
        // move custom range when insert text before it
        if (startIndex >= currentIndex) {
            customRange.startIndex += textLength;
            customRange.endIndex += textLength;
        }
    }

    const insertRanges: ICustomRange[] = [];
    if (insertBody.customRanges) {
        for (let i = 0, len = insertBody.customRanges.length; i < len; i++) {
            const customRange = insertBody.customRanges[i];
            customRange.startIndex += currentIndex;
            customRange.endIndex += currentIndex;
            // new custom range
            insertRanges.push(customRange);
        }

        customRanges.push(...insertRanges);
    }

    body.customRanges = mergeContinuousRanges(customRanges);
}

interface IIndexRange {
    startIndex: number;
    endIndex: number;
}

function mergeRanges<T extends IIndexRange>(lineSegments: T[]): T[] {
    lineSegments.sort((a, b) => a.startIndex - b.startIndex); // Sort by start value

    const mergedSegments: T[] = [];
    let currentSegment = lineSegments[0];

    for (let i = 1; i < lineSegments.length; i++) {
        if (currentSegment.endIndex + 1 >= lineSegments[i].startIndex) { // Check if continuous
            currentSegment.endIndex = Math.max(currentSegment.endIndex, lineSegments[i].endIndex);
        } else {
            mergedSegments.push(currentSegment);
            currentSegment = lineSegments[i];
        }
    }

    mergedSegments.push(currentSegment);

    return mergedSegments;
}

export function mergeDecorations(customDecorations: ICustomDecoration[]) {
    const customDecorationMap: Record<string, ICustomDecoration[]> = {};
    for (let i = 0, len = customDecorations.length; i < len; i++) {
        const customDecoration = customDecorations[i];
        const currentDecorations = customDecorationMap[customDecoration.id];
        customDecorationMap[customDecoration.id] = [...currentDecorations ?? [], customDecoration];
    }

    Object.keys(customDecorationMap).forEach((id) => {
        const decorations = customDecorationMap[id];
        const newRanges = mergeRanges(decorations);
        customDecorationMap[id] = newRanges;
    });

    return Object.values(customDecorationMap).flat();
}

export function insertCustomDecorations(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    if (!body.customDecorations) {
        body.customDecorations = [];
    }

    const { customDecorations } = body;
    splitCustomDecoratesByIndex(customDecorations, currentIndex);

    for (let i = 0, len = customDecorations.length; i < len; i++) {
        const customDecoration = customDecorations[i];
        const { startIndex } = customDecoration;
        // move custom range when insert text before it
        if (startIndex >= currentIndex) {
            customDecoration.startIndex += textLength;
            customDecoration.endIndex += textLength;
        }
    }

    const insertRanges: ICustomDecoration[] = [];
    if (insertBody.customDecorations) {
        for (let i = 0, len = insertBody.customDecorations.length; i < len; i++) {
            const customDecoration = insertBody.customDecorations[i];
            customDecoration.startIndex += currentIndex;
            customDecoration.endIndex += currentIndex;
            // new custom range
            insertRanges.push(customDecoration);
        }

        customDecorations.push(...insertRanges);
    }

    body.customDecorations = mergeContinuousDecorations(customDecorations);
}

// eslint-disable-next-line max-lines-per-function
export function deleteTextRuns(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { textRuns } = body;
    const startIndex = currentIndex;
    const endIndex = currentIndex + textLength;
    const removeTextRuns: ITextRun[] = [];

    if (textRuns) {
        const newTextRuns = [];

        for (let i = 0, len = textRuns.length; i < len; i++) {
            const textRun = textRuns[i];
            const { st, ed } = textRun;

            if (startIndex <= st && endIndex >= ed) {
                /**
                 * If the selection range is larger than the current textRuns, it needs to be deleted.
                 */
                removeTextRuns.push({
                    ...textRun,
                    st: st - startIndex,
                    ed: ed - startIndex,
                });

                continue;
            } else if (st <= startIndex && ed >= endIndex) {
                /**
                 * If the selection range is smaller than the current textRun,
                 * it needs to be trimmed. After trimming, the two segments of textRun should be merged.
                 */
                removeTextRuns.push({
                    ...textRun,
                    st: startIndex - startIndex,
                    ed: endIndex - startIndex,
                });

                textRun.ed -= textLength;
            } else if (startIndex >= st && startIndex < ed) {
                /**
                 * If the cursor start position is within the textRun,
                 * the content on the right side of the textRun needs to be removed,
                 * leaving the content on the left
                 */
                removeTextRuns.push({
                    ...textRun,
                    st: startIndex - startIndex,
                    ed: ed - startIndex,
                });

                textRun.ed = startIndex;
            } else if (endIndex > st && endIndex <= ed) {
                /**
                 * If the cursor end position is within the textRun,
                 * the content on the left side of the textRun needs to be removed,
                 * leaving the content on the right.
                 */
                removeTextRuns.push({
                    ...textRun,
                    st: st - startIndex,
                    ed: endIndex - startIndex,
                });

                textRun.st = endIndex - textLength;
                textRun.ed -= textLength;
            } else if (st >= endIndex) {
                /**
                 * TextRuns to the right of the selection content need to be moved as a whole
                 */
                textRun.st -= textLength;
                textRun.ed -= textLength;
            }

            newTextRuns.push(textRun);
        }

        body.textRuns = newTextRuns;
    }

    // In the case of no style before, add the style, removeTextRuns will be empty,
    // in this case, you need to add an empty textRun for undo.
    if (removeTextRuns.length === 0) {
        removeTextRuns.push({
            st: 0,
            ed: textLength,
            ts: {},
        });
    }

    return removeTextRuns;
}

export function deleteParagraphs(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { paragraphs } = body;

    const startIndex = currentIndex;
    const endIndex = currentIndex + textLength;
    const removeParagraphs: IParagraph[] = [];
    let removeAfterFirstNew: Nullable<IParagraph> = null;
    let isRemove = false;

    if (paragraphs) {
        const newParagraphs = [];
        for (let i = 0, len = paragraphs.length; i < len; i++) {
            const paragraph = paragraphs[i];
            const { startIndex: index } = paragraph;
            if (index >= startIndex && index < endIndex) {
                removeParagraphs.push({
                    ...paragraph,
                    startIndex: index - currentIndex,
                });

                isRemove = true;
                continue;
            } else if (index >= endIndex) {
                paragraph.startIndex -= textLength;
            }

            newParagraphs.push(paragraph);

            if (removeAfterFirstNew == null && isRemove) {
                removeAfterFirstNew = paragraph;
            }
        }
        // if (removeAfterFirstNew != null && closeRemoveAfterFirstNew === false) {
        //     // When deleting a paragraph, the configuration of the paragraph
        //     // in the beginning range should be retained. Due to the label design,
        //     // the paragraph mark is located after the content, so when deleting,
        //     // it will surround the configuration of the end range. A position update is required,
        //     // and the undo time should also be considered Restoration of position
        //     const removeFirst = removeParagraphs[0];

        //     if (removeFirst) {
        //         const newInsert = { ...removeFirst };
        //         removeParagraphs.splice(removeParagraphs.indexOf(removeFirst), 1, removeAfterFirstNew);
        //         newParagraphs.splice(newParagraphs.indexOf(removeAfterFirstNew), 1, newInsert);
        //         const tempIndex = newInsert.startIndex;
        //         newInsert.startIndex = removeAfterFirstNew.startIndex;
        //         removeAfterFirstNew.startIndex = tempIndex;
        //     }
        // }

        body.paragraphs = newParagraphs;
    }

    return removeParagraphs;
}

export function deleteSectionBreaks(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { sectionBreaks } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
    const removeSectionBreaks: ISectionBreak[] = [];
    if (sectionBreaks) {
        const newSectionBreaks = [];
        for (let i = 0, len = sectionBreaks.length; i < len; i++) {
            const sectionBreak = sectionBreaks[i];
            const { startIndex: index } = sectionBreak;
            if (index >= startIndex && index <= endIndex) {
                removeSectionBreaks.push({
                    ...sectionBreak,
                    startIndex: index - currentIndex,
                });
                continue;
            } else if (index > endIndex) {
                sectionBreak.startIndex -= textLength;
            }

            newSectionBreaks.push(sectionBreak);
        }
        body.sectionBreaks = newSectionBreaks;
    }
    return removeSectionBreaks;
}

export function deleteCustomBlocks(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { customBlocks = [] } = body;
    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
    const removeCustomBlocks: ICustomBlock[] = [];
    if (customBlocks) {
        const newCustomBlocks = [];
        for (let i = 0, len = customBlocks.length; i < len; i++) {
            const customBlock = customBlocks[i];
            const { startIndex: index } = customBlock;
            if (index >= startIndex && index <= endIndex) {
                removeCustomBlocks.push({
                    ...customBlock,
                    startIndex: index - currentIndex,
                });
                continue;
            } else if (index > endIndex) {
                customBlock.startIndex -= textLength;
            }

            newCustomBlocks.push(customBlock);
        }
        body.customBlocks = newCustomBlocks;
    }

    if (customBlocks.length && !body.customBlocks) {
        body.customBlocks = customBlocks;
    }
    return removeCustomBlocks;
}

export function deleteTables(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { tables } = body;
    const removeTables: ICustomTable[] = [];

    if (tables) {
        const newTables = [];
        for (let i = 0, len = tables.length; i < len; i++) {
            const table = tables[i];
            const transformed = shiftExclusiveRangeOnDelete(table, currentIndex, textLength);
            if (!transformed) {
                removeTables.push({
                    ...table,
                    startIndex: table.startIndex - currentIndex,
                    endIndex: table.endIndex - currentIndex,
                });
                continue;
            }
            Object.assign(table, transformed);
            newTables.push(table);
        }
        body.tables = newTables;
    }

    return removeTables;
}

export function deleteColumnGroups(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { columnGroups } = body;
    const removeColumnGroups: ICustomColumnGroup[] = [];

    if (columnGroups) {
        const newColumnGroups = [];
        for (let i = 0, len = columnGroups.length; i < len; i++) {
            const columnGroup = columnGroups[i];
            const transformed = shiftInclusiveRangeOnDelete(columnGroup, currentIndex, textLength);
            if (!transformed) {
                removeColumnGroups.push({
                    ...columnGroup,
                    startIndex: columnGroup.startIndex - currentIndex,
                    endIndex: columnGroup.endIndex - currentIndex,
                });
                continue;
            }
            Object.assign(columnGroup, transformed);
            newColumnGroups.push(columnGroup);
        }
        body.columnGroups = newColumnGroups;
    }

    return removeColumnGroups;
}

export function deleteCustomRanges(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { customRanges } = body;
    // TODO: @JOCS, removeCustomRanges is not used, should we remove it?
    const removeCustomRanges: ICustomRange[] = [];

    if (customRanges) {
        const newCustomRanges = [];
        for (let i = 0, len = customRanges.length; i < len; i++) {
            const customRange = customRanges[i];
            const transformed = shiftInclusiveRangeOnDelete(customRange, currentIndex, textLength);
            if (!transformed) {
                removeCustomRanges.push(customRange);
                continue;
            }
            Object.assign(customRange, transformed);
            newCustomRanges.push(customRange);
        }

        body.customRanges = mergeContinuousRanges(newCustomRanges);
    }

    return removeCustomRanges;
}

export function deleteBlockRanges(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { blockRanges } = body;
    const removeBlockRanges: IDocumentBlockRange[] = [];

    if (blockRanges) {
        const newBlockRanges = [];
        for (let i = 0, len = blockRanges.length; i < len; i++) {
            const blockRange = blockRanges[i];
            const transformed = shiftInclusiveRangeOnDelete(blockRange, currentIndex, textLength);
            if (!transformed) {
                removeBlockRanges.push(blockRange);
                continue;
            }
            Object.assign(blockRange, transformed);
            newBlockRanges.push(blockRange);
        }

        body.blockRanges = newBlockRanges;
    }

    return removeBlockRanges;
}

export function deleteCustomDecorations(body: IDocumentBody, textLength: number, currentIndex: number, needOffset = true) {
    const { customDecorations } = body;

    const startIndex = currentIndex;
    const endIndex = currentIndex + textLength - 1;
    const removeCustomDecorations: ICustomDecoration[] = [];

    if (customDecorations) {
        const newCustomDecorations = [];
        for (let i = 0, len = customDecorations.length; i < len; i++) {
            const customDecoration = customDecorations[i];
            const { startIndex: st, endIndex: ed } = customDecoration;
            // delete decoration
            if (st >= startIndex && ed <= endIndex) {
                removeCustomDecorations.push(customDecoration);
                continue;
                // substr decoration
            } else if (Math.max(startIndex, st) <= Math.min(endIndex, ed)) {
                const segments = horizontalLineSegmentsSubtraction(st, ed, startIndex, endIndex);

                if (segments.length === 0) {
                    continue;
                }

                customDecoration.startIndex = segments[0];
                customDecoration.endIndex = segments[1];
            } else if (endIndex < st) {
                if (needOffset) {
                    customDecoration.startIndex -= textLength;
                    customDecoration.endIndex -= textLength;
                }
            }
            newCustomDecorations.push(customDecoration);
        }
        body.customDecorations = newCustomDecorations;
    }

    return removeCustomDecorations;
}
