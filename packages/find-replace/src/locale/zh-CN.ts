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

const locale = {
    'find-replace': {
        toolbar: '查找替换',
        shortcut: {
            'open-find-dialog': '打开查找对话框',
            'open-replace-dialog': '打开替换对话框',
            'close-dialog': '关闭查找替换对话框',
            'go-to-next-match': '下一个匹配项',
            'go-to-previous-match': '下一个匹配项',
            'focus-selection': '聚焦选区',
        },
        dialog: {
            title: '查找',
            find: '查找',
            replace: '替换',
            'replace-all': '替换全部',
            'find-placeholder': '输入查找内容',
            'advanced-finding': '替换 / 高级查找',
            'replace-placeholder': '输入替换内容',
            'case-sensitive': '匹配大小写',
            'match-the-whole-cell': '匹配整个单元格',
            'find-scope': {
                title: '查找范围',
                'current-sheet': '当前子表',
                workbook: '整个工作簿',
            },
            'find-direction': {
                title: '查找顺序',
                column: '按列查找',
                row: '按行查找',
            },
            'find-by': {
                title: '查找方式',
                formula: '查找公式',
                value: '查找值',
            },
            'no-match': '已完成搜索，但是未找到任何匹配项',
            'no-result': '无结果',
        },
        replace: {
            'all-success': '已全部替换 {0} 个匹配项',
            'all-failure': '替换失败',
            confirm: {
                title: '确定要替换所有的匹配项吗？',
            },
        },
    },
    'find-replace-shortcuts': '查找替换',
};

export default locale;
