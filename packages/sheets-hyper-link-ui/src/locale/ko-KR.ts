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
    hyperLink: {
        form: {
            editTitle: '링크 편집',
            addTitle: '링크 삽입',
            label: '표시 텍스트',
            type: '유형',
            link: '링크',
            linkPlaceholder: '링크 입력',
            range: '범위',
            worksheet: '워크시트',
            definedName: '정의된 이름',
            ok: '확인',
            cancel: '취소',
            labelPlaceholder: '표시할 텍스트 입력',
            inputError: '값을 입력하세요',
            selectError: '선택하세요',
            linkError: '유효한 링크를 입력하세요',
        },
        menu: {
            add: '링크 삽입',
        },
        message: {
            noSheet: '대상 워크시트가 삭제되었습니다',
            refError: '잘못된 범위입니다',
            hiddenSheet: '링크를 열 수 없습니다. 연결된 워크시트가 숨겨져 있습니다',
            coped: '링크가 클립보드에 복사되었습니다',
        },
        popup: {
            copy: '링크 복사',
            edit: '링크 편집',
            cancel: '링크 취소',
        },
    },
};

export default locale;
