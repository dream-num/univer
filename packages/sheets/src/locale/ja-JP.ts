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
            defaultName: 'デフォルト',
        },
        permission: {
            dialog: {
                autoFillErr: 'この範囲は保護されており、オートフィルを使用できません。使用するには作成者に連絡してください。',
                editErr: 'この範囲は保護されており、編集権限がありません。編集するには作成者に連絡してください。',
                formulaErr: 'この範囲または参照された範囲は保護されており、数式を編集できません。編集するには作成者に連絡してください。',
                insertOrDeleteMoveRangeErr: '挿入または削除した範囲が保護された範囲と重複しているため、この操作は現在サポートされていません。',
                insertRowColErr: 'この範囲は保護されており、行または列を挿入できません。挿入するには作成者に連絡してください。',
                moveRangeErr: 'この範囲は保護されており、選択範囲を移動できません。移動するには作成者に連絡してください。',
                moveRowColErr: 'この範囲は保護されており、行または列を移動できません。移動するには作成者に連絡してください。',
                operatorSheetErr: 'このワークシートは保護されており、操作できません。操作するには作成者に連絡してください。',
                removeRowColErr: 'この範囲は保護されており、行または列を削除できません。削除するには作成者に連絡してください。',
                setRowColStyleErr: 'この範囲は保護されており、行/列のスタイルを設定する権限がありません。変更するには作成者に連絡してください。',
                setStyleErr: 'この範囲は保護されており、スタイルを変更する権限がありません。変更するには作成者に連絡してください。',
            },
        },
        autoFill: {
            copy: 'セルをコピー',
            series: '系列を入力',
            formatOnly: '書式のみ',
            noFormat: '書式なし',
        },
        merge: {
            confirm: {
                title: '結合を続行すると、左上のセルの値のみが保持され、他の値は破棄されます。続行しますか？',
                cancel: '結合をキャンセル',
                confirm: '結合を続行',
                warning: '警告',
                dismantleMergeCellWarning: 'これにより、一部の結合セルが分割されます。続行しますか？',
            },
        },
    },
};

export default locale;
