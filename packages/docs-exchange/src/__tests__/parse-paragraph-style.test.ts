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
import { parseParagraphStyle } from '../utils/parse/parse-paragraph-style';
import { xmlParser } from '../utils/parse/xml';

function pNode(xml: string): Record<string, unknown> {
    return (xmlParser.parse(xml) as Array<Record<string, unknown>>)[0];
}

describe('parseParagraphStyle', () => {
    it('returns undefined for empty pPr', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr/></w:p>');
        expect(parseParagraphStyle(node)).toBeUndefined();
    });

    it('maps center alignment', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:jc w:val="center"/></w:pPr></w:p>');
        expect(parseParagraphStyle(node)?.horizontalAlign).toBe(2);
    });

    it('maps end alignment to RIGHT', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:jc w:val="end"/></w:pPr></w:p>');
        expect(parseParagraphStyle(node)?.horizontalAlign).toBe(3);
    });

    it('maps Heading1 pStyle to namedStyleType 4', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:pStyle w:val="Heading1"/></w:pPr></w:p>');
        expect(parseParagraphStyle(node)?.namedStyleType).toBe(4);
    });

    it('maps borderBottom', () => {
        const node = pNode(
            '<w:p xmlns:w="x"><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CDD0D8"/></w:pBdr></w:pPr></w:p>'
        );
        const style = parseParagraphStyle(node);
        expect(style?.borderBottom?.color?.rgb).toBe('#CDD0D8');
        expect(style?.borderBottom?.dashStyle).toBe(1);
    });

    it('does not throw when w:jc has no val attribute (I2 guard)', () => {
    // <w:jc/> with no w:val — previously would do `undefined in ALIGN_MAP` → TypeError
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:jc/></w:pPr></w:p>');
        expect(() => parseParagraphStyle(node)).not.toThrow();
        expect(parseParagraphStyle(node)).toBeUndefined();
    });

  // ── w:spacing ────────────────────────────────────────────────────────────

    it('w:spacing line=240 lineRule=auto → lineSpacing 1.0, spacingRule AUTO', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.lineSpacing).toBe(1);
        expect(s?.spacingRule).toBe(0);
    });

    it('w:spacing line=480 lineRule=auto → 2.0 multiplier (double-spaced)', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:spacing w:line="480" w:lineRule="auto"/></w:pPr></w:p>');
        expect(parseParagraphStyle(node)?.lineSpacing).toBe(2);
    });

    it('w:spacing line=480 lineRule=atLeast → lineSpacing 32px, spacingRule AT_LEAST', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:spacing w:line="480" w:lineRule="atLeast"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.lineSpacing).toBe(32);
        expect(s?.spacingRule).toBe(1);
    });

    it('w:spacing line=400 lineRule=exact → lineSpacing ≈26.67px, spacingRule EXACT', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:spacing w:line="400" w:lineRule="exact"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.lineSpacing).toBeCloseTo(26.667, 2);
        expect(s?.spacingRule).toBe(2);
    });

    it('w:spacing line without lineRule defaults to auto', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:spacing w:line="360"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.lineSpacing).toBe(1.5);
        expect(s?.spacingRule).toBe(0);
    });

    it('w:spacing before/after → spaceAbove/spaceBelow in CSS px (dxa÷15)', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.spaceAbove).toEqual({ v: 16 });
        expect(s?.spaceBelow).toEqual({ v: 8 });
    });

  // ── w:ind ────────────────────────────────────────────────────────────────

    it('w:ind left/right/firstLine → indentStart/indentEnd/indentFirstLine in CSS px (no hanging)', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:ind w:left="720" w:right="360" w:firstLine="480"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.indentStart).toEqual({ v: 48 });
        expect(s?.indentEnd).toEqual({ v: 24 });
        expect(s?.indentFirstLine).toEqual({ v: 32 });
    });

  // OOXML w:ind has w:left = "the position of subsequent (non-first) lines",
  // and w:hanging = "how far to pull the first line LEFT of that position".
  // Univer's IIndentStart is the inverse: indentStart = first-line/glyph
  // position, then `hanging` is added back for subsequent lines. So the
  // mapping must be: Univer.indentStart = w:left - w:hanging, Univer.hanging = w:hanging.
    it('w:ind left+hanging → Univer indentStart = left - hanging (Word hanging-indent semantics)', () => {
    // Numbering ilvl=0 from frontend/文书格式.docx: left=425 dxa, hanging=425 dxa.
    // 425 dxa = 28.33px. Word renders this with the glyph at 0px and continuation at 28.33px.
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:ind w:left="425" w:hanging="425"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.indentStart).toEqual({ v: 0 });
        expect(s?.hanging?.v).toBeCloseTo(28.333, 2);
    });

    it('w:ind left=992 hanging=567 (numbering ilvl=1) → indentStart≈28.33px, hanging≈37.8px', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:ind w:left="992" w:hanging="567"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.indentStart?.v).toBeCloseTo(28.333, 2);
        expect(s?.hanging?.v).toBeCloseTo(37.8, 2);
    });

    it('w:ind hanging without left maps to hanging only (indentStart not emitted)', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:ind w:hanging="240"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.hanging).toEqual({ v: 16 });
        expect(s?.indentFirstLine).toBeUndefined();
    // No w:left present → no indentStart synthesised.
        expect(s?.indentStart).toBeUndefined();
    });

    it('w:ind w:start/w:end (OOXML 2010+) are accepted as left/right aliases', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:ind w:start="720" w:end="360"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.indentStart).toEqual({ v: 48 });
        expect(s?.indentEnd).toEqual({ v: 24 });
    });

  // ── *Chars / *Lines suffix variants ─────────────────────────────────────

    it('w:ind firstLineChars="0" emits {v:0} (explicit clear-inherited signal)', () => {
    // firstLineChars is a USER-WRITTEN attribute. "0" is meaningful: Word writes it to clear
    // any first-line indent inherited from a pStyle (e.g. "List Paragraph"). We forward {v:0}
    // so downstream consumers can override the inheritance. Contrast with dxa-only artifacts
    // (w:hanging="1" → tiny px) which are dropped because no chars override means it's just
    // round-trip noise.
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:ind w:firstLineChars="0"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.indentFirstLine).toEqual({ v: 0 });
    });

    it('w:ind firstLineChars wins over w:firstLine when both are present', () => {
    // firstLineChars=200 → 2 chars × 10.5pt = 21pt → 28px;
    // w:firstLine=480 (24pt → 32px) ignored.
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:ind w:firstLine="480" w:firstLineChars="200"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.indentFirstLine?.v).toBeCloseTo(28, 2);
    });

    it('w:ind leftChars / rightChars / hangingChars all read (Univer indentStart = leftChars - hangingChars)', () => {
    // leftChars=100 → 10.5pt → 14px; hangingChars=50 → 5.25pt → 7px;
    // Univer.indentStart = 14 − 7 = 7px; Univer.hanging = 7px; rightChars=200 → 21pt → 28px.
        const node = pNode(
            '<w:p xmlns:w="x"><w:pPr><w:ind w:leftChars="100" w:rightChars="200" w:hangingChars="50"/></w:pPr></w:p>'
        );
        const s = parseParagraphStyle(node);
        expect(s?.indentStart?.v).toBeCloseTo(7, 2);
        expect(s?.indentEnd?.v).toBeCloseTo(28, 2);
        expect(s?.hanging?.v).toBeCloseTo(7, 2);
    });

    it('w:spacing beforeLines/afterLines used when before/after dxa missing', () => {
    // beforeLines=100 → 1 line × 16px = 16px; afterLines=50 → 0.5 line × 16px = 8px
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:spacing w:beforeLines="100" w:afterLines="50"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.spaceAbove).toEqual({ v: 16 });
        expect(s?.spaceBelow).toEqual({ v: 8 });
    });

    it('w:spacing dxa wins over Lines variant when both are present', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:spacing w:before="240" w:beforeLines="500"/></w:pPr></w:p>');
        const s = parseParagraphStyle(node);
        expect(s?.spaceAbove).toEqual({ v: 16 }); // 240 dxa = 16px; not 80px from beforeLines
    });
});
