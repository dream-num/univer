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
        title: '資料驗證',
        operators: {
            legal: '是合法類型',
        },
        validFail: {
            value: '請輸入一個合法值',
            common: '請輸入數值或公式',
            number: '請輸入合法的數字或公式',
            formula: '請輸入合法的公式',
            integer: '請輸入合法的整數或公式',
            date: '請輸入合法的日期或公式',
            list: '請輸入至少一個合法選項',
            listInvalid: '清單來源必須是分隔清單或單列或欄的參考。 ',
            checkboxEqual: '為勾選和未勾選的儲存格內容輸入不同的值。 ',
            formulaError: '引用範圍內包含不可見的數據，請重新調整範圍',
            listIntersects: '所選範圍不能和規則範圍相交',
            primitive: '自訂勾選和未勾選值不允許使用公式。 ',
        },
        panel: {
            title: '管理資料驗證',
            addTitle: '新資料驗證',
            removeAll: '全部刪除',
            add: '新建規則',
            range: '應用範圍',
            rangeError: '應用範圍不合法',
            type: '條件型別',
            options: '進階設定',
            operator: '資料',
            removeRule: '刪除規則',
            done: '確認',
            formulaPlaceholder: '請輸入數值或公式',
            valuePlaceholder: '請輸入值',
            formulaAnd: '與',
            invalid: '資料無效時',
            showWarning: '顯示警告',
            rejectInput: '拒絕輸入',
            messageInfo: '文字提示',
            showInfo: '顯示所選儲存格的提示文字',
            allowBlank: '忽略空值',
        },
        any: {
            title: '任意值',
            error: '此儲存格的內容違反了驗證規則',
        },
        date: {
            title: '日期',
        },
        list: {
            title: '下拉選單',
            name: '值必須是列表中的值',
            error: '輸入必須在指定的範圍內',
            emptyError: '請輸入一個值',
            add: '新增選項',
            dropdown: '單選',
            options: '選項來源',
            customOptions: '自訂',
            refOptions: '引用資料',
            formulaError: '列表來源必須是劃定分界後的資料列表,或是對單一列或欄的引用。',
            edit: '編輯',
        },
        listMultiple: {
            title: '下拉式選單-多選',
            dropdown: '多選',
        },
        textLength: {
            title: '文字長度',
        },
        decimal: {
            title: '數字',
        },
        whole: {
            title: '整數',
        },
        checkbox: {
            title: '複選框',
            error: '此儲存格的內容違反了驗證規則',
            tips: '在儲存格內使用自訂值',
            checked: '選取值',
            unchecked: '未選取值',
        },
        custom: {
            title: '自訂公式',
            error: '此儲存格的內容違反了驗證規則',
            validFail: '請輸入合法的公式',
        },
        alert: {
            title: '提示',
            ok: '確定',
        },
        error: {
            title: '無效：',
        },
        renderMode: {
            arrow: '箭頭',
            chip: '條狀標籤',
            text: '純文字',
            label: '顯示樣式',
        },
        showTime: {
            label: '展示時間選擇',
        },
        permission: {
            dialog: {
                setStyleErr: '該範圍已被保護，目前無設定樣式權限。如需設定樣式，請聯絡建立者。 ',
            },
        },
    },
};

export default locale;
