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

import array from '@univerjs/formula/locale/function-list/array/ar-SA';
import compatibility from '@univerjs/formula/locale/function-list/compatibility/ar-SA';
import cube from '@univerjs/formula/locale/function-list/cube/ar-SA';
import database from '@univerjs/formula/locale/function-list/database/ar-SA';
import date from '@univerjs/formula/locale/function-list/date/ar-SA';
import engineering from '@univerjs/formula/locale/function-list/engineering/ar-SA';
import financial from '@univerjs/formula/locale/function-list/financial/ar-SA';
import information from '@univerjs/formula/locale/function-list/information/ar-SA';
import logical from '@univerjs/formula/locale/function-list/logical/ar-SA';
import lookup from '@univerjs/formula/locale/function-list/lookup/ar-SA';
import math from '@univerjs/formula/locale/function-list/math/ar-SA';
import statistical from '@univerjs/formula/locale/function-list/statistical/ar-SA';
import text from '@univerjs/formula/locale/function-list/text/ar-SA';
import univer from '@univerjs/formula/locale/function-list/univer/ar-SA';
import web from '@univerjs/formula/locale/function-list/web/ar-SA';

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
