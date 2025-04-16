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
import { CustomRangeType, type IDocumentBody } from '../../../../types/interfaces';
import { deleteCustomRanges } from '../apply-utils/common';

function getBodyWithCustomRanges() {
    const body: IDocumentBody = {
        dataStream: '人之初\r\n',
        customRanges: [{
            startIndex: 1,
            endIndex: 2,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.baidu.com',
            },
        }],
    };

    return body;
}

describe('delete apply consistency', () => {
    it('should pass the test case when delete start part custom range', () => {
        const body = getBodyWithCustomRanges();

        deleteCustomRanges(body, 2, 0);

        expect(body.customRanges).toEqual([{
            startIndex: 0,
            endIndex: 0,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.baidu.com',
            },
        }]);
    });

    it('should pass the test case when delete end part custom range', () => {
        const body = getBodyWithCustomRanges();
        deleteCustomRanges(body, 2, 2);
        expect(body.customRanges).toEqual([{
            startIndex: 1,
            endIndex: 1,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.baidu.com',
            },
        }]);
    });

    it('should pass the test case when delete all custom range', () => {
        const body = getBodyWithCustomRanges();
        deleteCustomRanges(body, 2, 1);
        expect(body.customRanges).toEqual([]);
    });

    it('should pass the test case when delete middle part custom range', () => {
        const body: IDocumentBody = {
            dataStream: '人之初，性本善\r\n',
            customRanges: [{
                startIndex: 1,
                endIndex: 6,
                rangeId: 'rangeId',
                rangeType: CustomRangeType.HYPERLINK,
                properties: {
                    url: 'http://www.baidu.com',
                },
            }],
        };
        deleteCustomRanges(body, 3, 2);
        expect(body.customRanges).toEqual([{
            startIndex: 1,
            endIndex: 3,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.baidu.com',
            },
        }]);
    });

    it('should pass the test case when delete before custom range', () => {
        const body = getBodyWithCustomRanges();

        deleteCustomRanges(body, 1, 0);

        expect(body.customRanges).toEqual([{
            startIndex: 0,
            endIndex: 1,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.baidu.com',
            },
        }]);
    });

    it('should pass the test case when delete after custom range', () => {
        const body = getBodyWithCustomRanges();

        deleteCustomRanges(body, 1, 3);

        expect(body.customRanges).toEqual([{
            startIndex: 1,
            endIndex: 2,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.baidu.com',
            },
        }]);
    });
});
