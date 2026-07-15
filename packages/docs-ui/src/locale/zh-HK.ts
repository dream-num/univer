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
    'docs-ui': {
        toolbar: {
            undo: '撤銷',
            redo: '重做',
            font: '字型',
            fontSize: '字號',
            bold: '粗體',
            italic: '斜體',
            strikethrough: '刪除線',
            subscript: '下標',
            superscript: '上標',
            underline: '底線',
            textColor: {
                main: '文字顏色',
            },
            fillColor: {
                main: '文字背景色',
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
            checklist: '任務列表',
            documentFlavor: '现代模式',
            alignLeft: '左對齊',
            alignCenter: '居中對齊',
            alignRight: '右對齊',
            alignJustify: '兩端對齊',
            horizontalLine: 'Horizontal line',
            headerFooter: '頁眉頁腳',
            pageSetup: '頁面設置',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                leading1: 'Heading 1',
                leading2: 'Heading 2',
                leading3: 'Heading 3',
                leading4: 'Heading 4',
                leading5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
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
            linkToPrevious: '連結到上一節',
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
        placeholder: {
            heading1: '標題1',
            heading2: '標題2',
            heading3: '標題3',
            heading4: '標題4',
            heading5: '標題5',
            normalText: '請輸入文字或按"/"啟用命令',
            listItem: '項目',
        },
        doc: {
            blockMenu: {
                dragBlock: '拖曳區塊',
            },

            menu: {
                paragraphSetting: 'Paragraph Setting',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Paragraph Setting',
                sectionSetting: 'Section Settings',
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
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Fixed Value(px)',
            },
            sectionSetting: {
                selectedSections: '{0} sections selected',
                columnCount: 'Column count',
                columnGap: 'Column gap',
                columnSeparator: 'Separator',
                none: 'None',
                betweenColumns: 'Between columns',
                sectionStart: 'Section start',
                unspecified: 'Unspecified',
                continuous: 'Continuous',
                nextPage: 'Next page',
                evenPage: 'Even page',
                oddPage: 'Odd page',
            },
        },
        rightClick: {
            copy: '複製',
            cut: '剪切',
            paste: '貼上',
            delete: '刪除',
            bulletList: '無序列表',
            orderList: '有序列表',
            checkList: '任務列表',
            insertBellow: '在下方插入',
        },
        paragraphMenu: {
            alignAndIndent: '對齊與縮進',
            align: '對齊',
            indent: '縮進',
            color: '顏色',
            increase: '增加',
            decrease: '減少',
            increaseIndent: '增加縮進',
            decreaseIndent: '減少縮進',
            defaultTextColor: '預設文字顏色',
            noBackground: '無背景色',
        },
        'page-settings': {
            'document-setting': '文檔設置',
            mode: '模式',
            'modern-mode': '現代模式',
            'classic-mode': '經典模式',
            'modern-width': '內容寬度',
            'modern-width-narrow': '窄',
            'modern-width-medium': '適中',
            'modern-width-wide': '寬',
            'paper-size': '紙張大小',
            'page-size': {
                main: '紙張大小',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: '美式信紙',
                legal: '美式法律用紙',
                tabloid: '小報尺寸',
                statement: '聲明用紙',
                executive: '行政用紙',
                folio: '對開紙',
            },
            orientation: '方向',
            portrait: '縱向',
            landscape: '橫向',
            'custom-paper-size': '自定義紙張大小',
            top: '上',
            bottom: '下',
            left: '左',
            right: '右',
            cancel: '取消',
            confirm: '確認',
        },
    },
};

export default locale;
