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

import array from './function-list/array/pt-BR';
import compatibility from './function-list/compatibility/pt-BR';
import cube from './function-list/cube/pt-BR';
import database from './function-list/database/pt-BR';
import date from './function-list/date/pt-BR';
import engineering from './function-list/engineering/pt-BR';
import financial from './function-list/financial/pt-BR';
import information from './function-list/information/pt-BR';
import logical from './function-list/logical/pt-BR';
import lookup from './function-list/lookup/pt-BR';
import math from './function-list/math/pt-BR';
import statistical from './function-list/statistical/pt-BR';
import text from './function-list/text/pt-BR';
import univer from './function-list/univer/pt-BR';
import web from './function-list/web/pt-BR';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Analisando fórmulas...',
            calculating: 'Calculando fórmulas...',
            'array-analysis': 'Analisando fórmulas de matriz...',
            'array-calculation': 'Calculando fórmulas de matriz...',
            done: 'Concluído',
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
