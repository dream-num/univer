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
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IAccessor } from '@wendellhu/redi';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { serializeTextRange, TextSelectionManagerService } from '../services/text-selection-manager.service';

interface IAddCustomRangeParam {
    unitId: string;
    range: ITextRange;
    segmentId?: string;
    textRanges: ITextRangeWithStyle[];
    rangeId: string;
    rangeType: CustomRangeType;
}

export function addCustomRangeFactory(param: IAddCustomRangeParam) {
    const { unitId, range, rangeId, rangeType, segmentId, textRanges } = param;
    const { startOffset, endOffset } = range;

    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges,
        },
    };

    const textX = new TextX();
    const jsonX = JSONX.getInstance();

    const body: IDocumentBody = {
        dataStream: '',
        customRanges: [
            {
                rangeId,
                rangeType,
                startIndex: startOffset,
                endIndex: endOffset + 2,
            },
        ],
    };

    if (startOffset > 0) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: startOffset,
            segmentId,
        });
    }
    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: '\x1F',
        },
        len: 1,
        line: startOffset,
    });

    textX.push({
        t: TextXActionType.RETAIN,
        body,
        len: endOffset - startOffset + 2,
        segmentId,
    });

    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: '\x1E',
        },
        len: 1,
        line: startOffset,
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

    const selections = textSelectionManagerService.getSelections()?.slice(0, 1);

    if (!Array.isArray(selections) || selections.length === 0) {
        return false;
    }

    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (!documentDataModel) {
        return false;
    }

    const unitId = documentDataModel.getUnitId();
    const textRanges = selections.map(serializeTextRange);

    const doMutation = addCustomRangeFactory({
        unitId,
        range: selections[0] as ITextRange,
        rangeId,
        rangeType,
        textRanges,
        segmentId,
    });

    return doMutation;
}
