import { PresetListType } from '@univerjs/core';
import { PageElementType } from '@univerjs/slides';

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
            body: {
                dataStream: 'SuperApps are more than composite applications that aggregate services.\rAdaptive AI allows for model behavior change post-deployment by using real-time feedback\r\n',
                textRuns: [
                    {
                        st: 0,
                        ed: 70,
                        ts: {
                            fs: 12 * 0.75,
                        },
                    },
                    {
                        st: 72,
                        ed: 159,
                        ts: {
                            fs: 12 * 0.75,
                        },
                    },
                ],
                paragraphs: [
                    {
                        paragraphId: 'para_common_mockdata_src_slides_rich_text_page3_richtext3_1',
                        startIndex: 71,
                        bullet: {
                            listType: PresetListType.ORDER_LIST,
                            listId: 'orderList',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 20 * 0.75,
                            },
                        },
                        paragraphStyle: {
                            spaceBelow: { v: 15 },
                        },
                    },
                    {
                        paragraphId: 'para_common_mockdata_src_slides_rich_text_page3_richtext3_2',
                        startIndex: 160,
                        bullet: {
                            listType: PresetListType.ORDER_LIST,
                            listId: 'orderList',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 20 * 0.75,
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
