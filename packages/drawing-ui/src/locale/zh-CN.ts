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
        ole: {
            progressReading: '正在读取附件…',
            progressUploading: '正在上传附件…',
            progressCreating: '正在创建在线文件…',
            progressSaving: '正在保存链接…',
            externalAttachment: '外链附件',
            externalHint: '此附件引用的原文件未嵌入当前文档，无法预览或下载。',
            missingHint: '当前文档缺少此附件的数据，无法预览或下载。',
            unavailableSummary: '文档中有 {0} 个不可用附件，已保留占位。悬停警告图标可查看原因。',
            rename: '重命名',
            saveName: '保存名称',
            cancel: '取消',
            invalidName: '请输入有效文件名，最多 255 个字符。',
            renameFailed: '无法重命名此附件，请重试。',
            actions: '附件操作',
            linkSaveFailed: '在线文件已创建，但链接保存失败。请重试保存链接。',
            conversionFailed: '附件转换失败，请重试。',
            converted: '转换完成',
            open: '打开',
            converting: '正在转换…',
            openSlide: '在新标签页打开在线幻灯片',
            openDoc: '在新标签页打开在线文档',
            openSheet: '在新标签页打开在线表格',
            convertSlide: '转换为在线幻灯片',
            convertDoc: '转换为在线文档',
            convertSheet: '转换为在线表格',
            nativePreviewHint: '如果浏览器无法显示此文件，请下载原文件。',
            attachment: 'OLE 附件',
            external: '外链文件不可用',
            missing: '附件数据不可用',
            opaque: '原始 OLE 二进制（可下载）',
            download: '下载',
            preview: '预览',
            remove: '删除',
            failed: '无法读取原始附件，请重试。',
            unsupported: '此文件暂不支持预览，可以下载原文件。',
        },
        mobile: { close: '关闭', more: '更多' },
        'image-cropper': {
            error: '无法裁剪非图片元素',
        },
        objectListPanel: {
            title: '图层',
            empty: '暂无对象',
            showAll: '全部显示',
            hideAll: '全部隐藏',
            lockAll: '全部锁定',
            unlockAll: '全部解锁',
            moveForward: '上移一层',
            moveBackward: '下移一层',
            close: '关闭',
            show: '显示',
            hide: '隐藏',
            lock: '锁定',
            unlock: '解锁',
            lockHint: '锁定，防止误选',
            unlockHint: '已锁定，点击解锁',
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
                cancel: '取消',
                apply: '完成',
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
            square: '四周型',
            topAndBottom: '上下型',
            inline: '嵌入型',
            behindText: '衬于文字下方',
            inFrontText: '浮于文字上方',
        },
    },
};

export default locale;
