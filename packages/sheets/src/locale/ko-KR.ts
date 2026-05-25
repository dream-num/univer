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
        },
        autoFill: {
            copy: '셀 복사',
            series: '시리즈 채우기',
            formatOnly: '서식만',
            noFormat: '서식 없음',
        },
    },
};

export default locale;
