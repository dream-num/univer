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

import type { Nullable } from '../../../../shared';
import type { ITextRange, ITextRangeParam } from '../../../../sheets/typedef';
import type { CustomRangeType, IDocumentBody, ITextRun } from '../../../../types/interfaces';
import type { DocumentDataModel } from '../../document-data-model';
import type { TextXAction } from '../action-types';
import type { TextXSelection } from '../text-x';
import { Tools, UpdateDocsAttributeType } from '../../../../shared';
import { textDiff } from '../../../../shared/text-diff';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';
import { getBodySlice, getTextRunSlice } from '../utils';
import { excludePointsFromRange, getIntersectingCustomRanges, getSelectionForAddCustomRange } from './custom-range';

export interface IDeleteCustomRangeParam {
    rangeId: string;
    segmentId?: string;
    documentDataModel: DocumentDataModel;
    insert?: Nullable<IDocumentBody>;
}

export function deleteCustomRangeTextX(params: IDeleteCustomRangeParam) {
    const { rangeId, segmentId, documentDataModel, insert } = params;
    const range = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.customRanges?.find((r) => r.rangeId === rangeId);
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

export function deleteSelectionTextX(
    selections: ITextRange[],
    body: IDocumentBody,
    memoryCursor: number = 0,
    insertBody: Nullable<IDocumentBody> = null,
    keepBullet: boolean = true
): Array<TextXAction> {
    selections.sort((a, b) => a.startOffset - b.startOffset);
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

    if (paragraphInRange && keepBullet) {
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
                coverType: UpdateDocsAttributeType.REPLACE,
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

    const oldBody = selection.collapsed ? null : getBodySlice(body, selection.startOffset, selection.endOffset);
    const diffs = textDiff(oldBody ? oldBody.dataStream : '', insertBody.dataStream);
    let cursor = 0;
    const actions = diffs.map(([type, text]) => {
        switch (type) {
            // retain
            case 0: {
                const action: TextXAction = {
                    t: TextXActionType.RETAIN,
                    body: {
                        ...getBodySlice(insertBody, cursor, cursor + text.length, false),
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
                    body: getBodySlice(insertBody, cursor, cursor + text.length),
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

export const replaceSelectionTextRuns = (params: IReplaceSelectionTextXParams) => {
    const { selection, body: insertBody, doc } = params;
    const segmentId = selection.segmentId;
    const body = doc.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    if (!body) return false;

    const oldBody = selection.collapsed ? null : getBodySlice(body, selection.startOffset, selection.endOffset);
    const diffs = textDiff(oldBody ? oldBody.dataStream : '', insertBody.dataStream);
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
                            textRuns: textRunsSlice,
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
                    body: getBodySlice(insertBody, cursor, cursor + text.length),
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
