import { PresetListType } from '@univerjs/core';
import { PageElementType } from '@univerjs/slides';

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
            body: {
                dataStream: 'Digital Immune System\rApplied Observability\r\n',
                textRuns: [
                    {
                        st: 0,
                        ed: 20,
                        ts: {
                            fs: 12 * 0.75,
                        },
                    },
                    {
                        st: 22,
                        ed: 42,
                        ts: {
                            fs: 12 * 0.75,
                        },
                    },
                ],
                paragraphs: [
                    {
                        paragraphId: 'para_common_mockdata_src_slides_rich_text_page3_richtext1_1',
                        startIndex: 21,
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
                        paragraphId: 'para_common_mockdata_src_slides_rich_text_page3_richtext1_2',
                        startIndex: 43,
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
