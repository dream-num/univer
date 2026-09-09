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
import { HtmlToUSMService } from '../converter';
import { WordPastePlugin } from '../paste-plugins/plugin-word';

HtmlToUSMService.use(WordPastePlugin);

describe('HtmlToUSMService', () => {
    it.each([
        '<p class="MsoNormal"><b>Office回归中文🙂</b></p><p class="MsoNormal"><b>第二行 0</b></p>',
        '<span>Office回归中文🙂</span><br><span>第二行 0</span>',
    ])('keeps document terminators out of plain paragraph cell values: %s', (html) => {
        const converter = new HtmlToUSMService({ getCurrentSkeleton: () => null });
        const { cellMatrix } = converter.convert(html);

        expect(cellMatrix.getValue(0, 0)?.v).toBe('Office回归中文🙂');
        expect(cellMatrix.getValue(1, 0)?.v).toBe('第二行 0');
        expect(cellMatrix.getValue(2, 0)).toBeUndefined();
    });

    it('preserves intentional spaces and empty paragraphs when splitting cells', () => {
        const converter = new HtmlToUSMService({ getCurrentSkeleton: () => null });
        const { cellMatrix } = converter.convert('<p class="MsoNormal"> left </p><p class="MsoNormal"></p><p class="MsoNormal">right </p>');

        expect(cellMatrix.getValue(0, 0)?.v).toBe(' left ');
        expect(cellMatrix.getValue(1, 0)?.v).toBe('');
        expect(cellMatrix.getValue(2, 0)?.v).toBe('right ');
        expect(cellMatrix.getValue(3, 0)).toBeUndefined();
    });
});
