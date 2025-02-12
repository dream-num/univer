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

import type { IDocumentBody } from '../../../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { CustomRangeType } from '../../../../../types/interfaces';
import { DocumentDataModel } from '../../../document-data-model';
import { TextX } from '../../text-x';
import { replaceSelectionTextX } from '../text-x-utils';

describe('test textX function', () => {
    const text = 'What is univer and how to use it?\r\n';
    it('should replace the selection', () => {
        const body: IDocumentBody = {
            dataStream: 'What is univer and how to use it?\r\n',
            paragraphs: [
                {
                    startIndex: text.length - 1,
                },
            ],
            customRanges: [
                {
                    startIndex: 0,
                    endIndex: 7,
                    rangeId: '1',
                    rangeType: CustomRangeType.HYPERLINK,
                    properties: {
                        url: 'https://univer.ai',
                    },
                },
            ],
        };

        const insertBody: IDocumentBody = {
            dataStream: 'what are',
            customRanges: [
                {
                    startIndex: 0,
                    endIndex: 8,
                    rangeId: '1',
                    rangeType: CustomRangeType.HYPERLINK,
                    properties: {
                        url: 'https://univer.ai/haha',
                    },
                },
            ],
        };

        const doc = new DocumentDataModel({
            body,
        });

        const textX = replaceSelectionTextX({
            selection: { startOffset: 0, endOffset: 8, collapsed: false },
            body: insertBody,
            doc,
        });
        expect(textX).toBeTruthy();
        if (textX) {
            TextX.apply(body, textX.serialize());
            expect(body.dataStream).toEqual('what are univer and how to use it?\r\n');
            expect(body.customRanges?.[0].properties?.url).toEqual('https://univer.ai/haha');
            expect(body.customRanges?.[0].startIndex).toEqual(0);
            expect(body.customRanges?.[0].endIndex).toEqual(8);
        }
    });
});
