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

import type { IDocumentData } from '@univerjs/core';
import {
    BooleanNumber,
    ColumnSeparatorType,
    DocumentFlavor,
    DrawingTypeEnum,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    SectionType,
    WrapTextType,
} from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';

export const DEFAULT_DOCUMENT_DATA_DREAMER: IDocumentData = {
    id: 'd',
    drawings: {
        shapeTest1: {
            unitId: 'd',
            subUnitId: 'd',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            drawingId: 'shapeTest1',
            title: 'test shape',
            description: 'test shape',
            docTransform: {
                size: {
                    width: 1484 * 0.15,
                    height: 864 * 0.15,
                },
                positionH: {
                    relativeFrom: ObjectRelativeFromH.COLUMN,
                    posOffset: 130,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 510,
                },
                angle: 0,
            },
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
        shapeTest2: {
            unitId: 'd',
            subUnitId: 'd',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            drawingId: 'shapeTest2',
            title: 'test shape',
            description: 'test shape',
            docTransform: {
                size: {
                    width: 2548 * 0.1,
                    height: 2343 * 0.1,
                },
                positionH: {
                    relativeFrom: ObjectRelativeFromH.COLUMN,
                    posOffset: 130,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 200,
                },
                angle: 0,
            },
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
    },
    body: {
        dataStream:
            'The Dreamer\r\rGo with your passion.It has been said that who see the invisible can do the impossible.\r\rWhen I was nine years old living in a smaIl town in North Carolina I found an ad for selling greeting cards in the back of a children\'s magazine．I thought to myself I can do this．I begged my mother to let me send for the kit．Two weeks later when the kit arrived，I ripped off the brown paper wrapper，grabbed the cards and dashed from the house．Three hours later．I returned home with no card and a pocket full of money proclaiming，“Mama．all the people couldn\'t wait to buy my cards！”A salesperson was born．when I was twelve years old，my father took me to see Zig Ziegler．I remember sitting in that dark auditorium listening to Mr，Zigler raise everyone\'s spirits up to the ceiling，I left there feeling like I could do anything．When we got to the car，I turned to my father and said．“Dad．I want to make people feel like that．”My father asked me what I meant．"I want to be a motivational speaker just like Mr．Zigler，“I replied．A dream was born．\r\rRecently，I began pursuing my dream of motivating others．After a four-year relationship with a major furtune 100company beginning as a salestrainer and ending as a regional sales manager，I left the company at the height of my career，Many people were astounded that I would leave after earning a six-figure income．And they asked why I would risk everything for a dream．\r\rI made my decision to start my own company and leave my secure position after attending a regional sales meeting．The vice-president of our company delivered a speech that changed my life．He asked us,“If a genie would grant you three wishes what would they be？”After giving us a moment to write down the three wishes．he then asked us,"why do you need a genie ?"I would never forget the empowerment I felt at that moment．\r\rI realized that everything I had accomplished一the graduate degree，the successful sales career，speaking engagements，training and managing for a fortune l00company had prepared me for this moment．I was ready and did not need a genie\'s help to become a motivational speaker．\r\rWhen I tearfully told my boss my plans this incredible leader whom Irespect so much replied,"Precede with reckless abandon and you will be successful“\r\rHaving made that decision，I was immediately tested．One week after I gave notice，my husband was“laid off from his job．We had recently bought a new home and needed both incomes to make the monthly mortgage payment and now we were done to no income．It was tempting to turn back to my former company，knowing they wanted me to stays but l was certain that if I went back，I would never leave．I decided I still wanted to move forward rather than end up with a mouth full of”if onlys"later on．A motivational speaker was born．\r\rWhen l held fast to my dream，even during the tough times．The miracles really began to happen．In a short time period my husband found a better job．We didn\'t miss a mortgage payment．And I was able to book several speaking engagements with new clients．I discovered the incredible power of dreams．I loved my old job,my peers and the company I left，but it was time to get on with my dream．To celebrate my success I had a local artist paint my new offlce as a garden．At the top of one wall she stenciled,“The world always makes way for the dreamer．\r\n”',
        textRuns: [
            {
                st: 0,
                ed: 11,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
            {
                st: 13,
                ed: 3318,
                ts: {
                    fs: 14 * 0.75,
                    ff: 'Times New Roman',
                    cl: {
                        rgb: 'rgb(0, 0, 0)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 11,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 12,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 100,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 101,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1040,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1041,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1409,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1410,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1830,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1831,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2103,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2104,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2255,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2256,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2774,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2775,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 3318,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 3319,
                columnProperties: [
                    {
                        width: ptToPixel(240),
                        paddingEnd: ptToPixel(15),
                    },
                ],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                // textDirection: textDirectionDocument,
                // contentDirection: textDirection!,
            },
        ],
        customBlocks: [
            {
                startIndex: 1243,
                blockId: 'shapeTest1',
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: ptToPixel(595),
            height: ptToPixel(842),
        },
        documentFlavor: DocumentFlavor.TRADITIONAL,
        marginTop: ptToPixel(50),
        marginBottom: ptToPixel(50),
        marginRight: ptToPixel(50),
        marginLeft: ptToPixel(50),
        renderConfig: {
            vertexAngle: 0,
            centerAngle: 0,
        },
    },
};
