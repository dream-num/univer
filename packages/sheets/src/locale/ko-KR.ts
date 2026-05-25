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
    sheets: {
        tabs: {
            sheetCopy: '(복사본{0})',
            sheet: '시트',
        },
        info: {
            overlappingSelections: '겹치는 영역에서는 해당 명령을 사용할 수 없습니다.',
            acrossMergedCell: '병합된 셀을 가로지름',
            partOfCell: '병합된 셀의 일부만 선택됨',
            hideSheet: '이 시트를 숨기면 표시되는 시트가 없습니다.',
        },
        definedName: {
            nameEmpty: '이름은 비워 둘 수 없습니다',
            nameDuplicate: '이미 존재하는 이름입니다',
            nameInvalid: '잘못된 이름입니다',
            nameSheetConflict: '이름이 시트 이름과 충돌합니다',
            formulaOrRefStringEmpty: '수식 또는 참조 문자열은 비워 둘 수 없습니다',
            nameConflict: '이름이 함수 이름과 충돌합니다',
            defaultName: '기본값',
        },
        permission: {
            dialog: {
                autoFillErr: '해당 범위는 보호되어 있어 자동 채우기 기능을 사용할 수 없습니다. 사용하려면 작성자에게 문의하세요.',
                editErr: '해당 범위는 보호되어 있어 편집 권한이 없습니다. 편집하려면 작성자에게 문의하세요.',
                formulaErr: '이 범위 또는 참조된 범위는 보호되어 있어 수식을 편집할 수 없습니다. 편집하려면 작성자에게 문의하세요.',
                insertOrDeleteMoveRangeErr: '삽입 또는 삭제한 범위가 보호된 범위와 겹치므로, 이 작업은 현재 지원되지 않습니다.',
                insertRowColErr: '해당 범위는 보호되어 있어 행이나 열을 삽입할 수 없습니다. 삽입하려면 작성자에게 문의하세요.',
                moveRangeErr: '해당 범위는 보호되어 있어 선택 영역을 이동할 수 없습니다. 이동하려면 작성자에게 문의하세요.',
                moveRowColErr: '해당 범위는 보호되어 있어 행이나 열을 이동할 수 없습니다. 이동하려면 작성자에게 문의하세요.',
                operatorSheetErr: '이 워크시트는 보호되어 있어 작업할 수 없습니다. 작업하려면 작성자에게 문의하세요.',
                removeRowColErr: '해당 범위는 보호되어 있어 행이나 열을 삭제할 수 없습니다. 삭제하려면 작성자에게 문의하세요.',
                setRowColStyleErr: '해당 범위는 보호되어 있어 행/열 스타일 지정 권한이 없습니다. 스타일을 변경하려면 작성자에게 문의하세요.',
                setStyleErr: '해당 범위는 보호되어 있어 스타일 지정 권한이 없습니다. 스타일을 변경하려면 작성자에게 문의하세요.',
            },
        },
        autoFill: {
            copy: '셀 복사',
            series: '시리즈 채우기',
            formatOnly: '서식만',
            noFormat: '서식 없음',
        },
        merge: {
            confirm: {
                title: '병합을 계속하면 왼쪽 상단 셀의 값만 유지되고 다른 값은 삭제됩니다. 계속하시겠습니까?',
                cancel: '병합 취소',
                confirm: '병합 계속',
                warning: '경고',
                dismantleMergeCellWarning: '일부 병합된 셀이 분할됩니다. 계속하시겠습니까?',
            },
        },
    },
};

export default locale;
