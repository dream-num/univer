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

import type { CustomRangeType, IDocumentBody, IMutationInfo, ITextRange } from '@univerjs/core';
import { IUniverInstanceService, JSONX, TextX, TextXActionType } from '@univerjs/core';
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
    console.log('===range', range);
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
            dataStream: '\x1F',
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
                    startIndex: 0,
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
            dataStream: '\x1E',
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

    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
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
