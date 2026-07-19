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

import array from './function-list/array/de-DE';
import compatibility from './function-list/compatibility/de-DE';
import cube from './function-list/cube/de-DE';
import database from './function-list/database/de-DE';
import date from './function-list/date/de-DE';
import engineering from './function-list/engineering/de-DE';
import financial from './function-list/financial/de-DE';
import information from './function-list/information/de-DE';
import logical from './function-list/logical/de-DE';
import lookup from './function-list/lookup/de-DE';
import math from './function-list/math/de-DE';
import statistical from './function-list/statistical/de-DE';
import text from './function-list/text/de-DE';
import univer from './function-list/univer/de-DE';
import web from './function-list/web/de-DE';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Formeln werden analysiert...',
            calculating: 'Formeln werden berechnet...',
            'array-analysis': 'Matrixformeln werden analysiert...',
            'array-calculation': 'Matrixformeln werden berechnet...',
            done: 'Fertig',
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
