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

import {
    AlignTypeH,
    AlignTypeV,
    BooleanNumber,
    DocumentFlavor,
    GridType,
    NumberUnitType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    SectionType,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { GlyphType } from '../../../../basics/i-document-skeleton-cached';
import {
    clearFontCreateConfigCache,
    columnIterator,
    getCharSpaceApply,
    getCharSpaceConfig,
    getColumnByDivide,
    getFontConfigFromLastGlyph,
    getFontCreateConfig,
    getGlyphGroupWidth,
    getLastColumn,
    getLastLine,
    getLastLineByColumn,
    getLastNotFullColumnInfo,
    getLastNotFullDivideInfo,
    getLastPage,
    getLastRemainingDivide,
    getLastSection,
    getLastSpan,
    getLineHeightConfig,
    getNextDivide,
    getNullSkeleton,
    getNumberUnitValue,
    getPageContentWidth,
    getPageFromPath,
    getPositionHorizon,
    getPositionVertical,
    getPreLine,
    glyphIterator,
    isBlankColumn,
    isBlankPage,
    isColumnFull,
    lineIterator,
    mergeByV,
    prepareSectionBreakConfig,
    resetContext,
    setPageParent,
    updateBlockIndex,
    validationGrid,
} from '../tools';

function createPageSkeleton() {
    const divide1 = {
        isFull: false,
        left: 5,
        glyphGroup: [
            { count: 1, glyphType: GlyphType.WORD, width: 10, bBox: { ba: 3, bd: 1 }, xOffset: 0 },
            { count: 1, glyphType: GlyphType.WORD, width: 8, bBox: { ba: 4, bd: 2 }, xOffset: 1 },
        ],
    } as any;
    const divide2 = {
        isFull: true,
        left: 0,
        glyphGroup: [
            { count: 0, glyphType: GlyphType.LIST, width: 6, bBox: { ba: 2, bd: 1 }, xOffset: 0 },
            { count: 1, glyphType: GlyphType.WORD, width: 7, bBox: { ba: 2, bd: 1 }, xOffset: 0 },
        ],
    } as any;

    const line1 = {
        isBehindTable: false,
        paragraphIndex: 0,
        top: 0,
        lineHeight: 20,
        divides: [divide1, divide2],
    } as any;
    const line2 = {
        isBehindTable: true,
        tableId: 'table-1',
        paragraphIndex: 1,
        top: 24,
        lineHeight: 20,
        divides: [{ isFull: false, left: 0, glyphGroup: [{ count: 1, glyphType: GlyphType.WORD, width: 12, bBox: { ba: 2, bd: 1 }, xOffset: 0 }] }],
    } as any;

    const column = {
        isFull: false,
        left: 10,
        width: 200,
        lines: [line1, line2],
    } as any;
    const section = {
        columns: [column],
    } as any;

    const page = {
        pageWidth: 600,
        pageHeight: 800,
        marginTop: 30,
        marginBottom: 30,
        marginLeft: 20,
        marginRight: 20,
        sections: [section],
        skeTables: new Map([
            ['table-1', { ed: 7 }],
        ]),
    } as any;

    // parent links required by a few helpers
    divide1.parent = line1;
    divide2.parent = line1;
    line1.parent = column;
    line2.parent = column;
    column.parent = section;
    section.parent = page;

    return { page, section, column, line1, line2, divide1, divide2 };
}

describe('docs layout tools extra', () => {
    it('handles page/section/column/line selectors', () => {
        const { page, section, column, line1, line2, divide1 } = createPageSkeleton();
        const pages = [page];

        expect(getLastPage(pages as any)).toBe(page);
        expect(getLastSection(page as any)).toBe(section);
        expect(getLastColumn(page as any)).toBe(column);
        expect(getLastLine(page as any)).toBe(column.lines[1]);
        expect(getLastLineByColumn(column as any)).toBe(column.lines[1]);
        expect(getPageContentWidth(page as any)).toBe(560);
        expect(getPreLine(column.lines[1] as any)).toBe(line1);
        expect(getColumnByDivide(divide1 as any)).toBe(column);

        const columnInfo = getLastNotFullColumnInfo(page as any);
        expect(columnInfo?.column).toBe(column);
        expect(columnInfo?.isLast).toBe(true);

        const divideInfo = getLastNotFullDivideInfo(page as any);
        expect(divideInfo?.divide).toBe(column.lines[1].divides[0]);
        expect(getNextDivide(line1 as any, line1.divides[0] as any)).toBe(line1.divides[1]);
        expect(getLastRemainingDivide(line1 as any)).toBe(line1.divides[1]);
        expect(getLastSpan(page as any)).toBe(line2.divides[0].glyphGroup[0]);
    });

    it('handles column/page blank checks and number/grid helpers', () => {
        const { page, column } = createPageSkeleton();

        expect(isColumnFull(page as any)).toBe(false);
        expect(isBlankPage(page as any)).toBe(false);
        expect(isBlankColumn(column as any)).toBe(false);

        const blankLine = { divides: [{ glyphGroup: [{ glyphType: GlyphType.TAB }] }] };
        expect(isBlankColumn({ lines: [blankLine] } as any)).toBe(true);
        expect(isBlankPage({ sections: [{ columns: [{ lines: [blankLine] }] }] } as any)).toBe(true);

        expect(getNumberUnitValue(null, 100)).toBe(0);
        expect(getNumberUnitValue({ v: 10, u: NumberUnitType.PIXEL } as any, 100)).toBe(10);
        expect(getNumberUnitValue({ v: 2, u: NumberUnitType.POINT } as any, 10)).toBe(2);

        expect(validationGrid(GridType.SNAP_TO_CHARS, BooleanNumber.TRUE)).toBe(true);
        expect(validationGrid(GridType.LINES, BooleanNumber.TRUE)).toBe(false);
        expect(getCharSpaceApply(2, 3, GridType.SNAP_TO_CHARS, BooleanNumber.TRUE)).toBe(6);
    });

    it('derives line/char config from section and paragraph settings', () => {
        const sectionBreakConfig = {
            linePitch: 20,
            gridType: GridType.LINES,
            paragraphLineGapDefault: 1,
            charSpace: 2,
            defaultTabStop: 5,
            documentTextStyle: { fs: 11 },
        };
        const paragraphConfig = {
            paragraphStyle: {
                lineSpacing: 0,
                spacingRule: 0,
                snapToGrid: BooleanNumber.TRUE,
            },
        };

        const lineCfg = getLineHeightConfig(sectionBreakConfig as any, paragraphConfig as any);
        expect(lineCfg.lineSpacing).toBe(1);
        expect(lineCfg.linePitch).toBe(20);

        const charCfg = getCharSpaceConfig(sectionBreakConfig as any, paragraphConfig as any);
        expect(charCfg).toEqual(expect.objectContaining({
            charSpace: 2,
            defaultTabStop: 5,
            documentFontSize: 11,
        }));
    });

    it('updates block index values and iterates skeleton blocks', () => {
        const { page, column } = createPageSkeleton();
        updateBlockIndex([page] as any, -1);

        expect(page.st).toBe(0);
        expect(page.ed).toBeGreaterThan(page.st);
        expect(column.st).toBeGreaterThanOrEqual(0);
        expect(column.ed).toBeGreaterThanOrEqual(column.st);

        const glyphs: any[] = [];
        glyphIterator([page] as any, (glyph) => glyphs.push(glyph));
        expect(glyphs.length).toBeGreaterThan(0);

        const lines: any[] = [];
        lineIterator([page] as any, (line) => lines.push(line));
        expect(lines.length).toBe(2);

        const columns: any[] = [];
        columnIterator([page] as any, (col) => columns.push(col));
        expect(columns.length).toBe(1);
    });

    it('computes horizontal and vertical positioned object coordinates', () => {
        const { page, column } = createPageSkeleton();

        expect(getPositionHorizon({
            relativeFrom: ObjectRelativeFromH.COLUMN,
            align: AlignTypeH.LEFT,
        } as any, column as any, page as any, 20)).toBe(10);

        expect(getPositionHorizon({
            relativeFrom: ObjectRelativeFromH.PAGE,
            align: AlignTypeH.CENTER,
        } as any, column as any, page as any, 100)).toBe(250);

        expect(getPositionHorizon({
            relativeFrom: ObjectRelativeFromH.COLUMN,
            posOffset: 50,
        } as any, column as any, page as any, 20)).toBe(60);

        expect(getPositionHorizon({
            relativeFrom: ObjectRelativeFromH.PAGE,
            percent: 0.5,
        } as any, column as any, page as any, 20)).toBe(300);

        expect(getPositionVertical({
            relativeFrom: ObjectRelativeFromV.LINE,
            align: AlignTypeV.BOTTOM,
        } as any, page as any, 30, 20, 10)).toBe(40);

        expect(getPositionVertical({
            relativeFrom: ObjectRelativeFromV.PAGE,
            align: AlignTypeV.CENTER,
        } as any, page as any, 30, 20, 100)).toBe(350);

        expect(getPositionVertical({
            relativeFrom: ObjectRelativeFromV.PARAGRAPH,
            posOffset: 5,
        } as any, page as any, 30, 20, 100, 12, false)).toBe(17);

        expect(getPositionVertical({
            relativeFrom: ObjectRelativeFromV.PAGE,
            percent: 0.25,
        } as any, page as any, 30, 20, 100)).toBe(200);
    });

    it('handles glyph widths and font config cache', () => {
        const divide = {
            glyphGroup: [{ width: 3 }, { width: 4 }, { width: 5 }],
        };
        expect(getGlyphGroupWidth(divide as any)).toBe(12);

        clearFontCreateConfigCache();
        const fromLastGlyph = getFontConfigFromLastGlyph(
            { ts: { fs: 14 }, fontStyle: { fontString: '14pt Arial' } } as any,
            {
                gridType: GridType.LINES,
                charSpace: 1,
                pageSize: { width: 500 },
                marginLeft: 10,
                marginRight: 20,
            } as any,
            { snapToGrid: BooleanNumber.TRUE } as any
        );
        expect(fromLastGlyph.pageWidth).toBe(500);
        expect(fromLastGlyph.charSpace).toBe(1);

        const viewModel = {
            getTextRun: vi.fn(() => ({ st: 0, ed: 10, ts: { fs: 12, ff: 'Arial' } })),
            getCustomDecoration: vi.fn(() => null),
            getCustomRange: vi.fn(() => null),
            getDataModel: vi.fn(() => ({
                getBulletPresetList: () => ({
                    bullet: { nestingLevel: [{ paragraphProperties: { textStyle: { bl: 1 } } }] },
                }),
            })),
        };

        const sectionBreakConfig = {
            gridType: GridType.LINES,
            charSpace: 2,
            documentTextStyle: { fs: 10, ff: 'Calibri' },
            pageSize: { width: 300 },
            marginLeft: 0,
            marginRight: 0,
            renderConfig: {},
        };
        const paragraphNode = { startIndex: 0 };
        const paragraph = { paragraphStyle: {} };

        const config1 = getFontCreateConfig(0, viewModel as any, paragraphNode as any, sectionBreakConfig as any, paragraph as any);
        const config2 = getFontCreateConfig(0, viewModel as any, paragraphNode as any, sectionBreakConfig as any, paragraph as any);
        expect(config1).toBe(config2);

        const configWithBullet = getFontCreateConfig(
            0,
            viewModel as any,
            paragraphNode as any,
            sectionBreakConfig as any,
            { paragraphStyle: {}, bullet: { listType: 'bullet' } } as any
        );
        expect(configWithBullet.textStyle.bl).toBe(1);
    });

    it('creates default skeleton, prepares section config, and resolves page paths', () => {
        const skeleton = getNullSkeleton();
        const pages = [{ segmentId: 'seg-1' }, { segmentId: 'seg-2' }] as any[];
        setPageParent(pages as any, skeleton as any);
        expect(pages[0].parent).toBe(skeleton);

        const ctx = {
            docsConfig: { locale: 'zh-CN' },
            viewModel: {
                getChildren: () => [{ endIndex: 9 }, { endIndex: 19 }],
                getSectionBreak: vi.fn((endIndex: number) => {
                    if (endIndex === 9) {
                        return {
                            sectionType: SectionType.CONTINUOUS,
                            pageSize: { width: 900, height: 1200 },
                            marginLeft: 30,
                            marginRight: 40,
                            renderConfig: { isRenderStyle: BooleanNumber.TRUE },
                        };
                    }
                    return { sectionType: SectionType.CONTINUOUS };
                }),
            },
            dataModel: {
                documentStyle: {
                    documentFlavor: DocumentFlavor.MODERN,
                    pageSize: { width: 800, height: 1000 },
                    marginLeft: 20,
                    marginRight: 20,
                    marginTop: 20,
                    marginBottom: 20,
                    renderConfig: {},
                },
            },
        };

        const sectionConfig = prepareSectionBreakConfig(ctx as any, 0);
        expect(sectionConfig.pageSize?.width).toBeGreaterThan(0);
        expect(sectionConfig.headerIds).toEqual(expect.objectContaining({
            defaultHeaderId: expect.any(String),
        }));

        const dirtyCtx = {
            isDirty: true,
            skeleton: { drawingAnchor: new Map([['a', 1]]) },
        };
        resetContext(dirtyCtx as any);
        expect(dirtyCtx.isDirty).toBe(false);
        expect(dirtyCtx.skeleton.drawingAnchor.size).toBe(0);

        const mergedMax = mergeByV({ a: { v: 1 }, b: 2 }, { a: { v: 3 }, b: 4 }, 'max');
        expect((mergedMax as any).a.v).toBe(3);
        const mergedMin = mergeByV({ a: { v: 5 } }, { a: { v: 3 } }, 'min');
        expect((mergedMin as any).a.v).toBe(3);

        const pageCell = { id: 'cell-page' };
        const root = {
            pages: [
                {
                    id: 'page-0',
                    skeTables: new Map([
                        ['t1', { rows: [{ cells: [pageCell] }] }],
                    ]),
                },
            ],
        };
        expect(getPageFromPath(root as any, ['pages', 0])).toBe(root.pages[0]);
        expect(getPageFromPath(root as any, ['pages', 0, 'skeTables', 't1', 'rows', 0, 'cells', 0])).toBe(pageCell);
    });
});
