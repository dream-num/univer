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

import { getBodySlice, IUniverInstanceService, JSONX, TextX, TextXActionType, Tools, UniverInstanceType, UpdateDocsAttributeType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import type { CustomDecorationType, DocumentDataModel, IAccessor, IMutationInfo } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';

interface IAddCustomDecorationParam {
    unitId: string;
    ranges: ITextRangeWithStyle[];
    segmentId?: string;
    id: string;
    type: CustomDecorationType;
}

export function addCustomDecorationFactory(param: IAddCustomDecorationParam) {
    const { unitId, ranges, id, type, segmentId } = param;

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
    let cursor = 0;

    for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const { startOffset: start, endOffset: end } = range;
        if (start > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: start - cursor,
                segmentId,
            });
        }

        textX.push({
            t: TextXActionType.RETAIN,
            body: {
                dataStream: '',
                customDecorations: [{
                    id,
                    type,
                    startIndex: 0,
                    endIndex: end - start - 1,
                }],
            },
            len: end - start,
            segmentId,
        });

        cursor = end;
    }

    doMutation.params.actions = jsonX.editOp(textX.serialize());
    return doMutation;
}

interface IAddCustomDecorationFactoryParam {
    segmentId?: string;
    id: string;
    type: CustomDecorationType;
}

export function addCustomDecorationBySelectionFactory(accessor: IAccessor, param: IAddCustomDecorationFactoryParam) {
    const { segmentId, id, type } = param;
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const documentDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!documentDataModel) {
        return false;
    }

    const unitId = documentDataModel.getUnitId();
    const selections = docSelectionManagerService.getTextRanges({ unitId, subUnitId: unitId });
    if (!selections) {
        return false;
    }
    const body = documentDataModel.getBody();
    if (!body) {
        return false;
    }

    const doMutation = addCustomDecorationFactory(
        {
            unitId,
            ranges: selections as ITextRangeWithStyle[],
            id,
            type,
            segmentId,
        }
    );

    return doMutation;
}

export interface IDeleteCustomRangeParam {
    unitId: string;
    id: string;
    segmentId?: string;
}

export function deleteCustomDecorationFactory(accessor: IAccessor, params: IDeleteCustomRangeParam) {
    const { unitId, id, segmentId } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    const body = documentDataModel?.getBody();
    if (!documentDataModel || !body) {
        return false;
    }

    const decorations = documentDataModel.getBody()?.customDecorations?.filter((d) => d.id === id);
    if (!decorations?.length) {
        return false;
    }

    const oldBodySlices = decorations.map((i) => {
        const bodySlice = getBodySlice(body, i.startIndex, i.endIndex + 1);
        // bodySlice.customDecorations = bodySlice.customDecorations?.filter((decoration) => decoration.id !== id);
        return bodySlice;
    });

    const bodySlices = oldBodySlices.map((bodySlice) => {
        const copy = Tools.deepClone(bodySlice);
        copy.customDecorations = copy.customDecorations?.filter((decoration) => decoration.id !== id);
        return copy;
    });

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

    let cursor = 0;
    decorations.forEach((decoration, i) => {
        const bodySlice = bodySlices[i];
        const oldBody = oldBodySlices[i];
        if (decoration.startIndex !== cursor) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: decoration.startIndex - cursor,
                segmentId,
            });
        }
        cursor = (decoration.startIndex);
        textX.push({
            t: TextXActionType.RETAIN,
            len: decoration.endIndex - decoration.startIndex + 1,
            segmentId,
            body: bodySlice,
            oldBody,
            coverType: UpdateDocsAttributeType.REPLACE,
        });
        cursor = cursor + (decoration.endIndex - decoration.startIndex + 1);
    });

    doMutation.params.actions = jsonX.editOp(textX.serialize());
    return doMutation;
}
