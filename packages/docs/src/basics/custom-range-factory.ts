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

import type { CustomRangeType, DocumentDataModel, IDocumentBody, IMutationInfo, ITextRange } from '@univerjs/core';
import { DataStreamTreeTokenType, IUniverInstanceService, JSONX, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';
import { getSelectionForAddCustomRange } from './selection';

interface IAddCustomRangeParam {
    unitId: string;
    range: ITextRange;
    segmentId?: string;
    rangeId: string;
    rangeType: CustomRangeType;
}

export function addCustomRangeFactory(param: IAddCustomRangeParam, body: IDocumentBody) {
    const { unitId, range, rangeId, rangeType, segmentId } = param;
    const actualRange = getSelectionForAddCustomRange(range, body);
    if (!actualRange) {
        return null;
    }

    const { startOffset: start, endOffset: end } = actualRange;
    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges: undefined,
        },
    };

    const textX = new TextX();
    const jsonX = JSONX.getInstance();

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
            customRanges: [
                {
                    rangeId,
                    rangeType,
                    startIndex: 0,
                    endIndex: 0,
                },
            ],
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
                    startIndex: 0,
                    endIndex: 0,
                },
            ],
        },
        len: 1,
        line: 0,
    });

    doMutation.params.actions = jsonX.editOp(textX.serialize());
    return doMutation;
}

interface IAddCustomRangeFactoryParam {
    segmentId?: string;
    rangeId: string;
    rangeType: CustomRangeType;
}

export function addCustomRangeBySelectionFactory(accessor: IAccessor, param: IAddCustomRangeFactoryParam) {
    const { segmentId, rangeId, rangeType } = param;
    const textSelectionManagerService = accessor.get(TextSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selection = textSelectionManagerService.getActiveRange();
    if (!selection) {
        return false;
    }

    const documentDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!documentDataModel) {
        return false;
    }
    const body = documentDataModel.getBody();
    const unitId = documentDataModel.getUnitId();
    if (!body) {
        return false;
    }

    const doMutation = addCustomRangeFactory(
        {
            unitId,
            range: {
                startOffset: selection.startOffset,
                endOffset: selection.endOffset,
                collapsed: true,
            },
            rangeId,
            rangeType,
            segmentId,
        },
        body
    );

    return doMutation;
}

export interface IDeleteCustomRangeParam {
    unitId: string;
    rangeId: string;
    segmentId?: string;
}

export function deleteCustomRange(accessor: IAccessor, params: IDeleteCustomRangeParam) {
    const { unitId, rangeId, segmentId } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    if (!documentDataModel) {
        return false;
    }

    const range = documentDataModel.getBody()?.customRanges?.find((r) => r.rangeId === rangeId);
    if (!range) {
        return false;
    }
    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges: undefined,
        },
    };

    const { startIndex, endIndex } = range;
    const textX = new TextX();
    const jsonX = JSONX.getInstance();
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

    doMutation.params.actions = jsonX.editOp(textX.serialize());
    return doMutation;
}
