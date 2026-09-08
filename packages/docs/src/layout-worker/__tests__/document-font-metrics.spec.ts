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

import { JSONX } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { collectDocumentFontFamilies } from '../document-font-metrics';

describe('document font metrics', () => {
    it('collects inherited, header and footnote families and font changes without inspecting text content', () => {
        const families = new Set<string>();
        collectDocumentFontFamilies({
            documentStyle: { textStyle: { ff: 'Body Font' } },
            headers: { first: { body: { textRuns: [{ ts: { ff: 'Header Font' } }] } } },
            footnotes: { first: { body: { textRuns: [{ ts: { ff: 'Note Font' } }] } } },
            body: { dataStream: '{"ff":"Not a font"}', textRuns: [{ ts: { ff: 'Body Font' } }] },
        }, families);
        collectDocumentFontFamilies(JSONX.getInstance().replaceOp(
            ['documentStyle', 'textStyle', 'ff'],
            'Body Font',
            'Replacement Font'
        ), families);
        collectDocumentFontFamilies([{ actions: ['body', {
            et: 'textX',
            e: [{ t: 'retain', len: 1, body: { textRuns: [{ ts: { ff: 'Pasted Font' } }] } }],
        }] }], families);
        expect([...families].sort()).toEqual([
            'Body Font',
            'Header Font',
            'Note Font',
            'Pasted Font',
            'Replacement Font',
        ]);
    });
});
