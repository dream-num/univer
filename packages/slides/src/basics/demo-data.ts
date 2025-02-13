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
    BaselineOffset,
    BooleanNumber,
    ColumnSeparatorType,
    DocumentFlavor,
    DrawingTypeEnum,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    PresetListType,
    SectionType,
    WrapTextType,
} from '@univerjs/core';

export const docsDemoData: IDocumentData = {
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
                    width: 100,
                    height: 400,
                },
                positionH: {
                    relativeFrom: ObjectRelativeFromH.COLUMN,
                    posOffset: 100,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                    posOffset: 160,
                },
                angle: 0,
                // imageProperties: {
                //     contentUrl: 'https://cnbabylon.com/assets/img/agents.png',
                // },
            },
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
    },
    body: {
        dataStream: '在“第1题”工作表中完成以下操作\b上标日期列单元格数据验证，限制只能输入日期（介于1949年1月1日至2099年1月1日）\r细化埋点上报链路和指标方案梳理目前通过每日定时任务发送报告\r自2018年首届进博会举办以来，进博会已经成为全球新品的首发地、前沿技术的首选地、创新服务的首推地。中国这十年”对外开放成就展湖北展区主要以图文、图表、数据、视频、企业展品、实物模型、光电科技等体现湖北十年开放成就、重大开放平台及产业。湖北省共计17家企业、机构的展品将在这一展区展示\r国家主席习近平以视频方式出席在上海举行的第五届中国国际进口博览会开幕式并发表题为《共创开放繁荣的美好未来》的致辞中国将推动各国各方共享深化国际合作机遇，全面深入参与世界贸易组织改革谈判\r中国男排两名现役国手彭世坤和张秉龙分别效力的三得利太阳鸟和东京大熊本轮遭遇。双方经过激战，主场作战的卫冕冠军三得利技高一筹3-2逆转击败对手，力夺第3场胜利\r\n',
        textRuns: [
            {
                st: 0,
                ed: 15,
                ts: {
                    fs: 12,
                    bg: {
                        rgb: 'rgb(200,0,90)',
                    },
                    cl: {
                        rgb: 'rgb(255,130,0)',
                    },
                },
            },
            {
                st: 17,
                ed: 18,
                ts: {
                    fs: 14,
                    bg: {
                        rgb: 'rgb(2,128,2)',
                    },
                    cl: {
                        rgb: 'rgb(0,1,55)',
                    },
                    va: BaselineOffset.SUPERSCRIPT,
                },
            },
            {
                st: 19,
                ed: 60,
                ts: {
                    fs: 14,
                    bg: {
                        rgb: 'rgb(90,128,255)',
                    },
                    cl: {
                        rgb: 'rgb(0,1,255)',
                    },
                },
            },

            {
                st: 62,
                ed: 90,
            },

            {
                st: 92,
                ed: 233,
            },

            {
                st: 235,
                ed: 326,
            },

            {
                st: 328,
                ed: 405,
            },
        ],
        paragraphs: [
            {
                startIndex: 60,
                bullet: {
                    listId: 'orderList',
                    listType: PresetListType.ORDER_LIST,
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
            {
                startIndex: 91,
                bullet: {
                    listId: 'orderList',
                    listType: PresetListType.ORDER_LIST,
                    nestingLevel: 1,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
            {
                startIndex: 234,
                bullet: {
                    listId: 'orderList',
                    listType: PresetListType.ORDER_LIST,
                    nestingLevel: 1,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
            {
                startIndex: 327,
                bullet: {
                    listId: 'orderList',
                    listType: PresetListType.ORDER_LIST,
                    nestingLevel: 1,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
            {
                startIndex: 406,
                bullet: {
                    listId: 'orderList',
                    listType: PresetListType.ORDER_LIST,
                    nestingLevel: 2,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 407,
                columnProperties: [
                    {
                        width: 200,
                        paddingEnd: 20,
                    },
                ],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                // textDirection: textDirectionDocument,
                // contentDirection: textDirection!,
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: 594.3,
            height: 840.51,
        },
        documentFlavor: DocumentFlavor.UNSPECIFIED,
        marginTop: 72,
        marginBottom: 72,
        marginRight: 90,
        marginLeft: 90,
    },
};
