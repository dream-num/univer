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

import array from './function-list/array/ar-SA';
import compatibility from './function-list/compatibility/ar-SA';
import cube from './function-list/cube/ar-SA';
import database from './function-list/database/ar-SA';
import date from './function-list/date/ar-SA';
import engineering from './function-list/engineering/ar-SA';
import financial from './function-list/financial/ar-SA';
import information from './function-list/information/ar-SA';
import logical from './function-list/logical/ar-SA';
import lookup from './function-list/lookup/ar-SA';
import math from './function-list/math/ar-SA';
import statistical from './function-list/statistical/ar-SA';
import text from './function-list/text/ar-SA';
import univer from './function-list/univer/ar-SA';
import web from './function-list/web/ar-SA';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: 'جارٍ تحليل الصيغ...',
            calculating: 'جارٍ حساب الصيغ...',
            'array-analysis': 'جارٍ تحليل صيغ الصفائف...',
            'array-calculation': 'جارٍ حساب صيغ الصفائف...',
            done: 'تم',
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
