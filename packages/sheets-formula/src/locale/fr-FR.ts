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

import array from './function-list/array/fr-FR';
import compatibility from './function-list/compatibility/fr-FR';
import cube from './function-list/cube/fr-FR';
import database from './function-list/database/fr-FR';
import date from './function-list/date/fr-FR';
import engineering from './function-list/engineering/fr-FR';
import financial from './function-list/financial/fr-FR';
import information from './function-list/information/fr-FR';
import logical from './function-list/logical/fr-FR';
import lookup from './function-list/lookup/fr-FR';
import math from './function-list/math/fr-FR';
import statistical from './function-list/statistical/fr-FR';
import text from './function-list/text/fr-FR';
import univer from './function-list/univer/fr-FR';
import web from './function-list/web/fr-FR';

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
