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

import { BooleanNumber, DEFAULT_STYLES, JSONX } from '@univerjs/core';
import { FontCache, getFontStyleString } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { collectDocumentFontFamilies, measureDocumentFontFamilies } from '../document-font-metrics';

describe('document font metrics', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        FontCache.invalidateMetrics(() => true);
    });

    it.each(['Latin Font', undefined])('transfers the composite East Asian font key used in document layout (%s)', (ff) => {
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ height: 3000 } as DOMRect);
        const families = new Set<string>();
        collectDocumentFontFamilies({ ts: { ff, eastAsiaFontFamily: 'East Asian Font' } }, families);
        const transferred = measureDocumentFontFamilies(families);
        const primary = ff || DEFAULT_STYLES.ff;
        const fontStyles = [
            `${primary}, East Asian Font`,
            `East Asian Font, ${primary}, East Asian Font`,
        ].flatMap((family) => [BooleanNumber.FALSE, BooleanNumber.TRUE].flatMap((bl) =>
            [BooleanNumber.FALSE, BooleanNumber.TRUE].map((it) => getFontStyleString({ ff: family, fs: 12, bl, it }))));

        FontCache.invalidateMetrics(() => true);
        vi.stubGlobal('document', undefined);
        FontCache.setNormalLineHeightCache(transferred);
        for (const fontStyle of fontStyles) {
            expect(FontCache.getNormalLineHeight(fontStyle), fontStyle.fontString).toBe(18);
        }
    });

    it('collects inherited, header and footnote families and font changes without inspecting text content', () => {
        const families = new Set<string>();
        collectDocumentFontFamilies({
            documentStyle: { textStyle: { ff: 'Body Font' } },
            headers: { first: { body: { textRuns: [{ ts: { ff: 'Header Font' } }] } } },
            notes: { first: { body: { textRuns: [{ ts: { ff: 'Note Font' } }] } } },
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
