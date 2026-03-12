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

import { BooleanNumber, ColumnSeparatorType, DataStreamTreeTokenType, GridType, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, SpacingRule } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { BreakPointType } from '../../../line-breaker/break';
import { createSkeletonPage } from '../../../model/page';
import { layoutParagraph, updateInlineDrawingPosition } from '../layout-ruler';

function createGlyph(content: string, width = 16, streamType = 'text') {
    return {
        glyphType: 1,
        streamType,
        content,
        raw: content,
        count: content.length,
        width,
        left: 0,
        xOffset: 0,
        isJustifiable: false,
        bBox: {
            width,
            ba: 10,
            bd: 2,
            aba: 10,
            abd: 2,
            sp: 0,
            sbr: 0.6,
            sbo: 2,
            spr: 0.6,
            spo: 3,
        },
        adjustability: {
            stretchability: [0, 0],
            shrinkability: [0, 0],
        },
    } as any;
}

function createLayoutContext() {
    return {
        viewModel: {
            getSelfOrHeaderFooterViewModel: () => ({
                getDataModel: () => ({
                    body: {},
                }),
            }),
        },
        dataModel: {
            documentStyle: {},
        },
        docsConfig: {},
        skeleton: {
            pages: [],
            left: 0,
            top: 0,
            st: 0,
        },
        layoutStartPointer: {},
        isDirty: false,
        skeletonResourceReference: {
            skeHeaders: new Map(),
            skeFooters: new Map(),
            skeListLevel: new Map(),
            drawingAnchor: new Map(),
        },
        floatObjectsCache: new Map(),
        paragraphConfigCache: new Map(),
        sectionBreakConfigCache: new Map(),
        paragraphsOpenNewPage: new Set(),
        hyphen: {
            hasPattern: () => true,
            loadPattern: () => Promise.resolve(),
        },
        languageDetector: {
            detect: () => 'en-us',
        },
    } as any;
}

function createSectionBreakConfig() {
    return {
        pageNumberStart: 1,
        pageSize: {
            width: 220,
            height: 120,
        },
        pageOrient: 0,
        marginTop: 8,
        marginBottom: 8,
        marginLeft: 8,
        marginRight: 8,
        marginHeader: 0,
        marginFooter: 0,
        renderConfig: {},
        localeService: {} as any,
        headerTreeMap: new Map(),
        footerTreeMap: new Map(),
        lists: {},
        drawings: {},
        columnProperties: [],
        columnSeparatorType: ColumnSeparatorType.NONE,
        gridType: GridType.DEFAULT,
        linePitch: 18,
        lineSpacing: 1.2,
        spacingRule: SpacingRule.AUTO,
        paragraphLineGapDefault: 1,
        charSpace: 0,
        defaultTabStop: 10.5,
        autoHyphenation: BooleanNumber.TRUE,
        consecutiveHyphenLimit: 0,
        hyphenationZone: 5,
    } as any;
}

describe('layout ruler', () => {
    it('lays out paragraph glyphs into lines/columns/pages with overflow and hyphen break handling', () => {
        const ctx = createLayoutContext();
        const sectionBreakConfig = createSectionBreakConfig();
        const paragraphConfig = {
            paragraphIndex: 2,
            paragraphStyle: {
                snapToGrid: BooleanNumber.FALSE,
                spaceAbove: { v: 4 },
                spaceBelow: { v: 3 },
                indentFirstLine: { v: 12 },
                hanging: { v: 6 },
                indentStart: { v: 4 },
                indentEnd: { v: 2 },
            },
            skeHeaders: new Map(),
            skeFooters: new Map(),
            pDrawingAnchor: new Map(),
        } as any;

        const firstPage = createSkeletonPage(
            ctx,
            sectionBreakConfig,
            {
                skeHeaders: paragraphConfig.skeHeaders,
                skeFooters: paragraphConfig.skeFooters,
            },
            1
        );
        ctx.skeleton.pages = [firstPage];

        const lineBreakerGroup = [
            createGlyph('longword', 120),
            createGlyph('piece', 90),
            createGlyph(DataStreamTreeTokenType.PARAGRAPH, 0, DataStreamTreeTokenType.PARAGRAPH),
        ];

        layoutParagraph(
            ctx,
            lineBreakerGroup,
            ctx.skeleton.pages,
            sectionBreakConfig,
            paragraphConfig,
            true,
            BreakPointType.Hyphen
        );

        for (let i = 0; i < 12; i++) {
            layoutParagraph(
                ctx,
                [
                    createGlyph(`S${i}`, 40),
                    createGlyph('tail', 30),
                ],
                ctx.skeleton.pages,
                sectionBreakConfig,
                {
                    ...paragraphConfig,
                    paragraphIndex: i + 3,
                },
                i === 0,
                BreakPointType.Normal
            );
        }

        const lastPage = ctx.skeleton.pages[ctx.skeleton.pages.length - 1];
        lastPage.sections[0].columns[0].isFull = true;
        layoutParagraph(
            ctx,
            [createGlyph('newpage', 70)],
            ctx.skeleton.pages,
            sectionBreakConfig,
            {
                ...paragraphConfig,
                paragraphIndex: 99,
            },
            true,
            BreakPointType.Normal
        );

        expect(ctx.skeleton.pages.length).toBeGreaterThan(1);
        expect(ctx.skeleton.pages[0].sections[0].columns[0].lines.length).toBeGreaterThan(0);
        expect(ctx.skeleton.pages.some((page: any) => page.sections.length > 0)).toBe(true);
    });

    it('updates inline drawing positions and handles page-break detection fallback', () => {
        const page = createSkeletonPage(
            createLayoutContext(),
            createSectionBreakConfig(),
            { skeHeaders: new Map(), skeFooters: new Map() },
            1
        );
        const section = page.sections[0];
        const column = section.columns[0];

        const customGlyph = {
            ...createGlyph('\u25A1', 20, 'custom'),
            streamType: DataStreamTreeTokenType.CUSTOM_BLOCK,
            drawingId: 'drawing-1',
        } as any;
        const divide = {
            glyphGroup: [customGlyph],
            left: 8,
            paddingLeft: 4,
            width: 120,
        } as any;
        const line = {
            divides: [divide],
            top: 24,
            lineHeight: 18,
            marginBottom: 2,
            paragraphStart: false,
        } as any;

        divide.parent = line;
        customGlyph.parent = divide;
        line.parent = column;
        column.lines = [line];

        const inlineDrawings = new Map([
            ['drawing-1', {
                drawingId: 'drawing-1',
                drawingOrigin: {
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN },
                        positionV: { relativeFrom: ObjectRelativeFromV.LINE },
                        size: { width: 20, height: 12 },
                        angle: 15,
                    },
                },
            }],
        ]) as NonNullable<Parameters<typeof updateInlineDrawingPosition>[1]>;

        updateInlineDrawingPosition(line, inlineDrawings, 7);
        const placed = page.skeDrawings.get('drawing-1');
        expect(placed).toBeTruthy();
        expect(placed?.aLeft).toBeGreaterThan(0);
        expect(placed?.aTop).toBeGreaterThan(0);
        expect(placed?.lineTop).toBe(24);
        expect(placed?.blockAnchorTop).toBe(7);

        updateInlineDrawingPosition({ parent: null } as any, inlineDrawings, 0);
    });
});
