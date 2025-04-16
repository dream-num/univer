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

export const DEFAULT_SECOND_PAGE = {
    id: 'catalog_1',
    pageType: PageType.SLIDE,
    zIndex: 2,
    title: 'catalog',
    description: 'this is second page, catalog',
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
            zIndex: 3,
            left: 180,
            top: 240,
            width: 200,
            height: 40,
            title: 'Catalog',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Catalog',
                fs: 42 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
        centerRect1: {
            id: 'centerRect1',
            zIndex: 2,
            left: 140,
            top: 168,
            width: 203,
            height: 203,
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
        firstRect1: {
            id: 'firstRect1',
            zIndex: 2,
            left: 547,
            top: 115,
            width: 44,
            height: 44,
            title: 'index1',
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
        secondRect1: {
            id: 'secondRect1',
            zIndex: 2,
            left: 547,
            top: 210,
            width: 44,
            height: 44,
            title: 'index2',
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
        thirdRect1: {
            id: 'thirdRect1',
            zIndex: 2,
            left: 547,
            top: 304,
            width: 44,
            height: 44,
            title: 'index2',
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
        forth1: {
            id: 'forth1',
            zIndex: 2,
            left: 547,
            top: 397,
            width: 44,
            height: 44,
            title: 'index2',
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
        first_index1: {
            id: 'first_index1',
            zIndex: 3,
            left: 557,
            top: 120,
            width: 44,
            height: 44,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: '01',
                fs: 28 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
                bl: 1,
            },
        },
        first_title1: {
            id: 'first_title1',
            zIndex: 3,
            left: 610,
            top: 115,
            width: 248,
            height: 39,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Strategic technology trends',
                fs: 20 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
                bl: 1,
            },
        },
        first_detail1: {
            id: 'first_detail1',
            zIndex: 3,
            left: 610,
            top: 140,
            width: 300,
            height: 39,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'How they impact business goals.',
                fs: 14 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
        second_index1: {
            id: 'second_index1',
            zIndex: 3,
            left: 557,
            top: 215,
            width: 44,
            height: 44,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: '02',
                fs: 28 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
                bl: 1,
            },
        },
        second_title1: {
            id: 'second_title1',
            zIndex: 3,
            left: 610,
            top: 210,
            width: 248,
            height: 39,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Technical profile',
                fs: 20 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
                bl: 1,
            },
        },
        second_detail1: {
            id: 'second_detail1',
            zIndex: 3,
            left: 610,
            top: 235,
            width: 300,
            height: 39,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'What the technologies are and do.',
                fs: 14 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
        third_index1: {
            id: 'third_index1',
            zIndex: 3,
            left: 557,
            top: 310,
            width: 44,
            height: 44,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: '03',
                fs: 28 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
                bl: 1,
            },
        },
        third_title1: {
            id: 'third_title1',
            zIndex: 3,
            left: 610,
            top: 305,
            width: 248,
            height: 39,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Opportunities',
                fs: 20 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
                bl: 1,
            },
        },
        third_detail1: {
            id: 'third_detail1',
            zIndex: 3,
            left: 610,
            top: 330,
            width: 300,
            height: 39,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'What benefits and outcomes they drive.',
                fs: 14 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
        forth_index1: {
            id: 'forth_index1',
            zIndex: 3,
            left: 557,
            top: 405,
            width: 44,
            height: 44,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: '04',
                fs: 28 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
                bl: 1,
            },
        },
        forth_title1: {
            id: 'forth_title1',
            zIndex: 3,
            left: 610,
            top: 400,
            width: 248,
            height: 39,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Implementation steps',
                fs: 20 * 0.75,
                cl: {
                    rgb: 'rgb(244,79,86)',
                },
                bl: 1,
            },
        },
        forth_detail1: {
            id: 'forth_detail1',
            zIndex: 3,
            left: 610,
            top: 425,
            width: 300,
            height: 39,
            title: 'mask',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: 'Action plans for implementation.',
                fs: 14 * 0.75,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
    },
};
