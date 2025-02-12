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

export const DEFAULT_FIFTH_PAGE = {
    id: 'technology_1',
    pageType: PageType.SLIDE,
    zIndex: 2,
    title: 'technology',
    description: 'this is second page, technology',
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
                text: 'Sustainable Technology',
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
                text: 'Delivering technology alone will not be enough in 2023',
                fs: 18 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
        picture1: {
            id: 'picture1',
            zIndex: 2,
            left: 53,
            top: 151,
            width: 258,
            height: 156,
            title: 'title Icon',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/P1.png',
                },
            },
        },
        picture2: {
            id: 'picture2',
            zIndex: 2,
            left: 315,
            top: 151,
            width: 241,
            height: 156,
            title: 'title Icon',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/P2.png',
                },
            },
        },
        picture3: {
            id: 'picture3',
            zIndex: 2,
            left: 53,
            top: 310,
            width: 258,
            height: 156,
            title: 'title Icon',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/P3.png',
                },
            },
        },
        picture4: {
            id: 'picture4',
            zIndex: 2,
            left: 310,
            top: 315,
            width: 241,
            height: 156,
            title: 'title Icon',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/P4.jpg',
                },
            },
        },
        detailTitle1: {
            id: 'detailTitle1',
            zIndex: 3,
            left: 580,
            top: 138,
            width: 75,
            height: 28,
            title: 'detailTitle1',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'In short:',
                fs: 16 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
            },
        },
        detailContent1: {
            id: 'detailContent1',
            zIndex: 3,
            left: 580,
            top: 167,
            width: 373,
            height: 81,
            title: 'detailContent1',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Investments in sustainable technology also have the potential to create greater operational resiliency and financial performance, while providing new avenues for growth.',
                fs: 12 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
        listTitle1: {
            id: 'listTitle1',
            zIndex: 3,
            left: 580,
            top: 138,
            width: 75,
            height: 28,
            title: 'listTitle1',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'In short:',
                fs: 16 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
            },
        },
        listTitlePicture1: {
            id: 'listTitlePicture1',
            zIndex: 2,
            left: 572,
            top: 261,
            width: 53,
            height: 53,
            title: 'title Icon',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/icon1.png',
                },
            },
        },
        listContent1: {
            id: 'listContent1',
            zIndex: 3,
            left: 637,
            top: 265,
            width: 309,
            height: 61,
            title: 'listContent1',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Gartner’s Top 10 Strategic Technology Trends will help fulfill your business needs to optimize, scale or pioneer.',
                fs: 12 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },

        listTitlePicture2: {
            id: 'listTitlePicture2',
            zIndex: 2,
            left: 572,
            top: 341,
            width: 53,
            height: 53,
            title: 'title Icon',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/icon2.png',
                },
            },
        },
        listContent2: {
            id: 'listContent2',
            zIndex: 3,
            left: 637,
            top: 345,
            width: 309,
            height: 61,
            title: 'listContent2',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'The trends allow you to align your technology innovation with the future strategic objectives of your enterprise.',
                fs: 12 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },

        listTitlePicture3: {
            id: 'listTitlePicture3',
            zIndex: 2,
            left: 572,
            top: 421,
            width: 53,
            height: 53,
            title: 'title Icon',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/icon3.png',
                },
            },
        },
        listContent3: {
            id: 'listContent3',
            zIndex: 3,
            left: 637,
            top: 425,
            width: 309,
            height: 61,
            title: 'listContent3',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Investments in sustainable technology provide operational and financial benefits, and can create growth opportunities.',
                fs: 12 * 0.75,
                cl: {
                    rgb: 'rgb(127,127,127)',
                },
            },
        },
    },
};
