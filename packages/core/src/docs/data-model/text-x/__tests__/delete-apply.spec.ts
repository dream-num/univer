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

import { describe, expect, it } from 'vitest';
import { CustomRangeType, type IDocumentBody } from '../../../../types/interfaces';
import { deleteCustomRanges } from '../apply-utils/common';

describe('delete apply consistency', () => {
    it('should pass the test case when delete between custom range', () => {
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
});
