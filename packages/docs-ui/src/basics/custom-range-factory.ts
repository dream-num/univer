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

import { DataStreamTreeTokenType, IUniverInstanceService, JSONX, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import type { CustomRangeType, DocumentDataModel, IAccessor, IDocumentBody, IMutationInfo, ITextRange } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { getRichTextEditPath } from '../commands/util';
import { getSelectionForAddCustomRange, normalizeSelection } from './selection';

interface IAddCustomRangeParam {
    unitId: string;
    range: ITextRange;
    segmentId?: string;
    rangeId: string;
    rangeType: CustomRangeType;
}

function addCustomRangeTextX(param: IAddCustomRangeParam, body: IDocumentBody) {
    const { range, rangeId, rangeType, segmentId } = param;
    const actualRange = getSelectionForAddCustomRange(range, body);
    if (!actualRange) {
        return null;
    }

    const { startOffset: start, endOffset: end } = actualRange;

    const textX = new TextX();

    if (start > 0) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: start,
            segmentId,
        });
    }

    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: DataStreamTreeTokenType.CUSTOM_RANGE_START,
        },
        len: 1,
        line: 0,
    });

    textX.push({
        t: TextXActionType.RETAIN,
        body: {
            dataStream: '',
        },
        len: end - start,
        segmentId,
    });

    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: DataStreamTreeTokenType.CUSTOM_RANGE_END,
            customRanges: [
                {
                    rangeId,
                    rangeType,
                    startIndex: -(end - start) - 1,
                    endIndex: 0,
                },
            ],
        },
        len: 1,
        line: 0,
    });

    return textX;
}

export function addCustomRangeFactory(accessor: IAccessor, param: IAddCustomRangeParam, body: IDocumentBody) {
    const { unitId, segmentId } = param;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    if (!documentDataModel) {
        return false;
    }

    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId: param.unitId,
            actions: [],
            textRanges: undefined,
        },
    };
    const jsonX = JSONX.getInstance();
    const textX = addCustomRangeTextX(param, body);
    if (!textX) {
        return false;
    }

    const path = getRichTextEditPath(documentDataModel, segmentId);
    doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
    return doMutation;
}

interface IAddCustomRangeFactoryParam {
    rangeId: string;
    rangeType: CustomRangeType;
    wholeEntity?: boolean;
    properties?: Record<string, any>;
}

// eslint-disable-next-line max-lines-per-function
export function addCustomRangeBySelectionFactory(accessor: IAccessor, param: IAddCustomRangeFactoryParam) {
    const { rangeId, rangeType, wholeEntity, properties } = param;
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selection = docSelectionManagerService.getActiveTextRange();
    const segmentId = selection?.segmentId;
    if (!selection) {
        return false;
    }

    const documentDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!documentDataModel) {
        return false;
    }
    const body = documentDataModel.getSelfOrHeaderFooterModel(selection.segmentId).getBody();
    const unitId = documentDataModel.getUnitId();
    if (!body) {
        return false;
    }
    const { startOffset, endOffset } = normalizeSelection(selection);

    const customRanges = body.customRanges ?? [];

    const relativeCustomRanges = [];
    for (let i = 0, len = customRanges.length; i < len; i++) {
        const customRange = customRanges[i];
        // intersect
        if (customRange.rangeType === rangeType && Math.max(customRange.startIndex, startOffset) <= Math.min(customRange.endIndex, endOffset - 1)) {
            relativeCustomRanges.push({ ...customRange });
        }

        // optimize
        if (customRange.startIndex >= endOffset) {
            break;
        }
    }
    const deletes = relativeCustomRanges.map((i) => [i.startIndex, i.endIndex]).flat().sort((pre, aft) => pre - aft);

    let cursor = 0;
    const textX = new TextX();

    const range = deletes.length
        ? {
            startOffset: Math.min(deletes[0], startOffset),
            endOffset: Math.max(deletes[deletes.length - 1] + 1, endOffset),
        }
        : selection;

    if (range.startOffset !== cursor) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: range.startOffset - cursor,
            segmentId,
        });
        cursor = range.startOffset;
    }
    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: DataStreamTreeTokenType.CUSTOM_RANGE_START,
        },
        len: 1,
        line: 0,
        segmentId,
    });

    deletes.forEach((index, i) => {
        if (index !== cursor) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: index - cursor,
                segmentId,
            });
            cursor = index;
        }
        textX.push({
            t: TextXActionType.DELETE,
            len: 1,
            line: 0,
            segmentId,
        });
        cursor++;
    });

    if (cursor !== range.endOffset) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: range.endOffset - cursor,
            segmentId,
        });
        cursor = range.endOffset;
    }

    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: DataStreamTreeTokenType.CUSTOM_RANGE_END,
            customRanges: [
                {
                    rangeId,
                    rangeType,
                    startIndex: -(range.endOffset - range.startOffset - deletes.length + 1),
                    endIndex: 0,
                    wholeEntity,
                    properties,
                },
            ],
        },
        len: 1,
        line: 0,
        segmentId,
    });
    const jsonX = JSONX.getInstance();
    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges: undefined,
        },
    };
    const path = getRichTextEditPath(documentDataModel, segmentId);
    doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
    return doMutation;
}

export interface IDeleteCustomRangeParam {
    unitId: string;
    rangeId: string;
    segmentId?: string;
}

function deleteCustomRangeTextX(accessor: IAccessor, params: IDeleteCustomRangeParam) {
    const { unitId, rangeId, segmentId } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    if (!documentDataModel) {
        return false;
    }

    const range = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.customRanges?.find((r) => r.rangeId === rangeId);
    if (!range) {
        return false;
    }

    const { startIndex, endIndex } = range;
    const textX = new TextX();

    const len = endIndex - startIndex + 1;

    if (startIndex > 0) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: startIndex,
            segmentId,
        });
    }

    textX.push({
        t: TextXActionType.DELETE,
        len: 1,
        segmentId,
        line: 0,
    });

    if (len - 2 > 0) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: len - 2,
            segmentId,
        });
    }

    textX.push({
        t: TextXActionType.DELETE,
        len: 1,
        segmentId,
        line: 0,
    });

    return textX;
}

export function deleteCustomRangeFactory(accessor: IAccessor, params: IDeleteCustomRangeParam) {
    const { unitId, segmentId } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    if (!documentDataModel) {
        return false;
    }
    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId: params.unitId,
            actions: [],
            textRanges: undefined,
            segmentId,
        },
    };

    const jsonX = JSONX.getInstance();
    const textX = deleteCustomRangeTextX(accessor, params);
    if (!textX) {
        return false;
    }

    const path = getRichTextEditPath(documentDataModel, segmentId);
    doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
    return doMutation;
}
