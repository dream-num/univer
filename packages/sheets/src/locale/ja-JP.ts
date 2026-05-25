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
            sheetCopy: '(コピー{0})',
            sheet: 'シート',
        },
        info: {
            overlappingSelections: 'そのコマンドは、重なり合う選択範囲に対しては使用できません。',
            acrossMergedCell: '結合セルをまたいでいます',
            partOfCell: '結合セルの一部が選択されています',
            hideSheet: '表示されるシートがなくなるため、このシートを非表示にできません。',
        },
        definedName: {
            nameEmpty: '名前を空白にすることはできません',
            nameDuplicate: '名前が既に存在します',
            nameInvalid: '名前が無効です',
            nameSheetConflict: '名前がシート名と競合しています',
            formulaOrRefStringEmpty: '数式または参照文字列を空白にすることはできません',
            nameConflict: '名前が関数名と競合しています',
        },
        autoFill: {
            copy: 'セルをコピー',
            series: '系列を入力',
            formatOnly: '書式のみ',
            noFormat: '書式なし',
        },
    },
};

export default locale;
