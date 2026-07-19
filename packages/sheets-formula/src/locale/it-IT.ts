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

import array from '@univerjs/formula/locale/function-list/array/it-IT';
import compatibility from '@univerjs/formula/locale/function-list/compatibility/it-IT';
import cube from '@univerjs/formula/locale/function-list/cube/it-IT';
import database from '@univerjs/formula/locale/function-list/database/it-IT';
import date from '@univerjs/formula/locale/function-list/date/it-IT';
import engineering from '@univerjs/formula/locale/function-list/engineering/it-IT';
import financial from '@univerjs/formula/locale/function-list/financial/it-IT';
import information from '@univerjs/formula/locale/function-list/information/it-IT';
import logical from '@univerjs/formula/locale/function-list/logical/it-IT';
import lookup from '@univerjs/formula/locale/function-list/lookup/it-IT';
import math from '@univerjs/formula/locale/function-list/math/it-IT';
import statistical from '@univerjs/formula/locale/function-list/statistical/it-IT';
import text from '@univerjs/formula/locale/function-list/text/it-IT';
import univer from '@univerjs/formula/locale/function-list/univer/it-IT';
import web from '@univerjs/formula/locale/function-list/web/it-IT';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Analisi delle formule...',
            calculating: 'Calcolo delle formule...',
            'array-analysis': 'Analisi delle formule matrice...',
            'array-calculation': 'Calcolo delle formule matrice...',
            done: 'Completato',
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
