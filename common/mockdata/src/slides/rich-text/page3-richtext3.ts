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

import { PageElementType, PresetListType } from '@univerjs/core';

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
