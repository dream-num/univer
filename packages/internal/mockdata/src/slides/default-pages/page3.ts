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

import { PAGE3_RICHTEXT_1 } from '../rich-text/page3-richtext1';
import { PAGE3_RICHTEXT_2 } from '../rich-text/page3-richtext2';
import { PAGE3_RICHTEXT_3 } from '../rich-text/page3-richtext3';

export const DEFAULT_THIRD_PAGE = {
    id: 'strategic_1',
    pageType: PageType.SLIDE,
    zIndex: 1,
    title: 'cover',
    description: 'this is third page, strategic',
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
                text: 'Strategic technology trends',
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
                text: 'We expect the 2023 trends to impact enterprise strategies in the coming three years by enabling organizations to address four key priorities:',
                fs: 18 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
        chart1: {
            id: 'chart1',
            zIndex: 2,
            left: 53,
            top: 214,
            width: 125,
            height: 58,
            title: 'chart1',
            description: '',
            type: PageElementType.SHAPE,
            shape: {
                shapeType: BasicShapes.Rect,
                text: '',
                shapeProperties: {
                    shapeBackgroundFill: {
                        rgb: 'rgb(105,126,146)',
                    },
                },
            },
        },
        chartTitle1: {
            id: 'chartTitle1',
            zIndex: 3,
            left: 53,
            top: 186,
            width: 84,
            height: 28,
            title: 'chartTitle1',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Optimize',
                fs: 16 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
        chartNumber1: {
            id: 'chartNumber1',
            zIndex: 3,
            left: 63,
            top: 230,
            width: 61,
            height: 36,
            title: 'chartNumber1',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: '20%',
                fs: 22 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
        chart2: {
            id: 'chart2',
            zIndex: 2,
            left: 178,
            top: 214,
            width: 428,
            height: 58,
            title: 'chart2',
            description: '',
            type: PageElementType.SHAPE,
            shape: {
                shapeType: BasicShapes.Rect,
                text: '',
                shapeProperties: {
                    shapeBackgroundFill: {
                        rgb: 'rgb(57,74,87)',
                    },
                },
            },
        },
        chartTitle2: {
            id: 'chartTitle2',
            zIndex: 3,
            left: 178,
            top: 186,
            width: 59,
            height: 28,
            title: 'chartTitle2',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Scale',
                fs: 16 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
        chartNumber2: {
            id: 'chartNumber2',
            zIndex: 3,
            left: 188,
            top: 230,
            width: 61,
            height: 36,
            title: 'chartNumber2',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: '50%',
                fs: 22 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
        chart3: {
            id: 'chart3',
            zIndex: 2,
            left: 605,
            top: 214,
            width: 302,
            height: 58,
            title: 'chart3',
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
        chartTitle3: {
            id: 'chartTitle3',
            zIndex: 3,
            left: 605,
            top: 186,
            width: 74,
            height: 28,
            title: 'chartTitle3',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Scale',
                fs: 16 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
        chartNumber3: {
            id: 'chartNumber3',
            zIndex: 3,
            left: 615,
            top: 230,
            width: 61,
            height: 36,
            title: 'chartNumber3',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: '30%',
                fs: 22 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
        detailTitle1: {
            id: 'detailTitle1',
            zIndex: 3,
            left: 53,
            top: 326,
            width: 152,
            height: 28,
            title: 'detailTitle1',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Theme 1: Optimize',
                fs: 16 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
            },
        },
        detailContent1: PAGE3_RICHTEXT_1,
        detailTitle2: {
            id: 'detailTitle2',
            zIndex: 3,
            left: 334,
            top: 326,
            width: 129,
            height: 28,
            title: 'detailTitle2',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Theme 2: Scale',
                fs: 16 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
            },
        },
        detailContent2: PAGE3_RICHTEXT_2,
        detailTitle3: {
            id: 'detailTitle3',
            zIndex: 3,
            left: 652,
            top: 326,
            width: 143,
            height: 28,
            title: 'detailTitle3',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Theme 2: Scale',
                fs: 16 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
            },
        },
        detailContent3: PAGE3_RICHTEXT_3,
    },
};
