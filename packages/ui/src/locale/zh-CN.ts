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
import emojiLocale from './emoji-locale/zh-CN.generated';

const locale: typeof enUS = {
    ui: {
        featureSearch: {
            title: '搜索功能',
            placeholder: '输入功能或菜单名称…',
            empty: '未找到当前可用的功能',
            ribbon: '功能区',
            contextMenu: '右键菜单',
        },
        emojiPicker: {
            search: '搜索',
            random: '随机表情',
            recents: '最近使用',
            emojis: '表情',
            animals: '动物',
            food: '食物',
            activities: '活动',
            places: '地点',
            objects: '物品',
            symbols: '符号',
            searchResults: '搜索结果',
            noResults: '未找到表情',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: '数学',
            greek: '希腊字母',
            common: '常用',
        },
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
        navigation: {
            back: '返回',
            previous: '上一个',
            next: '下一个',
        },
        sidebar: {
            panel: '侧边栏',
            resize: '调整侧边栏大小',
            close: '关闭侧边栏',
        },
        beforeClose: {
            title: '部分更改尚未保存',
        },
        clipboard: {
            authentication: {
                title: '无法访问剪贴板',
                content: '请允许 Univer 访问您的剪贴板。',
            },
        },
        rangeSelector: {
            cancel: '取消',
        },
        'global-shortcut': '全局快捷键',
        row: '行',
        column: '列',
    },
};

export default locale;
