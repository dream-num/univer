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

import type { ITextRange } from '../../../../sheets/typedef';
import type { DocumentDataModel } from '../../document-data-model';
import { CustomDecorationType } from '../../../../types/interfaces';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

interface IAddCustomDecorationParam {
    ranges: ITextRange[];
    id: string;
    type: CustomDecorationType;
}

export function addCustomDecorationTextX(param: IAddCustomDecorationParam) {
    const { ranges, id, type } = param;

    const textX = new TextX();
    let cursor = 0;

    for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const { startOffset: start, endOffset: end } = range;
        if (start > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: start - cursor,
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
        });

        cursor = end;
    }

    return textX;
}

export interface IDeleteCustomRangeParam {
    id: string;
    segmentId?: string;
    documentDataModel: DocumentDataModel;
}

export function deleteCustomDecorationTextX(params: IDeleteCustomRangeParam) {
    const { id, segmentId, documentDataModel } = params;
    const body = documentDataModel?.getBody();
    if (!documentDataModel || !body) {
        return false;
    }

    const decoration = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customDecorations?.find((d) => d.id === id);
    if (!decoration) {
        return false;
    }

    const textX = new TextX();
    const { startIndex, endIndex } = decoration;
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
            customDecorations: [
                {
                    startIndex: 0,
                    endIndex: len - 1,
                    id,
                    type: CustomDecorationType.DELETED,
                },
            ],
        },
    });

    return textX;
}
