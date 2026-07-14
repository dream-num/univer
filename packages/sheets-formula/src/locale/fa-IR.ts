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

import type enUS from './en-US';

import array from './function-list/array/en-US';
import compatibility from './function-list/compatibility/en-US';
import cube from './function-list/cube/en-US';
import database from './function-list/database/en-US';
import date from './function-list/date/en-US';
import engineering from './function-list/engineering/en-US';
import financial from './function-list/financial/en-US';
import information from './function-list/information/en-US';
import logical from './function-list/logical/en-US';
import lookup from './function-list/lookup/en-US';
import math from './function-list/math/en-US';
import statistical from './function-list/statistical/en-US';
import text from './function-list/text/en-US';
import univer from './function-list/univer/en-US';
import web from './function-list/web/en-US';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'در حال تحلیل فرمول‌ها...',
            calculating: 'در حال محاسبه فرمول‌ها...',
            'array-analysis': 'در حال تحلیل فرمول‌های آرایه‌ای...',
            'array-calculation': 'در حال محاسبه فرمول‌های آرایه‌ای...',
            done: 'انجام شد',
        },
        functionList: {
            ...array,
            ...compatibility,
            ...cube,
            ...database,
            ...date,
            ...engineering,
            ...financial,
            ...information,
            ...logical,
            ...lookup,
            ...math,
            ...statistical,
            ...text,
            ...univer,
            ...web,
        },
    },
};

export default locale;
