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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    toolbar: {
        heading: {
            normal: '正文',
            title: '標題',
            subTitle: '副標題',
            1: '標題 1',
            2: '標題 2',
            3: '標題 3',
            4: '標題 4',
            5: '標題 5',
            6: '標題 6',
            tooltip: '設定標題',
        },
    },
    ribbon: {
        start: '開始',
        insert: '插入',
        formulas: '公式',
        data: '資料',
        view: '視圖',
        others: '其他',
        more: '更多',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftYaHei: '微軟雅黑',
        SimSun: '宋體',
        SimHei: '黑體',
        Kaiti: '楷體',
        FangSong: '仿宋',
        NSimSun: '新宋體',
        STXinwei: '華文新魏',
        STXingkai: '華文行楷',
        STLiti: '華文隸書',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    'shortcut-panel': {
        title: '快捷鍵面板',
    },
    shortcut: {
        undo: '撤銷',
        redo: '重做',
        cut: '剪切',
        copy: '複製',
        paste: '貼上',
        'shortcut-panel': '開啟收起快捷鍵面板',
    },
    'common-edit': '常用編輯',
    'toggle-shortcut-panel': '開啟收起快速鍵面板',
    clipboard: {
        authentication: {
            title: '無法存取剪貼簿',
            content: '請允許 Univer 存取您的剪貼簿。 ',
        },
    },
    textEditor: {
        formulaError: '請輸入合法的公式，例如=SUM(A1)',
        rangeError: '請輸入合法的範圍，例如 A1:B10',
    },
    rangeSelector: {
        title: '選擇一個資料範圍',
        addAnotherRange: '新增範圍',
        buttonTooltip: '選擇資料範圍',
        placeHolder: '框選範圍或輸入',
        confirm: '確認',
        cancel: '取消',
    },
    'global-shortcut': '全域快捷鍵',
    'zoom-slider': {
        resetTo: '恢復至',
    },
};

export default locale;
