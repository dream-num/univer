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

import type { DocumentChild } from '../utils/parse/types';
import { describe, expect, it } from 'vitest';
import { assembleDocument } from '../utils/parse/assemble';
import { parseNumbering } from '../utils/parse/parse-numbering';
import { parseParagraph } from '../utils/parse/parse-paragraph';
import { xmlParser } from '../utils/parse/xml';

function pNode(xml: string): Record<string, unknown> {
    return (xmlParser.parse(xml) as Array<Record<string, unknown>>)[0];
}

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

describe('docx indent semantics for list paragraphs', () => {
    it('keeps explicit firstLineChars="0" as {v:0} (clears inherited firstLine from pStyle)', () => {
        const node = pNode(
            `<w:p ${NS}><w:pPr>` +
        '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' +
        '<w:ind w:firstLineChars="0"/>' +
        '</w:pPr><w:r><w:t>x</w:t></w:r></w:p>'
        );
        const p = parseParagraph(node);
        expect(p.bullet).toEqual({ numId: '1', ilvl: 0 });
        expect(p.style?.indentFirstLine).toEqual({ v: 0 });
    });

    it('keeps explicit firstLineChars="0" w:firstLine="0" as {v:0}', () => {
        const node = pNode(
            `<w:p ${NS}><w:pPr>` +
        '<w:numPr><w:ilvl w:val="1"/><w:numId w:val="1"/></w:numPr>' +
        '<w:ind w:firstLineChars="0" w:firstLine="0"/>' +
        '</w:pPr><w:r><w:t>x</w:t></w:r></w:p>'
        );
        const p = parseParagraph(node);
        expect(p.style?.indentFirstLine).toEqual({ v: 0 });
    });

    it('drops dxa-only near-zero hanging (e.g. w:hanging="1" → tiny px) as round-trip artifact', () => {
        const node = pNode(
            `<w:p ${NS}><w:pPr>` +
        '<w:ind w:left="851" w:firstLineChars="0" w:hanging="1"/>' +
        '</w:pPr><w:r><w:t>x</w:t></w:r></w:p>'
        );
        const p = parseParagraph(node);
    // hanging="1" without hangingChars → artifact, dropped
        expect(p.style?.hanging).toBeUndefined();
    // firstLineChars="0" is explicit → kept as {v:0}
        expect(p.style?.indentFirstLine).toEqual({ v: 0 });
    // 851 dxa = 56.73 px
        expect(p.style?.indentStart?.v).toBeCloseTo(56.73, 2);
    });

    it('keeps a real first-line indent (firstLineChars=200 → 28 px) on non-list paragraphs', () => {
        const node = pNode(
            `<w:p ${NS}><w:pPr>` +
        '<w:ind w:firstLineChars="200" w:firstLine="480"/>' +
        '</w:pPr><w:r><w:t>x</w:t></w:r></w:p>'
        );
        const p = parseParagraph(node);
    // 200 chars-hundredths × 10.5pt = 21pt → 28 px
        expect(p.style?.indentFirstLine?.v).toBeCloseTo(28, 2);
    });

    it('emits indentFirstLine:{v:0} on list paragraphs with firstLineChars="0" (must clear pStyle inheritance)', () => {
    // Word's "List Paragraph" pStyle commonly inherits firstLine="420" (21pt). Each list
    // paragraph writes firstLineChars="0" to neutralize that inheritance. On list paragraphs
    // the {v:0} does NOT collide with numbering — numbering controls first-line via its own
    // hanging — so we MUST forward the explicit 0 to Univer to override the inherited indent.
        const node = pNode(
            `<w:p ${NS}><w:pPr>` +
        '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' +
        '<w:ind w:left="567" w:firstLineChars="0"/>' +
        '</w:pPr><w:r><w:t>x</w:t></w:r></w:p>'
        );
        const p = parseParagraph(node);
        expect(p.bullet).toEqual({ numId: '1', ilvl: 0 });
        expect(p.style?.indentFirstLine).toEqual({ v: 0 });
    // 567 dxa = 37.8 px
        expect(p.style?.indentStart?.v).toBeCloseTo(37.8, 2);
    });
});

describe('inline w:ind on numbered paragraphs merges with numbering (per-attribute override)', () => {
  // ECMA-376 §17.9.23: numbering pPr is a base, inline pPr overrides per-attribute.
  // When a list paragraph writes `<w:ind w:left="567"/>` (no hanging), it intends to
  // override w:left only — the numbering's w:hanging must be preserved. After Word→Univer
  // hanging translation that means: indentStart = inlineLeft − numberingHanging,
  // and hanging = numberingHanging.
    it('inline w:ind w:left only on a numId/ilvl=0 paragraph inherits numbering.hanging', () => {
    // Numbering for numId=1 ilvl=0: left=425 hanging=425 → numbering.hanging=21.25pt
        const numberingXml =
            `<?xml version="1.0"?><w:numbering ${NS}>` +
      '<w:abstractNum w:abstractNumId="0">' +
      '<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/>' +
      '<w:pPr><w:ind w:left="425" w:hanging="425"/></w:pPr></w:lvl>' +
      '</w:abstractNum>' +
      '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>' +
      '</w:numbering>';
        const numbering = parseNumbering(numberingXml);

    // Inline w:ind has only w:left=567 (≈28.35pt), no hanging.
        const node = pNode(
            `<w:p ${NS}><w:pPr>` +
        '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' +
        '<w:ind w:left="567" w:firstLineChars="0"/>' +
        '</w:pPr><w:r><w:t>x</w:t></w:r></w:p>'
        );
        const p = parseParagraph(node);

        const children: DocumentChild[] = [{ kind: 'paragraph', paragraph: p }];
        const doc = assembleDocument(children, { numbering, rels: new Map(), media: new Map() });
        const para = (doc.body!.paragraphs as Array<{ paragraphStyle?: { indentStart?: { v: number }; hanging?: { v: number } } }>)[0];

    // Expected: indentStart = (567-425)/15 = 9.47 px, hanging inherited = 425/15 = 28.33 px.
        expect(para.paragraphStyle?.hanging?.v).toBeCloseTo(28.333, 2);
        expect(para.paragraphStyle?.indentStart?.v).toBeCloseTo(9.467, 2);
    });
});

describe('Univer list startNumber is an offset, not an absolute start', () => {
    it('OOXML start=1 must produce Univer startNumber=0 so the first item renders as "1"', () => {
    // Univer's bullet renderer computes display = previousStartIndexItem + startNumber,
    // and previousStartIndexItem defaults to 1 for the first item. So a docx start=1
    // (intent: "begin at 1") needs Univer startNumber=0.
        const xml =
            `<?xml version="1.0"?><w:numbering ${NS}>` +
      '<w:abstractNum w:abstractNumId="0">' +
      '<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/></w:lvl>' +
      '<w:lvl w:ilvl="1"><w:start w:val="3"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1.%2"/></w:lvl>' +
      '</w:abstractNum>' +
      '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>' +
      '</w:numbering>';
        const numbering = parseNumbering(xml);
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'a' }], bullet: { numId: '1', ilvl: 0 } } },
        ];
        const doc = assembleDocument(children, { numbering, rels: new Map(), media: new Map() });
        const lists = (doc as unknown as { lists: Record<string, { nestingLevel: Array<{ startNumber: number }> }> }).lists;
        expect(lists['1'].nestingLevel[0].startNumber).toBe(0); // OOXML start=1 → Univer offset 0
        expect(lists['1'].nestingLevel[1].startNumber).toBe(2); // OOXML start=3 → Univer offset 2
    });
});

describe('numbering w:lvl indent → ParsedNumberingLevel + IListData.nestingLevel', () => {
    const numberingXml =
        `<?xml version="1.0"?><w:numbering ${NS}>` +
    '<w:abstractNum w:abstractNumId="0">' +
    '<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/>' +
    '<w:pPr><w:ind w:left="1140" w:hanging="720"/></w:pPr></w:lvl>' +
    '<w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1.%2"/>' +
    '<w:pPr><w:ind w:left="1260" w:hanging="420"/></w:pPr></w:lvl>' +
    '</w:abstractNum>' +
    '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>' +
    '</w:numbering>';

    it('parses w:lvl <w:pPr><w:ind> into ParsedNumberingLevel (CSS px units, Univer hanging-indent semantics)', () => {
        const map = parseNumbering(numberingXml);
        const def = map.get('1');
        expect(def).toBeDefined();
    // Word's w:left = position of subsequent lines; Univer's indentStart = first-line/glyph
    // position. Univer adds `hanging` BACK for non-first lines. So indentStart = left − hanging.
        expect(def!.levels[0].indentStart?.v).toBeCloseTo(28, 2); // (1140 − 720)/15
        expect(def!.levels[0].hanging?.v).toBeCloseTo(48, 2); // 720/15
        expect(def!.levels[1].indentStart?.v).toBeCloseTo(56, 2); // (1260 − 420)/15
        expect(def!.levels[1].hanging?.v).toBeCloseTo(28, 2); // 420/15
    });

    it('writes lvl indent into IListData.nestingLevel[i].paragraphProperties', () => {
        const numbering = parseNumbering(numberingXml);
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'item' }], bullet: { numId: '1', ilvl: 0 } } },
        ];
        const doc = assembleDocument(children, { numbering, rels: new Map(), media: new Map() });
        const lists = (doc as unknown as { lists: Record<string, { nestingLevel: Array<{
            paragraphProperties?: { indentStart?: { v: number }; hanging?: { v: number } };
        }>; }>; }).lists;
        expect(lists['1'].nestingLevel[0].paragraphProperties?.indentStart?.v).toBeCloseTo(28, 2);
        expect(lists['1'].nestingLevel[0].paragraphProperties?.hanging?.v).toBeCloseTo(48, 2);
        expect(lists['1'].nestingLevel[1].paragraphProperties?.indentStart?.v).toBeCloseTo(56, 2);
    });
});
