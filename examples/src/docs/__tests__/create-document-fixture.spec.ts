import type { IDocumentBody } from '@univerjs/core';
import {
    BaselineOffset,
    BooleanNumber,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    HorizontalAlign,
    LocaleType,
    NamedStyleType,
    PositionedObjectLayoutType,
    PresetListType,
    TextDirection,
    validateDocumentStructure,
    WrapTextType,
} from '@univerjs/core';
import { getSectionContentWidth } from '@univerjs/docs';
import { DOCS_DRAWING_PLUGIN } from '@univerjs/preset-docs-drawing';
import { describe, expect, it } from 'vitest';

import { readGeneratedSvgSize } from '../../generated-svg';
import { createDocumentFixture } from '../create-document-fixture';

describe('createDocumentFixture', () => {
    it('provides valid, discoverable editing, layout and review samples', () => {
        const snapshot = createDocumentFixture(LocaleType.EN_US);
        const body = snapshot.body!;
        const paragraphStyles = body.paragraphs?.flatMap(({ paragraphStyle }) => paragraphStyle ? [paragraphStyle] : []) ?? [];
        const bullets = body.paragraphs?.flatMap(({ bullet }) => bullet ? [bullet] : []) ?? [];
        const textStyles = body.textRuns?.flatMap(({ ts }) => ts ? [ts] : []) ?? [];
        const tableRange = body.tables?.[0];
        const table = tableRange ? snapshot.tableSource?.[tableRange.tableId] : undefined;
        const multiColumnSection = body.sectionBreaks?.find(({ columnProperties }) => columnProperties?.length === 2);
        const columns = multiColumnSection?.columnProperties ?? [];
        const commentResource = snapshot.resources?.find(({ name }) => name === 'SHEET_UNIVER_THREAD_COMMENT_PLUGIN');
        const drawingResource = snapshot.resources?.find(({ name }) => name === DOCS_DRAWING_PLUGIN);
        const comments = commentResource
            ? JSON.parse(commentResource.data) as Record<
                string,
                Array<{ children: Array<{ text: IDocumentBody }>; text: IDocumentBody }>
            >
            : {};
        const drawingResourceData = drawingResource
            ? JSON.parse(drawingResource.data) as { data: unknown; order: unknown }
            : undefined;

        expect(validateDocumentStructure(snapshot)).toEqual([]);
        expect([...new Set(paragraphStyles.map(({ namedStyleType }) => namedStyleType))]).toEqual(expect.arrayContaining([
            NamedStyleType.TITLE,
            NamedStyleType.HEADING_1,
            NamedStyleType.HEADING_2,
        ]));
        expect(textStyles.some(({ bl }) => bl === BooleanNumber.TRUE)).toBe(true);
        expect(textStyles.some(({ it }) => it === BooleanNumber.TRUE)).toBe(true);
        expect(textStyles.some(({ bg }) => bg != null)).toBe(true);
        expect(textStyles.some(({ ul }) => ul != null)).toBe(true);
        expect(textStyles.some(({ st }) => st != null)).toBe(true);
        expect(textStyles.some(({ va }) => va === BaselineOffset.SUBSCRIPT)).toBe(true);
        expect(textStyles.some(({ va }) => va === BaselineOffset.SUPERSCRIPT)).toBe(true);
        expect(paragraphStyles.some(({ horizontalAlign }) => horizontalAlign === HorizontalAlign.JUSTIFIED)).toBe(true);
        expect(paragraphStyles.some(({ indentFirstLine }) => indentFirstLine != null)).toBe(true);
        expect(paragraphStyles.some(({ hanging }) => hanging != null)).toBe(true);
        expect(paragraphStyles.some(({ borderLeft, shading }) => borderLeft && shading)).toBe(true);
        expect(paragraphStyles.some(({ tabStops }) => tabStops?.length)).toBe(true);
        expect([...new Set(bullets.map(({ listType }) => listType))]).toEqual(expect.arrayContaining([
            PresetListType.BULLET_LIST,
            PresetListType.ORDER_LIST,
            PresetListType.CHECK_LIST,
        ]));
        expect(bullets.some(({ nestingLevel }) => nestingLevel > 0)).toBe(true);
        expect(body.dataStream).toContain('\t');
        expect(body.dataStream).toContain('\f');
        expect([...new Set(body.blockRanges?.map(({ blockType }) => blockType))]).toEqual(expect.arrayContaining([
            DocumentBlockRangeType.QUOTE,
            DocumentBlockRangeType.CALLOUT,
            DocumentBlockRangeType.CODE,
        ]));
        expect(columns).toHaveLength(2);
        expect(columns.every(({ width }) => width > 0)).toBe(true);
        expect(columns.reduce((total, { width, paddingEnd }) => total + width + paddingEnd, 0)).toBeLessThanOrEqual(
            getSectionContentWidth(snapshot.documentStyle, multiColumnSection)
        );
        expect(Object.keys(snapshot.headers ?? {})).not.toHaveLength(0);
        expect(Object.keys(snapshot.footers ?? {})).not.toHaveLength(0);
        expect(tableRange && body.dataStream[tableRange.startIndex]).toBe(DataStreamTreeTokenType.TABLE_START);
        expect(table?.tableRows.some(({ tableCells }) => tableCells.some(({ rowSpan }) => rowSpan === 2))).toBe(true);
        expect(table?.tableRows[0].repeatHeaderRow).toBe(BooleanNumber.TRUE);
        expect(body.customRanges?.some(({ rangeType }) => rangeType === CustomRangeType.HYPERLINK)).toBe(true);
        expect([...new Set(Object.values(snapshot.drawings ?? {}).map(({ layoutType }) => layoutType))]).toEqual(
            expect.arrayContaining([PositionedObjectLayoutType.INLINE, PositionedObjectLayoutType.WRAP_SQUARE])
        );
        expect(Object.values(snapshot.drawings ?? {}).find(
            ({ layoutType }) => layoutType === PositionedObjectLayoutType.WRAP_SQUARE
        )).toMatchObject({
            distB: 8,
            distL: 12,
            distT: 8,
            wrapText: WrapTextType.LEFT,
        });
        expect(Object.values(snapshot.drawings ?? {}).every((drawing) => (
            'source' in drawing && typeof drawing.source === 'string' && drawing.source.startsWith('data:image/svg+xml')
        ))).toBe(true);
        Object.values(snapshot.drawings ?? {}).forEach((drawing) => {
            if (!('source' in drawing) || typeof drawing.source !== 'string') {
                throw new Error(`Expected ${drawing.drawingId} to be an SVG image drawing.`);
            }

            const intrinsicSize = readGeneratedSvgSize(drawing.source);
            const { transform } = drawing;
            if (transform?.width == null || transform.height == null) {
                throw new Error(`Expected ${drawing.drawingId} to define a render transform.`);
            }

            expect(drawing.docTransform.size).toEqual(intrinsicSize);
            expect(transform.width / transform.height).toBeCloseTo(
                intrinsicSize.width / intrinsicSize.height,
                8
            );
        });
        expect(body.customBlocks?.map(({ blockId, startIndex }) => ({
            blockId,
            token: body.dataStream[startIndex],
        }))).toEqual(snapshot.drawingsOrder?.map((blockId) => ({
            blockId,
            token: DataStreamTreeTokenType.CUSTOM_BLOCK,
        })));
        expect(drawingResourceData).toEqual({
            data: snapshot.drawings,
            order: snapshot.drawingsOrder,
        });
        expect(body.customDecorations).toHaveLength(2);
        expect(comments.default_doc).toHaveLength(2);
        expect(comments.default_doc?.some(({ children }) => children.length > 0)).toBe(true);
        expect(comments.default_doc.flatMap((comment) => [comment, ...comment.children]).every(({ text }) => (
            text.paragraphs?.some(({ startIndex }) => (
                text.dataStream.slice(0, startIndex).replaceAll('\r', '').trim()
            )) === true
        ))).toBe(true);
    });

    it('creates fresh deterministic snapshots and applies RTL to document sections', () => {
        const first = createDocumentFixture(LocaleType.AR_SA, 'rtl');
        const second = createDocumentFixture(LocaleType.AR_SA, 'rtl');
        const documentSections = first.body?.sectionBreaks?.filter(({ sectionId }) => !sectionId.startsWith('section-table-'));

        expect(first.body).not.toBe(second.body);
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));
        expect(documentSections?.every(({ contentDirection }) => contentDirection === TextDirection.RIGHT_TO_LEFT)).toBe(true);
    });

    it('persists the selected default zoom in the document snapshot', () => {
        expect(createDocumentFixture(LocaleType.EN_US).settings?.zoomRatio).toBe(1);
        expect(createDocumentFixture(LocaleType.EN_US, 'ltr', 1.5).settings?.zoomRatio).toBe(1.5);
    });
});
