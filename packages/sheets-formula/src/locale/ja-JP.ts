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

import array from './function-list/array/ja-JP';
import compatibility from './function-list/compatibility/ja-JP';
import cube from './function-list/cube/ja-JP';
import database from './function-list/database/ja-JP';
import date from './function-list/date/ja-JP';
import engineering from './function-list/engineering/ja-JP';
import financial from './function-list/financial/ja-JP';
import information from './function-list/information/ja-JP';
import logical from './function-list/logical/ja-JP';
import lookup from './function-list/lookup/ja-JP';
import math from './function-list/math/ja-JP';
import statistical from './function-list/statistical/ja-JP';
import text from './function-list/text/ja-JP';
import univer from './function-list/univer/ja-JP';
import web from './function-list/web/ja-JP';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: '数式を分析中...',
            calculating: '数式を計算中...',
            'array-analysis': '配列数式を分析中...',
            'array-calculation': '配列数式を計算中...',
            done: '完了',
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
