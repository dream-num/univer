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
import { UDMToHtmlService } from '../convertor';

describe('test case in html and udm convert', () => {
    it('test case in html and udm convert and bodyList length is 1', () => {
        const convertor = new UDMToHtmlService();
        const bodyList = [
            {
                dataStream: '=SUM(F15:G18)',
                textRuns: [
                    {
                        st: 5,
                        ed: 12,
                        ts: {
                            cl: {
                                rgb: '#9e6de3',
                            },
                        },
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 13,
                        paragraphStyle: {
                            horizontalAlign: 0,
                        },
                    },
                ],
            },
        ];

        const html = convertor.convert(bodyList);

        expect(html).toBe('=SUM(<span style="color: #9e6de3">F15:G18</span>)');
    });
});
