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

import type { IDocumentData } from '../../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '../../../common/const';
import { BooleanNumber, HorizontalAlign, TextDecoration, TextDirection } from '../../../types/enum/text-style';
import { DocumentFlavor } from '../../../types/interfaces/i-document-data';
import { DocumentDataModel } from '../document-data-model';
import { JSONX } from '../json-x/json-x';
import { ParagraphStyleBuilder, RichTextBuilder, TextDecorationBuilder, TextStyleBuilder } from '../rich-text-builder';
import { DataStreamTreeTokenType } from '../types';

function createDocSnapshot(id = 'doc-main'): IDocumentData {
    return {
        id,
        title: 'Main Doc',
        documentStyle: {
            pageSize: { width: 300, height: 400 },
            marginTop: 1,
            marginBottom: 2,
            marginLeft: 3,
            marginRight: 4,
        },
        body: {
            dataStream: 'Hello World\r\n',
            paragraphs: [{ startIndex: 0, paragraphId: 'para_fixture_1' }],
            textRuns: [{ st: 0, ed: 5, ts: { ff: 'Arial', fs: 12 } }],
            customRanges: [],
            customDecorations: [],
        },
        headers: {
            header1: {
                headerId: 'header1',
                body: {
                    dataStream: 'Header\r\n',
                    paragraphs: [{ startIndex: 0, paragraphId: 'para_fixture_2' }],
                    textRuns: [],
                },
            },
        },
        footers: {
            footer1: {
                footerId: 'footer1',
                body: {
                    dataStream: 'Footer\r\n',
                    paragraphs: [{ startIndex: 0, paragraphId: 'para_fixture_3' }],
                    textRuns: [],
                },
            },
        },
        drawings: {
            drawing1: {
                drawingId: 'drawing1',
                docTransform: {
                    size: { width: 10, height: 10 },
                    positionH: { posOffset: 0 },
                    positionV: { posOffset: 0 },
                },
            },
        } as any,
        drawingsOrder: ['drawing1'],
    };
}

describe('DocumentDataModel + RichTextBuilder integration', () => {
    it('should hydrate missing default fields for partial normal document snapshots', () => {
        const model = new DocumentDataModel({ id: 'partial-doc', title: 'Partial Doc' });

        expect(model.getUnitId()).toBe('partial-doc');
        expect(model.getTitle()).toBe('Partial Doc');
        expect(model.getBody()?.dataStream).toBe('\r\n');
        expect(model.getSnapshot().headers).toEqual({});
        expect(model.getSnapshot().footers).toEqual({});
        expect(model.getDrawings()).toEqual({});
        expect(model.getDrawingsOrder()).toEqual([]);
        expect(model.getSettings()).toEqual({});
        expect(model.getSnapshot().tableSource).toEqual({});
        expect(model.getDocumentStyle().documentFlavor).toBe(DocumentFlavor.MODERN);
        expect(model.getDocumentStyle().pageSize).toBeDefined();
        expect(() => model.updateDocumentDataMargin({ t: 10 })).not.toThrow();
        expect(model.getDocumentStyle().marginTop).toBe(10);

        model.reset({ id: 'partial-doc', title: 'Reset Partial Doc' });

        expect(model.getTitle()).toBe('Reset Partial Doc');
        expect(model.getBody()?.dataStream).toBe('\r\n');
        expect(model.getSnapshot().headers).toEqual({});
        expect(model.getDrawings()).toEqual({});
        expect(model.getSettings()).toEqual({});

        model.dispose();
    });

    it('should keep internal editor document snapshots shallow', () => {
        const model = new DocumentDataModel({
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            title: 'Editor Doc',
            documentStyle: {},
            body: {
                dataStream: 'Draft\r\n',
            },
        });

        expect(model.getUnitId()).toBe(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(model.getTitle()).toBe('Editor Doc');
        expect(model.getBody()?.dataStream).toBe('Draft\r\n');
        expect(model.getSnapshot().headers).toBeUndefined();
        expect(model.getSnapshot().footers).toBeUndefined();
        expect(model.getDrawings()).toBeUndefined();
        expect(model.getDrawingsOrder()).toBeUndefined();
        expect(model.getSettings()).toBeUndefined();
        expect(model.getSnapshot().tableSource).toBeUndefined();
        expect(model.getDocumentStyle()).toEqual({});

        model.reset({
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            title: 'Reset Editor Doc',
            documentStyle: {},
            body: {
                dataStream: 'Reset\r\n',
            },
        });

        expect(model.getTitle()).toBe('Reset Editor Doc');
        expect(model.getBody()?.dataStream).toBe('Reset\r\n');
        expect(model.getSnapshot().headers).toBeUndefined();
        expect(model.getSettings()).toBeUndefined();
        expect(model.getDocumentStyle()).toEqual({});

        model.dispose();
    });

    it('should perform typical editing operations and reflect them in the document snapshot', () => {
        const model = new DocumentDataModel(createDocSnapshot());
        expect(model.getUnitId()).toBe('doc-main');
        expect(model.getTitle()).toBe('Main Doc');

        model.setName('Renamed');
        expect(model.getTitle()).toBe('Renamed');

        model.updateDocumentDataMargin({ t: 10, l: 20 });
        model.updateDocumentDataPageSize(500, 600);
        expect(model.getDocumentStyle().marginTop).toBe(10);
        expect(model.getDocumentStyle().marginLeft).toBe(20);
        expect(model.getDocumentStyle().pageSize).toEqual({ width: 500, height: 600 });

        model.updateDocumentRenderConfig({
            locale: 'enUS',
        } as any);
        model.updateDocumentStyle({
            renderConfig: { direction: TextDirection.LEFT_TO_RIGHT },
        } as any);

        model.updateDrawing('drawing1', { width: 100, height: 50, left: 12, top: 34 });
        expect(model.getDrawings()?.drawing1.docTransform.size).toEqual({ width: 100, height: 50 });

        model.setZoomRatio(1.5);
        model.setDisabled(true);
        expect(model.zoomRatio).toBe(1.5);
        expect(model.getDisabled()).toBe(true);

        const richText = RichTextBuilder.create(RichTextBuilder.newEmptyData());
        richText
            .insertText('Hello')
            .insertParagraph(
                ParagraphStyleBuilder.create({
                    horizontalAlign: HorizontalAlign.CENTER,
                    direction: TextDirection.RIGHT_TO_LEFT,
                })
            )
            .insertLink(' Univer', 'https://univer.ai')
            .setStyle(0, 5, TextStyleBuilder.create({ ff: 'Inter', fs: 14, bl: BooleanNumber.TRUE }))
            .setLink(0, 5, 'https://example.com');

        const firstLinkId = richText.getLinks()[0].rangeId;
        richText.updateLink(firstLinkId, 'https://updated.example.com');

        expect(richText.toPlainText()).toContain('Hello');
        expect(richText.getLinks()).toHaveLength(2);

        const sliced = richText.slice(0, 5);
        expect(sliced.toPlainText()).toContain('Hello');

        const decoration = TextDecorationBuilder.create({ s: BooleanNumber.TRUE })
            .setLineType(TextDecoration.SINGLE)
            .setFollowFontColor(false)
            .build();

        const styled = new TextStyleBuilder({}).setUnderline(TextDecorationBuilder.create(decoration)).build();
        expect(styled.ul?.s).toBe(BooleanNumber.TRUE);

        const docData = richText.getData();
        expect(docData.body?.dataStream).toContain('Hello');

        const jsonx = JSONX.getInstance();
        model.apply(jsonx.replaceOp(['title'], 'Renamed', 'Applied Title') as any);
        model.apply(jsonx.replaceOp(['settings', 'zoomRatio'], 1.5, 2) as any);
        expect(model.getTitle()).toBe('Applied Title');

        expect(model.getPlainText()).toContain('Hello World');
        expect(model.sliceBody(0, 5)?.dataStream).toContain('Hello');

        const partialParagraphModel = new DocumentDataModel({
            id: 'partial-paragraph',
            title: 'Partial Paragraph',
            documentStyle: {},
            body: {
                dataStream: 'First\rSecond\r',
                paragraphs: [
                    { startIndex: 5, paragraphId: 'para_fixture_4', paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER } },
                    { startIndex: 12, paragraphId: 'para_fixture_5', paragraphStyle: { textStyle: { fs: 18 } } },
                ],
            },
        });
        expect(partialParagraphModel.sliceBody(0, 5)?.paragraphs?.[0]).toMatchObject({
            startIndex: 5,
            paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER },
        });
        expect(partialParagraphModel.sliceBody(6, 12)?.paragraphs?.[0]).toMatchObject({
            startIndex: 6,
            paragraphStyle: { textStyle: { fs: 18 } },
        });
        partialParagraphModel.dispose();

        const tableStream = [
            DataStreamTreeTokenType.TABLE_START,
            DataStreamTreeTokenType.TABLE_ROW_START,
            DataStreamTreeTokenType.TABLE_CELL_START,
            'Cell\r\n',
            DataStreamTreeTokenType.TABLE_CELL_END,
            DataStreamTreeTokenType.TABLE_ROW_END,
            DataStreamTreeTokenType.TABLE_END,
        ].join('');
        const partialTableModel = new DocumentDataModel({
            id: 'partial-table',
            title: 'Partial Table',
            documentStyle: {},
            body: {
                dataStream: tableStream,
                tables: [{ startIndex: 0, endIndex: tableStream.length, tableId: 'table-1' }],
                paragraphs: [{ startIndex: 7, paragraphId: 'para_fixture_6' }],
            },
        });
        expect(partialTableModel.sliceBody(1, tableStream.length - 1)?.tables?.[0]).toMatchObject({
            startIndex: 0,
            endIndex: tableStream.length - 2,
            tableId: 'table-1',
        });
        partialTableModel.dispose();

        model.resetDrawing({} as any, []);
        expect(model.getDrawingsOrder()).toEqual([]);
        model.dispose();
    });

    it('should manage reset, noop apply and header-footer reinitialization for realistic document state changes', () => {
        const snapshot = createDocSnapshot('doc-reset');
        const model = new DocumentDataModel(snapshot);
        const jsonx = JSONX.getInstance();
        const initialChangeCount = model.change$.getValue();

        expect(model.getCustomRanges()).toEqual([]);
        expect(model.getCustomDecorations()).toEqual([]);
        expect(model.getSettings()).toEqual({});
        expect(model.apply(null as never)).toBeUndefined();
        expect(model.change$.getValue()).toBe(initialChangeCount);

        model.setZoomRatio(2);
        expect(model.getSettings()).toEqual({ zoomRatio: 2 });

        model.apply(jsonx.replaceOp(['headers'], model.getSnapshot().headers, {
            ...model.getSnapshot().headers,
            header2: {
                headerId: 'header2',
                body: {
                    dataStream: 'Another Header\r\n',
                    paragraphs: [{ startIndex: 0, paragraphId: 'para_fixture_7' }],
                },
            },
        }) as never);

        expect(model.getSnapshot().headers?.header2?.body.dataStream).toBe('Another Header\r\n');
        expect(model.change$.getValue()).toBeGreaterThan(initialChangeCount);

        expect(() => model.reset({ id: 'other-doc' })).toThrow('Cannot reset a document model with a different unit id!');

        model.reset({
            id: 'doc-reset',
            title: 'Reset Title',
            body: {
                dataStream: 'Reset\r\n',
                paragraphs: [{ startIndex: 5, paragraphId: 'para_fixture_8' }],
            },
            documentStyle: {},
        });

        expect(model.getTitle()).toBe('Reset Title');
        expect(model.getBody()?.dataStream).toBe('Reset\r\n');
        expect(model.getUnitId()).toBe('doc-reset');
        expect(model.sliceBody(0, 5)?.dataStream).toContain('Reset');
        model.dispose();
    });
});
