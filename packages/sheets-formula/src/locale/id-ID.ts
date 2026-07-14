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

import array from './function-list/array/id-ID';
import compatibility from './function-list/compatibility/id-ID';
import cube from './function-list/cube/id-ID';
import database from './function-list/database/id-ID';
import date from './function-list/date/id-ID';
import engineering from './function-list/engineering/id-ID';
import financial from './function-list/financial/id-ID';
import information from './function-list/information/id-ID';
import logical from './function-list/logical/id-ID';
import lookup from './function-list/lookup/id-ID';
import math from './function-list/math/id-ID';
import statistical from './function-list/statistical/id-ID';
import text from './function-list/text/id-ID';
import univer from './function-list/univer/id-ID';
import web from './function-list/web/id-ID';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Menganalisis rumus...',
            calculating: 'Menghitung rumus...',
            'array-analysis': 'Menganalisis rumus array...',
            'array-calculation': 'Menghitung rumus array...',
            done: 'Selesai',
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
