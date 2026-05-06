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

import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { docxToUniverData } from '../docx-to-univer';

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

function buildDocumentXml(sectPrInner: string): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Hello</w:t></w:r></w:p>
    <w:sectPr>${sectPrInner}</w:sectPr>
  </w:body>
</w:document>`;
}

async function buildDocxBuffer(documentXml: string): Promise<Uint8Array> {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', CONTENT_TYPES);
    zip.file('_rels/.rels', ROOT_RELS);
    zip.file('word/document.xml', documentXml);
    return zip.generateAsync({ type: 'uint8array' });
}

describe('docxToUniverData — sectPr → documentStyle', () => {
    it('extracts pageSize from w:pgSz (twentieths-of-a-point → CSS px)', async () => {
        const xml = buildDocumentXml('<w:pgSz w:w="11906" w:h="16838"/>');
        const result = await docxToUniverData(await buildDocxBuffer(xml));
        expect(result.documentStyle.pageSize!.width).toBeCloseTo(793.73, 1);
        expect(result.documentStyle.pageSize!.height).toBeCloseTo(1122.53, 1);
    });

    it('extracts margins from w:pgMar', async () => {
        const xml = buildDocumentXml(
            '<w:pgSz w:w="11906" w:h="16838"/>' +
        '<w:pgMar w:top="2098" w:right="1474" w:bottom="1985" w:left="1588" w:header="851" w:footer="992"/>'
        );
        const result = await docxToUniverData(await buildDocxBuffer(xml));
        expect(result.documentStyle.marginTop).toBeCloseTo(139.87, 1);
        expect(result.documentStyle.marginRight).toBeCloseTo(98.27, 1);
        expect(result.documentStyle.marginBottom).toBeCloseTo(132.33, 1);
        expect(result.documentStyle.marginLeft).toBeCloseTo(105.87, 1);
        expect(result.documentStyle.marginHeader).toBeCloseTo(56.73, 1);
        expect(result.documentStyle.marginFooter).toBeCloseTo(66.13, 1);
    });

    it('extracts landscape orientation from w:pgSz w:orient', async () => {
        const xml = buildDocumentXml('<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>');
        const result = await docxToUniverData(await buildDocxBuffer(xml));
        expect(result.documentStyle.pageOrient).toBe(1);
    });

    it('falls back to A4 defaults when sectPr is missing', async () => {
        const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>NoSect</w:t></w:r></w:p></w:body>
</w:document>`;
        const result = await docxToUniverData(await buildDocxBuffer(xml));
        expect(result.documentStyle.pageSize).toEqual({ width: 793.7, height: 1122.7 });
    });

    it('marks documentFlavor as TRADITIONAL so Univer renders pagination instead of continuous flow', async () => {
        const xml = buildDocumentXml('<w:pgSz w:w="11906" w:h="16838"/>');
        const result = await docxToUniverData(await buildDocxBuffer(xml));
    // DocumentFlavor.TRADITIONAL = 1 (Word-style paginated layout)
        expect(result.documentStyle.documentFlavor).toBe(1);
    });

    it('extracts docGrid linePitch (dxa → CSS px) and gridType into sectionBreaks', async () => {
        const xml = buildDocumentXml(
            '<w:pgSz w:w="11906" w:h="16838"/><w:docGrid w:type="lines" w:linePitch="312"/>'
        );
        const result = await docxToUniverData(await buildDocxBuffer(xml));
        const sb = result.body!.sectionBreaks?.[0];
    // 312 dxa = 15.6pt = 20.8px; GridType.LINES = 1
        expect(sb?.linePitch).toBeCloseTo(20.8, 2);
        expect(sb?.gridType).toBe(1);
    });

    it('maps docGrid w:type values to Univer GridType enum', async () => {
        const cases: Array<[string, number]> = [
            ['default', 0],
            ['lines', 1],
            ['linesAndChars', 2],
            ['snapToChars', 3],
        ];
        for (const [name, expected] of cases) {
            const xml = buildDocumentXml(
                `<w:pgSz w:w="11906" w:h="16838"/><w:docGrid w:type="${name}" w:linePitch="312"/>`
            );
            const result = await docxToUniverData(await buildDocxBuffer(xml));
            expect(result.body!.sectionBreaks?.[0]?.gridType).toBe(expected);
        }
    });
});

// ── parseSectionPropertiesFromNode (the helper used by inline w:p/w:pPr/w:sectPr) ──

describe('parseSectionPropertiesFromNode', () => {
    it('parses inline sectPr with header/first/even refs, titlePg, type, landscape pgSz', async () => {
        const { parseSectionPropertiesFromNode } = await import('../utils/parse/parse-section');
        const { xmlParser } = await import('../utils/parse/xml');
        const xml = `<w:sectPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
            <w:headerReference w:type="default" r:id="rId4"/>
            <w:headerReference w:type="first" r:id="rId7"/>
            <w:footerReference w:type="default" r:id="rId5"/>
            <w:titlePg/>
            <w:type w:val="continuous"/>
            <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
            <w:pgMar w:top="720" w:right="900" w:bottom="720" w:left="900" w:header="360" w:footer="360"/>
        </w:sectPr>`;
        const node = (xmlParser.parse(xml) as Array<Record<string, unknown>>)[0];
        const parsed = parseSectionPropertiesFromNode(node);
        expect(parsed.headerRefs).toEqual({ default: 'rId4', first: 'rId7' });
        expect(parsed.footerRefs).toEqual({ default: 'rId5' });
        expect(parsed.titlePage).toBe(true);
        expect(parsed.sectionTypeRaw).toBe('continuous');
        // 16838 dxa ≈ 1122.53px (landscape width); 11906 dxa ≈ 793.73px (height).
        expect(parsed.documentStyle.pageOrient).toBe(1);
        expect(parsed.documentStyle.pageSize!.width).toBeCloseTo(1122.5, 1);
        expect(parsed.documentStyle.pageSize!.height).toBeCloseTo(793.7, 1);
        expect(parsed.documentStyle.marginTop).toBeCloseTo(48, 1);
        expect(parsed.documentStyle.marginHeader).toBeCloseTo(24, 1);
    });

    it('returns empty refs/titlePage=false when sectPr has no relevant children', async () => {
        const { parseSectionPropertiesFromNode } = await import('../utils/parse/parse-section');
        const { xmlParser } = await import('../utils/parse/xml');
        const node = (xmlParser.parse(
            '<w:sectPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>'
        ) as Array<Record<string, unknown>>)[0];
        const parsed = parseSectionPropertiesFromNode(node);
        expect(parsed.headerRefs).toEqual({});
        expect(parsed.footerRefs).toEqual({});
        expect(parsed.titlePage).toBe(false);
        expect(parsed.sectionTypeRaw).toBeUndefined();
    });
});
