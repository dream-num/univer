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

import type { IBullet, IHyperlink, ITextStyle } from '@univerjs/core';
import { BooleanNumber, CustomRangeType, DataStreamTreeTokenType, DocumentFlavor, PositionedObjectLayoutType, PRESET_LIST_TYPE, PresetListType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { GlyphType } from '../../../../../../basics/i-document-skeleton-cached';
import { FontCache } from '../../../shaping-engine/font-cache';
import { dealWidthParagraph } from '../paragraph-layout';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

const CONTENT = 'Workspace architecture';

function layoutList(
    documentFlavor: DocumentFlavor,
    listType: PresetListType,
    options: {
        linkStart?: number;
        properties?: Partial<IHyperlink> & { textColorMode?: 'text' };
        runStyle?: ITextStyle;
        bulletStyle?: ITextStyle;
        listStyle?: ITextStyle;
        markStyle?: ITextStyle;
        floatingAnchor?: boolean;
    } = {}
) {
    const bullet: IBullet = { listId: 'marker-style', listType, nestingLevel: 0, textStyle: options.bulletStyle };
    const offset = options.floatingAnchor ? 1 : 0;
    const content = options.floatingAnchor ? `${DataStreamTreeTokenType.CUSTOM_BLOCK}${CONTENT}` : CONTENT;
    const bed = createParagraphLayoutTestBed(content, {
        body: {
            paragraphs: [{ startIndex: content.length, paragraphId: 'list-paragraph', bullet, paragraphStyle: { paragraphMarkTextStyle: options.markStyle } }],
            textRuns: [
                ...offset ? [{ st: 0, ed: offset, ts: {} }] : [],
                { st: offset, ed: content.length, ts: options.runStyle ?? {} },
            ],
            customBlocks: options.floatingAnchor ? [{ startIndex: 0, blockId: 'behind-picture' }] : [],
            customRanges: options.linkStart == null
                ? []
                : [{
                    startIndex: options.linkStart + offset,
                    endIndex: content.length - 1,
                    rangeId: 'workspace-link',
                    rangeType: CustomRangeType.HYPERLINK,
                    properties: { url: 'https://example.test/workspace', ...options.properties },
                }],
        },
        drawings: options.floatingAnchor
            ? {
                'behind-picture': {
                    drawingId: 'behind-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: BooleanNumber.TRUE,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { posOffset: 0 },
                        positionV: { posOffset: 0 },
                        angle: 0,
                    },
                },
            }
            : {},
        documentStyle: { documentFlavor },
        lists: options.listStyle == null
            ? undefined
            : {
                [listType]: {
                    ...PRESET_LIST_TYPE[listType],
                    nestingLevel: PRESET_LIST_TYPE[listType].nestingLevel.map((level) => ({ ...level, textStyle: options.listStyle })),
                },
            },
    });
    const snapshot = structuredClone(bed.dataModel.getSnapshot());
    const pages = dealWidthParagraph(bed.ctx, bed.viewModel, bed.paragraphNode, bed.curPage, bed.sectionBreakConfig);
    const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
    const glyphs = lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup));
    const marker = glyphs.find((glyph) => glyph.glyphType === GlyphType.LIST)!;
    const text = glyphs.filter((glyph) => glyph.glyphType !== GlyphType.LIST);
    expect(marker).toBeDefined();
    expect(bed.dataModel.getSnapshot()).toEqual(snapshot);
    return { marker, text, lines };
}

describe.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('list marker hyperlink styles in flavor %s', (flavor) => {
    it.each([PresetListType.BULLET_LIST, PresetListType.ORDER_LIST])('keeps a leading hyperlink off the %s marker without changing layout', (listType) => {
        const reference = layoutList(flavor, listType);
        const linked = layoutList(flavor, listType, { linkStart: 0 });

        expect(linked.marker.ts).toEqual(reference.marker.ts);
        expect(linked.marker.ts?.cl?.rgb).not.toBe('blue.600');
        expect(linked.marker.ts?.ul?.s).not.toBe(BooleanNumber.TRUE);
        expect(linked.text[0].ts).toMatchObject({ cl: { rgb: 'blue.600' }, ul: { s: BooleanNumber.TRUE } });
        expect(linked.marker.width).toBe(reference.marker.width);
        expect(linked.marker.bBox).toEqual(reference.marker.bBox);
        expect(linked.text.map(({ width, left, bBox }) => ({ width, left, bBox })))
            .toEqual(reference.text.map(({ width, left, bBox }) => ({ width, left, bBox })));
        expect(linked.lines.map(({ top, lineHeight }) => ({ top, lineHeight })))
            .toEqual(reference.lines.map(({ top, lineHeight }) => ({ top, lineHeight })));
    });

    it('does not change a marker when the hyperlink starts later in the item', () => {
        const reference = layoutList(flavor, PresetListType.BULLET_LIST);
        const linked = layoutList(flavor, PresetListType.BULLET_LIST, { linkStart: 10 });
        expect(linked.marker.ts).toEqual(reference.marker.ts);
        expect(linked.text.find((glyph) => glyph.ts?.cl?.rgb === 'blue.600')?.ts?.ul?.s).toBe(BooleanNumber.TRUE);
    });

    it.each([
        { textColorMode: 'text' },
        { textStyleMode: 'text' },
    ] satisfies Array<Partial<IHyperlink> & { textColorMode?: 'text' }>)('preserves hyperlink text appearance mode %j', (properties) => {
        const runStyle: ITextStyle = { cl: { rgb: '#8E24AA' }, ul: { s: BooleanNumber.TRUE }, fs: 18, bl: BooleanNumber.TRUE };
        const reference = layoutList(flavor, PresetListType.ORDER_LIST, { runStyle });
        const linked = layoutList(flavor, PresetListType.ORDER_LIST, { linkStart: 0, properties, runStyle });
        expect(linked.marker.ts).toEqual(reference.marker.ts);
        expect(linked.text[0].ts).toMatchObject(runStyle);
    });

    it('preserves explicitly styled markers ahead of hyperlink styling', () => {
        const bulletStyle: ITextStyle = { cl: { rgb: '#8E24AA' }, ul: { s: BooleanNumber.TRUE }, fs: 18 };
        const linked = layoutList(flavor, PresetListType.ORDER_LIST, { linkStart: 0, bulletStyle });
        expect(linked.marker.ts).toMatchObject(bulletStyle);
        expect(linked.text[0].ts).toMatchObject({ cl: { rgb: 'blue.600' }, ul: { s: BooleanNumber.TRUE } });
        const listStyle: ITextStyle = { cl: { rgb: '#4CAF50' }, ul: { s: BooleanNumber.FALSE } };
        const listStyled = layoutList(flavor, PresetListType.ORDER_LIST, { linkStart: 0, bulletStyle, listStyle });
        expect(listStyled.marker.ts).toMatchObject({ ...bulletStyle, ...listStyle });
    });

    it('preserves authored leading-run color when paragraph-mark color is unspecified', () => {
        const runStyle: ITextStyle = { cl: { rgb: '#8E24AA' }, fs: 18, bl: BooleanNumber.TRUE };
        const reference = layoutList(flavor, PresetListType.ORDER_LIST, { runStyle });
        const linked = layoutList(flavor, PresetListType.ORDER_LIST, { linkStart: 0, runStyle });
        expect(linked.marker.ts).toEqual(reference.marker.ts);
        expect(linked.marker.ts).toMatchObject(runStyle);
        expect(linked.text[0].ts).toMatchObject({ cl: { rgb: 'blue.600' }, fs: 18, bl: BooleanNumber.TRUE });
    });

    it.each([false, true])('keeps first visible run style after a floating anchor with link %s', (link) => {
        const measure = vi.spyOn(FontCache, 'getTextSize').mockReturnValue({
            width: 8,
            ba: 10,
            bd: 4,
            aba: 10,
            abd: 4,
            sp: 0,
            sbr: 0,
            sbo: 0,
            spr: 0,
            spo: 0,
        });
        try {
            const runStyle: ITextStyle = { cl: { rgb: '#8E24AA' }, ul: { s: BooleanNumber.TRUE }, fs: 18 };
            const result = layoutList(flavor, PresetListType.ORDER_LIST, { floatingAnchor: true, runStyle, linkStart: link ? 0 : undefined });
            expect(result.marker.ts).toMatchObject({
                ...runStyle,
                ul: { s: flavor === DocumentFlavor.TRADITIONAL ? BooleanNumber.FALSE : BooleanNumber.TRUE },
            });
        } finally {
            measure.mockRestore();
        }
    });
});

it('preserves traditional paragraph-mark color ahead of a linked leading run', () => {
    const linked = layoutList(DocumentFlavor.TRADITIONAL, PresetListType.ORDER_LIST, {
        linkStart: 0,
        runStyle: { cl: { rgb: '#8E24AA' } },
        markStyle: { cl: { rgb: '#4CAF50' }, ul: { s: BooleanNumber.TRUE } },
    });
    expect(linked.marker.ts).toMatchObject({ cl: { rgb: '#4CAF50' }, ul: { s: BooleanNumber.FALSE } });
    expect(linked.text[0].ts).toMatchObject({ cl: { rgb: 'blue.600' }, ul: { s: BooleanNumber.TRUE } });
});

it('keeps authored first-run color, underline and typography on modern markers', () => {
    const runStyle: ITextStyle = { cl: { rgb: '#8E24AA' }, ul: { s: BooleanNumber.TRUE }, fs: 18, bl: BooleanNumber.TRUE };
    const reference = layoutList(DocumentFlavor.MODERN, PresetListType.BULLET_LIST, { runStyle });
    const linked = layoutList(DocumentFlavor.MODERN, PresetListType.BULLET_LIST, { linkStart: 0, runStyle });
    expect(linked.marker.ts).toEqual(reference.marker.ts);
    expect(linked.marker.ts).toMatchObject(runStyle);
    expect(linked.text[0].ts).toMatchObject({ cl: { rgb: 'blue.600' }, ul: { s: BooleanNumber.TRUE }, fs: 18, bl: BooleanNumber.TRUE });
});
