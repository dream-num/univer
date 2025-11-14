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
    },
};

export default locale;
