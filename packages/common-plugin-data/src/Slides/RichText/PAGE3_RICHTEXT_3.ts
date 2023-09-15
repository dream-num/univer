import { PageElementType } from '@univerjs/core';

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
                dataStream: `SuperApps are more than composite applications that aggregate services.\rAdaptive AI allows for model behavior change post-deployment by using real-time feedback\r\n`,
                textRuns: [
                    {
                        st: 0,
                        ed: 70,
                        ts: {
                            fs: 12,
                        },
                    },
                    {
                        st: 72,
                        ed: 159,
                        ts: {
                            fs: 12,
                        },
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 71,
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
                        startIndex: 160,
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
