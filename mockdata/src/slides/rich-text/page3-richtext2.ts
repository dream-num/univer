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
            body: {
                dataStream: 'combine SaaS, PaaS and IaaS with tailored\rprovides a curated set of tools, capabilities and processes that are packaged for easy consumption by developers and end users\r\n',
                textRuns: [
                    {
                        st: 0,
                        ed: 40,
                        ts: {
                            fs: 12 * 0.75,
                        },
                    },
                    {
                        st: 42,
                        ed: 167,
                        ts: {
                            fs: 12 * 0.75,
                        },
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 41,
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
                        startIndex: 168,
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
