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

import type { OoxmlBundle, ParsedParagraph, ParsedRun, ParsedTable } from '../utils/parse/types';
import { describe, expect, it } from 'vitest';

describe('parse types', () => {
    it('ParsedRun has text and optional style', () => {
        const r: ParsedRun = { text: 'hello' };
        expect(r.text).toBe('hello');
    });
    it('ParsedParagraph contains runs and optional bullet/style', () => {
        const p: ParsedParagraph = { runs: [{ text: 'x' }] };
        expect(p.runs.length).toBe(1);
    });
    it('ParsedTable holds rows of cells of paragraphs', () => {
        const t: ParsedTable = { rows: [[{ paragraphs: [{ runs: [] }] }]] };
        expect(t.rows[0][0].paragraphs[0].runs).toEqual([]);
    });
    it('OoxmlBundle exposes documentXml at minimum', () => {
        const b: OoxmlBundle = { documentXml: '<root/>' };
        expect(b.documentXml).toBe('<root/>');
    });
});
