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

import { describe, expect, it } from 'vitest';
import { CustomDecorationType } from '../../../../../types/interfaces';
import { DocumentDataModel } from '../../../document-data-model';
import { TextXActionType } from '../../action-types';
import { addCustomDecorationTextX, deleteCustomDecorationTextX } from '../custom-decoration';

describe('custom decoration text-x helpers', () => {
    it('should build decoration retain actions for multiple ranges', () => {
        const textX = addCustomDecorationTextX({
            id: 'comment-1',
            type: CustomDecorationType.COMMENT,
            ranges: [
                { startOffset: 1, endOffset: 4, collapsed: false },
                { startOffset: 6, endOffset: 8, collapsed: false },
            ],
        });

        expect(textX.serialize()).toEqual([
            { t: TextXActionType.RETAIN, len: 1 },
            {
                t: TextXActionType.RETAIN,
                len: 3,
                body: {
                    dataStream: '',
                    customDecorations: [{ id: 'comment-1', type: CustomDecorationType.COMMENT, startIndex: 0, endIndex: 2 }],
                },
            },
            { t: TextXActionType.RETAIN, len: 2 },
            {
                t: TextXActionType.RETAIN,
                len: 2,
                body: {
                    dataStream: '',
                    customDecorations: [{ id: 'comment-1', type: CustomDecorationType.COMMENT, startIndex: 0, endIndex: 1 }],
                },
            },
        ]);
    });

    it('should mark an existing decoration as deleted and guard missing bodies', () => {
        const doc = new DocumentDataModel({
            id: 'doc-decoration',
            body: {
                dataStream: 'Hello\r\n',
                customDecorations: [{ id: 'comment-1', type: CustomDecorationType.COMMENT, startIndex: 1, endIndex: 3 }],
            },
        });

        const textX = deleteCustomDecorationTextX({
            id: 'comment-1',
            documentDataModel: doc,
        });

        expect(textX).not.toBe(false);
        if (textX === false) {
            throw new Error('Expected deleteCustomDecorationTextX to return a TextX instance');
        }

        expect(textX.serialize()).toEqual([
            { t: TextXActionType.RETAIN, len: 1 },
            {
                t: TextXActionType.RETAIN,
                len: 3,
                body: {
                    dataStream: '',
                    customDecorations: [{ id: 'comment-1', type: CustomDecorationType.DELETED, startIndex: 0, endIndex: 2 }],
                },
            },
        ]);
        expect(deleteCustomDecorationTextX({ id: 'missing', documentDataModel: doc })).toBe(false);
        expect(deleteCustomDecorationTextX({ id: 'missing', documentDataModel: new DocumentDataModel({ id: 'doc-without-body' }) })).toBe(false);
    });
});
