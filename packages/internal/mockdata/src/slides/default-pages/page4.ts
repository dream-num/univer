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

import type { IWorksheetData } from '@univerjs/core';
import { BasicShapes, PageElementType, PageType } from '@univerjs/core';

import { SLIDE_WORKBOOK_DATA } from '../../sheets/slide-workbook-data';

const worksheetConfig = SLIDE_WORKBOOK_DATA.sheets[SLIDE_WORKBOOK_DATA.sheetOrder[0]] as IWorksheetData;
const spreadStyles = SLIDE_WORKBOOK_DATA.styles;

export const DEFAULT_FORTH_PAGE = {
    id: 'business_1',
    pageType: PageType.SLIDE,
    zIndex: 2,
    title: 'business',
    description: 'this is second page, business',
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
                text: 'The Business Objectives',
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
                text: 'What we hope to achieve in the short and long run',
                fs: 18 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
        spreadSheet1: {
            id: 'table1',
            zIndex: 3,
            left: 30,
            top: 125,
            width: 900,
            height: 400,
            title: 'table1',
            description: '',
            type: PageElementType.SPREADSHEET,
            spreadsheet: {
                worksheet: worksheetConfig,
                styles: spreadStyles,
            },
        },
    },
};
