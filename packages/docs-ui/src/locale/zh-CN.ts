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
            undo: '撤销',
            redo: '重做',
            font: '字体',
            fontSize: '字号',
            bold: '粗体',
            italic: '斜体',
            strikethrough: '删除线',
            subscript: '下标',
            superscript: '上标',
            underline: '下划线',
            textColor: {
                main: '文本颜色',
            },
            fillColor: {
                main: '文本背景色',
            },
            table: {
                main: '表格',
                insert: '插入表格',
                colCount: '列数',
                rowCount: '行数',
            },
            resetColor: '重置颜色',
            order: '有序列表',
            unorder: '无序列表',
            checklist: '任务列表',
            documentFlavor: '现代模式',
            alignLeft: '左对齐',
            alignCenter: '居中对齐',
            alignRight: '右对齐',
            alignJustify: '两端对齐',
            horizontalLine: '水平分割线',
            headerFooter: '页眉页脚',
            pageSetup: '页面设置',
            heading: {
                tooltip: '标题',
                normal: '普通文本',
                leading1: '标题1',
                leading2: '标题2',
                leading3: '标题3',
                leading4: '标题4',
                leading5: '标题5',
                title: '标题',
                subTitle: '副标题',
            },
        },
        table: {
            insert: '插入',
            insertRowAbove: '上方插入行',
            insertRowBelow: '下方插入行',
            insertColumnLeft: '左方插入列',
            insertColumnRight: '右方插入列',
            delete: '表格删除',
            deleteRows: '删除行',
            deleteColumns: '删除列',
            deleteTable: '删除表格',
        },
        headerFooter: {
            linkToPrevious: '链接到上一节',
            header: '页眉',
            footer: '页脚',
            panel: '页眉页脚设置',
            firstPageCheckBox: '首页不同',
            oddEvenCheckBox: '奇偶页不同',
            headerTopMargin: '页眉顶端距离',
            footerBottomMargin: '页脚底端距离',
            closeHeaderFooter: '关闭页眉页脚',
            disableText: '页眉页脚设置不可用',
        },
        placeholder: {
            heading1: '标题1',
            heading2: '标题2',
            heading3: '标题3',
            heading4: '标题4',
            heading5: '标题5',
            normalText: '请输入文字或按"/"启用命令',
            listItem: '项目',
        },
        doc: {
            blockMenu: {
                dragBlock: '拖动块',
            },

            menu: {
                paragraphSetting: '段落设置',
                sectionSetting: '节设置',
            },
            slider: {
                paragraphSetting: '段落设置',
                sectionSetting: '节设置',
            },
            paragraphSetting: {
                alignment: '对齐方式',
                indentation: '缩进',
                left: '左边距',
                right: '右边距',
                firstLine: '首行',
                hanging: '悬挂',
                spacing: '间距',
                before: '段落前',
                after: '段落后',
                lineSpace: '行距',
                multiSpace: '多倍行距',
                atLeast: '至少值(px)',
                exactly: '固定值(px)',
                fixedValue: '固定值(px)',
            },
            sectionSetting: {
                selectedSections: '已选择 {0} 个节',
                columnCount: '栏数',
                columnGap: '栏间距',
                columnSeparator: '分隔线',
                none: '无',
                betweenColumns: '栏间分隔线',
                sectionStart: '节起始位置',
                unspecified: '未指定',
                continuous: '连续',
                nextPage: '下一页',
                evenPage: '偶数页',
                oddPage: '奇数页',
            },
        },
        rightClick: {
            copy: '复制',
            cut: '剪切',
            paste: '粘贴',
            delete: '删除',
            bulletList: '无序列表',
            orderList: '有序列表',
            checkList: '任务列表',
            insertBellow: '在下方插入',
        },
        paragraphMenu: {
            alignAndIndent: '对齐和缩进',
            align: '对齐',
            indent: '缩进',
            color: '颜色',
            increase: '增加',
            decrease: '减少',
            increaseIndent: '增加缩进',
            decreaseIndent: '减少缩进',
            defaultTextColor: '默认文字颜色',
            noBackground: '无背景色',
        },
        'page-settings': {
            'document-setting': '文档设置',
            mode: '模式',
            'modern-mode': '现代模式',
            'classic-mode': '经典模式',
            'modern-width': '内容宽度',
            'modern-width-narrow': '窄',
            'modern-width-medium': '适中',
            'modern-width-wide': '宽',
            'page-size': {
                main: '纸张大小',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: '美式信纸',
                legal: '美式法律用纸',
                tabloid: '小报尺寸',
                statement: '声明用纸',
                executive: '行政用纸',
                folio: '对开纸',
            },
            'paper-size': '纸张大小',
            orientation: '方向',
            portrait: '纵向',
            landscape: '横向',
            'custom-paper-size': '自定义纸张大小',
            top: '上',
            bottom: '下',
            left: '左',
            right: '右',
            cancel: '取消',
            confirm: '确认',
        },
    },
};

export default locale;
