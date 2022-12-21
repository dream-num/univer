import { ISlideData } from '@univer/core';
import { DEFAULT_FIRST_PAGE } from './DefaultPages/Page1';
import { DEFAULT_SECOND_PAGE } from './DefaultPages/Page2';
import { DEFAULT_THIRD_PAGE } from './DefaultPages/Page3';
import { DEFAULT_FORTH_PAGE } from './DefaultPages/Page4';
import { DEFAULT_FIFTH_PAGE } from './DefaultPages/Page5';
import { DEFAULT_SIXTH_PAGE } from './DefaultPages/Page6';
import { DEFAULT_SEVEN_PAGE } from './DefaultPages/Page7';

export const DEFAULT_SLIDE_DATA: ISlideData = {
    id: 'slide_test',
    title: 'UniverSlide',
    pageSize: {
        width: 960,
        height: 540,
    },
    body: {
        pages: {
            cover_1: DEFAULT_FIRST_PAGE,
            catalog_1: DEFAULT_SECOND_PAGE,
            strategic_1: DEFAULT_THIRD_PAGE,
            technology_1: DEFAULT_FIFTH_PAGE,
            richText_1: DEFAULT_SIXTH_PAGE,
            business_1: DEFAULT_FORTH_PAGE,
            unlimited_1: DEFAULT_SEVEN_PAGE,
        },
        pageOrder: ['cover_1', 'catalog_1', 'strategic_1', 'technology_1', 'richText_1', 'business_1', 'unlimited_1'],
    },
};
