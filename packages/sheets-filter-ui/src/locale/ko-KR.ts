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

const locale: typeof enUS = {
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': '필터 토글',
            'clear-filter-criteria': '필터 조건 지우기',
            're-calc-filter-conditions': '필터 조건 재계산',
        },
        command: {
            'not-valid-filter-range': '선택한 범위에 한 행만 있어 필터를 적용할 수 없습니다.',
        },
        shortcut: {
            'smart-toggle-filter': '필터 토글',
        },
        panel: {
            'clear-filter': '필터 지우기',
            cancel: '취소',
            confirm: '확인',
            'by-values': '값으로 필터',
            'by-colors': '색상으로 필터',
            'filter-by-cell-fill-color': '셀 채우기 색상으로 필터',
            'filter-by-cell-text-color': '셀 텍스트 색상으로 필터',
            'filter-by-color-none': '이 열은 단일 색상만 포함합니다',
            'by-conditions': '조건으로 필터',
            'filter-only': '필터만 보기',
            'search-placeholder': '검색어는 공백으로 구분',
            'select-all': '전체 선택',
            'input-values-placeholder': '값 입력',
            and: 'AND',
            or: 'OR',
            empty: '(빈 값)',
            '?': '“?”는 임의의 한 문자',
            '*': '“*”는 임의의 여러 문자',
        },
        conditions: {
            none: '없음',
            empty: '빈 셀',
            'not-empty': '빈 셀 아님',
            'text-contains': '텍스트 포함',
            'does-not-contain': '텍스트 미포함',
            'starts-with': '텍스트 시작',
            'ends-with': '텍스트 끝',
            equals: '텍스트 일치',
            'greater-than': '크다',
            'greater-than-or-equal': '크거나 같다',
            'less-than': '작다',
            'less-than-or-equal': '작거나 같다',
            equal: '같음',
            'not-equal': '같지 않음',
            between: '범위 내',
            'not-between': '범위 밖',
            custom: '사용자 지정',
        },
        msg: {
            'filter-header-forbidden': '필터 헤더 행은 이동할 수 없습니다.',
        },
        date: {
            1: '1월',
            2: '2월',
            3: '3월',
            4: '4월',
            5: '5월',
            6: '6월',
            7: '7월',
            8: '8월',
            9: '9월',
            10: '10월',
            11: '11월',
            12: '12월',
        },
        sync: {
            title: '필터를 모든 사용자가 볼 수 있음',
            statusTips: {
                on: '활성화하면 모든 협업자가 필터 결과를 볼 수 있습니다.',
                off: '비활성화하면 나만 필터 결과를 볼 수 있습니다.',
            },
            switchTips: {
                on: '"필터를 모든 사용자가 볼 수 있음"이 활성화되어 모든 협업자가 필터 결과를 볼 수 있습니다.',
                off: '"필터를 모든 사용자가 볼 수 있음"이 비활성화되어 나만 필터 결과를 볼 수 있습니다.',
            },
        },
    },
};

export default locale;
