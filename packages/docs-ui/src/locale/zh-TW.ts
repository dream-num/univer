/**
 * Copyright 2023-present DreamNum Inc.
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
        undo: '撤銷',
        redo: '重做',
        font: '字體',
        fontSize: '字號',
        bold: '粗體',
        italic: '斜體',
        strikethrough: '刪除線',
        subscript: '下標',
        superscript: '上標',
        underline: '底線',
        textColor: {
            main: '文字顏色',
            right: '顏色選擇',
        },
        fillColor: {
            main: '文字背景色',
            right: '背景色選擇',
        },
        table: {
            main: 'Table',
            insert: 'Insert Table',
            colCount: 'Column count',
            rowCount: 'Row count',
        },
        resetColor: '重置顏色',
        order: '有序列表',
        unorder: '無序列表',
        alignLeft: '左對齊',
        alignCenter: '居中對齊',
        alignRight: '右對齊',
        alignJustify: '兩端對齊',
        headerFooter: '頁眉頁腳',
        checklist: '任務列表',
        documentFlavor: '现代模式',
    },
    table: {
        insert: 'Insert',
        insertRowAbove: 'Insert row above',
        insertRowBelow: 'Insert row below',
        insertColumnLeft: 'Insert column left',
        insertColumnRight: 'Insert column right',
        delete: 'Table delete',
        deleteRows: 'Delete row',
        deleteColumns: 'Delete column',
        deleteTable: 'Delete table',
    },
    headerFooter: {
        header: '頁眉',
        footer: '頁腳',
        panel: '頁眉頁腳設置',
        firstPageCheckBox: '首頁不同',
        oddEvenCheckBox: '奇偶頁不同',
        headerTopMargin: '頁眉頂端距離（px）',
        footerBottomMargin: '頁腳底端距離（px）',
        closeHeaderFooter: '關閉頁眉頁腳',
        disableText: '頁眉頁腳設置不可用',
    },
    doc: {
        menu: {
            paragraphSetting: 'Paragraph Setting',
        },
        slider: {
            paragraphSetting: 'Paragraph Setting',
        },
        paragraphSetting: {
            alignment: 'Alignment',
            indentation: 'Indentation',
            left: 'Left',
            right: 'Right',
            firstLine: 'First Line',
            hanging: 'Hanging',
            spacing: 'Spacing',
            before: 'Before',
            after: 'After',
            lineSpace: 'Line Space',
            multiSpace: 'Multi Space',
            fixedValue: 'Fixed Value(px)',
        },
    },
};

export default locale;
