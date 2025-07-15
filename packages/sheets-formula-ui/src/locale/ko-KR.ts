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
    shortcut: {
        'sheets-formula-ui': {
            'quick-sum': '빠른 합계',
        },
    },
    formula: {
        insert: {
            tooltip: '함수',
            sum: 'SUM',
            average: 'AVERAGE',
            count: 'COUNT',
            max: 'MAX',
            min: 'MIN',
            more: '더 많은 함수...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
        },
        prompt: {
            helpExample: '예제',
            helpAbstract: '정보',
            required: '필수.',
            optional: '선택.',
        },
        error: {
            title: '오류',
            divByZero: '0으로 나누기 오류',
            name: '잘못된 이름 오류',
            value: '값 오류',
            num: '숫자 오류',
            na: '사용할 수 없는 값 오류',
            cycle: '순환 참조 오류',
            ref: '잘못된 셀 참조 오류',
            spill: '분산 범위가 비어 있지 않음',
            calc: '계산 오류',
            error: '오류',
            connect: '데이터 가져오는 중',
            null: 'Null 오류',
        },

        functionType: {
            financial: '재무',
            date: '날짜 및 시간',
            math: '수학 및 삼각 함수',
            statistical: '통계',
            lookup: '찾기 및 참조',
            database: '데이터베이스',
            text: '텍스트',
            logical: '논리',
            information: '정보',
            engineering: '공학',
            cube: '큐브',
            compatibility: '호환성',
            web: '웹',
            array: '배열',
            univer: 'Univer',
            user: '사용자 정의',
            definedname: '정의된 이름',
        },
        moreFunctions: {
            confirm: '확인',
            prev: '이전',
            next: '다음',
            searchFunctionPlaceholder: '함수 검색',
            allFunctions: '모든 함수',
            syntax: '구문',
        },
        operation: {
            pasteFormula: '수식 붙여넣기',
        },
    },
};

export default locale;
