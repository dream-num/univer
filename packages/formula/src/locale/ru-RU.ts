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

import array from './function-list/array/ru-RU';
import compatibility from './function-list/compatibility/ru-RU';
import cube from './function-list/cube/ru-RU';
import database from './function-list/database/ru-RU';
import date from './function-list/date/ru-RU';
import engineering from './function-list/engineering/ru-RU';
import financial from './function-list/financial/ru-RU';
import information from './function-list/information/ru-RU';
import logical from './function-list/logical/ru-RU';
import lookup from './function-list/lookup/ru-RU';
import math from './function-list/math/ru-RU';
import statistical from './function-list/statistical/ru-RU';
import text from './function-list/text/ru-RU';
import univer from './function-list/univer/ru-RU';
import web from './function-list/web/ru-RU';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Анализ формул...',
            calculating: 'Вычисление формул...',
            'array-analysis': 'Анализ формул массива...',
            'array-calculation': 'Вычисление формул массива...',
            done: 'Готово',
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
