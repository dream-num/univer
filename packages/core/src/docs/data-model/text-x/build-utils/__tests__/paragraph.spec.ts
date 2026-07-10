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

import type { IDocumentBody, IParagraph } from '../../../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { HorizontalAlign } from '../../../../../types/enum';
import { DocumentBlockRangeType } from '../../../../../types/interfaces';
import { DocumentDataModel } from '../../../document-data-model';
import { PresetListType } from '../../../preset-list-type';
import { DataStreamTreeTokenType } from '../../../types';
import { TextX } from '../../text-x';
import {
    changeParagraphBulletNestLevel,
    getParagraphContentStartOffset,
    getParagraphContentStartOffsets,
    getParagraphFollowingBlockOffset,
    hasParagraphInTable,
    setParagraphBullet,
    setParagraphStyle,
    switchParagraphBullet,
    toggleChecklistParagraph,
} from '../paragraph';

function createParagraphBody(): IDocumentBody {
    return {
        dataStream: 'Alpha\rBeta\rGamma\r\n',
        paragraphs: [
            {
                startIndex: 5,
                paragraphId: 'para_fixture_1069',
                paragraphStyle: { horizontalAlign: HorizontalAlign.LEFT },
                bullet: {
                    listId: 'bullet-prev',
                    listType: PresetListType.BULLET_LIST,
                    nestingLevel: 0,
                    textStyle: { fs: 12 },
                },
            },
            {
                startIndex: 10,
                paragraphId: 'para_fixture_1070',
                paragraphStyle: { horizontalAlign: HorizontalAlign.LEFT },
                bullet: {
                    listId: 'check-1',
                    listType: PresetListType.CHECK_LIST,
                    nestingLevel: 1,
                    textStyle: { fs: 16 },
                },
            },
            {
                startIndex: 16,
                paragraphId: 'para_fixture_1071',
                paragraphStyle: { horizontalAlign: HorizontalAlign.RIGHT },
            },
        ],
        tables: [
            {
                startIndex: 8,
                endIndex: 12,
                tableId: 'table-1',
            },
        ],
    };
}

function createDocModel() {
    return new DocumentDataModel({
        id: 'paragraph-doc',
        body: createParagraphBody(),
        documentStyle: {
            pageSize: { width: 100, height: 100 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
    });
}

describe('paragraph build utils', () => {
    it('skips structural container sentinels when resolving paragraph content starts', () => {
        const T = DataStreamTreeTokenType;
        const cases = [
            `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}`,
            `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}A${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}`,
            `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.SECTION_BREAK}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.PARAGRAPH}`,
        ];

        for (const dataStream of cases) {
            const firstParagraphIndex = dataStream.indexOf(T.PARAGRAPH);
            const paragraph = {
                startIndex: dataStream.lastIndexOf(T.PARAGRAPH),
                paragraphId: `para-structural-${dataStream.length}`,
            };
            const body: IDocumentBody = {
                dataStream,
                paragraphs: [
                    { startIndex: firstParagraphIndex, paragraphId: 'para-before-structure' },
                    paragraph,
                ],
            };

            expect(getParagraphContentStartOffset(body, paragraph)).toBe(paragraph.startIndex);
        }
    });

    it('resolves insert-below offsets after a containing document block', () => {
        expect(getParagraphFollowingBlockOffset({
            blockRanges: [{
                blockId: 'code-1',
                blockType: DocumentBlockRangeType.CODE,
                startIndex: 0,
                endIndex: 6,
            }],
        }, { startIndex: 5 })).toBe(7);
        expect(getParagraphFollowingBlockOffset({}, { startIndex: 5 })).toBe(6);
    });

    it('resolves all paragraph starts in one structural pass', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}B${T.PARAGRAPH}`,
            paragraphs: [
                { startIndex: 2, paragraphId: 'inside' },
                { startIndex: 5, paragraphId: 'after' },
            ],
        };

        expect([...getParagraphContentStartOffsets(body)]).toEqual([[2, 1], [5, 4]]);
    });

    it('should switch bullets using adjacent paragraph context and remove an existing list when toggled again', () => {
        const doc = createDocModel();
        const body = doc.getBody()!;
        const secondParagraph = body.paragraphs![1] as IParagraph;
        const firstParagraph = body.paragraphs![0] as IParagraph;

        const adoptBullet = switchParagraphBullet({
            paragraphs: [secondParagraph],
            listType: PresetListType.BULLET_LIST,
            document: doc,
        });
        TextX.apply(body, adoptBullet.serialize());

        expect(body.paragraphs?.[1].bullet).toMatchObject({
            listType: PresetListType.BULLET_LIST,
            listId: 'bullet-prev',
        });

        const removeBullet = switchParagraphBullet({
            paragraphs: [firstParagraph],
            listType: PresetListType.BULLET_LIST,
            document: doc,
        });
        TextX.apply(body, removeBullet.serialize());

        expect(body.paragraphs?.[0]).toMatchObject({
            startIndex: 5,
            paragraphStyle: { horizontalAlign: HorizontalAlign.LEFT },
        });
        expect(body.paragraphs?.[0].bullet).toBeUndefined();
    });

    it('should set bullets, toggle checklist state and change nesting with table-aware limits', () => {
        const doc = createDocModel();
        const body = doc.getBody()!;
        const [, secondParagraph, thirdParagraph] = body.paragraphs! as IParagraph[];

        const setBulletTextX = setParagraphBullet({
            paragraphs: [thirdParagraph],
            listType: PresetListType.ORDER_LIST,
            document: doc,
        });
        const documentWithoutBody = new DocumentDataModel({ id: 'missing-segment' });
        delete documentWithoutBody.getSnapshot().body;
        expect(setParagraphBullet({ paragraphs: [thirdParagraph], listType: PresetListType.ORDER_LIST, segmentId: 'missing', document: documentWithoutBody })).toBe(false);
        documentWithoutBody.dispose();

        if (setBulletTextX === false) {
            throw new Error('Expected setParagraphBullet to return TextX actions');
        }
        TextX.apply(body, setBulletTextX.serialize());
        expect(body.paragraphs?.[2].bullet).toMatchObject({
            listType: PresetListType.ORDER_LIST,
            nestingLevel: 0,
            textStyle: { fs: 20 },
        });

        const toggled = toggleChecklistParagraph({ paragraphIndex: secondParagraph.startIndex, document: doc });
        expect(toggleChecklistParagraph({ paragraphIndex: 999, document: doc })).toBe(false);
        expect(toggled).not.toBe(false);
        if (toggled === false) {
            throw new Error('Expected toggleChecklistParagraph to return TextX actions');
        }
        TextX.apply(body, toggled.serialize());
        expect(body.paragraphs?.[1].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);

        const changedNest = changeParagraphBulletNestLevel({
            paragraphs: [body.paragraphs![1] as IParagraph, body.paragraphs![2] as IParagraph],
            type: 1,
            document: doc,
        });
        TextX.apply(body, changedNest.serialize());

        expect(hasParagraphInTable(body.paragraphs![1] as IParagraph, body.tables!)).toBe(true);
        expect(hasParagraphInTable(body.paragraphs![2] as IParagraph, body.tables!)).toBe(false);
        expect(body.paragraphs?.[1].bullet?.nestingLevel).toBe(2);
        expect(body.paragraphs?.[2].bullet?.nestingLevel).toBe(1);
    });

    it('should set bullets with an explicit list id', () => {
        const doc = createDocModel();
        const body = doc.getBody()!;
        const thirdParagraph = body.paragraphs![2] as IParagraph;

        const textX = setParagraphBullet({
            paragraphs: [thirdParagraph],
            listType: PresetListType.ORDER_LIST,
            listId: 'agent-list-id',
            document: doc,
        });

        if (textX === false) {
            throw new Error('Expected setParagraphBullet to return TextX actions');
        }

        TextX.apply(body, textX.serialize());

        expect(body.paragraphs?.[2].bullet).toMatchObject({
            listId: 'agent-list-id',
            listType: PresetListType.ORDER_LIST,
        });
    });

    it('should set paragraph styles across selected ranges and optionally add text runs', () => {
        const doc = createDocModel();
        const body = doc.getBody()!;
        const textX = setParagraphStyle({
            textRanges: [{ startOffset: 6, endOffset: 9, collapsed: false }],
            document: doc,
            style: {
                horizontalAlign: HorizontalAlign.CENTER,
            },
            paragraphTextRun: {
                fs: 18,
            },
        });

        expect(textX.serialize()).toEqual(expect.arrayContaining([
            expect.objectContaining({
                body: expect.objectContaining({
                    textRuns: [expect.objectContaining({ ts: { fs: 18 } })],
                }),
            }),
        ]));

        TextX.apply(body, textX.serialize());

        expect(body.paragraphs?.[1]).toMatchObject({
            startIndex: 10,
            paragraphStyle: {
                horizontalAlign: HorizontalAlign.CENTER,
            },
        });
    });
});
