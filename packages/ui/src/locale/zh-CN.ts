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
    toolbar: {
        heading: {
            normal: '正文',
            title: '标题',
            subTitle: '副标题',
            1: '标题1',
            2: '标题2',
            3: '标题3',
            4: '标题4',
            5: '标题5',
            6: '标题6',
            tooltip: '设置标题',
        },
    },
    ribbon: {
        start: '开始',
        startDesc: '初始化工作表并设置基本参数。',
        insert: '插入',
        insertDesc: '插入行、列、图表和各种其他元素。',
        formulas: '公式',
        formulasDesc: '使用函数和公式进行数据计算。',
        data: '数据',
        dataDesc: '管理数据，包括导入、排序和筛选。',
        view: '视图',
        viewDesc: '切换视图模式并调整显示效果。',
        others: '其他',
        othersDesc: '其他功能和设置。',
        more: '更多',
    },
    fontFamily: {
        'not-supported': '系统中未找到该字体，使用默认字体。',
        arial: 'Arial',
        'times-new-roman': 'Times New Roman',
        tahoma: 'Tahoma',
        verdana: 'Verdana',
        'microsoft-yahei': '微软雅黑',
        simsun: '宋体',
        simhei: '黑体',
        kaiti: '楷体',
        fangsong: '仿宋',
        nsimsun: '新宋体',
        stxinwei: '华文新魏',
        stxingkai: '华文行楷',
        stliti: '华文隶书',
    },
    'shortcut-panel': {
        title: '快捷键面板',
    },
    shortcut: {
        undo: '撤销',
        redo: '重做',
        cut: '剪切',
        copy: '复制',
        paste: '粘贴',
        'shortcut-panel': '打开收起快捷键面板',
    },
    'common-edit': '常用编辑',
    'toggle-shortcut-panel': '打开收起快捷键面板',
    clipboard: {
        authentication: {
            title: '无法访问剪贴板',
            content: '请允许 Univer 访问您的剪贴板。',
        },
    },
    textEditor: {
        formulaError: '请输入合法的公式，例如=SUM(A1)',
        rangeError: '请输入合法的范围，例如 A1:B10',
    },
    rangeSelector: {
        title: '选择一个数据范围',
        addAnotherRange: '添加范围',
        buttonTooltip: '选择数据范围',
        placeHolder: '框选范围或输入',
        confirm: '确认',
        cancel: '取消',
    },
    'global-shortcut': '全局快捷键',
    'zoom-slider': {
        resetTo: '恢复至',
    },
};

export default locale;
