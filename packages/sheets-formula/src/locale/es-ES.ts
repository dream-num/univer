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

import array from './function-list/array/es-ES';
import compatibility from './function-list/compatibility/es-ES';
import cube from './function-list/cube/es-ES';
import database from './function-list/database/es-ES';
import date from './function-list/date/es-ES';
import engineering from './function-list/engineering/es-ES';
import financial from './function-list/financial/es-ES';
import information from './function-list/information/es-ES';
import logical from './function-list/logical/es-ES';
import lookup from './function-list/lookup/es-ES';
import math from './function-list/math/es-ES';
import statistical from './function-list/statistical/es-ES';
import text from './function-list/text/es-ES';
import univer from './function-list/univer/es-ES';
import web from './function-list/web/es-ES';

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
