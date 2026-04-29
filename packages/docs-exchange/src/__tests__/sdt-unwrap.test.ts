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

import { CustomRangeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { parseHeaderFooterXml } from '../utils/parse/parse-header-footer';
import { flattenSdt, nodeChildren, nodeName, xmlParser } from '../utils/parse/xml';

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

describe('flattenSdt', () => {
    it('passes through non-sdt nodes unchanged', () => {
        const tree = xmlParser.parse(`<root ${W}><w:p/><w:tbl/></root>`) as any[];
        const root = tree.find((n) => nodeName(n) === 'root')!;
        const flat = flattenSdt(nodeChildren(root));
        expect(flat.map(nodeName)).toEqual(['w:p', 'w:tbl']);
    });

    it('unwraps a single sdt level, preserving order', () => {
        const tree = xmlParser.parse(
            `<root ${W}><w:p><w:r><w:t>before</w:t></w:r></w:p><w:sdt><w:sdtPr/><w:sdtContent><w:p><w:r><w:t>inside</w:t></w:r></w:p></w:sdtContent></w:sdt><w:p><w:r><w:t>after</w:t></w:r></w:p></root>`
        ) as any[];
        const root = tree.find((n) => nodeName(n) === 'root')!;
        const flat = flattenSdt(nodeChildren(root));
        expect(flat.map(nodeName)).toEqual(['w:p', 'w:p', 'w:p']);
    });

    it('unwraps nested sdt', () => {
        const tree = xmlParser.parse(
            `<root ${W}><w:sdt><w:sdtContent><w:sdt><w:sdtContent><w:p/></w:sdtContent></w:sdt></w:sdtContent></w:sdt></root>`
        ) as any[];
        const root = tree.find((n) => nodeName(n) === 'root')!;
        const flat = flattenSdt(nodeChildren(root));
        expect(flat.map(nodeName)).toEqual(['w:p']);
    });
});

describe('parseHeaderFooterXml unwraps sdt-wrapped paragraphs', () => {
    it('extracts PAGE field from a paragraph nested inside w:sdtContent', () => {
        // Mirrors the shape of footer2.xml in 文书格式.docx: the PAGE field is
        // wrapped in an SDT content control rather than living directly under <w:ftr>.
        const xml = `<w:ftr ${W}>
      <w:sdt>
        <w:sdtPr><w:id w:val="1"/></w:sdtPr>
        <w:sdtContent>
          <w:p>
            <w:r><w:fldChar w:fldCharType="begin"/></w:r>
            <w:r><w:instrText>PAGE</w:instrText></w:r>
            <w:r><w:fldChar w:fldCharType="separate"/></w:r>
            <w:r><w:t>1</w:t></w:r>
            <w:r><w:fldChar w:fldCharType="end"/></w:r>
          </w:p>
        </w:sdtContent>
      </w:sdt>
    </w:ftr>`;

        const result = parseHeaderFooterXml(xml, 'w:ftr', {
            numbering: new Map(),
            media: new Map(),
            rels: new Map(),
        });

        expect(result).toBeDefined();
        const fieldRange = result!.body.customRanges?.find(
            (r) => r.rangeType === CustomRangeType.FIELD
        );
        expect(fieldRange).toBeDefined();
        expect((fieldRange as any).properties?.subtype).toBe('PAGE');
    });
});
