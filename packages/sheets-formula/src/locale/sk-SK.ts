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

import array from './function-list/array/sk-SK';
import compatibility from './function-list/compatibility/sk-SK';
import cube from './function-list/cube/sk-SK';
import database from './function-list/database/sk-SK';
import date from './function-list/date/sk-SK';
import engineering from './function-list/engineering/sk-SK';
import financial from './function-list/financial/sk-SK';
import information from './function-list/information/sk-SK';
import logical from './function-list/logical/sk-SK';
import lookup from './function-list/lookup/sk-SK';
import math from './function-list/math/sk-SK';
import statistical from './function-list/statistical/sk-SK';
import text from './function-list/text/sk-SK';
import univer from './function-list/univer/sk-SK';
import web from './function-list/web/sk-SK';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Analyzujú sa vzorce...',
            calculating: 'Počítajú sa vzorce...',
            'array-analysis': 'Analyzujú sa maticové vzorce...',
            'array-calculation': 'Počítajú sa maticové vzorce...',
            done: 'Hotovo',
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
