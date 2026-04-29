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
import { parseParagraph } from '../utils/parse/parse-paragraph';
import { parseRunsFromParagraphXml } from '../utils/parse/parse-run';
import { parseStyles } from '../utils/parse/parse-styles';
import { xmlParser } from '../utils/parse/xml';

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

function pNode(xml: string): Record<string, unknown> {
    return (xmlParser.parse(xml) as Array<Record<string, unknown>>)[0];
}

/** Style table that mirrors the relevant subset of word/styles.xml for header/footer. */
const HEADER_FOOTER_STYLES_XML = `<w:styles ${W}>
  <w:style w:type="paragraph" w:styleId="a4">
    <w:name w:val="header"/>
    <w:pPr>
      <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="auto"/></w:pBdr>
      <w:tabs>
        <w:tab w:val="center" w:pos="4153"/>
        <w:tab w:val="right" w:pos="8306"/>
      </w:tabs>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:rPr><w:sz w:val="18"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="a6">
    <w:name w:val="footer"/>
    <w:pPr>
      <w:tabs>
        <w:tab w:val="center" w:pos="4153"/>
        <w:tab w:val="right" w:pos="8306"/>
      </w:tabs>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:rPr><w:sz w:val="18"/></w:rPr>
  </w:style>
</w:styles>`;

describe('header paragraph inherits borderBottom from style "a4"', () => {
    it('a paragraph with <w:pStyle w:val="a4"/> exposes borderBottom on its style', () => {
        const styles = parseStyles(HEADER_FOOTER_STYLES_XML);
    // Sanity: the style itself carries the border.
        const resolved = styles.resolvePStyle('a4');
        expect(resolved.pPr?.borderBottom).toBeDefined();
        expect(resolved.pPr?.borderBottom?.dashStyle).toBe(1); // single

    // Empty header paragraph (header1.xml shape) — no inline pBdr, only pStyle.
        const node = pNode(`<w:p ${W}><w:pPr><w:pStyle w:val="a4"/></w:pPr></w:p>`);
        const p = parseParagraph(node, undefined, styles);

    // The fix should have the inherited border land on the parsed paragraph style.
        expect(p.style?.borderBottom).toBeDefined();
        expect(p.style?.borderBottom?.dashStyle).toBe(1);
    });

    it('inline pBdr on a paragraph still overrides the inherited border', () => {
        const styles = parseStyles(HEADER_FOOTER_STYLES_XML);
        const node = pNode(
            `<w:p ${W}><w:pPr><w:pStyle w:val="a4"/><w:pBdr><w:bottom w:val="dashed" w:sz="12"/></w:pBdr></w:pPr></w:p>`
        );
        const p = parseParagraph(node, undefined, styles);
    // dashed = 3 in BORDER_DASH_MAP
        expect(p.style?.borderBottom?.dashStyle).toBe(3);
    // sz=12 → width 2 (sz/6 rounded)
        expect(p.style?.borderBottom?.width).toBe(2);
    });
});

describe('header paragraph merges right-tab from inline tabs', () => {
    it('right tab at 8844 dxa survives the clear+merge pipeline', () => {
        const styles = parseStyles(HEADER_FOOTER_STYLES_XML);
    // header2.xml shape — clear inherited tabs, add new right tab at 8844, jc=left.
        const node = pNode(
            `<w:p ${W}><w:pPr>
        <w:pStyle w:val="a4"/>
        <w:tabs>
          <w:tab w:val="clear" w:pos="4153"/>
          <w:tab w:val="clear" w:pos="8306"/>
          <w:tab w:val="right" w:pos="8844"/>
        </w:tabs>
        <w:jc w:val="left"/>
      </w:pPr></w:p>`
        );
        const p = parseParagraph(node, undefined, styles);
        expect(p.style?.tabStops).toBeDefined();
    // Inherited 4153 / 8306 should be cleared; only 8844 right remains.
        const offsets = p.style!.tabStops!.map((s) => Math.round(s.offset));
    // 8844 dxa / 15 = 589.6 px
        expect(offsets).toEqual([Math.round(8844 / 15)]);
    // alignment: 3 = END (right)
        expect(p.style!.tabStops![0].alignment).toBe(3);
    });
});

describe('footer PAGE / NUMPAGES field codes are recognized', () => {
    it('a simple PAGE field is emitted as a page-number placeholder, not a literal cached value', () => {
    // Compact fldChar/instrText shape:
    //   begin → instrText "PAGE" → separate → cached "2" → end
        const xml = `<w:p ${W}>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:r><w:instrText>PAGE</w:instrText></w:r>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:r><w:t>2</w:t></w:r>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>`;
        const runs = parseRunsFromParagraphXml(xml);

    // Either: a dedicated run carrying a page-number marker (preferred), or
    // a textual placeholder like "{{page}}" — the cached "2" must NOT survive
    // as plain text or the page number freezes at "2" forever.
        const concatText = runs.map((r) => r.text ?? '').join('');
        expect(concatText).not.toBe('2');

        const hasPagePlaceholder = runs.some(
            (r) =>
        // A new field on the run that flags it as a page-number element.
        // Exact shape is up to the implementation; the test just asserts the
        // semantics survived past the importer.
                (r as unknown as { fieldType?: string }).fieldType === 'PAGE'
        );
        expect(hasPagePlaceholder).toBe(true);
    });

    it('a PAGE / NUMPAGES pair (footer2 shape) yields both placeholders in order', () => {
        const xml = `<w:p ${W}>
      <w:r><w:t xml:space="preserve"> </w:t></w:r>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:r><w:instrText>PAGE</w:instrText></w:r>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:r><w:t>2</w:t></w:r>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
      <w:r><w:t xml:space="preserve"> / </w:t></w:r>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:r><w:instrText>NUMPAGES</w:instrText></w:r>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:r><w:t>2</w:t></w:r>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>`;
        const runs = parseRunsFromParagraphXml(xml);
        const types = runs
            .map((r) => (r as unknown as { fieldType?: string }).fieldType ?? r.text ?? '')
            .filter((t) => t !== '');
    // We expect (in some shape): PAGE marker, " / ", NUMPAGES marker — with
    // optional whitespace runs between. Exact run boundaries don't matter, but
    // both markers must be present and the literal cached "2" must not.
        const flat = types.join('|');
        expect(flat).toMatch(/PAGE/);
        expect(flat).toMatch(/NUMPAGES/);
        expect(flat).not.toMatch(/^[^P]*2[^P]*$/); // "2" should not be the only numeric content
    });

    it('PAGE placeholder inherits fontSize/fontFamily from the cached-value run, not the begin run', () => {
        // Real-world Word footers (e.g. 文书格式.docx) put the field's display
        // style on the cached-value run, not on fldChar begin. The importer
        // previously read rPr off the begin run, so PAGE/NUMPAGES placeholders
        // dropped back to docDefault size — visibly different from surrounding text.
        const xml = `<w:p ${W}>
      <w:r><w:rPr><w:b/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:instrText>PAGE</w:instrText></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>
      <w:r><w:rPr><w:rFonts w:ascii="Calibri"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>`;
        const runs = parseRunsFromParagraphXml(xml);
        const pageRun = runs.find(
            (r) => (r as unknown as { fieldType?: string }).fieldType === 'PAGE'
        );
        expect(pageRun).toBeDefined();
        // sz="18" is half-points → fs 9; ff comes from rFonts on the cached run.
        expect(pageRun!.style?.fs).toBe(9);
        expect(pageRun!.style?.ff).toBe('Calibri');
    });
});
