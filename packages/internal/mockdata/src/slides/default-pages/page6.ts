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

import { BasicShapes, PageElementType, PageType } from '@univerjs/core';

import { DEFAULT_DOCUMENT_DATA_EN } from '../../docs/default-document-data-en';

export const DEFAULT_SIXTH_PAGE = {
    id: 'richText_1',
    pageType: PageType.SLIDE,
    zIndex: 2,
    title: 'business',
    description: 'this is fix page, rich text',
    pageBackgroundFill: {
        rgb: 'rgb(255,255,255)',
    },
    pageElements: {
        background1: {
            id: 'background1',
            zIndex: 1,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'mask',
            description: '',
            type: PageElementType.SHAPE,
            shape: {
                shapeType: BasicShapes.Rect,
                text: '',
                shapeProperties: {
                    shapeBackgroundFill: {
                        rgb: 'rgba(237,237,237,1)',
                    },
                    outline: {
                        outlineFill: {
                            rgb: 'rgba(198,198,198,1)',
                        },
                        weight: 1,
                    },
                },
            },
        },
        titleIcon1: {
            id: 'titleIcon1',
            zIndex: 2,
            left: 48,
            top: 52,
            width: 117 * 0.3,
            height: 16 * 0.3,
            title: 'title Icon',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/title.png',
                },
            },
        },
        title1: {
            id: 'title1',
            zIndex: 2,
            left: 44,
            top: 56,
            width: 454,
            height: 50,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'The Work-like Editor',
                fs: 32 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
            },
        },
        subTitle1: {
            id: 'subTitle1',
            zIndex: 2,
            left: 44,
            top: 93,
            width: 889,
            height: 46,
            title: 'subTitle',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Open source WYSIWYG editor built for the modern web',
                fs: 18 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
        document: {
            id: 'table1',
            zIndex: 3,
            left: 30,
            top: 125,
            width: 900,
            height: 400,
            title: 'table1',
            description: '',
            type: PageElementType.DOCUMENT,
            document: DEFAULT_DOCUMENT_DATA_EN,
        },
    },
};
