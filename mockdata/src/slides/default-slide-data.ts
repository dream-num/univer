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

import type { ISlideData } from '@univerjs/core';

import { DEFAULT_FIRST_PAGE } from './default-pages/page1';
import { DEFAULT_SECOND_PAGE } from './default-pages/page2';
import { DEFAULT_THIRD_PAGE } from './default-pages/page3';
import { DEFAULT_FORTH_PAGE } from './default-pages/page4';
import { DEFAULT_FIFTH_PAGE } from './default-pages/page5';
import { DEFAULT_SIXTH_PAGE } from './default-pages/page6';
import { DEFAULT_SEVEN_PAGE } from './default-pages/page7';

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
