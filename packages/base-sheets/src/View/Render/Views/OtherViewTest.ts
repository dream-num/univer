import { getColor, Path, Picture, Rect, Circle, RichText } from '@univer/base-render';
import { BaselineOffset, BlockType, BulletAlignment, GlyphType, IDocumentData, ParagraphElementType } from '@univer/core';
import { BaseView, CanvasViewRegistry } from '../BaseView';

const richTextTest: IDocumentData = {
    documentId: 'd',
    lists: {
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
            // nestingLevel: [
            //     {
            //         bulletAlignment: BulletAlignment.START,
            //         glyphFormat: ' %0',
            //         textStyle: {
            //             fs: 12,
            //         },
            //         startNumber: 0,
            //         glyphSymbol: '\u25CF',
            //         hanging: 21,
            //         indentStart: 21,
            //     },
            //     {
            //         bulletAlignment: BulletAlignment.START,
            //         glyphFormat: ' %1',
            //         textStyle: {
            //             fs: 12,
            //         },
            //         startNumber: 0,
            //         glyphSymbol: '\u25A0',
            //         hanging: 21,
            //         indentStart: 42,
            //     },
            //     {
            //         bulletAlignment: BulletAlignment.START,
            //         glyphFormat: ' %1',
            //         textStyle: {
            //             fs: 12,
            //         },
            //         startNumber: 0,
            //         glyphSymbol: '\u25C6',
            //         hanging: 21,
            //         indentStart: 63,
            //     },
            // ],
        },
    },
    body: {
        blockElements: {
            oneParagraph: {
                blockId: 'oneParagraph',
                st: 0,
                ed: 15,
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
                            st: 0,
                            ed: 15,
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
                            st: 0,
                            ed: 15,
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
                st: 0,
                ed: 15,
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
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '细化埋点上报链路和指标方案梳理',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
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
                st: 0,
                ed: 15,
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
                                ct: '自2018年首届进博会举办以来，进博会已经成为全球新品的首发地、前沿技术的首选地、创新服务的首推地。',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
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
                st: 0,
                ed: 15,
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
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '国家主席习近平以视频方式出席在上海举行的第五届中国国际进口博览会开幕式并发表题为《共创开放繁荣的美好未来》的致辞',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
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
                st: 0,
                ed: 15,
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
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '中国男排两名现役国手彭世坤和张秉龙分别效力的三得利太阳鸟和东京大熊本轮遭遇。',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
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
        },
        blockElementOrder: ['oneParagraph', 'twoParagraph', 'threeParagraph', 'fourParagraph', 'fiveParagraph'],
    },
    documentStyle: {
        pageSize: {
            width: Infinity,
            height: Infinity,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

export class OtherViewTest extends BaseView {
    protected _initialize() {
        const mainScene = this.getScene();
        const path = new Path('path1', {
            data: 'M848.2028 624.638c61.7667 0 111.9928-50.2538 111.9928-111.9928 0-61.7667-50.2262-111.9949-111.9928-111.9949h-19.414016c-3.9373-11.1831-8.448-22.1194-13.4779-32.7014l13.6704-13.698c21.0811-21.0801 32.7025-49.2165 32.7025-79.1828 0-29.995-11.6214-58.1028-32.7025-79.1839-21.0801-21.1098-49.2165-32.7035-79.1839-32.7035-29.9704 0-58.1048 11.5937-79.1818 32.7035l-13.6704 13.6714c-10.6107-5.033-21.5214-9.5437-32.7311-13.481v-19.412992c0-61.7656-50.2292-111.9939-111.9949-111.9939-61.7636 0-111.9928 50.2282-111.9928 111.9939v19.412992c-11.2118 3.9373-22.1225 8.448-32.7322 13.481l-13.6714-13.6714c-21.077-21.1098-49.2124-32.7035-79.1828-32.7035-29.9663 0-58.0987 11.5937-79.1839 32.7035-21.076 21.0801-32.7014 49.1889-32.7014 79.1839 0 29.9674 11.6255 58.1028 32.7014 79.1828l13.6714 13.6704c-5.0289 10.6097-9.5406 21.5194-13.4779 32.7291h-19.414016c-61.7636 0-111.9928 50.2282-111.9928 111.9949 0 61.739 50.2292 111.9928 111.9928 111.9928h19.414016c3.9373 11.2118 8.449 22.1215 13.4779 32.7291l-13.6714 13.6714c-21.076 21.0811-32.7014 49.1909-32.7014 79.1849 0 29.996 11.6255 58.1028 32.7014 79.1828 21.0852 21.078 49.2175 32.7035 79.1839 32.7035 29.9715 0 58.1059-11.6255 79.1828-32.7035l13.6714-13.6704c10.6097 5.0309 21.5204 9.5119 32.7322 13.4789v19.416064c0 61.7359 50.2292 111.9928 111.9928 111.9928 61.7656 0 111.9949-50.2569 111.9949-111.9928v-19.416064c11.2097-3.967 22.1204-8.448 32.7311-13.5045l13.6704 13.695c21.077 21.078 49.2124 32.7035 79.1818 32.7035 29.9674 0 58.1038-11.6255 79.1839-32.7035 21.0811-21.0801 32.7025-49.1868 32.7025-79.1828 0-29.994-11.6214-58.1038-32.7025-79.1849l-13.6704-13.698c5.0299-10.6076 9.5406-21.5194 13.4779-32.7025H848.202752zM789.3873 710.6294c10.5277 10.5001 16.297 24.5555 16.297 39.594 0 15.0108-5.7692 29.0673-16.297 39.5909-21.0504 21.0278-58.1294 21.0278-79.1808 0l-43.1186-43.1452-18.4842 10.3629c-18.647 10.4172-38.826 18.7556-60.0177 24.7695l-20.3694 5.7723v61.057024c0 30.8675-25.1279 55.9933-55.9985 55.9933s-55.9985-25.1259-55.9985-55.9933v-61.057024l-20.3674-5.7723c-21.2183-6.0416-41.4259-14.3534-60.0156-24.7695l-18.4852-10.3363-43.1206 43.1176c-21.0534 21.0278-58.1294 21.0278-79.1828 0-10.5267-10.5236-16.2939-24.5801-16.2939-39.5909 0-15.0385 5.7672-29.0939 16.2939-39.594l43.1176-43.1165-10.3588-18.4852c-10.3916-18.5907-18.7054-38.7697-24.746-60.0412l-5.7733-20.3448h-61.053951999999995c-30.8695 0-55.9954-25.1279-55.9954-55.9964 0-30.8705 25.1249-55.9985 55.9954-55.9985h61.053951999999995l5.7733-20.3704c6.0406-21.2449 14.3544-41.4505 24.746-60.0156l10.3588-18.4832-43.1176-43.1186c-10.5267-10.5277-16.2939-24.5811-16.2939-39.5919 0-15.0395 5.7672-29.0939 16.2939-39.5919 21.0545-21.0278 58.1304-21.0278 79.1828 0l43.1206 43.1176 18.4852-10.3608c18.5897-10.3905 38.7983-18.731 60.0156-24.746l20.3674-5.7702v-61.056000000000004c0-30.8951 25.1279-55.9964 55.9985-55.9964s55.9985 25.1013 55.9985 55.9964v61.056000000000004l20.3694 5.7702c21.1917 6.016 41.3706 14.3278 60.0177 24.7716l18.4842 10.3352 43.1186-43.1176c21.0524-21.0278 58.1315-21.0278 79.1808 0 10.5277 10.498 16.297 24.5524 16.297 39.5919 0 15.0108-5.7692 29.0642-16.297 39.5919l-43.0909 43.1186 10.3076 18.4832c10.4479 18.6737 18.7832 38.8813 24.7706 60.0156l5.7733 20.3704h61.053951999999995c30.8695 0 55.9974 25.1279 55.9974 55.9985 0 30.8685-25.1279 55.9964-55.9974 55.9964h-61.053951999999995l-5.7733 20.3448c-5.9884 21.161-14.3227 41.342-24.7706 60.0412l-10.3076 18.4852L789.3873 710.6294zM512.2181 344.6528c-92.6372 0-167.9913 75.3551-167.9913 167.9923 0 92.6351 75.3541 167.9913 167.9913 167.9913s167.9913-75.3562 167.9913-167.9913C680.2094 420.0079 604.8553 344.6528 512.2181 344.6528zM512.2181 624.638c-61.7636 0-111.9928-50.2538-111.9928-111.9928 0-61.7667 50.2292-111.9949 111.9928-111.9949 61.7656 0 111.9949 50.2282 111.9949 111.9949C624.213 574.3841 573.9848 624.638 512.2181 624.638z',
            width: 200,
            height: 200,
            left: 600,
            top: 300,
            zIndex: 14,
            strokeWidth: 1,
            stroke: getColor([102, 111, 99], 1),
            fill: getColor([102, 255, 99], 1),
        });

        const pathRect = path.getRect();
        console.log('pathRect', pathRect, path);
        const rect3 = new Rect('pathRect', {
            ...pathRect,
            strokeWidth: 1,
            stroke: 'rgba(102,111,99, 0.8)',
            zIndex: 11,
        });
        const picture = new Picture({
            url: 'https://cnbabylon.com/assets/img/agents.png',
            top: 500,
            left: 800,
            zIndex: 13,
        });

        const circle1 = new Circle('circle1', {
            left: 800,
            top: 200,
            radius: 100,
            fill: 'rgba(255,111,99, 0.8)',
            zIndex: 14,
        });

        const richText = new RichText(this.getContext(), 'richText1', {
            richText: richTextTest,
            width: 300,
            zIndex: 20,
            left: 100,
            top: 400,
        });

        console.log('insert path test', mainScene);
        mainScene.addObjects([path, picture, circle1, richText]);
    }
}

CanvasViewRegistry.add(new OtherViewTest());
