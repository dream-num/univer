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
            sheetCopy: '（副本{0}）',
            sheet: '工作表',
        },
        info: {
            overlappingSelections: '無法對重疊選區使用該命令',
            acrossMergedCell: '無法跨越合併儲存格',
            partOfCell: '僅選擇了合併儲存格的一部份',
            hideSheet: '隱藏後無可見工作表',
        },
        definedName: {
            nameEmpty: '名稱不能為空',
            nameDuplicate: '名稱已存在',
            nameInvalid: '名稱無效',
            nameSheetConflict: '名稱與工作表名稱衝突',
            formulaOrRefStringEmpty: '公式或引用字串不能為空',
            nameConflict: '名稱與函數名稱衝突',
            defaultName: 'DefinedName',
        },
        permission: {
            dialog: {
                autoFillErr: '範圍已被保護，目前無自動填入權限。如需自動填充，請聯絡建立者。 ',
                editErr: '該範圍已被保護，目前無編輯權限。如需編輯，請聯絡創建者。 ',
                formulaErr: '該範圍或引用範圍已被保護，目前無編輯權限。如需編輯，請聯絡創建者。 ',
                insertOrDeleteMoveRangeErr: '插入、刪除區域與保護範圍相交，暫不支援此操作。 ',
                insertRowColErr: '該範圍已被保護，目前無插入欄列權限。如需插入欄列，請聯絡創作者。 ',
                moveRangeErr: '該範圍已被保護，目前無移動選取範圍權限。如需移動選區，請聯絡創作者。 ',
                moveRowColErr: '該範圍已被保護，目前無移動欄列權限。如需行動欄列，請聯絡創作者。 ',
                operatorSheetErr: '該工作表已被保護，目前無操作工作表權限。如需操作工作表，請聯絡創建者。 ',
                removeRowColErr: '該範圍已被保護，目前無刪除欄列權限。如需刪除欄列，請聯絡創作者。 ',
                setRowColStyleErr: '該範圍已被保護，目前無設定欄列樣式權限。如需設定欄列樣式，請聯絡建立者。 ',
                setStyleErr: '該範圍已被保護，目前無設定樣式權限。如需設定樣式，請聯絡建立者。 ',
            },
        },
        autoFill: {
            copy: '複製儲存格',
            series: '填入數列',
            formatOnly: '僅格式',
            noFormat: '無格式',
        },
        merge: {
            confirm: {
                title: '繼續合併將只保留左上角儲存格的值，捨棄其他值。您確定要繼續嗎？',
                cancel: '取消合併',
                confirm: '繼續合併',
                warning: '警告',
                dismantleMergeCellWarning: '這將導致一些合併儲存格被拆分。您要繼續嗎？',
            },
        },
    },
};

export default locale;
