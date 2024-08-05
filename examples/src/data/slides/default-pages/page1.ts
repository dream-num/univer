/**
 * Copyright 2023-present DreamNum Inc.
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

export const DEFAULT_FIRST_PAGE = {
    id: 'cover_1',
    pageType: PageType.SLIDE,
    zIndex: 1,
    title: 'cover',
    description: 'this is first page, cover',
    pageBackgroundFill: {
        rgb: 'rgb(255,255,255)',
    },
    pageElements: {
        background1: {
            id: 'background1',
            zIndex: 0,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'background',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/Picture1.jpg',
                },
            },
        },
        mask1: {
            id: 'mask1',
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
                        rgb: 'rgba(0,0,0,0.7)',
                    },
                },
            },
        },
        text1: {
            id: 'text1',
            zIndex: 2,
            left: 300,
            top: 200,
            width: 400,
            height: 100,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Univer slide',
                fs: 64 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
                bl: 1,
            },
        },
        centerRect1: {
            id: 'centerRect1',
            zIndex: 1,
            left: 378,
            top: 0,
            width: 204,
            height: 144,
            title: 'mask',
            description: '',
            type: PageElementType.SHAPE,
            shape: {
                shapeType: BasicShapes.Rect,
                text: '',
                shapeProperties: {
                    shapeBackgroundFill: {
                        rgb: 'rgb(244,79,86)',
                    },
                },
            },
        },
        year1: {
            id: 'year1',
            zIndex: 2,
            left: 430,
            top: 42,
            width: 100,
            height: 40,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: '2022',
                fs: 48 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
                bl: 1,
            },
        },
        content1: {
            id: 'content1',
            zIndex: 2,
            left: 80,
            top: 300,
            width: 780,
            height: 140,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'The concepts national income and national product have roughly the same value and can be used interchangeably if our interest is in their sum total which is measured as the market value of the total output of goods and services of an economy in a given period, usually a year.',
                fs: 14 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
                bl: 1,
            },
        },
    },
};
