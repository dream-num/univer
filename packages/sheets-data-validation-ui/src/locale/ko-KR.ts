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
    'sheets-data-validation-ui': {
        title: '데이터 유효성 검사',
        ribbon: {
            setCheckbox: '체크박스 설정',
            clearCheckbox: '체크박스 지우기',
            dropdownPresetTitle: '프리셋 적용:',
            editDropdown: '옵션 편집',
            clearDropdown: '드롭다운 지우기',
            dateTime: '날짜 및 시간',
            presets: {
                yes: '예',
                no: '아니요',
                notStarted: '시작 전',
                inProgress: '진행 중',
                completed: '완료',
                option1: '옵션 1',
                option2: '옵션 2',
            },
        },
        operators: {
            legal: '유효한 형식',
        },
        validFail: {
            formulaError: '참조 범위에 보이지 않는 데이터가 포함되어 있습니다. 범위를 다시 설정하세요',
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
        date: {
            title: '날짜',
        },
        list: {
            title: '목록',
            add: '추가',
            options: '옵션',
            customOptions: '사용자 지정',
            refOptions: '범위 참조',
            edit: '수정',
        },
        checkbox: {
            title: '체크박스',
            tips: '셀 내 사용자 지정 값을 사용하세요',
            checked: '선택된 값',
            unchecked: '선택되지 않은 값',
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
        permission: {
            dialog: {
                setStyleErr: '해당 범위는 보호되어 있어 스타일 지정 권한이 없습니다. 스타일을 변경하려면 작성자에게 문의하세요.',
            },
        },
    },
};

export default locale;
