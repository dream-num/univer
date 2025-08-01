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
    'sheets-table': {
        title: '표',
        selectRange: '표 범위 선택',
        rename: '표 이름 바꾸기',
        updateRange: '표 범위 업데이트',
        tableRangeWithMergeError: '표 범위는 병합된 셀과 겹칠 수 없습니다',
        tableRangeWithOtherTableError: '표 범위는 다른 표와 겹칠 수 없습니다',
        tableRangeSingleRowError: '표 범위는 한 줄만으로 구성될 수 없습니다',
        updateError: '표 범위는 원래 범위와 겹치지 않거나 같은 행에 있지 않으면 설정할 수 없습니다',
        tableStyle: '표 스타일',
        defaultStyle: '기본 스타일',
        customStyle: '사용자 지정 스타일',
        customTooMore: '사용자 지정 테마 수가 최대치를 초과했습니다. 일부 테마를 삭제한 후 다시 추가해 주세요',
        setTheme: '표 테마 설정',
        removeTable: '표 제거',
        cancel: '취소',
        confirm: '확인',
        header: '머리글',
        footer: '바닥글',
        firstLine: '첫 번째 줄',
        secondLine: '두 번째 줄',
        columnPrefix: '열',
        tablePrefix: '표',
        tableNameError: '표 이름은 공백을 포함할 수 없으며 숫자로 시작할 수 없고 기존 표 이름과 중복될 수 없습니다',

        insert: {
            main: '표 삽입',
            row: '표 행 삽입',
            col: '표 열 삽입',
        },

        remove: {
            main: '표 제거',
            row: '표 행 삭제',
            col: '표 열 삭제',
        },
        condition: {
            string: '텍스트',
            number: '숫자',
            date: '날짜',

            empty: '(비어 있음)',
        },
        string: {
            compare: {
                equal: '같음',
                notEqual: '같지 않음',
                contains: '포함함',
                notContains: '포함하지 않음',
                startsWith: '시작 문자열',
                endsWith: '끝 문자열',
            },
        },
        number: {
            compare: {
                equal: '같음',
                notEqual: '같지 않음',
                greaterThan: '보다 큼',
                greaterThanOrEqual: '크거나 같음',
                lessThan: '보다 작음',
                lessThanOrEqual: '작거나 같음',
                between: '사이',
                notBetween: '사이 아님',
                above: '보다 큼',
                below: '보다 작음',
                topN: '상위 {0}개',
            },
        },
        date: {
            compare: {
                equal: '같은 날짜',
                notEqual: '같지 않은 날짜',
                after: '이후',
                afterOrEqual: '이후 또는 같음',
                before: '이전',
                beforeOrEqual: '이전 또는 같음',
                between: '사이',
                notBetween: '사이 아님',
                today: '오늘',
                yesterday: '어제',
                tomorrow: '내일',
                thisWeek: '이번 주',
                lastWeek: '지난주',
                nextWeek: '다음 주',
                thisMonth: '이번 달',
                lastMonth: '지난달',
                nextMonth: '다음 달',
                thisQuarter: '이번 분기',
                lastQuarter: '지난 분기',
                nextQuarter: '다음 분기',
                thisYear: '올해',
                nextYear: '내년',
                lastYear: '작년',
                quarter: '분기별',
                month: '월별',
                q1: '1분기',
                q2: '2분기',
                q3: '3분기',
                q4: '4분기',
                m1: '1월',
                m2: '2월',
                m3: '3월',
                m4: '4월',
                m5: '5월',
                m6: '6월',
                m7: '7월',
                m8: '8월',
                m9: '9월',
                m10: '10월',
                m11: '11월',
                m12: '12월',
            },
        },
    },
};

export default locale;
