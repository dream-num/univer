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
    'drawing-ui': {
        'image-cropper': {
            error: '无法裁剪非图片元素',
        },
        objectListPanel: {
            title: '对象',
            empty: '暂无对象',
            showAll: '全部显示',
            hideAll: '全部隐藏',
            moveForward: '上移一层',
            moveBackward: '下移一层',
            close: '关闭',
            show: '显示',
            hide: '隐藏',
            lock: '锁定',
            unlock: '解锁',
            name: '名称',
            nameInput: '对象名称',
            description: '描述',
            descriptionPlaceholder: '添加描述',
            details: '详情',
            locate: '定位',
            expand: '展开',
            collapse: '折叠',
            dragToReorder: '拖拽调整层级',
            search: '搜索对象',
            filterAll: '全部',
            filterHidden: '隐藏',
            filterLocked: '锁定',
            sectionCanvas: '画布层',
            sectionFloating: '浮动层',
            typeNames: {
                object: '对象',
                shape: '形状',
                connector: '连接线',
                image: '图片',
                chart: '图表',
                table: '表格',
                smartArt: 'SmartArt',
                video: '视频',
                group: '组合',
                unit: '单元',
                dom: 'DOM',
                text: '文本',
                placeholder: '占位符',
                container: '容器',
            },
            noSelection: '选择一个对象以编辑详情',
        },
        'image-panel': {
            arrange: {
                title: '排列',
                forward: '上移一层',
                backward: '下移一层',
                front: '置于顶层',
                back: '置于底层',
            },
            transform: {
                title: '变换',
                rotate: '旋转 (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: '宽度 (px)',
                height: '高度 (px)',
                lock: '锁定比例 (%)',
            },
            crop: {
                title: '裁剪',
                start: '开始裁剪',
                mode: '自由比例裁剪',
            },
            group: {
                title: '组合',
                group: '组合',
                unGroup: '取消组合',
            },
            align: {
                title: '对齐方式',
                default: '选择对齐方式',
                left: '左对齐',
                center: '水平居中',
                right: '右对齐',
                top: '顶部对齐',
                middle: '垂直居中',
                bottom: '底部对齐',
                horizon: '水平分布',
                vertical: '垂直分布',
            },
            null: '未选中任何对象',
        },
        'image-text-wrap': {
            title: '文字环绕',
            wrappingStyle: '环绕方式',
            square: '四周型',
            topAndBottom: '上下型',
            inline: '嵌入型',
            behindText: '衬于文字下方',
            inFrontText: '浮于文字上方',
            wrapText: '自动换行',
            bothSide: '两侧',
            leftOnly: '左侧',
            rightOnly: '右侧',
            distanceFromText: '距正文',
            top: '上（px）',
            left: '左（px）',
            bottom: '下（px）',
            right: '右（px）',
        },
        'image-popup': {
            replace: '替换',
            delete: '删除',
            edit: '编辑',
            crop: '裁剪',
            reset: '重置大小',
        },
    },
};

export default locale;
