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
import { DocTextResolverService } from '../doc-text-resolver.service';

describe('DocTextResolverService', () => {
    it('projects replacement text and maps every visible character to native offsets', () => {
        const service = new DocTextResolverService();
        service.register({
            resolve: () => [{
                startOffset: 1,
                endOffset: 2,
                text: '42',
            }],
        });

        expect(service.resolve('doc-1', { dataStream: 'A\uFFFCC' })).toEqual({
            text: 'A42C',
            characters: [
                { startOffset: 0, endOffset: 1, replaceable: true },
                { startOffset: 1, endOffset: 2, replaceable: false },
                { startOffset: 1, endOffset: 2, replaceable: false },
                { startOffset: 2, endOffset: 3, replaceable: true },
            ],
        });
    });

    it('ignores invalid and overlapping replacements deterministically', () => {
        const service = new DocTextResolverService();
        service.register({
            resolve: () => [
                { startOffset: 1, endOffset: 3, text: 'first' },
                { startOffset: 2, endOffset: 3, text: 'overlap' },
                { startOffset: -1, endOffset: 1, text: 'invalid' },
            ],
        });

        expect(service.resolve('doc-1', { dataStream: 'ABCD' }).text).toBe('AfirstD');
    });
});
