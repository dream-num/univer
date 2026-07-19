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

import array from '@univerjs/formula/locale/function-list/array/es-ES';
import compatibility from '@univerjs/formula/locale/function-list/compatibility/es-ES';
import cube from '@univerjs/formula/locale/function-list/cube/es-ES';
import database from '@univerjs/formula/locale/function-list/database/es-ES';
import date from '@univerjs/formula/locale/function-list/date/es-ES';
import engineering from '@univerjs/formula/locale/function-list/engineering/es-ES';
import financial from '@univerjs/formula/locale/function-list/financial/es-ES';
import information from '@univerjs/formula/locale/function-list/information/es-ES';
import logical from '@univerjs/formula/locale/function-list/logical/es-ES';
import lookup from '@univerjs/formula/locale/function-list/lookup/es-ES';
import math from '@univerjs/formula/locale/function-list/math/es-ES';
import statistical from '@univerjs/formula/locale/function-list/statistical/es-ES';
import text from '@univerjs/formula/locale/function-list/text/es-ES';
import univer from '@univerjs/formula/locale/function-list/univer/es-ES';
import web from '@univerjs/formula/locale/function-list/web/es-ES';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Analizando fórmulas...',
            calculating: 'Calculando fórmulas...',
            'array-analysis': 'Analizando fórmulas de matriz...',
            'array-calculation': 'Calculando fórmulas de matriz...',
            done: 'Listo',
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
