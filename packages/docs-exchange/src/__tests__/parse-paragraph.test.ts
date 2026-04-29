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
import { xmlParser } from '../utils/parse/xml';

function pNode(xml: string): Record<string, unknown> {
    return (xmlParser.parse(xml) as Array<Record<string, unknown>>)[0];
}

describe('parseParagraph', () => {
    it('parses runs and style together', () => {
        const node = pNode('<w:p xmlns:w="x"><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>Hi</w:t></w:r></w:p>');
        const p = parseParagraph(node);
        expect(p.runs[0].text).toBe('Hi');
        expect(p.style?.horizontalAlign).toBe(2);
    });

    it('extracts numPr as bullet', () => {
        const node = pNode(
            '<w:p xmlns:w="x"><w:pPr><w:numPr><w:ilvl w:val="1"/><w:numId w:val="3"/></w:numPr></w:pPr><w:r><w:t>x</w:t></w:r></w:p>'
        );
        const p = parseParagraph(node);
        expect(p.bullet).toEqual({ numId: '3', ilvl: 1 });
    });

    it('handles empty paragraph (no runs)', () => {
        const node = pNode('<w:p xmlns:w="x"/>');
        const p = parseParagraph(node);
        expect(p.runs).toEqual([]);
        expect(p.bullet).toBeUndefined();
    });

    it('treats numId="0" as no bullet (DOCX list opt-out)', () => {
        const node = pNode(
            '<w:p xmlns:w="x"><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="0"/></w:numPr></w:pPr><w:r><w:t>x</w:t></w:r></w:p>'
        );
        expect(parseParagraph(node).bullet).toBeUndefined();
    });

    it('combines runs + style + bullet in one paragraph', () => {
        const node = pNode(
            '<w:p xmlns:w="x"><w:pPr><w:jc w:val="center"/><w:numPr><w:ilvl w:val="2"/><w:numId w:val="5"/></w:numPr></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>hi</w:t></w:r></w:p>'
        );
        const p = parseParagraph(node);
        expect(p.runs[0].style?.bl).toBe(1);
        expect(p.style?.horizontalAlign).toBe(2);
        expect(p.bullet).toEqual({ numId: '5', ilvl: 2 });
    });
});
