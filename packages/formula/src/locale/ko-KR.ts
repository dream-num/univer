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

import array from './function-list/array/ko-KR';
import compatibility from './function-list/compatibility/ko-KR';
import cube from './function-list/cube/ko-KR';
import database from './function-list/database/ko-KR';
import date from './function-list/date/ko-KR';
import engineering from './function-list/engineering/ko-KR';
import financial from './function-list/financial/ko-KR';
import information from './function-list/information/ko-KR';
import logical from './function-list/logical/ko-KR';
import lookup from './function-list/lookup/ko-KR';
import math from './function-list/math/ko-KR';
import statistical from './function-list/statistical/ko-KR';
import text from './function-list/text/ko-KR';
import univer from './function-list/univer/ko-KR';
import web from './function-list/web/ko-KR';

const locale: typeof enUS = {
    'sheets-formula': {
        progress: {
            analyzing: '수식 분석 중...',
            calculating: '수식 계산 중...',
            'array-analysis': '배열 수식 분석 중...',
            'array-calculation': '배열 수식 계산 중...',
            done: '완료',
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
