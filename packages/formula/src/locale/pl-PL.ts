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

import array from './function-list/array/pl-PL';
import compatibility from './function-list/compatibility/pl-PL';
import cube from './function-list/cube/pl-PL';
import database from './function-list/database/pl-PL';
import date from './function-list/date/pl-PL';
import engineering from './function-list/engineering/pl-PL';
import financial from './function-list/financial/pl-PL';
import information from './function-list/information/pl-PL';
import logical from './function-list/logical/pl-PL';
import lookup from './function-list/lookup/pl-PL';
import math from './function-list/math/pl-PL';
import statistical from './function-list/statistical/pl-PL';
import text from './function-list/text/pl-PL';
import univer from './function-list/univer/pl-PL';
import web from './function-list/web/pl-PL';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Analizowanie formuł...',
            calculating: 'Obliczanie formuł...',
            'array-analysis': 'Analizowanie formuł tablicowych...',
            'array-calculation': 'Obliczanie formuł tablicowych...',
            done: 'Gotowe',
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
