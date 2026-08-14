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
        ribbon: {
            setCheckbox: '設定核取方塊',
            clearCheckbox: '清除核取方塊',
            dropdownPresetTitle: '套用預設：',
            editDropdown: '編輯選項',
            clearDropdown: '清除下拉式選單',
            dateTime: '日期時間',
            presets: {
                yes: '是',
                no: '否',
                notStarted: '尚未開始',
                inProgress: '進行中',
                completed: '已完成',
                option1: '選項 1',
                option2: '選項 2',
            },
        },
        operators: {
            legal: '是合法類型',
        },
        validFail: {
            formulaError: '引用範圍內包含不可見的數據，請重新調整範圍',
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
        date: {
            title: '日期',
        },
        list: {
            title: '下拉選單',
            add: '新增選項',
            options: '選項來源',
            customOptions: '自訂',
            refOptions: '引用資料',
            edit: '編輯',
        },
        checkbox: {
            title: '複選框',
            tips: '在儲存格內使用自訂值',
            checked: '選取值',
            unchecked: '未選取值',
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
