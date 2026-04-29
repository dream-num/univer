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
import { parseStyles } from '../utils/parse/parse-styles';

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

describe('parseStyles', () => {
    it('returns empty index when stylesXml is undefined', () => {
        const idx = parseStyles(undefined);
        expect(idx.docDefaults.pPr).toBeUndefined();
        expect(idx.docDefaults.rPr).toBeUndefined();
        expect(idx.paragraphStyles.size).toBe(0);
        expect(idx.characterStyles.size).toBe(0);
    });

    it('parses docDefaults rPr (font + size)', () => {
        const xml = `<w:styles ${NS}>
      <w:docDefaults>
        <w:rPrDefault><w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:sz w:val="24"/>
        </w:rPr></w:rPrDefault>
      </w:docDefaults>
    </w:styles>`;
        const idx = parseStyles(xml);
        expect(idx.docDefaults.rPr?.ff).toBe('Calibri');
        expect(idx.docDefaults.rPr?.fs).toBe(12);
    });

    it('parses docDefaults pPr (spacing)', () => {
        const xml = `<w:styles ${NS}>
      <w:docDefaults>
        <w:pPrDefault><w:pPr>
          <w:spacing w:line="276" w:lineRule="auto" w:after="160"/>
        </w:pPr></w:pPrDefault>
      </w:docDefaults>
    </w:styles>`;
        const idx = parseStyles(xml);
        expect(idx.docDefaults.pPr?.lineSpacing).toBeCloseTo(276 / 240);
        expect(idx.docDefaults.pPr?.spaceBelow?.v).toBeCloseTo(160 / 15, 2);
    });

    it('parses a paragraph named style with basedOn', () => {
        const xml = `<w:styles ${NS}>
      <w:style w:type="paragraph" w:styleId="Normal">
        <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
        <w:rPr><w:rFonts w:ascii="Times"/><w:sz w:val="22"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading1">
        <w:basedOn w:val="Normal"/>
        <w:pPr><w:spacing w:before="240"/></w:pPr>
        <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
      </w:style>
    </w:styles>`;
        const idx = parseStyles(xml);
        expect(idx.paragraphStyles.has('Normal')).toBe(true);
        expect(idx.paragraphStyles.has('Heading1')).toBe(true);
        expect(idx.paragraphStyles.get('Heading1')?.basedOn).toBe('Normal');
    });

    it('resolvePStyle walks basedOn chain (child wins over parent)', () => {
        const xml = `<w:styles ${NS}>
      <w:style w:type="paragraph" w:styleId="Normal">
        <w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
        <w:rPr><w:rFonts w:ascii="Times"/><w:sz w:val="22"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading1">
        <w:basedOn w:val="Normal"/>
        <w:pPr><w:spacing w:before="240"/></w:pPr>
        <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
      </w:style>
    </w:styles>`;
        const idx = parseStyles(xml);
        const resolved = idx.resolvePStyle('Heading1');
    // pPr: parent's lineSpacing inherited, child's spaceAbove added
        expect(resolved.pPr?.lineSpacing).toBe(1);
        expect(resolved.pPr?.spaceAbove).toEqual({ v: 16 });
    // rPr: parent's ff inherited, child overrides fs and adds bold
        expect(resolved.rPr?.ff).toBe('Times');
        expect(resolved.rPr?.fs).toBe(16); // 32/2, child wins
        expect(resolved.rPr?.bl).toBe(1);
    });

    it('resolvePStyle returns empty when styleId unknown', () => {
        const idx = parseStyles(`<w:styles ${NS}/>`);
        expect(idx.resolvePStyle('Bogus').pPr).toBeUndefined();
        expect(idx.resolvePStyle('Bogus').rPr).toBeUndefined();
    });

    it('parses character styles separately and resolveRStyle walks chain', () => {
        const xml = `<w:styles ${NS}>
      <w:style w:type="character" w:styleId="Emphasis">
        <w:rPr><w:i/></w:rPr>
      </w:style>
      <w:style w:type="character" w:styleId="StrongEmphasis">
        <w:basedOn w:val="Emphasis"/>
        <w:rPr><w:b/></w:rPr>
      </w:style>
    </w:styles>`;
        const idx = parseStyles(xml);
        const r = idx.resolveRStyle('StrongEmphasis');
        expect(r?.it).toBe(1);
        expect(r?.bl).toBe(1);
    });

    it('breaks basedOn cycles without infinite loop', () => {
        const xml = `<w:styles ${NS}>
      <w:style w:type="paragraph" w:styleId="A">
        <w:basedOn w:val="B"/>
        <w:pPr><w:spacing w:before="240"/></w:pPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="B">
        <w:basedOn w:val="A"/>
        <w:pPr><w:spacing w:after="120"/></w:pPr>
      </w:style>
    </w:styles>`;
        const idx = parseStyles(xml);
        const r = idx.resolvePStyle('A');
        expect(r.pPr?.spaceAbove).toEqual({ v: 16 });
        expect(r.pPr?.spaceBelow).toEqual({ v: 8 });
    });
});
