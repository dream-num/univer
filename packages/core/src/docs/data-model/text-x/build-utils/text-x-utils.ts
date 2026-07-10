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

import type { ThemeService } from '../../../../services/theme/theme.service';
import type { Nullable } from '../../../../shared';
import type { ITextRange, ITextRangeParam } from '../../../../sheets/typedef';
import type { CustomRangeType, IDocumentBody, ITextRun } from '../../../../types/interfaces';
import type { DocumentDataModel } from '../../document-data-model';
import type { TextXAction } from '../action-types';
import type { TextXSelection } from '../text-x';
import fastDiff from 'fast-diff';
import { Tools, UpdateDocsAttributeType } from '../../../../shared';
import { DataStreamTreeTokenType } from '../../types';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';
import { getBodySlice, getBodySliceForTextXAction, getTextRunSlice } from '../utils';
import { excludePointsFromRange, getIntersectingCustomRanges, getSelectionForAddCustomRange } from './custom-range';
import { getBlockRangeInterval } from './range-interval';

export interface IDeleteCustomRangeParam {
    rangeId: string;
    segmentId?: string;
    documentDataModel: DocumentDataModel;
    insert?: Nullable<IDocumentBody>;
}

export function deleteCustomRangeTextX(params: IDeleteCustomRangeParam) {
    const { rangeId, segmentId, documentDataModel, insert } = params;
    const range = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customRanges?.find((r) => r.rangeId === rangeId);
    if (!range) {
        return false;
    }

    const { startIndex, endIndex } = range;
    const textX: TextXSelection = new TextX();

    const len = endIndex - startIndex + 1;

    textX.push({
        t: TextXActionType.RETAIN,
        len: startIndex,
    });

    textX.push({
        t: TextXActionType.RETAIN,
        len,
        body: {
            dataStream: '',
            customRanges: [],
        },
    });

    if (insert) {
        textX.push({
            t: TextXActionType.INSERT,
            body: insert,
            len: insert.dataStream.length,
        });
    }

    const end = endIndex + 1 + (insert?.dataStream.length ?? 0);
    textX.selections = [{
        startOffset: end,
        endOffset: end,
        collapsed: true,
    }];

    return textX;
}

export interface IAddCustomRangeTextXParam {
    ranges: ITextRange[];
    segmentId?: string;
    rangeId: string;
    rangeType: CustomRangeType;
    properties?: Record<string, any>;
    wholeEntity?: boolean;
    body: IDocumentBody;
}

export function addCustomRangeTextX(param: IAddCustomRangeTextXParam) {
    const { ranges, rangeId, rangeType, wholeEntity, properties, body } = param;
    let cursor = 0;
    const textX: TextX & { selections?: ITextRange[] } = new TextX();

    let changed = false;
    ranges.forEach((range) => {
        const actualRange = getSelectionForAddCustomRange(range, body);
        if (!actualRange) {
            return false;
        }

        if (!body) {
            return false;
        }

        const { startOffset, endOffset } = actualRange;

        const customRanges = body.customRanges ?? [];

        const addCustomRange = (startIndex: number, endIndex: number, index: number) => {
            const relativeCustomRanges = getIntersectingCustomRanges(startIndex, endIndex, customRanges, rangeType);
            const rangeStartIndex = Math.min((relativeCustomRanges[0]?.startIndex ?? Infinity), startIndex);
            const rangeEndIndex = Math.max(relativeCustomRanges[relativeCustomRanges.length - 1]?.endIndex ?? -Infinity, endIndex);

            const customRange = {
                rangeId: index ? `${rangeId}$${index}` : rangeId,
                rangeType,
                startIndex: 0,
                endIndex: rangeEndIndex - rangeStartIndex,
                wholeEntity,
                properties: {
                    ...properties,
                },
            };

            textX.push({
                t: TextXActionType.RETAIN,
                len: rangeStartIndex - cursor,
            });

            textX.push({
                t: TextXActionType.RETAIN,
                len: rangeEndIndex - rangeStartIndex + 1,
                body: {
                    dataStream: '',
                    customRanges: [customRange],
                },
                coverType: UpdateDocsAttributeType.COVER,
            });
            cursor = rangeEndIndex + 1;
        };

        const relativeParagraphs = (body.paragraphs ?? []).filter((p) => p.startIndex < endOffset && p.startIndex > startOffset);
        const customBlocks = (body.customBlocks ?? []).filter((block) => block.startIndex < endOffset && block.startIndex > startOffset);
        const newRanges = excludePointsFromRange([startOffset, endOffset - 1], [...relativeParagraphs.map((p) => p.startIndex), ...customBlocks.map((b) => b.startIndex)]);
        newRanges.forEach(([start, end], i) => addCustomRange(start, end, i));

        changed = true;
        textX.selections = [{
            startOffset: actualRange.endOffset,
            endOffset: actualRange.endOffset,
            collapsed: true,
        }];
    });

    return changed ? textX : false;
}

// If the selection contains line breaks,
// paragraph information needs to be preserved when performing the CUT operation

interface IStructuralTextContainer {
    atomicRange?: { endOffset: number; startOffset: number };
    startOffset: number;
    endOffset: number;
    paragraphs: number[];
    sectionBreaks: number[];
    require: 'paragraph-or-section' | 'paragraph-and-section';
}

function isAtomicContainerDeleted(container: IStructuralTextContainer, selections: ITextRange[]): boolean {
    return Boolean(container.atomicRange && selections.some((selection) =>
        selection.startOffset <= container.atomicRange!.startOffset &&
        selection.endOffset >= container.atomicRange!.endOffset
    ));
}

function isOffsetDeleted(offset: number, selections: ITextRange[]) {
    return selections.some((selection) => offset >= selection.startOffset && offset < selection.endOffset);
}

function isInsertInContainer(insertOffset: number, container: IStructuralTextContainer) {
    return insertOffset >= container.startOffset && insertOffset <= container.endOffset;
}

function protectLastDeletedOffset(offsets: number[], selections: ITextRange[], protectedOffsets: Set<number>) {
    if (offsets.length && offsets.every((offset) => isOffsetDeleted(offset, selections))) {
        protectedOffsets.add(offsets[offsets.length - 1]);
    }
}

function protectDeletedColumnBoundaryTokens(body: IDocumentBody, selections: ITextRange[], protectedOffsets: Set<number>) {
    // Plain text selection edits may cross column edges, but structural column tokens must stay atomic.
    for (let i = 0; i < body.dataStream.length; i++) {
        const char = body.dataStream[i];
        if (
            (
                char === DataStreamTreeTokenType.COLUMN_GROUP_START ||
                char === DataStreamTreeTokenType.COLUMN_START ||
                char === DataStreamTreeTokenType.COLUMN_END ||
                char === DataStreamTreeTokenType.COLUMN_GROUP_END
            ) &&
            isOffsetDeleted(i, selections)
        ) {
            protectedOffsets.add(i);
        }
    }
}

function protectPartiallyDeletedBlockBoundaryTokens(body: IDocumentBody, selections: ITextRange[], protectedOffsets: Set<number>) {
    for (const blockRange of body.blockRanges ?? []) {
        const blockInterval = getBlockRangeInterval(blockRange);
        const fullyDeleted = selections.some((selection) =>
            selection.startOffset <= blockInterval.startOffset &&
            selection.endOffset >= blockInterval.endOffset
        );
        if (fullyDeleted) {
            continue;
        }

        if (isOffsetDeleted(blockRange.startIndex, selections)) {
            protectedOffsets.add(blockRange.startIndex);
        }
        if (isOffsetDeleted(blockRange.endIndex, selections)) {
            protectedOffsets.add(blockRange.endIndex);
        }
    }
}

function collectBlockTextContainers(body: IDocumentBody): IStructuralTextContainer[] {
    const blockRanges = [...(body.blockRanges ?? [])].sort((left, right) => left.startIndex - right.startIndex);
    const containers = blockRanges.map((blockRange) => {
        const atomicRange = getBlockRangeInterval(blockRange);
        return {
            atomicRange,
            startOffset: atomicRange.startOffset + 1,
            endOffset: atomicRange.endOffset - 1,
            paragraphs: [] as number[],
            sectionBreaks: [] as number[],
            require: 'paragraph-or-section' as const,
        };
    });

    const assignPoint = (offset: number, key: 'paragraphs' | 'sectionBreaks') => {
        let low = 0;
        let high = blockRanges.length - 1;
        let index = -1;
        while (low <= high) {
            const middle = Math.floor((low + high) / 2);
            const blockRange = blockRanges[middle];
            if (offset <= blockRange.startIndex) {
                high = middle - 1;
            } else if (offset >= blockRange.endIndex) {
                low = middle + 1;
            } else {
                index = middle;
                break;
            }
        }
        if (index >= 0) {
            containers[index][key].push(offset);
        }
    };
    (body.paragraphs ?? []).forEach((paragraph) => assignPoint(paragraph.startIndex, 'paragraphs'));
    (body.sectionBreaks ?? []).forEach((sectionBreak) => assignPoint(sectionBreak.startIndex, 'sectionBreaks'));

    return containers;
}

function collectStructuralTextContainers(body: IDocumentBody): IStructuralTextContainer[] {
    const containers: IStructuralTextContainer[] = [{
        startOffset: 0,
        endOffset: body.dataStream.length,
        paragraphs: [],
        sectionBreaks: [],
        require: 'paragraph-and-section',
    }];
    const columnStack: IStructuralTextContainer[] = [];
    const cellStack: IStructuralTextContainer[] = [];

    const getActiveContainer = () => {
        if (cellStack.length) {
            return cellStack[cellStack.length - 1];
        }

        if (columnStack.length) {
            return columnStack[columnStack.length - 1];
        }

        return containers[0];
    };

    for (let i = 0; i < body.dataStream.length; i++) {
        const char = body.dataStream[i];

        if (char === DataStreamTreeTokenType.COLUMN_START) {
            columnStack.push({
                startOffset: i + 1,
                endOffset: i + 1,
                paragraphs: [],
                sectionBreaks: [],
                require: 'paragraph-or-section',
            });
        } else if (char === DataStreamTreeTokenType.COLUMN_END) {
            const column = columnStack.pop();
            if (column) {
                column.endOffset = i;
                containers.push(column);
            }
        } else if (char === DataStreamTreeTokenType.TABLE_CELL_START) {
            cellStack.push({
                startOffset: i + 1,
                endOffset: i + 1,
                paragraphs: [],
                sectionBreaks: [],
                require: 'paragraph-and-section',
            });
        } else if (char === DataStreamTreeTokenType.TABLE_CELL_END) {
            const cell = cellStack.pop();
            if (cell) {
                cell.endOffset = i;
                containers.push(cell);
            }
        } else if (char === DataStreamTreeTokenType.PARAGRAPH) {
            getActiveContainer().paragraphs.push(i);
        } else if (char === DataStreamTreeTokenType.SECTION_BREAK) {
            getActiveContainer().sectionBreaks.push(i);
        }
    }

    containers.push(...collectBlockTextContainers(body));

    return containers;
}

function protectRequiredContainerChildren(
    container: IStructuralTextContainer,
    selections: ITextRange[],
    insertBody: Nullable<IDocumentBody>,
    insertOffset: number,
    protectedOffsets: Set<number>
): void {
    if (isAtomicContainerDeleted(container, selections)) {
        return;
    }

    const insertAppliesToContainer = insertBody && isInsertInContainer(insertOffset, container);
    const insertDataStream = insertBody?.dataStream ?? '';
    const insertHasParagraph = insertDataStream.includes(DataStreamTreeTokenType.PARAGRAPH);
    const insertHasSectionBreak = insertDataStream.includes(DataStreamTreeTokenType.SECTION_BREAK);
    if (container.require === 'paragraph-or-section') {
        const offsets = [...container.paragraphs, ...container.sectionBreaks].sort((a, b) => a - b);
        if (!insertAppliesToContainer || (!insertHasParagraph && !insertHasSectionBreak)) {
            protectLastDeletedOffset(offsets, selections, protectedOffsets);
        }
        return;
    }

    if (!insertAppliesToContainer || !insertHasParagraph) {
        protectLastDeletedOffset(container.paragraphs, selections, protectedOffsets);
    }
    if (!insertAppliesToContainer || !insertHasSectionBreak) {
        protectLastDeletedOffset(container.sectionBreaks, selections, protectedOffsets);
    }
}

function normalizeSelectionsForStructuralSentinels(
    selections: ITextRange[],
    body: IDocumentBody,
    insertBody: Nullable<IDocumentBody>
) {
    if (!selections.length) {
        return selections;
    }

    const insertOffset = selections[0].startOffset;
    const protectedOffsets = new Set<number>();

    // Plain text edits must not leave the document root, columns, or table cells without parser children.
    collectStructuralTextContainers(body).forEach((container) => {
        protectRequiredContainerChildren(container, selections, insertBody, insertOffset, protectedOffsets);
    });
    protectDeletedColumnBoundaryTokens(body, selections, protectedOffsets);
    protectPartiallyDeletedBlockBoundaryTokens(body, selections, protectedOffsets);

    if (!protectedOffsets.size) {
        return selections;
    }

    const normalizedSelections: ITextRange[] = [];
    selections.forEach((selection) => {
        let startOffset = selection.startOffset;

        for (let offset = selection.startOffset; offset < selection.endOffset; offset++) {
            if (!protectedOffsets.has(offset)) {
                continue;
            }

            if (startOffset < offset) {
                normalizedSelections.push({
                    ...selection,
                    startOffset,
                    endOffset: offset,
                    collapsed: false,
                });
            }

            startOffset = offset + 1;
        }

        if (startOffset < selection.endOffset) {
            normalizedSelections.push({
                ...selection,
                startOffset,
                endOffset: selection.endOffset,
                collapsed: false,
            });
        }
    });

    return normalizedSelections.length
        ? normalizedSelections
        : [{
            ...selections[0],
            endOffset: selections[0].startOffset,
            collapsed: true,
        }];
}

export function deleteSelectionTextX(
    selections: ITextRange[],
    body: IDocumentBody,
    memoryCursor: number = 0,
    insertBody: Nullable<IDocumentBody> = null,
    keepBullet: boolean = true
): Array<TextXAction> {
    selections.sort((a, b) => a.startOffset - b.startOffset);
    selections = normalizeSelectionsForStructuralSentinels(selections, body, insertBody);
    const dos: Array<TextXAction> = [];
    const { paragraphs = [] } = body;

    const paragraphInRange = paragraphs?.find(
        (p) => p.startIndex >= selections[0].startOffset && p.startIndex < selections[0].endOffset
    );
    let cursor = memoryCursor;
    selections.forEach((selection) => {
        const { startOffset, endOffset } = selection;
        if (startOffset > cursor) {
            dos.push({
                t: TextXActionType.RETAIN,
                len: startOffset - cursor,
            });
            cursor = startOffset;
        }

        if (cursor < endOffset) {
            dos.push({
                t: TextXActionType.DELETE,
                len: endOffset - cursor,
            });
            cursor = endOffset;
        }
    });

    if (insertBody) {
        dos.push({
            t: TextXActionType.INSERT,
            body: insertBody,
            len: insertBody.dataStream.length,
        });
    }

    if (paragraphInRange?.bullet && keepBullet) {
        const nextParagraph = paragraphs.find((p) => p.startIndex - memoryCursor >= (selections[selections.length - 1].endOffset - 1));
        if (nextParagraph) {
            if (nextParagraph.startIndex > cursor) {
                dos.push({
                    t: TextXActionType.RETAIN,
                    len: nextParagraph.startIndex - cursor,
                });
                cursor = nextParagraph.startIndex;
            }

            dos.push({
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            ...nextParagraph,
                            startIndex: 0,
                            bullet: paragraphInRange?.bullet,
                        },
                    ],
                },
                coverType: UpdateDocsAttributeType.COVER,
            });
        }
    }

    return dos;
}

export function retainSelectionTextX(selections: ITextRange[], body: IDocumentBody, memoryCursor: number = 0) {
    const dos: Array<TextXAction> = [];
    let cursor = memoryCursor;
    selections.forEach((selection) => {
        const { startOffset, endOffset } = selection;
        if (startOffset > cursor) {
            dos.push({
                t: TextXActionType.RETAIN,
                len: startOffset - cursor,
            });
            cursor = startOffset;
        }
        if (endOffset > cursor) {
            dos.push({
                t: TextXActionType.RETAIN,
                len: endOffset - cursor,
                body: {
                    ...Tools.deepClone(body),
                    dataStream: '',
                },
            });
            cursor = endOffset;
        }
    });

    return dos;
}

export interface IReplaceSelectionTextXParams {
    /**
     * range to be replaced.
     */
    selection: ITextRangeParam;

    /** Body to be inserted at the given position. */
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    /**
     * origin document data model.
     */
    doc: DocumentDataModel;
}

export const replaceSelectionTextX = (params: IReplaceSelectionTextXParams) => {
    const { selection, body: insertBody, doc } = params;
    const segmentId = selection.segmentId;
    const body = doc.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    if (!body) return false;

    const normalizedSelections = normalizeSelectionsForStructuralSentinels([selection], body, insertBody);
    const selectionAdjusted = normalizedSelections.length !== 1 ||
        normalizedSelections[0].startOffset !== selection.startOffset ||
        normalizedSelections[0].endOffset !== selection.endOffset;

    if (selectionAdjusted) {
        const textX = new TextX();
        textX.push(...deleteSelectionTextX([selection], body, 0, insertBody));
        return textX;
    }

    const oldBody = selection.collapsed ? null : getBodySlice(body, selection.startOffset, selection.endOffset);
    const diffs = fastDiff(oldBody ? oldBody.dataStream : '', insertBody.dataStream);
    let cursor = 0;
    const actions = diffs.map(([type, text]) => {
        switch (type) {
            // retain
            case 0: {
                const action: TextXAction = {
                    t: TextXActionType.RETAIN,
                    body: {
                        ...getBodySliceForTextXAction(insertBody, cursor, cursor + text.length, false),
                        dataStream: '',
                    },
                    len: text.length,
                };
                cursor += text.length;
                return action;
            }
            // insert
            case 1: {
                const action: TextXAction = {
                    t: TextXActionType.INSERT,
                    body: getBodySliceForTextXAction(insertBody, cursor, cursor + text.length),
                    len: text.length,
                };
                cursor += text.length;
                return action;
            }
            // delete
            default: {
                const action: TextXAction = {
                    t: TextXActionType.DELETE,
                    len: text.length,
                };
                return action;
            }
        }
    });

    const textX = new TextX();
    textX.push({
        t: TextXActionType.RETAIN,
        len: selection.startOffset,
    });
    textX.push(...actions);
    return textX;
};

function isTextRunsEqual(textRuns: ITextRun[] | undefined, oldTextRuns: ITextRun[] | undefined) {
    if (textRuns?.length === oldTextRuns?.length && textRuns?.every((textRun, index) => JSON.stringify(textRun) === JSON.stringify(oldTextRuns?.[index]))) {
        return true;
    }

    return false;
}

export interface IReplaceSelectionTextRunsParams extends IReplaceSelectionTextXParams {
    themeService: ThemeService;
}

export const replaceSelectionTextRuns = (params: IReplaceSelectionTextRunsParams) => {
    const { selection, body: insertBody, doc, themeService } = params;
    const segmentId = selection.segmentId;
    const body = doc.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    if (!body) return false;

    const normalizedSelections = normalizeSelectionsForStructuralSentinels([selection], body, insertBody);
    const selectionAdjusted = normalizedSelections.length !== 1 ||
        normalizedSelections[0].startOffset !== selection.startOffset ||
        normalizedSelections[0].endOffset !== selection.endOffset;

    if (selectionAdjusted) {
        const textX = new TextX();
        textX.push(...deleteSelectionTextX([selection], body, 0, insertBody));
        return textX;
    }

    const oldBody = selection.collapsed ? null : getBodySlice(body, selection.startOffset, selection.endOffset);
    const diffs = fastDiff(oldBody ? oldBody.dataStream : '', insertBody.dataStream);
    let cursor = 0;
    const actions = diffs.map(([type, text]) => {
        switch (type) {
            // retain
            case 0: {
                const textRunsSlice = getTextRunSlice(insertBody, cursor, cursor + text.length, false);
                const oldTextRunsSlice = getTextRunSlice(oldBody!, cursor, cursor + text.length, false);
                const action: TextXAction = {
                    t: TextXActionType.RETAIN,
                    body: isTextRunsEqual(textRunsSlice, oldTextRunsSlice)
                        ? undefined
                        : {
                            textRuns: textRunsSlice?.map((textRun) => ({
                                ...textRun,
                                ts: {
                                    ...textRun.ts,
                                    cl: textRun.ts?.cl?.rgb?.includes('.')
                                        ? { rgb: themeService.getColorFromTheme(textRun.ts?.cl?.rgb ?? '') }
                                        : textRun.ts?.cl,
                                },
                            })),
                            dataStream: '',
                        },
                    len: text.length,
                };
                cursor += text.length;
                return action;
            }
            // insert
            case 1: {
                const action: TextXAction = {
                    t: TextXActionType.INSERT,
                    body: getBodySliceForTextXAction(insertBody, cursor, cursor + text.length),
                    len: text.length,
                };
                cursor += text.length;
                return action;
            }
            // delete
            default: {
                const action: TextXAction = {
                    t: TextXActionType.DELETE,
                    len: text.length,
                };
                return action;
            }
        }
    });

    if (actions.every((action) => action.t === TextXActionType.RETAIN && !action.body)) {
        return false;
    }

    const textX = new TextX();
    textX.push({
        t: TextXActionType.RETAIN,
        len: selection.startOffset,
    });
    textX.push(...actions);
    return textX;
};
