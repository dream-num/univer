import { PageElementType } from '@univerjs/core';
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
                dataStream: `Digital Immune System\rApplied Observability\r\n`,
                textRuns: [
                    {
                        st: 0,
                        ed: 20,
                        ts: {
                            fs: 12,
                        },
                    },
                    {
                        st: 22,
                        ed: 42,
                        ts: {
                            fs: 12,
                        },
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 21,
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
                    },
                    {
                        startIndex: 43,
                        bullet: {
                            listId: 'testBullet',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 20,
                            },
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
