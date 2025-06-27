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
    sheet: {
        cf: {
            title: '조건부 서식',
            menu: {
                manageConditionalFormatting: '조건부 서식 관리',
                createConditionalFormatting: '조건부 서식 만들기',
                clearRangeRules: '선택 영역 규칙 지우기',
                clearWorkSheetRules: '시트 전체 규칙 지우기',
            },
            form: {
                lessThan: '{0}보다 작음',
                lessThanOrEqual: '{0} 이하',
                greaterThan: '{0}보다 큼',
                greaterThanOrEqual: '{0} 이상',
                rangeSelector: '범위 선택 또는 값 입력',
            },
            iconSet: {
                direction: '방향',
                shape: '모양',
                mark: '표식',
                rank: '순위',
                rule: '규칙',
                icon: '아이콘',
                type: '유형',
                value: '값',
                reverseIconOrder: '아이콘 순서 반대로',
                and: '그리고',
                when: '조건',
                onlyShowIcon: '아이콘만 표시',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '≥',
                lessThan: '<',
                lessThanOrEqual: '≤',
            },
            panel: {
                createRule: '규칙 만들기',
                clear: '모든 규칙 지우기',
                range: '적용 범위',
                styleType: '스타일 유형',
                submit: '확인',
                cancel: '취소',
                rankAndAverage: '상위/하위/평균',
                styleRule: '스타일 규칙',
                isNotBottom: '상위',
                isBottom: '하위',
                greaterThanAverage: '평균 초과',
                lessThanAverage: '평균 미만',
                medianValue: '중앙값',
                fillType: '채우기 유형',
                pureColor: '단색',
                gradient: '그라데이션',
                colorSet: '색상 세트',
                positive: '양수',
                native: '음수',
                workSheet: '시트 전체',
                selectedRange: '선택 영역',
                managerRuleSelect: '{0} 규칙 관리',
                onlyShowDataBar: '데이터 막대만 표시',
            },
            preview: {
                describe: {
                    beginsWith: '{0}로 시작',
                    endsWith: '{0}로 끝남',
                    containsText: '{0} 포함',
                    notContainsText: '{0} 미포함',
                    equal: '{0}와 같음',
                    notEqual: '{0}와 다름',
                    containsBlanks: '빈 셀 포함',
                    notContainsBlanks: '빈 셀 미포함',
                    containsErrors: '오류 포함',
                    notContainsErrors: '오류 미포함',
                    greaterThan: '{0}보다 큼',
                    greaterThanOrEqual: '{0} 이상',
                    lessThan: '{0}보다 작음',
                    lessThanOrEqual: '{0} 이하',
                    notBetween: '{0}와 {1} 사이 아님',
                    between: '{0}와 {1} 사이',
                    yesterday: '어제',
                    tomorrow: '내일',
                    last7Days: '최근 7일',
                    thisMonth: '이번 달',
                    lastMonth: '지난 달',
                    nextMonth: '다음 달',
                    thisWeek: '이번 주',
                    lastWeek: '지난 주',
                    nextWeek: '다음 주',
                    today: '오늘',
                    topN: '상위 {0}개',
                    bottomN: '하위 {0}개',
                    topNPercent: '상위 {0}%',
                    bottomNPercent: '하위 {0}%',
                },
            },
            operator: {
                beginsWith: '로 시작',
                endsWith: '로 끝남',
                containsText: '포함',
                notContainsText: '미포함',
                equal: '같음',
                notEqual: '다름',
                containsBlanks: '빈 셀 포함',
                notContainsBlanks: '빈 셀 미포함',
                containsErrors: '오류 포함',
                notContainsErrors: '오류 미포함',
                greaterThan: '보다 큼',
                greaterThanOrEqual: '이상',
                lessThan: '보다 작음',
                lessThanOrEqual: '이하',
                notBetween: '사이 아님',
                between: '사이',
                yesterday: '어제',
                tomorrow: '내일',
                last7Days: '최근 7일',
                thisMonth: '이번 달',
                lastMonth: '지난 달',
                nextMonth: '다음 달',
                thisWeek: '이번 주',
                lastWeek: '지난 주',
                nextWeek: '다음 주',
                today: '오늘',
            },
            ruleType: {
                highlightCell: '셀 강조',
                dataBar: '데이터 막대',
                colorScale: '색상 눈금',
                formula: '사용자 지정 수식',
                iconSet: '아이콘 집합',
                duplicateValues: '중복 값',
                uniqueValues: '고유 값',
            },
            subRuleType: {
                uniqueValues: '고유 값',
                duplicateValues: '중복 값',
                rank: '순위',
                text: '텍스트',
                timePeriod: '기간',
                number: '숫자',
                average: '평균',
            },
            valueType: {
                num: '숫자',
                min: '최소값',
                max: '최대값',
                percent: '백분율',
                percentile: '백분위수',
                formula: '수식',
                none: '없음',
            },
            errorMessage: {
                notBlank: '조건을 비울 수 없습니다.',
                formulaError: '잘못된 수식입니다.',
                rangeError: '잘못된 선택 영역입니다.',
            },
        },
    },
};

export default locale;
