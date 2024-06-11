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

import type { ICustomRange, IDocumentBody, IMutationInfo, ITextRange } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, JSONX, TextX, TextXActionType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { serializeTextRange, TextSelectionManagerService } from '../services/text-selection-manager.service';
import { getRetainAndDeleteFromReplace } from './retain-delete-params';

interface IAddCustomRangeParam {
    unitId: string;
    body: IDocumentBody;
    range: ITextRange;
    customRange: ICustomRange;
    segmentId?: string;
}

export function addCustomRangeFactory(accessor: IAccessor, param: IAddCustomRangeParam) {
    const textSelectionManagerService = accessor.get(TextSelectionManagerService);
    const selections = textSelectionManagerService.getSelections()?.slice(0, 1);

    if (!Array.isArray(selections) || selections.length === 0) {
        return false;
    }

    const { unitId, range, customRange, segmentId } = param;
    const { startOffset, endOffset } = range;

    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges: selections.map(serializeTextRange),
        },
    };

    const textX = new TextX();
    const jsonX = JSONX.getInstance();

    const body: IDocumentBody = {
        dataStream: '',
        customRanges: [
            {
                ...customRange,
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

    return {
        redos: [doMutation],
    };
}
