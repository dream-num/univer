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

import array from './function-list/array/zh-TW';
import compatibility from './function-list/compatibility/zh-TW';
import cube from './function-list/cube/zh-TW';
import database from './function-list/database/zh-TW';
import date from './function-list/date/zh-TW';
import engineering from './function-list/engineering/zh-TW';
import financial from './function-list/financial/zh-TW';
import information from './function-list/information/zh-TW';
import logical from './function-list/logical/zh-TW';
import lookup from './function-list/lookup/zh-TW';
import math from './function-list/math/zh-TW';
import statistical from './function-list/statistical/zh-TW';
import text from './function-list/text/zh-TW';
import univer from './function-list/univer/zh-TW';
import web from './function-list/web/zh-TW';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: '正在分析公式...',
            calculating: '正在計算公式...',
            'array-analysis': '正在分析陣列公式...',
            'array-calculation': '正在計算陣列公式...',
            done: '完成',
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
