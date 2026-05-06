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

// Multi-section integration test: imports a python-docx generated DOCX with
// 6 sections (portrait/continuous/landscape/first-page-header/...) and asserts
// the importer wires per-section header/footer/orient/sectionType correctly.

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { docxToUniverData } from '../docx-to-univer';

const FIXTURE = path.resolve(__dirname, 'fixtures/multi-section.docx');

describe('multi-section: fixtures/multi-section.docx', () => {
    it('extracts headers / footers / per-section properties matching the source sectPrs', async () => {
        const buf = fs.readFileSync(FIXTURE);
        const doc = await docxToUniverData(buf);

        // 3 unique header xmls (header1/2/3) and 1 footer (footer1) should be parsed and deduped.
        expect(Object.keys(doc.headers ?? {}).sort()).toEqual(['header1', 'header2', 'header3']);
        expect(Object.keys(doc.footers ?? {})).toEqual(['footer1']);

        // Document-level fallback: body-end sectPr has no refs, so the fallback walks
        // inline sectPrs and picks the first one with refs (sectPr #0 → header1/footer1).
        expect(doc.documentStyle.defaultHeaderId).toBe('header1');
        expect(doc.documentStyle.defaultFooterId).toBe('footer1');

        // useFirstPageHeaderFooter is per-section in OOXML, NOT a document-level
        // default. The body-end sectPr (#5) has <w:titlePg/>, but section #0
        // doesn't — promoting the body-end value to documentStyle would make
        // section #0 walk the first-page-header path with no firstPageHeaderId
        // and render the cover page blank. Each section carries its own value
        // on the sectionBreak entry instead.
        expect(doc.documentStyle.useFirstPageHeaderFooter).toBeUndefined();

        // Filter out the table-cell SECTION_BREAKs (they're bare { startIndex }).
        const sb = doc.body!.sectionBreaks!.filter((b) =>
            b.defaultHeaderId !== undefined
            || b.firstPageHeaderId !== undefined
            || b.evenPageHeaderId !== undefined
            || b.defaultFooterId !== undefined
            || b.sectionType !== undefined
            || b.useFirstPageHeaderFooter !== undefined
            || b.pageOrient !== undefined
        );

        // 6 source sectPrs in 全格式.docx → 6 document-level section breaks.
        expect(sb.length).toBe(6);

        // sectPr #0: portrait, header1 + footer1.
        expect(sb[0].defaultHeaderId).toBe('header1');
        expect(sb[0].defaultFooterId).toBe('footer1');
        expect(sb[0].pageOrient).toBeUndefined(); // portrait is the default (0), not emitted explicitly

        // sectPr #1: continuous, no own headerRef → inherits header1 from sectPr #0
        // (ECMA-376 §17.6 cross-section header inheritance).
        expect(sb[1].sectionType).toBe(1); // SectionType.CONTINUOUS
        expect(sb[1].defaultHeaderId).toBe('header1');

        // sectPr #2: landscape, own headerRef → header2.
        expect(sb[2].pageOrient).toBe(1); // landscape
        expect(sb[2].defaultHeaderId).toBe('header2');

        // sectPr #3: first-page header, titlePg=true. Inherits default from sectPr #2.
        expect(sb[3].firstPageHeaderId).toBe('header3');
        expect(sb[3].defaultHeaderId).toBe('header2');
        expect(sb[3].useFirstPageHeaderFooter).toBe(1);

        // sectPr #4: continuous + titlePg, inherits default from sectPr #3 (still header2).
        expect(sb[4].sectionType).toBe(1);
        expect(sb[4].useFirstPageHeaderFooter).toBe(1);
        expect(sb[4].defaultHeaderId).toBe('header2');

        // sectPr #5: body-end break. No own ref but inherits header2 from the chain.
        expect(sb[5].sectionType).toBe(1);
        expect(sb[5].useFirstPageHeaderFooter).toBe(1);
        expect(sb[5].defaultHeaderId).toBe('header2');
    });
});
