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
    'docs-toc-ui': {
        tableOfContents: {
            title: '目录',
            insertTitle: '插入目录',
            automaticTitle: '自动目录',
            customTitle: '自定义目录…',
            contentsTitle: '目录',
            levels: '显示级别',
            showPageNumbers: '显示页码',
            rightAlignPageNumbers: '页码右对齐',
            tabLeader: '制表符前导符',
            leaderNone: '无',
            leaderDots: '点线',
            leaderDashes: '短划线',
            leaderUnderline: '下划线',
            format: '格式',
            formatFromTemplate: '来自模板',
            formatClassic: '经典',
            formatModern: '现代',
            formatSimple: '简洁',
            preview: '打印预览',
            previewHeading: '标题',
            noHeadings: '未找到标题。请先应用标题 1–3 样式，或选择匹配的标题级别。',
            updateTitle: '更新目录',
            removeTitle: '删除目录',
            updatePageNumbersOnly: '只更新页码',
            updateEntireTable: '更新整个目录',
            updateHint: '请选择 Univer 更新此目录的方式。',
        },
    },
};

export default locale;
