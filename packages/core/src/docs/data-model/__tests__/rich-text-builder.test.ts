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

import type { IBullet } from '../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { BaselineOffset, BooleanNumber, HorizontalAlign, TextDecoration, TextDirection, VerticalAlign } from '../../../types/enum';
import { CustomRangeType, SpacingRule } from '../../../types/interfaces';
import { PresetListType } from '../preset-list-type';
import { ParagraphStyleBuilder, RichTextBuilder, RichTextValue, TextDecorationBuilder, TextStyleBuilder } from '../rich-text-builder';

describe('TextStyleBuilder', () => {
    it('should create empty text style', () => {
        const style = TextStyleBuilder.create();
        expect(style.getValue()).toEqual({});
    });

    it('should set and get font family', () => {
        const style = TextStyleBuilder.create()
            .setFontFamily('Arial');
        expect(style.fontFamily).toBe('Arial');
    });

    it('should set and get font size', () => {
        const style = TextStyleBuilder.create()
            .setFontSize(12);
        expect(style.fontSize).toBe(12);
    });

    it('should set and get bold', () => {
        const style = TextStyleBuilder.create()
            .setBold(true);
        expect(style.bold).toBe(true);
        expect(style.getValue().bl).toBe(BooleanNumber.TRUE);
    });

    it('should set and get italic', () => {
        const style = TextStyleBuilder.create()
            .setItalic(true);
        expect(style.italic).toBe(true);
        expect(style.getValue().it).toBe(BooleanNumber.TRUE);
    });

    it('should copy style correctly', () => {
        const original = TextStyleBuilder.create()
            .setFontFamily('Arial')
            .setFontSize(12)
            .setBold(true);

        const copy = original.copy();
        expect(copy.getValue()).toEqual(original.getValue());
        expect(copy.getValue()).not.toBe(original.getValue()); // Different object references
    });
});

describe('TextDecorationBuilder', () => {
    it('should create default text decoration', () => {
        const decoration = TextDecorationBuilder.create();
        expect(decoration.show).toBe(true);
        expect(decoration.build().s).toBe(BooleanNumber.TRUE);
    });

    it('should set and get line type', () => {
        const decoration = TextDecorationBuilder.create()
            .setLineType(TextDecoration.SINGLE);
        expect(decoration.type).toBe(TextDecoration.SINGLE);
    });

    it('should set and get color', () => {
        const color = { rgb: '#FF0000' };
        const decoration = TextDecorationBuilder.create()
            .setColor(color);
        expect(decoration.color).toEqual(color);
    });

    it('should set and get follow font color', () => {
        const decoration = TextDecorationBuilder.create()
            .setFollowFontColor(true);
        expect(decoration.followFontColor).toBe(true);
        expect(decoration.build().c).toBe(BooleanNumber.TRUE);
    });
});

describe('ParagraphStyleBuilder', () => {
    it('should create empty paragraph style', () => {
        const style = ParagraphStyleBuilder.create();
        expect(style.getValue()).toEqual({});
    });

    it('should set and get horizontal align', () => {
        const style = ParagraphStyleBuilder.create()
            .setHorizontalAlign(HorizontalAlign.CENTER);
        expect(style.horizontalAlign).toBe(HorizontalAlign.CENTER);
    });

    it('should set and get line spacing', () => {
        const style = ParagraphStyleBuilder.create()
            .setLineSpacing(1.5);
        expect(style.lineSpacing).toBe(1.5);
    });

    it('should set and get direction', () => {
        const style = ParagraphStyleBuilder.create()
            .setDirection(TextDirection.RIGHT_TO_LEFT);
        expect(style.direction).toBe(TextDirection.RIGHT_TO_LEFT);
    });

    it('should set and get text style', () => {
        const textStyle = TextStyleBuilder.create()
            .setFontFamily('Arial')
            .setFontSize(12)
            .build();

        const style = ParagraphStyleBuilder.create()
            .setTextStyle(textStyle);
        expect(style.textStyle).toEqual(textStyle);
    });

    it('should set and get indentation', () => {
        const indentValue = { v: 20, unit: 'pt' };
        const style = ParagraphStyleBuilder.create()
            .setIndentStart(indentValue)
            .setIndentEnd(indentValue)
            .setIndentFirstLine(indentValue);

        expect(style.indentStart).toEqual(indentValue);
        expect(style.indentEnd).toEqual(indentValue);
        expect(style.indentFirstLine).toEqual(indentValue);
    });

    it('should handle complex paragraph style', () => {
        const textStyle = TextStyleBuilder.create()
            .setFontFamily('Arial')
            .setFontSize(12)
            .setBold(true)
            .setItalic(true)
            .build();

        const style = ParagraphStyleBuilder.create()
            .setTextStyle(textStyle)
            .setHorizontalAlign(HorizontalAlign.CENTER)
            .setLineSpacing(1.5)
            .setDirection(TextDirection.LEFT_TO_RIGHT)
            .setSnapToGrid(true);

        expect(style.textStyle).toEqual(textStyle);
        expect(style.horizontalAlign).toBe(HorizontalAlign.CENTER);
        expect(style.lineSpacing).toBe(1.5);
        expect(style.direction).toBe(TextDirection.LEFT_TO_RIGHT);
        expect(style.snapToGrid).toBe(BooleanNumber.TRUE);
        expect(style.getValue().snapToGrid).toBe(BooleanNumber.TRUE);
    });
});

describe('RichTextValue', () => {
    it('should create empty rich text value', () => {
        const richText = RichTextValue.createByBody({
            dataStream: '',
            textRuns: [],
            paragraphs: [],
        });
        expect(richText.getData().body).toEqual({
            dataStream: '',
            textRuns: [],
            paragraphs: [],
            sectionBreaks: [],
            tables: [],
            customBlocks: [],
            customDecorations: [],
            customRanges: [],
        });
    });

    it('should throw error when creating without body', () => {
        expect(() => RichTextValue.create({} as any)).toThrow('Invalid document data, body is required');
    });

    it('should create by body data', () => {
        const body = {
            dataStream: 'Hello World',
            textRuns: [],
            paragraphs: [],
        };
        const richText = RichTextValue.createByBody(body);
        expect(richText.getData()).toEqual({
            id: 'd',
            documentStyle: {},
            body,
            drawings: {},
            drawingsOrder: [],
        });
    });

    it('should convert to plain text', () => {
        const richText = RichTextValue.createByBody({
            dataStream: 'Hello World\rNew Line\r\n',
            textRuns: [],
            paragraphs: [],
        });
        expect(richText.toPlainText()).toBe('Hello World\nNew Line');
    });

    it('should get paragraph style', () => {
        const paragraphStyle = {
            horizontalAlign: HorizontalAlign.CENTER,
        };
        const richText = RichTextValue.createByBody({
            dataStream: 'Hello World',
            textRuns: [],
            paragraphs: [{
                startIndex: 11,
                paragraphId: 'para_fixture_1007',
                paragraphStyle,
            }],
        });
        expect(richText.getParagraphStyle().getValue()).toEqual(paragraphStyle);
    });

    it('should get paragraph bullet', () => {
        const bullet: IBullet = {
            listId: '1',
            listType: '1',
            nestingLevel: 0,
        };
        const richText = RichTextValue.createByBody({
            dataStream: 'Hello World',
            textRuns: [],
            paragraphs: [{
                startIndex: 11,
                paragraphId: 'para_fixture_1008',
                bullet,
            }],
        });
        expect(richText.getParagraphBullet()).toEqual(bullet);
    });

    it('should get text runs with styles', () => {
        const textRun = {
            st: 0,
            ed: 5,
            ts: { ff: 'Arial', fs: 12 },
        };
        const richText = RichTextValue.createByBody({
            dataStream: 'Hello World',
            textRuns: [textRun],
            paragraphs: [],
        });
        const runs = richText.getTextRuns();
        expect(runs[0].st).toBe(0);
        expect(runs[0].ed).toBe(5);
        expect(runs[0].ts?.getValue()).toEqual(textRun.ts);
    });

    it('should get links', () => {
        const link = {
            startIndex: 0,
            endIndex: 5,
            rangeType: CustomRangeType.HYPERLINK,
            url: 'https://example.com',
            rangeId: 'linkId',
        };
        const richText = RichTextValue.createByBody({
            dataStream: 'Hello World',
            textRuns: [],
            paragraphs: [],
            customRanges: [link],
        });
        expect(richText.getLinks()).toEqual([link]);
    });

    it('should slice text correctly', () => {
        const richText = RichTextValue.createByBody({
            dataStream: 'Hello World',
            textRuns: [],
            paragraphs: [],
        });
        const sliced = richText.slice(0, 5);
        expect(sliced.getData().body!.dataStream).toBe('Hello');
    });

    it('should copy rich text value', () => {
        const originalData = {
            dataStream: 'Hello World',
            textRuns: [{
                st: 0,
                ed: 5,
                ts: { ff: 'Arial' },
            }],
            paragraphs: [{
                startIndex: 11,
                paragraphId: 'para_fixture_1009',
                paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER },
            }],
        };
        const richText = RichTextValue.createByBody(originalData);
        const copy = richText.copy();

        expect(copy.getData().body).toEqual(originalData);
        expect(copy.getData().body).not.toBe(originalData); // Different object references
    });
});

describe('RichTextBuilder', () => {
    it('should create empty rich text builder', () => {
        const builder = RichTextBuilder.create();
        const emptyData = RichTextBuilder.newEmptyData();
        expect(builder.getData()).toMatchObject({
            ...emptyData,
            body: {
                ...emptyData.body,
                paragraphs: [{ startIndex: 0, paragraphId: expect.stringMatching(/^para_/) }],
            },
        });
    });

    describe('text insertion', () => {
        it('should insert text at the end by default', () => {
            const builder = RichTextBuilder.create();
            builder.insertText('Hello World');
            expect(builder.getData().body!.dataStream).toBe('Hello World\r\n');
        });

        it('should insert text at specified position', () => {
            const builder = RichTextBuilder.create()
                .insertText('Hello World')
                .insertText(5, ' Beautiful');
            expect(builder.getData().body!.dataStream).toBe('Hello Beautiful World\r\n');
        });

        it('should insert text with style', () => {
            const style = TextStyleBuilder.create()
                .setFontFamily('Arial')
                .setFontSize(12)
                .setBold(true);

            const builder = RichTextBuilder.create()
                .insertText('Hello', style);

            const data = builder.getData().body!;
            expect(data.dataStream).toBe('Hello\r\n');
            expect(data.textRuns![0].ts).toEqual(style.build());
            expect(data.textRuns![0].st).toBe(0);
            expect(data.textRuns![0].ed).toBe(5);
        });

        it('should build agent-friendly styled spans', () => {
            const builder = RichTextBuilder.create()
                .text('Status: ')
                .span('Important', { bold: true, italic: true, color: '#d92d20' })
                .text(' ')
                .bold('High')
                .text(' ')
                .italic('now');

            const data = builder.getData().body!;

            expect(data.dataStream).toBe('Status: Important High now\r\n');
            expect(data.textRuns).toEqual([
                {
                    st: 8,
                    ed: 17,
                    ts: {
                        bl: BooleanNumber.TRUE,
                        it: BooleanNumber.TRUE,
                        cl: { rgb: '#d92d20' },
                    },
                },
                {
                    st: 18,
                    ed: 22,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 23,
                    ed: 26,
                    ts: {
                        it: BooleanNumber.TRUE,
                    },
                },
            ]);
        });

        it('should build inline code as a text style', () => {
            const builder = RichTextBuilder.create()
                .text('Run ')
                .code('pnpm test')
                .text(' before submitting.');

            const data = builder.getData().body!;

            expect(data.dataStream).toBe('Run pnpm test before submitting.\r\n');
            expect(data.textRuns).toHaveLength(1);
            const codeRun = data.textRuns![0]!;
            expect(codeRun).toMatchObject({
                st: 4,
                ed: 13,
                ts: {
                    bg: { rgb: '#f3f4f6' },
                },
            });
            expect(codeRun.ts!.ff).toContain('monospace');
        });

        it('should ignore empty styled spans', () => {
            const builder = RichTextBuilder.create()
                .text('Hello')
                .span('', { bold: true, italic: true })
                .text(' World');

            const data = builder.getData().body!;

            expect(data.dataStream).toBe('Hello World\r\n');
            expect(data.textRuns).toHaveLength(0);
        });
    });

    describe('editable text runs', () => {
        it('replaces runs in forward order and rebases all later document offsets', () => {
            const titleStyle = { ff: 'Arial', fs: 24, bl: BooleanNumber.TRUE };
            const bodyStyle = { ff: 'Arial', fs: 14, cl: { rgb: '#334155' } };
            const builder = RichTextBuilder.create({
                id: 'translated-slide-text',
                documentStyle: { textStyle: { ff: 'Arial' } },
                body: {
                    dataStream: '标题\r正文内容\r\n',
                    textRuns: [
                        { st: 0, ed: 2, ts: titleStyle },
                        { st: 3, ed: 7, ts: bodyStyle },
                    ],
                    paragraphs: [
                        {
                            startIndex: 2,
                            paragraphId: 'title-paragraph',
                            paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER },
                        },
                        {
                            startIndex: 7,
                            paragraphId: 'body-paragraph',
                            paragraphStyle: { spaceAbove: { v: 6 } },
                        },
                    ],
                    customRanges: [{
                        startIndex: 3,
                        endIndex: 6,
                        rangeId: 'body-link',
                        rangeType: CustomRangeType.HYPERLINK,
                        properties: { url: 'https://example.com/report' },
                    }],
                    sectionBreaks: [{ startIndex: 8, sectionId: 'section-1' }],
                },
            });

            const paragraphs = builder.getParagraphs();
            const titleRun = paragraphs[0].getTextRuns()[0];
            const bodyRun = paragraphs[1].getTextRuns()[0];

            expect(paragraphs.map((paragraph) => paragraph.getText())).toEqual(['标题', '正文内容']);
            titleRun.setText('Quarterly Review');
            bodyRun.setText('Revenue increased by 18%.');

            const body = builder.getData().body!;
            const titleEnd = 'Quarterly Review'.length;
            const bodyStart = titleEnd + 1;
            const bodyEnd = bodyStart + 'Revenue increased by 18%.'.length;

            expect(body.dataStream).toBe('Quarterly Review\rRevenue increased by 18%.\r\n');
            expect(titleRun.getRange()).toEqual({ startOffset: 0, endOffset: titleEnd });
            expect(bodyRun.getRange()).toEqual({ startOffset: bodyStart, endOffset: bodyEnd });
            expect(body.textRuns).toEqual([
                { st: 0, ed: titleEnd, ts: titleStyle },
                { st: bodyStart, ed: bodyEnd, ts: bodyStyle },
            ]);
            expect(body.paragraphs).toEqual([
                {
                    startIndex: titleEnd,
                    paragraphId: 'title-paragraph',
                    paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER },
                },
                {
                    startIndex: bodyEnd,
                    paragraphId: 'body-paragraph',
                    paragraphStyle: { spaceAbove: { v: 6 } },
                },
            ]);
            expect(body.customRanges).toEqual([{
                startIndex: bodyStart,
                endIndex: bodyEnd - 1,
                rangeId: 'body-link',
                rangeType: CustomRangeType.HYPERLINK,
                properties: { url: 'https://example.com/report' },
            }]);
            expect(body.sectionBreaks).toEqual([{ startIndex: bodyEnd + 1, sectionId: 'section-1' }]);
        });

        it('includes unstyled gaps while preserving explicit styles', () => {
            const builder = RichTextBuilder.create({
                id: 'mixed-style-text',
                documentStyle: {},
                body: {
                    dataStream: '状态：就绪\r\n',
                    textRuns: [{
                        st: 3,
                        ed: 5,
                        ts: { bl: BooleanNumber.TRUE, cl: { rgb: '#16a34a' } },
                    }],
                    paragraphs: [{ startIndex: 5, paragraphId: 'status-paragraph' }],
                    sectionBreaks: [{ startIndex: 6, sectionId: 'section-1' }],
                },
            });

            const runs = builder.getParagraphs()[0].getTextRuns();
            expect(runs.map((run) => run.getText())).toEqual(['状态：', '就绪']);
            expect(runs[0].hasTextStyle()).toBe(false);
            expect(runs[0].getTextStyle()).toBeNull();
            expect(runs[1].getTextStyle()?.getValue()).toEqual({
                bl: BooleanNumber.TRUE,
                cl: { rgb: '#16a34a' },
            });

            runs[0].setText('Status: ');
            runs[1].setText('Ready');

            expect(builder.toPlainText()).toBe('Status: Ready');
            expect(builder.getData().body?.textRuns).toEqual([{
                st: 8,
                ed: 13,
                ts: { bl: BooleanNumber.TRUE, cl: { rgb: '#16a34a' } },
            }]);
        });

        it('rebases later handles when an earlier run becomes shorter', () => {
            const builder = RichTextBuilder.create({
                id: 'shorter-text',
                documentStyle: {},
                body: {
                    dataStream: 'LongTitleBody\r\n',
                    textRuns: [
                        { st: 0, ed: 9, ts: { bl: BooleanNumber.TRUE } },
                        { st: 9, ed: 13, ts: { it: BooleanNumber.TRUE } },
                    ],
                    paragraphs: [{ startIndex: 13, paragraphId: 'paragraph-1' }],
                    sectionBreaks: [{ startIndex: 14, sectionId: 'section-1' }],
                },
            });

            const [title, body] = builder.getTextRuns();
            title.setText('T');
            expect(body.getRange()).toEqual({ startOffset: 1, endOffset: 5 });
            body.setText('Content');

            expect(builder.getData().body).toMatchObject({
                dataStream: 'TContent\r\n',
                textRuns: [
                    { st: 0, ed: 1, ts: { bl: BooleanNumber.TRUE } },
                    { st: 1, ed: 8, ts: { it: BooleanNumber.TRUE } },
                ],
                paragraphs: [{ startIndex: 8, paragraphId: 'paragraph-1' }],
                sectionBreaks: [{ startIndex: 9, sectionId: 'section-1' }],
            });
        });

        it('keeps one hyperlink when its text crosses multiple style runs', () => {
            const builder = RichTextBuilder.create({
                id: 'linked-mixed-style-text',
                documentStyle: {},
                body: {
                    dataStream: '查看报告\r\n',
                    textRuns: [
                        { st: 0, ed: 2, ts: { cl: { rgb: '#2563eb' } } },
                        { st: 2, ed: 4, ts: { cl: { rgb: '#2563eb' }, bl: BooleanNumber.TRUE } },
                    ],
                    paragraphs: [{ startIndex: 4, paragraphId: 'paragraph-1' }],
                    customRanges: [{
                        startIndex: 0,
                        endIndex: 3,
                        rangeId: 'report-link',
                        rangeType: CustomRangeType.HYPERLINK,
                        properties: { url: 'https://example.com/report' },
                    }],
                    sectionBreaks: [{ startIndex: 5, sectionId: 'section-1' }],
                },
            });

            const paragraph = builder.getParagraphs()[0];
            const [prefix, emphasis] = paragraph.getTextRuns();
            prefix.setText('View ');
            emphasis.setText('report');

            expect(builder.toPlainText()).toBe('View report');
            expect(builder.getLinks()).toEqual([{
                startIndex: 0,
                endIndex: 10,
                rangeId: 'report-link',
                rangeType: CustomRangeType.HYPERLINK,
                properties: { url: 'https://example.com/report' },
            }]);
            expect(paragraph.getLinks()).toEqual(builder.getLinks());
        });

        it('rejects paragraph changes through a text-run handle', () => {
            const run = RichTextBuilder.create()
                .text('Original')
                .getParagraphs()[0]
                .getTextRuns()[0];

            expect(() => run.setText('First\nSecond')).toThrow(RangeError);
            expect(run.getText()).toBe('Original');
        });
    });

    describe('rich text insertion', () => {
        it('should insert rich text value', () => {
            const richText = RichTextValue.createByBody({
                dataStream: 'Hello',
                textRuns: [{
                    st: 0,
                    ed: 5,
                    ts: { ff: 'Arial' },
                }],
                paragraphs: [],
            });

            const builder = RichTextBuilder.create()
                .insertRichText(richText);

            const data = builder.getData().body!;
            expect(data.dataStream).toBe('Hello\r\n');
            expect(data.textRuns![0].ts).toEqual({ ff: 'Arial' });
        });

        it('should insert rich text at specified position', () => {
            const richText = RichTextValue.createByBody({
                dataStream: 'Beautiful',
                textRuns: [],
                paragraphs: [],
            });

            const builder = RichTextBuilder.create()
                .insertText('Hello World')
                .insertRichText(6, richText);

            expect(builder.getData().body!.dataStream).toBe('Hello BeautifulWorld\r\n');
        });
    });

    describe('text deletion', () => {
        it('should delete specified number of characters', () => {
            const builder = RichTextBuilder.create()
                .insertText('Hello World')
                .delete(5, 6);

            expect(builder.getData().body!.dataStream).toBe('Hello\r\n');
        });

        it('should handle deletion with invalid count', () => {
            const builder = RichTextBuilder.create()
                .insertText('Hello World')
                .delete(5, 0);

            expect(builder.getData().body!.dataStream).toBe('Hello World\r\n');
        });
    });

    describe('style management', () => {
        it('should set text style for range', () => {
            const style = TextStyleBuilder.create()
                .setFontFamily('Arial')
                .setFontSize(12)
                .build();

            const builder = RichTextBuilder.create()
                .insertText('Hello World')
                .setStyle(0, 5, style);

            const data = builder.getData().body!;
            expect(data.textRuns![0].ts).toEqual(style);
            expect(data.textRuns![0].st).toBe(0);
            expect(data.textRuns![0].ed).toBe(5);
        });
    });

    describe('link management', () => {
        it('should set link for text range', () => {
            const builder = RichTextBuilder.create()
                .insertText('Hello World')
                .setLink(0, 5, 'https://example.com');

            const links = builder.getLinks();
            expect(links).toHaveLength(1);
            expect(links[0].startIndex).toBe(0);
            expect(links[0].endIndex).toBe(4);
            expect(links[0].properties?.url).toBe('https://example.com');
        });

        it('should insert link with text', () => {
            const builder = RichTextBuilder.create()
                .insertLink('Click here', 'https://example.com');

            const data = builder.getData().body!;
            expect(data.dataStream).toBe('Click here\r\n');

            const links = builder.getLinks();
            expect(links).toHaveLength(1);
            expect(links[0].properties?.url).toBe('https://example.com');
            expect(links[0].startIndex).toBe(0);
            expect(links[0].endIndex).toBe(9);
        });

        it('should insert link at specified position', () => {
            const builder = RichTextBuilder.create()
                .insertText('Hello  World')
                .insertLink(6, 'link', 'https://example.com');

            expect(builder.getData().body!.dataStream).toBe('Hello link World\r\n');

            const links = builder.getLinks();
            expect(links).toHaveLength(1);
            expect(links[0].properties?.url).toBe('https://example.com');
        });

        it('should cancel link by id', () => {
            const builder = RichTextBuilder.create()
                .insertLink('Click here', 'https://example.com');

            const linkId = builder.getLinks()[0].rangeId;
            builder.cancelLink(linkId);

            expect(builder.getLinks()).toHaveLength(0);
        });

        it('should cancel link by range', () => {
            const builder = RichTextBuilder.create()
                .insertLink('Click here', 'https://example.com');

            builder.cancelLink(0, 9);
            expect(builder.getLinks()).toHaveLength(0);
        });

        it('should update link url', () => {
            const builder = RichTextBuilder.create()
                .insertLink('Click here', 'https://example.com');

            const linkId = builder.getLinks()[0].rangeId;
            builder.updateLink(linkId, 'https://new-example.com');

            const links = builder.getLinks();
            expect(links[0].properties?.url).toBe('https://new-example.com');
        });

        it('should throw error when updating non-existent link', () => {
            const builder = RichTextBuilder.create();
            expect(() => builder.updateLink('non-existent', 'https://example.com'))
                .toThrow('Link not found');
        });
    });

    describe('paragraph management', () => {
        it('should apply portable horizontal and vertical block alignment', () => {
            const builder = RichTextBuilder.create()
                .align({
                    horizontal: HorizontalAlign.CENTER,
                    vertical: VerticalAlign.MIDDLE,
                })
                .text('First')
                .paragraph()
                .text('Second');

            const data = builder.getData();

            expect(data.documentStyle?.renderConfig).toMatchObject({
                horizontalAlign: HorizontalAlign.CENTER,
                verticalAlign: VerticalAlign.MIDDLE,
            });
            expect(data.body?.paragraphs?.[0]?.paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);
        });

        it('should set and clear rich text columns', () => {
            const builder = RichTextBuilder.create()
                .columns({ count: 2, spacing: 12 })
                .text('Columns');

            expect(builder.getData().body?.sectionBreaks?.[0]?.columnProperties).toEqual([
                { width: 0, paddingEnd: 12 },
                { width: 0, paddingEnd: 0 },
            ]);

            builder.columns({ count: 1 });

            expect(builder.getData().body?.sectionBreaks?.[0]?.columnProperties).toBeUndefined();
        });

        it('should start a paragraph chain without a leading blank paragraph', () => {
            const builder = RichTextBuilder.create()
                .paragraph()
                .text('Title')
                .paragraph()
                .span('Body', { bold: true, italic: true });

            const data = builder.getData().body!;

            expect(data.dataStream).toBe('Title\rBody\r\n');
            expect(data.paragraphs).toHaveLength(2);
            expect(data.textRuns).toEqual([
                {
                    st: 6,
                    ed: 10,
                    ts: {
                        bl: BooleanNumber.TRUE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ]);
        });

        it('should apply agent-friendly options to the following paragraph', () => {
            const builder = RichTextBuilder.create()
                .paragraph({
                    align: HorizontalAlign.LEFT,
                    lineHeight: 1.4,
                    firstLineIndent: 16,
                    indentStart: 8,
                    spaceAfter: 6,
                })
                .text('First')
                .paragraph({
                    align: HorizontalAlign.RIGHT,
                    lineHeight: 24,
                    lineHeightRule: SpacingRule.EXACT,
                    hangingIndent: { v: 10 },
                    spaceBefore: 4,
                    keepNext: true,
                })
                .text('Second');

            const data = builder.getData().body!;

            expect(data.dataStream).toBe('First\rSecond\r\n');
            expect(data.paragraphs?.[0]?.paragraphStyle).toMatchObject({
                horizontalAlign: HorizontalAlign.LEFT,
                lineSpacing: 1.4,
                indentFirstLine: { v: 16 },
                indentStart: { v: 8 },
                spaceBelow: { v: 6 },
            });
            expect(data.paragraphs?.[1]?.paragraphStyle).toMatchObject({
                horizontalAlign: HorizontalAlign.RIGHT,
                lineSpacing: 24,
                spacingRule: SpacingRule.EXACT,
                hanging: { v: 10 },
                spaceAbove: { v: 4 },
                keepNext: BooleanNumber.TRUE,
            });
        });

        it('should build stable nested list items and end the list on a normal paragraph', () => {
            const builder = RichTextBuilder.create()
                .listItem('Plan', { listId: 'agent.tasks' })
                .listItem('Implement', { listId: 'agent.tasks', level: 1 })
                .listItem('Verify', { type: PresetListType.ORDER_LIST, listId: 'agent.steps' })
                .paragraph()
                .text('Summary');

            const data = builder.getData().body!;

            expect(data.dataStream).toBe('Plan\rImplement\rVerify\rSummary\r\n');
            expect(data.paragraphs?.map((paragraph) => paragraph.bullet)).toEqual([
                { listId: 'agent.tasks', listType: PresetListType.BULLET_LIST, nestingLevel: 0 },
                { listId: 'agent.tasks', listType: PresetListType.BULLET_LIST, nestingLevel: 1 },
                { listId: 'agent.steps', listType: PresetListType.ORDER_LIST, nestingLevel: 0 },
                undefined,
            ]);
        });

        it('should insert paragraph at the end', () => {
            const style = ParagraphStyleBuilder.create()
                .setHorizontalAlign(HorizontalAlign.CENTER);

            const builder = RichTextBuilder.create()
                .insertText('Hello World')
                .insertParagraph(style);

            const data = builder.getData().body!;
            expect(data.dataStream).toBe('Hello World\r\r\n');
            expect(data.paragraphs).toHaveLength(2);
            expect(data.paragraphs![0].paragraphStyle).toEqual(style.build());
        });

        it('should insert paragraph at specified position', () => {
            const style = ParagraphStyleBuilder.create()
                .setHorizontalAlign(HorizontalAlign.CENTER);

            const builder = RichTextBuilder.create()
                .insertText('Hello World')
                .insertParagraph(5, style);

            const data = builder.getData().body!;
            expect(data.dataStream).toBe('Hello\r World\r\n');
            expect(data.paragraphs).toHaveLength(2);
            expect(data.paragraphs![0].paragraphStyle).toEqual(style.build());
        });
    });
});

describe('Integration Tests', () => {
    it('should create complex document style', () => {
        // Create text decoration
        const underline = TextDecorationBuilder.create()
            .setLineType(TextDecoration.SINGLE)
            .setColor({ rgb: '#0000FF' })
            .build();

        // Create text style
        const textStyle = TextStyleBuilder.create()
            .setFontFamily('Times New Roman')
            .setFontSize(14)
            .setBold(true)
            .setItalic(false)
            .setVerticalAlign(BaselineOffset.SUPERSCRIPT)
            .build();

        // Create paragraph style
        const paragraphStyle = ParagraphStyleBuilder.create()
            .setTextStyle(textStyle)
            .setHorizontalAlign(HorizontalAlign.CENTER)
            .setLineSpacing(1.15)
            .setDirection(TextDirection.LEFT_TO_RIGHT)
            .setSnapToGrid(true)
            .build();

        // Verify the complete style
        expect(paragraphStyle).toEqual({
            textStyle: {
                ff: 'Times New Roman',
                fs: 14,
                bl: BooleanNumber.TRUE,
                it: BooleanNumber.FALSE,
                va: BaselineOffset.SUPERSCRIPT,
            },
            horizontalAlign: HorizontalAlign.CENTER,
            lineSpacing: 1.15,
            direction: TextDirection.LEFT_TO_RIGHT,
            snapToGrid: BooleanNumber.TRUE,
        });
    });
});
