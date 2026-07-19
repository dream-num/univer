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

import array from '@univerjs/formula/locale/function-list/array/fr-FR';
import compatibility from '@univerjs/formula/locale/function-list/compatibility/fr-FR';
import cube from '@univerjs/formula/locale/function-list/cube/fr-FR';
import database from '@univerjs/formula/locale/function-list/database/fr-FR';
import date from '@univerjs/formula/locale/function-list/date/fr-FR';
import engineering from '@univerjs/formula/locale/function-list/engineering/fr-FR';
import financial from '@univerjs/formula/locale/function-list/financial/fr-FR';
import information from '@univerjs/formula/locale/function-list/information/fr-FR';
import logical from '@univerjs/formula/locale/function-list/logical/fr-FR';
import lookup from '@univerjs/formula/locale/function-list/lookup/fr-FR';
import math from '@univerjs/formula/locale/function-list/math/fr-FR';
import statistical from '@univerjs/formula/locale/function-list/statistical/fr-FR';
import text from '@univerjs/formula/locale/function-list/text/fr-FR';
import univer from '@univerjs/formula/locale/function-list/univer/fr-FR';
import web from '@univerjs/formula/locale/function-list/web/fr-FR';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'Analyse des formules...',
            calculating: 'Calcul des formules...',
            'array-analysis': 'Analyse des formules matricielles...',
            'array-calculation': 'Calcul des formules matricielles...',
            done: 'Terminé',
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
