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

import array from './function-list/array/vi-VN';
import compatibility from './function-list/compatibility/vi-VN';
import cube from './function-list/cube/vi-VN';
import database from './function-list/database/vi-VN';
import date from './function-list/date/vi-VN';
import engineering from './function-list/engineering/vi-VN';
import financial from './function-list/financial/vi-VN';
import information from './function-list/information/vi-VN';
import logical from './function-list/logical/vi-VN';
import lookup from './function-list/lookup/vi-VN';
import math from './function-list/math/vi-VN';
import statistical from './function-list/statistical/vi-VN';
import text from './function-list/text/vi-VN';
import univer from './function-list/univer/vi-VN';
import web from './function-list/web/vi-VN';

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
