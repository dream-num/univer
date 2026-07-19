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

import array from '@univerjs/formula/locale/function-list/array/ca-ES';
import compatibility from '@univerjs/formula/locale/function-list/compatibility/ca-ES';
import cube from '@univerjs/formula/locale/function-list/cube/ca-ES';
import database from '@univerjs/formula/locale/function-list/database/ca-ES';
import date from '@univerjs/formula/locale/function-list/date/ca-ES';
import engineering from '@univerjs/formula/locale/function-list/engineering/ca-ES';
import financial from '@univerjs/formula/locale/function-list/financial/ca-ES';
import information from '@univerjs/formula/locale/function-list/information/ca-ES';
import logical from '@univerjs/formula/locale/function-list/logical/ca-ES';
import lookup from '@univerjs/formula/locale/function-list/lookup/ca-ES';
import math from '@univerjs/formula/locale/function-list/math/ca-ES';
import statistical from '@univerjs/formula/locale/function-list/statistical/ca-ES';
import text from '@univerjs/formula/locale/function-list/text/ca-ES';
import univer from '@univerjs/formula/locale/function-list/univer/ca-ES';
import web from '@univerjs/formula/locale/function-list/web/ca-ES';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Analitzant fórmules...',
            calculating: 'Calculant fórmules...',
            'array-analysis': 'Analitzant fórmules de matriu...',
            'array-calculation': 'Calculant fórmules de matriu...',
            done: 'Fet',
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
