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

import array from '@univerjs/formula/locale/function-list/array/vi-VN';
import compatibility from '@univerjs/formula/locale/function-list/compatibility/vi-VN';
import cube from '@univerjs/formula/locale/function-list/cube/vi-VN';
import database from '@univerjs/formula/locale/function-list/database/vi-VN';
import date from '@univerjs/formula/locale/function-list/date/vi-VN';
import engineering from '@univerjs/formula/locale/function-list/engineering/vi-VN';
import financial from '@univerjs/formula/locale/function-list/financial/vi-VN';
import information from '@univerjs/formula/locale/function-list/information/vi-VN';
import logical from '@univerjs/formula/locale/function-list/logical/vi-VN';
import lookup from '@univerjs/formula/locale/function-list/lookup/vi-VN';
import math from '@univerjs/formula/locale/function-list/math/vi-VN';
import statistical from '@univerjs/formula/locale/function-list/statistical/vi-VN';
import text from '@univerjs/formula/locale/function-list/text/vi-VN';
import univer from '@univerjs/formula/locale/function-list/univer/vi-VN';
import web from '@univerjs/formula/locale/function-list/web/vi-VN';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Đang phân tích công thức...',
            calculating: 'Đang tính toán công thức...',
            'array-analysis': 'Đang phân tích công thức mảng...',
            'array-calculation': 'Đang tính toán công thức mảng...',
            done: 'Hoàn tất',
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
