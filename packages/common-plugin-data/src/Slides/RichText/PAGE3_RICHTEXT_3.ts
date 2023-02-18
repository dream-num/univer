import { BlockType, PageElementType, ParagraphElementType } from '@univer/core';
import { DEFAULT_LIST_TEST } from '../../Docs/DEFAULT_LIST';

export const PAGE3_RICHTEXT_3 = {
    id: 'detailContent3',
    zIndex: 3,
    left: 652,
    top: 363,
    width: 273,
    height: 130,
    title: 'detailContent3',
    description: '',
    type: PageElementType.TEXT,
    richText: {
        rich: {
            id: 'd',
            lists: DEFAULT_LIST_TEST,
            body: {
                blockElements: [
                    {
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
                            paragraphStyle: {
                                spaceBelow: 15,
                            },
                            elements: [
                                {
                                    eId: 'oneElement',
                                    st: 0,
                                    ed: 15,
                                    et: ParagraphElementType.TEXT_RUN,
                                    tr: {
                                        ct: 'SuperApps are more than composite applications that aggregate services.',
                                        ts: {
                                            fs: 12,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        blockId: 'twoParagraph',
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
                            elements: [
                                {
                                    eId: 'oneElement',
                                    st: 0,
                                    ed: 15,
                                    et: ParagraphElementType.TEXT_RUN,
                                    tr: {
                                        ct: 'Adaptive AI allows for model behavior change post-deployment by using real-time feedback',
                                        ts: {
                                            fs: 12,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            documentStyle: {
                pageSize: {
                    width: undefined,
                    height: undefined,
                },
                marginTop: 2,
                marginBottom: 2,
                marginRight: 0,
                marginLeft: 0,
            },
        },
    },
};
