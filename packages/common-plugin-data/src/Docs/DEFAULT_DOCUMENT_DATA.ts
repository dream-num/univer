import {
    BaselineOffset,
    BlockType,
    BooleanNumber,
    BulletAlignment,
    ColumnSeparatorType,
    GlyphType,
    IDocumentData,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    ParagraphElementType,
    PositionedObjectLayoutType,
    SectionType,
    WrapTextType,
} from '@univer/core';

export const DEFAULT_DOCUMENT_DATA: IDocumentData = {
    documentId: 'd',
    drawings: {
        shapeTest1: {
            objectId: 'shapeTest1',
            objectProperties: {
                title: 'test shape',
                description: 'test shape',
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
                imageProperties: {
                    contentUrl: 'https://cnbabylon.com/assets/img/agents.png',
                },
            },
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
    },
    lists: {
        unorderedTest: {
            listId: 'unorderedTest',
            nestingLevel: [
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %0',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphSymbol: '\u25CF',
                    hanging: 21,
                    indentStart: 21,
                },
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphSymbol: '\u25A0',
                    hanging: 21,
                    indentStart: 42,
                },
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphSymbol: '\u25C6',
                    hanging: 21,
                    indentStart: 63,
                },
            ],
        },
        testBullet: {
            listId: 'testBullet',
            nestingLevel: [
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1.',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphType: GlyphType.ROMAN,
                    hanging: 21,
                    indentStart: 21,
                },
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1.%2)',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphType: GlyphType.ROMAN,
                    hanging: 21,
                    indentStart: 42,
                },
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1.%2.%3.',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphType: GlyphType.ROMAN,
                    hanging: 21,
                    indentStart: 63,
                },
            ],
        },
    },
    body: {
        blockElements: {
            oneParagraph: {
                blockId: 'oneParagraph',
                st: 0,
                ed: 59,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '在“第1题”工作表中完成以下操作',
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
                        },
                        smallSub: {
                            eId: 'smallSub',
                            st: 16,
                            ed: 17,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '上标',
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
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 18,
                            ed: 59,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '日期列单元格数据验证，限制只能输入日期（介于1949年1月1日至2099年1月1日）',
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
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'shapeTest1',
                            paragraphElementType: ParagraphElementType.DRAWING,
                        },
                        {
                            elementId: 'smallSub',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            twoParagraph: {
                blockId: 'twoParagraph',
                st: 60,
                ed: 88,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 1,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 60,
                            ed: 74,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '细化埋点上报链路和指标方案梳理',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 75,
                            ed: 88,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '目前通过每日定时任务发送报告',
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            threeParagraph: {
                blockId: 'threeParagraph',
                st: 89,
                ed: 230,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 89,
                            ed: 138,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '自2018年首届进博会举办以来，进博会已经成为全球新品的首发地、前沿技术的首选地、创新服务的首推地。',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 139,
                            ed: 230,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '中国这十年”对外开放成就展湖北展区主要以图文、图表、数据、视频、企业展品、实物模型、光电科技等体现湖北十年开放成就、重大开放平台及产业。湖北省共计17家企业、机构的展品将在这一展区展示',
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            fourParagraph: {
                blockId: 'fourParagraph',
                st: 231,
                ed: 322,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 1,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 231,
                            ed: 286,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '国家主席习近平以视频方式出席在上海举行的第五届中国国际进口博览会开幕式并发表题为《共创开放繁荣的美好未来》的致辞',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 287,
                            ed: 322,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '中国将推动各国各方共享深化国际合作机遇，全面深入参与世界贸易组织改革谈判',
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            fiveParagraph: {
                blockId: 'fiveParagraph',
                st: 323,
                ed: 400,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 2,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 323,
                            ed: 360,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '中国男排两名现役国手彭世坤和张秉龙分别效力的三得利太阳鸟和东京大熊本轮遭遇。',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 361,
                            ed: 400,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '双方经过激战，主场作战的卫冕冠军三得利技高一筹3-2逆转击败对手，力夺第3场胜利',
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            oneSectionBreak: {
                blockId: 'oneSectionBreak',
                st: 0,
                ed: 0,
                blockType: BlockType.SECTION_BREAK,
                sectionBreak: {
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
            },
        },
        blockElementOrder: ['oneParagraph', 'twoParagraph', 'threeParagraph', 'fourParagraph', 'fiveParagraph', 'oneSectionBreak'],
    },
    documentStyle: {
        pageSize: {
            width: 594.3,
            height: 840.51,
        },
        marginTop: 72,
        marginBottom: 72,
        marginRight: 90,
        marginLeft: 90,
    },
};
