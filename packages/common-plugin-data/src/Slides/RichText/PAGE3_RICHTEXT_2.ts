import { BlockType, PageElementType, ParagraphElementType } from '@univerjs/core';
import { DEFAULT_LIST_TEST } from '../../Docs/DEFAULT_LIST';

export const PAGE3_RICHTEXT_2 = {
    id: 'detailContent2',
    zIndex: 3,
    left: 334,
    top: 363,
    width: 273,
    height: 120,
    title: 'detailContent2',
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
                                        ct: 'combine SaaS, PaaS and IaaS with tailored',
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
                                        ct: 'provides a curated set of tools, capabilities and processes that are packaged for easy consumption by developers and end users',
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
