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
    dataValidation: {
        title: '데이터 유효성 검사',
        validFail: {
            value: '값을 입력하세요',
            common: '값 또는 수식을 입력하세요',
            number: '숫자 또는 수식을 입력하세요',
            formula: '수식을 입력하세요',
            integer: '정수 또는 수식을 입력하세요',
            date: '날짜 또는 수식을 입력하세요',
            list: '목록 옵션을 입력하세요',
            listInvalid: '목록 소스는 구분된 목록이거나 단일 행 또는 열 참조여야 합니다',
            checkboxEqual: '선택된 값과 선택되지 않은 값에 서로 다른 값을 입력하세요',
            formulaError: '참조 범위에 보이지 않는 데이터가 포함되어 있습니다. 범위를 다시 설정하세요',
            listIntersects: '선택한 범위가 규칙 범위와 겹칠 수 없습니다',
            primitive: '사용자 지정 선택/미선택 값에는 수식을 사용할 수 없습니다',
        },
        panel: {
            title: '데이터 유효성 검사 관리',
            addTitle: '새 데이터 유효성 검사 추가',
            removeAll: '모두 제거',
            add: '규칙 추가',
            range: '적용 범위',
            type: '유형',
            options: '고급 옵션',
            operator: '연산자',
            removeRule: '규칙 제거',
            done: '완료',
            formulaPlaceholder: '값 또는 수식 입력',
            valuePlaceholder: '값 입력',
            formulaAnd: '그리고',
            invalid: '유효하지 않음',
            showWarning: '경고 표시',
            rejectInput: '입력 거부',
            messageInfo: '도움말 메시지',
            showInfo: '선택한 셀에 도움말 표시',
            rangeError: '범위가 올바르지 않습니다',
            allowBlank: '빈 셀 허용',
        },
        operators: {
            between: '사이',
            greaterThan: '초과',
            greaterThanOrEqual: '이상',
            lessThan: '미만',
            lessThanOrEqual: '이하',
            equal: '같음',
            notEqual: '같지 않음',
            notBetween: '사이가 아님',
            legal: '유효한 형식',
        },
        ruleName: {
            between: '{FORMULA1}와 {FORMULA2} 사이',
            greaterThan: '{FORMULA1} 초과',
            greaterThanOrEqual: '{FORMULA1} 이상',
            lessThan: '{FORMULA1} 미만',
            lessThanOrEqual: '{FORMULA1} 이하',
            equal: '{FORMULA1}와 같음',
            notEqual: '{FORMULA1}와 다름',
            notBetween: '{FORMULA1}와 {FORMULA2} 사이 아님',
            legal: '유효한 {TYPE} 형식',
        },
        errorMsg: {
            between: '값은 {FORMULA1}와 {FORMULA2} 사이여야 합니다',
            greaterThan: '값은 {FORMULA1} 초과여야 합니다',
            greaterThanOrEqual: '값은 {FORMULA1} 이상이어야 합니다',
            lessThan: '값은 {FORMULA1} 미만이어야 합니다',
            lessThanOrEqual: '값은 {FORMULA1} 이하이어야 합니다',
            equal: '값은 {FORMULA1}와 같아야 합니다',
            notEqual: '값은 {FORMULA1}와 달라야 합니다',
            notBetween: '값은 {FORMULA1}와 {FORMULA2} 사이가 아니어야 합니다',
            legal: '값은 유효한 {TYPE} 형식이어야 합니다',
        },
        any: {
            title: '모든 값',
            error: '이 셀의 내용이 유효성 검사 규칙을 위반했습니다',
        },
        date: {
            title: '날짜',
            operators: {
                between: '사이',
                greaterThan: '이후',
                greaterThanOrEqual: '이거나 이후',
                lessThan: '이전',
                lessThanOrEqual: '이거나 이전',
                equal: '같음',
                notEqual: '다름',
                notBetween: '사이가 아님',
                legal: '유효한 날짜',
            },
            ruleName: {
                between: '{FORMULA1}와 {FORMULA2} 사이',
                greaterThan: '{FORMULA1} 이후',
                greaterThanOrEqual: '{FORMULA1} 이거나 이후',
                lessThan: '{FORMULA1} 이전',
                lessThanOrEqual: '{FORMULA1} 이거나 이전',
                equal: '{FORMULA1}와 같음',
                notEqual: '{FORMULA1}와 다름',
                notBetween: '{FORMULA1}와 {FORMULA2} 사이 아님',
                legal: '유효한 날짜',
            },
            errorMsg: {
                between: '값은 유효한 날짜이며 {FORMULA1}와 {FORMULA2} 사이여야 합니다',
                greaterThan: '값은 유효한 날짜이며 {FORMULA1} 이후여야 합니다',
                greaterThanOrEqual: '값은 유효한 날짜이며 {FORMULA1} 이거나 이후여야 합니다',
                lessThan: '값은 유효한 날짜이며 {FORMULA1} 이전이어야 합니다',
                lessThanOrEqual: '값은 유효한 날짜이며 {FORMULA1} 이거나 이전이어야 합니다',
                equal: '값은 유효한 날짜이며 {FORMULA1}와 같아야 합니다',
                notEqual: '값은 유효한 날짜이며 {FORMULA1}와 달라야 합니다',
                notBetween: '값은 유효한 날짜이며 {FORMULA1}와 {FORMULA2} 사이가 아니어야 합니다',
                legal: '값은 유효한 날짜여야 합니다',
            },
        },
        list: {
            title: '목록',
            name: '목록 범위 내 값',
            error: '입력 값이 지정된 범위 내에 있어야 합니다',
            emptyError: '값을 입력하세요',
            add: '추가',
            dropdown: '목록 표시',
            options: '옵션',
            customOptions: '사용자 지정',
            refOptions: '범위 참조',
            formulaError: '목록 소스는 구분된 목록이거나 단일 행 또는 열 참조여야 합니다',
            edit: '수정',
        },
        listMultiple: {
            title: '복수 선택 목록',
            dropdown: '여러 항목 선택',
        },
        textLength: {
            title: '텍스트 길이',
            errorMsg: {
                between: '텍스트 길이는 {FORMULA1}와 {FORMULA2} 사이여야 합니다',
                greaterThan: '텍스트 길이는 {FORMULA1} 초과여야 합니다',
                greaterThanOrEqual: '텍스트 길이는 {FORMULA1} 이상이어야 합니다',
                lessThan: '텍스트 길이는 {FORMULA1} 미만이어야 합니다',
                lessThanOrEqual: '텍스트 길이는 {FORMULA1} 이하이어야 합니다',
                equal: '텍스트 길이는 {FORMULA1}와 같아야 합니다',
                notEqual: '텍스트 길이는 {FORMULA1}와 달라야 합니다',
                notBetween: '텍스트 길이는 {FORMULA1}와 {FORMULA2} 사이가 아니어야 합니다',
            },
        },
        decimal: {
            title: '숫자',
        },
        whole: {
            title: '정수',
        },
        checkbox: {
            title: '체크박스',
            error: '이 셀의 내용이 유효성 검사 규칙을 위반했습니다',
            tips: '셀 내 사용자 지정 값을 사용하세요',
            checked: '선택된 값',
            unchecked: '선택되지 않은 값',
        },
        custom: {
            title: '사용자 지정 수식',
            error: '이 셀의 내용이 유효성 검사 규칙을 위반했습니다',
            validFail: '유효한 수식을 입력하세요',
            ruleName: '사용자 지정 수식: {FORMULA1}',
        },
        alert: {
            title: '오류',
            ok: '확인',
        },
        error: {
            title: '잘못된 값:',
        },
        renderMode: {
            arrow: '화살표',
            chip: '칩',
            text: '일반 텍스트',
            label: '표시 스타일',
        },
        showTime: {
            label: '시간 선택기 표시',
        },
    },
};

export default locale;
