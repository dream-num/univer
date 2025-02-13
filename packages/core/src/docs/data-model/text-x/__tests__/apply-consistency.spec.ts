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

import type { TextXAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { CustomRangeType, type IDocumentBody } from '../../../../types/interfaces';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

function getDefaultDocWithCustomRange() {
    const doc: IDocumentBody = {
        dataStream: '人之初,\r性本善。\r\n',
        textRuns: [],
        customBlocks: [],
        customRanges: [{
            startIndex: 1,
            endIndex: 3,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.baidu.com',
            },
        }],
        paragraphs: [
            {
                startIndex: 4,
            },
            {
                startIndex: 9,
            },
        ],
        customDecorations: [],
    };

    return doc;
}

describe('apply consistency', () => {
    it('should get the same result when compose delete action with body', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 2,
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 4,
            },
            {
                t: TextXActionType.DELETE,
                len: 1,
                body: {
                    dataStream: '\r',
                    paragraphs: [{
                        startIndex: 0,
                    }],
                    customRanges: [],
                },
            },
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];

        const doc1 = getDefaultDocWithCustomRange();
        const doc2 = getDefaultDocWithCustomRange();
        const doc3 = getDefaultDocWithCustomRange();
        const doc4 = getDefaultDocWithCustomRange();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'right'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'left'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'right'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'left'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);

        const undoActions = TextX.invert(TextX.makeInvertible(composedAction1, getDefaultDocWithCustomRange()));
        const undoDoc = TextX.apply(resultA, undoActions);

        // console.log(JSON.stringify(composedAction1, null, 2));
        // console.log(JSON.stringify(undoActions, null, 2));
        // console.log(JSON.stringify(undoDoc, null, 2));

        expect(undoDoc).toEqual(getDefaultDocWithCustomRange());
    });

    it('should get the same result when apply delete and cancel link', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 2,
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.RETAIN,
                len: 3,
                body: {
                    dataStream: '',
                    customRanges: [],
                },
            },
        ];

        const doc1 = getDefaultDocWithCustomRange();
        const doc2 = getDefaultDocWithCustomRange();
        const doc3 = getDefaultDocWithCustomRange();
        const doc4 = getDefaultDocWithCustomRange();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'right'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'left'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'right'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'left'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });
});
