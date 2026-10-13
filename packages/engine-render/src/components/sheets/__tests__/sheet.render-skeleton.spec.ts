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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    BorderStyleTypes,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocStyleType,
    DocumentBlockRangeType,
    DocumentFlavor,
    HorizontalAlign,
    IConfigService,
    LocaleType,
    PresetListType,
    RANGE_TYPE,
    SHEET_TEXT_LINE_GAP,
    Tools,
    Univer,
    UniverInstanceType,
    WrapStrategy,
} from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { BORDER_TYPE } from '../../../basics/const';
import { GlyphType } from '../../../basics/i-document-skeleton-cached';
import { FontCache } from '../../docs/layout/shaping-engine/font-cache';
import { getCustomNumberDisplayText, getGeneralNumberDisplayText, SpreadsheetSkeleton } from '../sheet.render-skeleton';

describe('Rich-text render snapshot isolation', () => {
    it.each(['font cache', 'row height', 'column width'])(
        'does not rewrite persisted rich text while calculating %s',
        (path) => {
            const environment = setupRenderTestEnv();
            const univer = new Univer({ locale: LocaleType.EN_US });
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'rich-render-isolation',
                sheetOrder: ['sheet'],
                sheets: {
                    sheet: {
                        id: 'sheet',
                        name: 'Sheet',
                        rowCount: 10,
                        columnCount: 10,
                        cellData: {
                            0: {
                                0: {
                                    v: '中文😀',
                                    p: {
                                        id: 'rich-cell',
                                        documentStyle: {
                                            documentFlavor: DocumentFlavor.TRADITIONAL,
                                            pageSize: { width: 37, height: 80 },
                                            marginTop: 7,
                                        },
                                        body: {
                                            dataStream: '中文😀\r\n',
                                            paragraphs: [{ startIndex: 4, paragraphId: 'paragraph' }],
                                            sectionBreaks: [{ startIndex: 5, sectionId: 'section' }],
                                            textRuns: [{ st: 0, ed: 2, ts: { bl: 1 } }],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const worksheet = workbook.getActiveSheet()!;
            const skeleton = univer.__getInjector().createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
            try {
                skeleton.calculate();
                const before = Tools.deepClone(workbook.getSnapshot());
                const cell = worksheet.getCellRaw(0, 0)!;
                if (path === 'font cache') {
                    skeleton._setFontStylesCache(0, 0, cell, {}, false);
                    expect(skeleton.stylesCache.fontMatrix.getValue(0, 0)?.documentSkeleton).toBeDefined();
                } else if (path === 'row height') {
                    expect(skeleton.calculateAutoHeightForCell(0, 0)).toBeGreaterThan(0);
                } else {
                    expect(skeleton._getMeasuredWidthByCell(cell, 0, 0, 0)).toBeGreaterThan(0);
                }
                expect(workbook.getSnapshot()).toEqual(before);
            } finally {
                skeleton.dispose();
                univer.dispose();
                environment.restore();
            }
        }
    );
});

describe('Cell layout and merged styles', () => {
    it.each(['ABC\rDEF', '中文\r测试', 'A中\rB文', '\rA\r\rB\r'])('lays out unwrapped stacked line breaks as blank advances without changing the cell: %s', (content) => {
        const environment = setupRenderTestEnv();
        const univer = new Univer({ locale: LocaleType.EN_US });
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text) => ({
            width: text.replace(/[\r\n]/g, '').length * 7,
            fontBoundingBoxAscent: 10,
            fontBoundingBoxDescent: 2,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        }));
        const style = { ff: 'Arial', fs: 9, tr: { a: 0, v: 1 } };
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'stacked-line-breaks',
            sheetOrder: ['sheet'],
            sheets: { sheet: {
                id: 'sheet',
                name: 'Sheet',
                rowCount: 10,
                columnCount: 10,
                defaultRowHeight: 200,
                cellData: { 0: {
                    0: { s: style, p: {
                        id: 'rich-text',
                        documentStyle: {},
                        body: {
                            dataStream: `${content}\r\n`,
                            paragraphs: [...content.matchAll(/\r/g), { index: content.length }]
                                .map(({ index }) => ({ startIndex: index, paragraphId: `paragraph-${index}` })),
                            sectionBreaks: [{ startIndex: content.length + 1, sectionId: 'section' }],
                            textRuns: [{ st: 0, ed: content.length, ts: { ff: 'Arial', fs: 9, cl: { rgb: '#ff0000' } } }],
                            customRanges: [{ rangeId: 'link', rangeType: CustomRangeType.HYPERLINK, startIndex: 0, endIndex: content.length - 1, properties: { url: 'https://example.com' } }],
                        },
                    } },
                    1: { s: style, v: content.replace(/\r/g, ' ') },
                } },
            } },
        });
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = univer.__getInjector().createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
        try {
            skeleton.calculate();
            const before = Tools.deepClone(workbook.getSnapshot());
            const expectedHeight = skeleton.calculateAutoHeightForCell(0, 1)!;
            const expectedWidth = skeleton._getMeasuredWidthByCell(worksheet.getCellRaw(0, 1)!, 0, 1, 100);
            const cell = worksheet.getCellRaw(0, 0)!;
            expect(skeleton.calculateAutoHeightForCell(0, 0)).toBeCloseTo(expectedHeight);
            expect(skeleton._getMeasuredWidthByCell(cell, 0, 0, 100)).toBeCloseTo(expectedWidth);
            skeleton._setFontStylesCache(0, 0, cell, style, false);
            const documentSkeleton = skeleton.stylesCache.fontMatrix.getValue(0, 0)!.documentSkeleton!;
            const lines = documentSkeleton.getSkeletonData()!.pages[0].sections[0].columns[0].lines;
            expect(lines).toHaveLength(1);
            const glyphs = lines[0].divides.flatMap((divide) => divide.glyphGroup);
            expect(glyphs.map((glyph) => glyph.content).join('').replace(/\s/g, '')).toBe(content.replace(/\s/g, ''));
            expect(glyphs.filter((glyph) => glyph.content.trim()).every((glyph) => glyph.ts?.fs === 9 && glyph.ts.ff === 'Arial')).toBe(true);
            const displayModel = documentSkeleton.getViewModel().getDataModel();
            expect(displayModel.getBody()!.customRanges).toEqual(cell.p!.body!.customRanges);
            expect(displayModel.getBody()!.dataStream).toBe(`${content}\r\n`);
            for (const { index } of content.matchAll(/[^\r]/g)) {
                expect(documentSkeleton.findNodeByCharIndex(index)?.content).toBe(content[index]);
            }
            expect(workbook.getSnapshot()).toEqual(before);
            const editorModel = worksheet.getCellDocumentModel(worksheet.getCellRaw(0, 0), style, { isDeepClone: true, ignoreTextRotation: true })!.documentModel!;
            expect(editorModel.getBody()!.dataStream).toBe(`${content}\r\n`);
            editorModel.dispose();

            cell.s = { ...style, tb: WrapStrategy.WRAP };
            skeleton.resetCache();
            skeleton._setFontStylesCache(0, 0, cell, cell.s, false);
            const wrapped = skeleton.stylesCache.fontMatrix.getValue(0, 0)!.documentSkeleton!;
            expect(wrapped.getSkeletonData()!.pages[0].sections[0].columns[0].lines.length).toBe(content.split('\r').length);
            expect(wrapped.getViewModel().getDataModel().getBody()!.dataStream).toBe(`${content}\r\n`);
            for (const wrapStrategy of [WrapStrategy.CLIP, WrapStrategy.OVERFLOW]) {
                cell.s = { ...style, tb: wrapStrategy };
                skeleton.resetCache();
                expect(skeleton.calculateAutoHeightForCell(0, 0)).toBeCloseTo(expectedHeight);
                expect(skeleton._getMeasuredWidthByCell(cell, 0, 0, 100)).toBeCloseTo(expectedWidth);
            }
            cell.s = { ...style, tr: { a: 45, v: 0 } };
            skeleton.resetCache();
            skeleton._setFontStylesCache(0, 0, cell, cell.s, false);
            const rotated = skeleton.stylesCache.fontMatrix.getValue(0, 0)!.documentSkeleton!;
            expect(rotated.getSkeletonData()!.pages[0].sections[0].columns[0].lines.length).toBe(content.split('\r').length);
            expect(rotated.getViewModel().getDataModel().getBody()!.dataStream).toBe(`${content}\r\n`);
        } finally {
            skeleton.dispose();
            univer.dispose();
            environment.restore();
            vi.restoreAllMocks();
        }
    });

    it.each(['paragraph formatting', 'checklists', 'named paragraph styles', 'quotes'])('retains %s in unwrapped stacked rich text', (feature) => {
        const environment = setupRenderTestEnv();
        const univer = new Univer({ locale: LocaleType.EN_US });
        const style = { tr: { a: 0, v: 1 }, tb: WrapStrategy.CLIP };
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'stacked-paragraph-formatting',
            sheetOrder: ['sheet'],
            sheets: { sheet: {
                id: 'sheet',
                name: 'Sheet',
                rowCount: 10,
                columnCount: 10,
                cellData: { 0: { 0: { s: style, p: {
                    id: 'rich-text',
                    documentStyle: {},
                    styles: feature === 'named paragraph styles'
                        ? { first: { name: 'First', type: DocStyleType.paragraph, paragraphStyle: { spaceBelow: { v: 24 } } } }
                        : undefined,
                    body: {
                        dataStream: 'A\rB\r\n',
                        paragraphs: [0, 1].map((index) => ({
                            startIndex: index * 2 + 1,
                            paragraphId: `paragraph-${index}`,
                            ...(feature === 'checklists'
                                ? { bullet: { listId: `list-${index}`, listType: index === 0 ? PresetListType.CHECK_LIST : PresetListType.CHECK_LIST_CHECKED, nestingLevel: 0 } }
                                : feature === 'paragraph formatting'
                                    ? { paragraphStyle: { textStyle: { fs: index === 0 ? 9 : 18, cl: { rgb: index === 0 ? '#ff0000' : '#0000ff' } } } }
                                    : feature === 'named paragraph styles' && index === 0 ? { styleId: 'first' } : {}),
                        })),
                        sectionBreaks: [{ startIndex: 4, sectionId: 'section' }],
                        blockRanges: feature === 'quotes' ? [{ blockId: 'quote', blockType: DocumentBlockRangeType.QUOTE, startIndex: 0, endIndex: 2 }] : undefined,
                    },
                } } } },
            } },
        });
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = univer.__getInjector().createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
        try {
            skeleton.calculate();
            const before = Tools.deepClone(workbook.getSnapshot());
            skeleton._setFontStylesCache(0, 0, worksheet.getCellRaw(0, 0), style, false);
            const documentSkeleton = skeleton.stylesCache.fontMatrix.getValue(0, 0)!.documentSkeleton!;
            const lines = documentSkeleton.getSkeletonData()!.pages[0].sections[0].columns[0].lines;
            if (feature === 'checklists') {
                const markers = lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup)).filter((glyph) => glyph.glyphType === GlyphType.LIST);
                expect(markers.map((glyph) => glyph.content)).toEqual(['☐', '☑']);
            } else if (feature === 'paragraph formatting') {
                expect(documentSkeleton.findNodeByCharIndex(0)?.ts).toMatchObject({ fs: 9, cl: { rgb: '#ff0000' } });
                expect(documentSkeleton.findNodeByCharIndex(2)?.ts).toMatchObject({ fs: 18, cl: { rgb: '#0000ff' } });
            } else {
                expect(lines).toHaveLength(2);
                expect(lines[0].spaceBelowApply).toBeGreaterThan(lines[1].spaceBelowApply);
            }
            expect(workbook.getSnapshot()).toEqual(before);
        } finally {
            skeleton.dispose();
            univer.dispose();
            environment.restore();
        }
    });

    it.each(['ABCDEF', '中文测试文字', 'A中B文C字'])('auto-fits wrapped vertical columns using the cell height: %s', (text) => {
        const environment = setupRenderTestEnv();
        const univer = new Univer({ locale: LocaleType.EN_US });
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((content) => ({
            width: content.replace(/[\r\n]/g, '').length * 7,
            fontBoundingBoxAscent: 10,
            fontBoundingBoxDescent: 2,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        }));
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'stacked-auto-size',
            sheetOrder: ['sheet'],
            sheets: { sheet: {
                id: 'sheet',
                name: 'Sheet',
                rowCount: 10,
                columnCount: 10,
                defaultColumnWidth: 24,
                defaultRowHeight: 40,
                columnData: { 1: { w: 200 } },
                rowData: { 2: { h: 80 } },
                mergeData: [{ startRow: 0, endRow: 1, startColumn: 3, endColumn: 3 }],
                cellData: { 0: {
                    0: { v: text, s: { ff: 'Arial', fs: 9, tr: { a: 0, v: 1 }, tb: WrapStrategy.WRAP } },
                    1: { v: text, s: { ff: 'Arial', fs: 9, tr: { a: 0, v: 1 }, tb: WrapStrategy.WRAP } },
                    2: { v: text, s: { ff: 'Arial', fs: 9, tr: { a: 0, v: 1 } } },
                    3: { v: text, s: { ff: 'Arial', fs: 9, tr: { a: 0, v: 1 }, tb: WrapStrategy.WRAP } },
                }, 2: {
                    3: { v: text, s: { ff: 'Arial', fs: 9, tr: { a: 0, v: 1 }, tb: WrapStrategy.WRAP } },
                } },
            } },
        });
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = univer.__getInjector().createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
        try {
            skeleton.calculate();
            const before = Tools.deepClone(workbook.getSnapshot());
            const narrow = skeleton.calculateAutoHeightForCell(0, 0)!;
            const wide = skeleton.calculateAutoHeightForCell(0, 1)!;
            expect(narrow).toBeCloseTo(wide);
            expect(narrow).toBeLessThan(skeleton.calculateAutoHeightForCell(0, 2)!);
            expect(narrow).toBeLessThanOrEqual(worksheet.getRowHeight(0));
            const narrowWidth = skeleton._getMeasuredWidthByCell(worksheet.getCellRaw(0, 0)!, 0, 0, 24);
            const wideWidth = skeleton._getMeasuredWidthByCell(worksheet.getCellRaw(0, 1)!, 0, 1, 200);
            expect(narrowWidth).toBeCloseTo(wideWidth);
            const mergedWidth = skeleton._getMeasuredWidthByCell(worksheet.getCellRaw(0, 3)!, 0, 3, 24);
            const tallWidth = skeleton._getMeasuredWidthByCell(worksheet.getCellRaw(2, 3)!, 2, 3, 24);
            expect(mergedWidth).toBeCloseTo(tallWidth);
            expect(mergedWidth).toBeLessThan(narrowWidth);
            expect(skeleton.calculateAutoHeightForCell(0, 3)).toBeUndefined();
            expect(workbook.getSnapshot()).toEqual(before);
        } finally {
            skeleton.dispose();
            univer.dispose();
            environment.restore();
            vi.restoreAllMocks();
        }
    });

    it('renders justified plain text using the cell width', () => {
        const environment = setupRenderTestEnv();
        const univer = new Univer({ locale: LocaleType.EN_US });
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'justified-cell',
            styles: {
                justified: {
                    ht: HorizontalAlign.JUSTIFIED,
                    tb: WrapStrategy.WRAP,
                },
            },
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    name: 'Sheet',
                    rowCount: 10,
                    columnCount: 10,
                    defaultColumnWidth: 72,
                    cellData: {
                        0: {
                            0: {
                                v: 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen',
                                s: 'justified',
                            },
                        },
                    },
                },
            },
        });
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = univer
            .__getInjector()
            .createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
        try {
            skeleton.calculate();
            const cell = worksheet.getCellRaw(0, 0)!;
            const style = worksheet.getComposedCellStyleByCellData(0, 0, cell);
            skeleton._setFontStylesCache(0, 0, cell, style, true);
            const documentSkeleton = skeleton.stylesCache.fontMatrix.getValue(0, 0)?.documentSkeleton;
            const lines = documentSkeleton?.getSkeletonData()?.pages[0].sections[0].columns[0].lines ?? [];
            const firstDivide = lines[0]?.divides[0];
            const visibleGlyphs = firstDivide?.glyphGroup.filter((glyph) => glyph.content !== '') ?? [];
            const lastGlyph = visibleGlyphs[visibleGlyphs.length - 1];

            expect(documentSkeleton).toBeDefined();
            expect(lines.length).toBeGreaterThan(1);
            expect(firstDivide?.isFull).toBe(true);
            expect(lastGlyph).toBeDefined();
            expect(lastGlyph!.left + lastGlyph!.width).toBeCloseTo(firstDivide!.width, 1);
        } finally {
            skeleton.dispose();
            univer.dispose();
            environment.restore();
        }
    });

    it('renders distributed plain text across the merged cell width', () => {
        const environment = setupRenderTestEnv();
        const univer = new Univer({ locale: LocaleType.EN_US });
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'distributed-merged-cell',
            styles: {
                distributed: {
                    ht: HorizontalAlign.DISTRIBUTED,
                },
            },
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    name: 'Sheet',
                    rowCount: 10,
                    columnCount: 10,
                    defaultColumnWidth: 72,
                    mergeData: [
                        {
                            startRow: 0,
                            endRow: 0,
                            startColumn: 0,
                            endColumn: 2,
                            rangeType: RANGE_TYPE.NORMAL,
                        },
                    ],
                    cellData: {
                        0: {
                            0: { v: '重庆市建设工程质量监督总站', s: 'distributed' },
                        },
                    },
                },
            },
        });
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = univer
            .__getInjector()
            .createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
        try {
            skeleton.calculate();
            const cell = worksheet.getCellRaw(0, 0)!;
            const style = worksheet.getComposedCellStyleByCellData(0, 0, cell);
            skeleton._setFontStylesCache(0, 0, cell, style, true);
            const documentSkeleton = skeleton.stylesCache.fontMatrix.getValue(0, 0)?.documentSkeleton;
            const divide = documentSkeleton?.getSkeletonData()?.pages[0].sections[0].columns[0].lines[0].divides[0];
            const visibleGlyphs = divide?.glyphGroup.filter((glyph) =>
                glyph.content !== '' && glyph.streamType !== DataStreamTreeTokenType.PARAGRAPH
            ) ?? [];
            const lastGlyph = visibleGlyphs[visibleGlyphs.length - 1];

            expect(documentSkeleton).toBeDefined();
            expect(lastGlyph).toBeDefined();
            expect(lastGlyph!.left + lastGlyph!.width).toBeCloseTo(divide!.width, 1);
            expect(divide?.paddingLeft).toBe(0);
        } finally {
            skeleton.dispose();
            univer.dispose();
            environment.restore();
        }
    });

    it('renders a merged border stored only on an edge cell', () => {
        const environment = setupRenderTestEnv();
        const univer = new Univer({ locale: LocaleType.EN_US });
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'merged-cell-edge-border',
            styles: {
                rightBorder: {
                    bd: {
                        r: { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } },
                    },
                },
            },
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    name: 'Sheet',
                    rowCount: 10,
                    columnCount: 10,
                    mergeData: [
                        {
                            startRow: 0,
                            endRow: 0,
                            startColumn: 0,
                            endColumn: 1,
                            rangeType: RANGE_TYPE.NORMAL,
                        },
                    ],
                    cellData: {
                        0: {
                            0: { v: 'merged' },
                            1: { s: 'rightBorder' },
                        },
                    },
                },
            },
        });
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = univer
            .__getInjector()
            .createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
        try {
            skeleton.calculate();
            const cell = worksheet.getCellRaw(0, 0)!;
            const style = worksheet.getComposedCellStyleByCellData(0, 0, cell);
            skeleton._setBorderStylesCache(0, 0, style, {
                mergeRange: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 1,
                },
            });

            expect(skeleton.stylesCache.border?.getValue(0, 1)?.[BORDER_TYPE.RIGHT]).toEqual({
                type: BORDER_TYPE.RIGHT,
                style: BorderStyleTypes.THIN,
                color: '#000000',
            });
        } finally {
            skeleton.dispose();
            univer.dispose();
            environment.restore();
        }
    });
});

describe('General number display', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('uses the most precise scientific notation that fits a narrow column', () => {
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text) => ({
            fontBoundingBoxAscent: 0,
            fontBoundingBoxDescent: 0,
            actualBoundingBoxAscent: 0,
            actualBoundingBoxDescent: 0,
            width: text.length * 7,
        }));

        expect(getGeneralNumberDisplayText(148706409, '148706409', '13.33px SimSun', 66)).toBe('1.49E+08');
        expect(getGeneralNumberDisplayText(209501025, '209501025', '13.33px SimSun', 66)).toBe('2.1E+08');
        expect(getGeneralNumberDisplayText(800510403, '800510403', '13.33px SimSun', 66)).toBe('8.01E+08');
        expect(getGeneralNumberDisplayText(148706409, '148706409', '13.33px SimSun', 70)).toBe('148706409');
    });
});

describe('Custom number display', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('uses hashes when a formatted number does not fit', () => {
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text) => ({
            fontBoundingBoxAscent: 0,
            fontBoundingBoxDescent: 0,
            actualBoundingBoxAscent: 0,
            actualBoundingBoxDescent: 0,
            width: text.length * 7,
        }));

        expect(getCustomNumberDisplayText('2022-11-01 0:00:00', '13.33px SimSun', 66)).toBe('#########');
        expect(getCustomNumberDisplayText('10/1/2022', '13.33px SimSun', 70)).toBe('10/1/2022');
    });
});

describe('Configured cell text line gap', () => {
    it.each([false, true])('keeps saved cells intact and includes inter-line gaps in auto height (rich: %s)', (rich) => {
        const environment = setupRenderTestEnv();
        const univer = new Univer({ locale: LocaleType.EN_US });
        const injector = univer.__getInjector();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'line-gap',
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    rowCount: 10,
                    columnCount: 10,
                    defaultColumnWidth: 200,
                    rowData: { 0: { h: 30 }, 1: { h: 15 } },
                    cellData: {
                        0: {
                            0: {
                                v: 'one\ntwo\nthree',
                                s: { fs: 12, tb: WrapStrategy.WRAP },
                                ...(rich
                                    ? {
                                        p: {
                                            id: 'rich-lines',
                                            documentStyle: {},
                                            body: {
                                                dataStream: 'one\rtwo\rthree\r\n',
                                                paragraphs: [{ startIndex: 3, paragraphId: 'one' }, { startIndex: 7, paragraphId: 'two' }, { startIndex: 13, paragraphId: 'three' }],
                                                sectionBreaks: [{ startIndex: 14, sectionId: 'section' }],
                                            },
                                        },
                                    }
                                    : {}),
                            },
                        },
                        1: { 0: { v: 'one', s: { fs: 12, tb: WrapStrategy.WRAP } } },
                    },
                },
            },
        });
        const worksheet = workbook.getActiveSheet()!;
        const baseline = injector.createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
        injector.get(IConfigService).setConfig(SHEET_TEXT_LINE_GAP, 2);
        const spaced = injector.createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
        try {
            baseline.calculate();
            spaced.calculate();
            const saved = Tools.deepClone(workbook.getSnapshot());
            expect(spaced.calculateAutoHeightForCell(0, 0)).toBeCloseTo(baseline.calculateAutoHeightForCell(0, 0)! + 4);
            expect(spaced.calculateAutoHeightForCell(1, 0)).toBe(baseline.calculateAutoHeightForCell(1, 0));
            expect(worksheet.getRowHeight(0)).toBe(30);
            if (rich) {
                const cell = worksheet.getCellRaw(0, 0)!;
                baseline._setFontStylesCache(0, 0, cell, {}, false);
                spaced._setFontStylesCache(0, 0, cell, {}, false);
                const oldLines = baseline.stylesCache.fontMatrix.getValue(0, 0)!.documentSkeleton!.getSkeletonData()!.pages[0].sections[0].columns[0].lines;
                const newLines = spaced.stylesCache.fontMatrix.getValue(0, 0)!.documentSkeleton!.getSkeletonData()!.pages[0].sections[0].columns[0].lines;
                expect(newLines).toHaveLength(oldLines.length);
                newLines.forEach((line, index) => {
                    expect(line.top + line.marginTop - oldLines[index].top - oldLines[index].marginTop).toBeCloseTo(index * 2);
                });
            }
            expect(workbook.getSnapshot()).toEqual(saved);
        } finally {
            baseline.dispose();
            spaced.dispose();
            univer.dispose();
            environment.restore();
        }
    });
});
