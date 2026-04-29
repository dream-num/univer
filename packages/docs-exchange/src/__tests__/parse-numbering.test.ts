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
import { parseNumbering } from '../utils/parse/parse-numbering';

const sampleNumberingXml = `
<w:numbering xmlns:w="x">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0"><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:start w:val="1"/></w:lvl>
    <w:lvl w:ilvl="1"><w:numFmt w:val="lowerLetter"/><w:lvlText w:val="%2."/><w:start w:val="1"/></w:lvl>
  </w:abstractNum>
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val="☐"/><w:start w:val="1"/></w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
  <w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>`;

describe('parseNumbering', () => {
    it('returns empty map for undefined input', () => {
        expect(parseNumbering(undefined).size).toBe(0);
    });

    it('builds numId map with levels and listType', () => {
        const map = parseNumbering(sampleNumberingXml);
        const def = map.get('1');
        expect(def?.abstractNumId).toBe('0');
        expect(def?.levels.length).toBe(2);
        expect(def?.levels[0].format).toBe('decimal');
        expect(def?.listType).toBe('ORDER_LIST');
    });

    it('flags checkbox list (w:lvlText = U+2610) with listType=CHECK_LIST', () => {
        const map = parseNumbering(sampleNumberingXml);
        expect(map.get('2')?.isCheckbox).toBe(true);
        expect(map.get('2')?.listType).toBe('CHECK_LIST');
        expect(map.get('1')?.isCheckbox).toBeFalsy();
    });

    it('detects Wingdings-font bullet as checkbox', () => {
        const xml = `<w:numbering xmlns:w="x">
      <w:abstractNum w:abstractNumId="0">
        <w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val=""/><w:start w:val="1"/><w:rPr><w:rFonts w:ascii="Wingdings"/></w:rPr></w:lvl>
      </w:abstractNum>
      <w:num w:numId="9"><w:abstractNumId w:val="0"/></w:num>
    </w:numbering>`;
        const def = parseNumbering(xml).get('9');
        expect(def?.listType).toBe('CHECK_LIST');
    });

    it('classifies plain bullet as BULLET_LIST', () => {
        const xml = `<w:numbering xmlns:w="x">
      <w:abstractNum w:abstractNumId="0">
        <w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:start w:val="1"/></w:lvl>
      </w:abstractNum>
      <w:num w:numId="7"><w:abstractNumId w:val="0"/></w:num>
    </w:numbering>`;
        expect(parseNumbering(xml).get('7')?.listType).toBe('BULLET_LIST');
    });
});
