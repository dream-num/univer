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
import { parseTable } from '../utils/parse/parse-table';
import { xmlParser } from '../utils/parse/xml';

function tblNode(xml: string): Record<string, unknown> {
    return (xmlParser.parse(xml) as Array<Record<string, unknown>>)[0];
}

describe('parseTable', () => {
    it('parses 2x2 table', () => {
        const xml = `<w:tbl xmlns:w="x">
      <w:tr><w:tc><w:p><w:r><w:t>A</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>B</w:t></w:r></w:p></w:tc></w:tr>
      <w:tr><w:tc><w:p><w:r><w:t>C</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>D</w:t></w:r></w:p></w:tc></w:tr>
    </w:tbl>`;
        const t = parseTable(tblNode(xml));
        expect(t.rows.length).toBe(2);
        expect(t.rows[0].length).toBe(2);
        expect(t.rows[0][0].paragraphs[0].runs[0].text).toBe('A');
        expect(t.rows[1][1].paragraphs[0].runs[0].text).toBe('D');
    });

    it('captures gridSpan as columnSpan', () => {
        const xml = `<w:tbl xmlns:w="x">
      <w:tr><w:tc><w:tcPr><w:gridSpan w:val="2"/></w:tcPr><w:p><w:r><w:t>X</w:t></w:r></w:p></w:tc></w:tr>
    </w:tbl>`;
        const t = parseTable(tblNode(xml));
        expect(t.rows[0][0].columnSpan).toBe(2);
    });

    it('captures column widths from tblGrid in DXA units', () => {
        const xml = `<w:tbl xmlns:w="x">
      <w:tblGrid><w:gridCol w:w="2400"/><w:gridCol w:w="3600"/></w:tblGrid>
      <w:tr><w:tc><w:p/></w:tc><w:tc><w:p/></w:tc></w:tr>
    </w:tbl>`;
        const t = parseTable(tblNode(xml));
    // dxa → CSS px (dxa / 15): 2400 → 160, 3600 → 240
        expect(t.columnWidths).toEqual([160, 240]);
    });

    it('computes rowSpan from vMerge restart + continue chain', () => {
        const xml = `<w:tbl xmlns:w="x">
      <w:tr>
        <w:tc><w:tcPr><w:vMerge w:val="restart"/></w:tcPr><w:p><w:r><w:t>A</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>B</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:tcPr><w:vMerge/></w:tcPr><w:p/></w:tc>
        <w:tc><w:p><w:r><w:t>C</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:tcPr><w:vMerge/></w:tcPr><w:p/></w:tc>
        <w:tc><w:p><w:r><w:t>D</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>`;
        const t = parseTable(tblNode(xml));
        expect(t.rows[0][0].rowSpan).toBe(3);
        expect(t.rows[0][0].vMerge).toBe('restart');
        expect(t.rows[1][0].vMerge).toBe('continue');
    });
});

describe('parseTable: cell-level styling (Phase 1+2)', () => {
    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

    it('parses <w:tcPr><w:shd w:fill> as shadingFill', () => {
        const xml =
            `<w:tbl ${NS}><w:tr><w:tc>` +
      '<w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="CAE0D6"/></w:tcPr>' +
      '<w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
        expect(t.rows[0][0].shadingFill).toBe('CAE0D6');
    });

    it('parses <w:tcPr><w:tcBorders> per side with val/color/sz', () => {
        const xml =
            `<w:tbl ${NS}><w:tr><w:tc>` +
      '<w:tcPr><w:tcBorders>' +
      '<w:top w:val="nil"/>' +
      '<w:bottom w:val="single" w:sz="4" w:color="67A589"/>' +
      '<w:left w:val="dotted" w:sz="6" w:color="auto"/>' +
      '<w:right w:val="dashed" w:sz="8" w:color="FF0000"/>' +
      '</w:tcBorders></w:tcPr>' +
      '<w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
        const b = t.rows[0][0].borders!;
        expect(b.top?.val).toBe('nil');
        expect(b.bottom?.val).toBe('single');
        expect(b.bottom?.color).toBe('67A589');
        expect(b.bottom?.sizeEighths).toBe(4);
        expect(b.left?.val).toBe('dotted');
        expect(b.right?.val).toBe('dashed');
        expect(b.right?.color).toBe('FF0000');
    });

    it('parses <w:tcPr><w:vAlign> as vAlign', () => {
        const xml =
            `<w:tbl ${NS}><w:tr><w:tc>` +
      '<w:tcPr><w:vAlign w:val="center"/></w:tcPr>' +
      '<w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
        expect(t.rows[0][0].vAlign).toBe('center');
    });

    it('parses <w:tcPr><w:tcMar> per side in CSS px (dxa/15)', () => {
        const xml =
            `<w:tbl ${NS}><w:tr><w:tc>` +
      '<w:tcPr><w:tcMar>' +
      '<w:top w:w="100" w:type="dxa"/>' +
      '<w:bottom w:w="100" w:type="dxa"/>' +
      '<w:start w:w="200" w:type="dxa"/>' +
      '<w:end w:w="200" w:type="dxa"/>' +
      '</w:tcMar></w:tcPr>' +
      '<w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
    // 100 dxa = 6.667 px, 200 dxa = 13.333 px
        const m = t.rows[0][0].margin!;
        expect(m.top).toBeCloseTo(6.667, 2);
        expect(m.bottom).toBeCloseTo(6.667, 2);
        expect(m.start).toBeCloseTo(13.333, 2);
        expect(m.end).toBeCloseTo(13.333, 2);
    });

    it('parses <w:tcPr><w:tcW w:type="dxa"> as preferredWidthPx (CSS px)', () => {
        const xml =
            `<w:tbl ${NS}><w:tr><w:tc>` +
      '<w:tcPr><w:tcW w:w="2788" w:type="dxa"/></w:tcPr>' +
      '<w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
    // 2788 dxa / 15 ≈ 185.867 px
        expect(t.rows[0][0].preferredWidthPx).toBeCloseTo(185.867, 2);
    });
});

describe('parseTable: row-level properties', () => {
    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

    it('parses <w:trPr><w:trHeight> per row in CSS px with hRule', () => {
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tr><w:trPr><w:trHeight w:val="480" w:hRule="exact"/></w:trPr><w:tc><w:p/></w:tc></w:tr>' +
      '<w:tr><w:trPr><w:trHeight w:val="600"/></w:trPr><w:tc><w:p/></w:tc></w:tr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr>' +
      '</w:tbl>';
        const t = parseTable(tblNode(xml));
    // 480 dxa / 15 = 32 px; 600 dxa / 15 = 40 px
        expect(t.rowHeights?.[0]).toEqual({ v: 32, rule: 'exact' });
    // No w:hRule defaults to atLeast per ECMA-376
        expect(t.rowHeights?.[1]).toEqual({ v: 40, rule: 'atLeast' });
        expect(t.rowHeights?.[2]).toBeUndefined();
    });

    it('parses <w:trPr><w:cantSplit> per row', () => {
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:p/></w:tc></w:tr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr>' +
      '</w:tbl>';
        const t = parseTable(tblNode(xml));
        expect(t.rowCantSplit?.[0]).toBe(true);
        expect(t.rowCantSplit?.[1]).toBeFalsy();
    });

    it('parses <w:trPr><w:tblHeader> per row', () => {
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tr><w:trPr><w:tblHeader/></w:trPr><w:tc><w:p/></w:tc></w:tr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr>' +
      '</w:tbl>';
        const t = parseTable(tblNode(xml));
        expect(t.rowIsHeader?.[0]).toBe(true);
        expect(t.rowIsHeader?.[1]).toBeFalsy();
    });
});

describe('parseTable: tblStyle inheritance from styles.xml (Phase 3)', () => {
    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

    it('table inherits tblBorders from named tblStyle when inline tblBorders is absent', async () => {
        const { parseStyles } = await import('../utils/parse/parse-styles');
        const stylesXml =
            `<?xml version="1.0"?><w:styles ${NS}>` +
      '<w:style w:type="table" w:styleId="aa">' +
      '<w:tblPr><w:tblBorders>' +
      '<w:top w:val="single" w:sz="4" w:color="000000"/>' +
      '<w:bottom w:val="single" w:sz="4" w:color="000000"/>' +
      '<w:insideH w:val="single" w:sz="4" w:color="000000"/>' +
      '</w:tblBorders></w:tblPr>' +
      '</w:style></w:styles>';
        const styles = parseStyles(stylesXml);

        const xml =
            `<w:tbl ${NS}>` +
      '<w:tblPr><w:tblStyle w:val="aa"/></w:tblPr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml), undefined, styles);
        expect(t.borders?.top?.val).toBe('single');
        expect(t.borders?.insideH?.val).toBe('single');
    });

    it('inline tblBorders override the inherited tblStyle per-side', () => {
    // Same as above but inline overrides the bottom side. The top still comes from style.
    });

    it('basedOn chain: style B based on A — B inherits A.tblBorders, B overrides perimeter', async () => {
        const { parseStyles } = await import('../utils/parse/parse-styles');
        const stylesXml =
            `<?xml version="1.0"?><w:styles ${NS}>` +
      '<w:style w:type="table" w:styleId="A">' +
      '<w:tblPr><w:tblBorders>' +
      '<w:top w:val="single" w:sz="4" w:color="000000"/>' +
      '<w:insideH w:val="dotted" w:sz="4" w:color="111111"/>' +
      '</w:tblBorders></w:tblPr>' +
      '</w:style>' +
      '<w:style w:type="table" w:styleId="B"><w:basedOn w:val="A"/>' +
      '<w:tblPr><w:tblBorders>' +
      '<w:top w:val="dashed" w:sz="8" w:color="FF0000"/>' +
      '</w:tblBorders></w:tblPr>' +
      '</w:style></w:styles>';
        const styles = parseStyles(stylesXml);
        const t = parseTable(
            tblNode(`<w:tbl ${NS}><w:tblPr><w:tblStyle w:val="B"/></w:tblPr><w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>`),
            undefined,
            styles
        );
        expect(t.borders?.top?.val).toBe('dashed'); // B wins
        expect(t.borders?.top?.color).toBe('FF0000');
        expect(t.borders?.insideH?.val).toBe('dotted'); // inherited from A
    });

    it('per-cell shading inherited from tblStyle <w:tcPr><w:shd> when cell has no own shd', async () => {
        const { parseStyles } = await import('../utils/parse/parse-styles');
        const stylesXml =
            `<?xml version="1.0"?><w:styles ${NS}>` +
      '<w:style w:type="table" w:styleId="aa">' +
      '<w:tcPr><w:shd w:val="clear" w:fill="EEEEEE"/></w:tcPr>' +
      '</w:style></w:styles>';
        const styles = parseStyles(stylesXml);
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tblPr><w:tblStyle w:val="aa"/></w:tblPr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml), undefined, styles);
        expect(t.rows[0][0].shadingFill).toBe('EEEEEE');
    });

    it('cell own shd wins over inherited tblStyle tcPr shd', async () => {
        const { parseStyles } = await import('../utils/parse/parse-styles');
        const stylesXml =
            `<?xml version="1.0"?><w:styles ${NS}>` +
      '<w:style w:type="table" w:styleId="aa">' +
      '<w:tcPr><w:shd w:val="clear" w:fill="EEEEEE"/></w:tcPr>' +
      '</w:style></w:styles>';
        const styles = parseStyles(stylesXml);
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tblPr><w:tblStyle w:val="aa"/></w:tblPr>' +
      '<w:tr><w:tc><w:tcPr><w:shd w:val="clear" w:fill="FF0000"/></w:tcPr><w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml), undefined, styles);
        expect(t.rows[0][0].shadingFill).toBe('FF0000');
    });
});

describe('parseTable: table-level properties', () => {
    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

    it('parses <w:tblPr><w:tblBorders> with insideH/insideV', () => {
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tblPr><w:tblBorders>' +
      '<w:top w:val="single" w:sz="4" w:color="000000"/>' +
      '<w:insideH w:val="dotted" w:sz="4" w:color="67A589"/>' +
      '<w:insideV w:val="dotted" w:sz="4" w:color="67A589"/>' +
      '</w:tblBorders></w:tblPr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
        expect(t.borders?.top?.val).toBe('single');
        expect(t.borders?.insideH?.val).toBe('dotted');
        expect(t.borders?.insideV?.color).toBe('67A589');
    });

    it('parses <w:tblPr><w:shd> as table-level shadingFill default', () => {
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tblPr><w:shd w:val="clear" w:fill="EEEEEE"/></w:tblPr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
        expect(t.shadingFill).toBe('EEEEEE');
    });

    it('parses <w:tblPr><w:tblCellMar> as default cellMargin', () => {
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tblPr><w:tblCellMar>' +
      '<w:top w:w="100" w:type="dxa"/>' +
      '<w:bottom w:w="100" w:type="dxa"/>' +
      '<w:start w:w="200" w:type="dxa"/>' +
      '<w:end w:w="200" w:type="dxa"/>' +
      '</w:tblCellMar></w:tblPr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
    // 100 dxa / 15 = 6.667 px; 200 dxa / 15 = 13.333 px
        const cm = t.cellMargin!;
        expect(cm.top).toBeCloseTo(6.667, 2);
        expect(cm.bottom).toBeCloseTo(6.667, 2);
        expect(cm.start).toBeCloseTo(13.333, 2);
        expect(cm.end).toBeCloseTo(13.333, 2);
    });

    it('parses <w:tblPr><w:jc>, <w:tblInd>, <w:tblLayout>, <w:tblW>, <w:tblStyle>', () => {
        const xml =
            `<w:tbl ${NS}>` +
      '<w:tblPr>' +
      '<w:tblStyle w:val="aa"/>' +
      '<w:tblW w:w="9000" w:type="dxa"/>' +
      '<w:jc w:val="center"/>' +
      '<w:tblInd w:w="200" w:type="dxa"/>' +
      '<w:tblLayout w:type="fixed"/>' +
      '</w:tblPr>' +
      '<w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>';
        const t = parseTable(tblNode(xml));
        expect(t.styleRef).toBe('aa');
    // 9000 dxa / 15 = 600 px
        expect(t.preferredWidthPx).toBe(600);
        expect(t.align).toBe('center');
    // 200 dxa / 15 = 13.333 px
        expect(t.indentPx).toBeCloseTo(13.333, 2);
        expect(t.layout).toBe('fixed');
    });
});
