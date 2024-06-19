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

import type { CustomRangeType, DocumentDataModel, IMutationInfo, ITextRange } from '@univerjs/core';
import { DataStreamTreeTokenType, IUniverInstanceService, JSONX, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

interface IAddCustomRangeParam {
    unitId: string;
    range: ITextRange;
    segmentId?: string;
    rangeId: string;
    rangeType: CustomRangeType;
}

export function addCustomRangeFactory(param: IAddCustomRangeParam) {
    const { unitId, range, rangeId, rangeType, segmentId } = param;
    const { startOffset, endOffset } = range;
    const start = Math.min(startOffset, endOffset);
    const end = Math.max(startOffset, endOffset);
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
        },
        len: 1,
        line: 0,
    });

    textX.push({
        t: TextXActionType.RETAIN,
        body: {
            dataStream: '',
            customRanges: [
                {
                    rangeId,
                    rangeType,
                    startIndex: -1,
                    endIndex: end - start - 1,
                },
            ],
        },
        len: end - start,
        segmentId,
    });

    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: DataStreamTreeTokenType.CUSTOM_RANGE_END,
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

    const selection = textSelectionManagerService.getSelections()?.[0];

    if (!selection) {
        return false;
    }

    const documentDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!documentDataModel) {
        return false;
    }

    const unitId = documentDataModel.getUnitId();

    const doMutation = addCustomRangeFactory({
        unitId,
        range: {
            startOffset: selection.startOffset!,
            endOffset: selection.endOffset!,
            collapsed: true,
        },
        rangeId,
        rangeType,
        segmentId,
    });

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
