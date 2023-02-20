import { BlockType, PageElementType, ParagraphElementType } from '@univerjs/core';
import { DEFAULT_LIST_TEST } from '../../Docs/DEFAULT_LIST';

export const PAGE3_RICHTEXT_1 = {
    id: 'detailContent1',
    zIndex: 3,
    left: 53,
    top: 363,
    width: 273,
    height: 54,
    title: 'detailContent1',
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
                                        ct: 'Digital Immune System',
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
                                        ct: 'Applied Observability',
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
