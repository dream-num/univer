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
    'sheets-drawing-ui': {
        title: '图片',
        uploadLoading: {
            loading: '正在上传，当前剩余',
        },

        upload: {
            float: '浮动图片',
            cell: '单元格图片',
        },

        panel: {
            title: '编辑图片',
        },

        save: {
            title: '保存单元格图片',
            menuLabel: '保存单元格图片',
            imageCount: '图片数量',
            fileNameConfig: '文件名',
            useRowCol: '使用单元格地址 (A1, B2...)',
            useColumnValue: '使用某列的值',
            selectColumn: '选择列',
            cancel: '取消',
            confirm: '保存',
            saving: '保存中...',
            error: '保存单元格图片失败',
        },
        'image-popup': {
            replace: '替换',
            delete: '删除',
            edit: '编辑',
            crop: '裁剪',
            reset: '重置大小',
            flipH: '水平翻转',
            flipV: '垂直翻转',
        },
        'update-status': {
            exceedMaxSize: '图片大小超过限制, 限制为{0}M',
            invalidImageType: '图片类型错误',
            exceedMaxCount: '图片只能一次上传{0}张',
            invalidImage: '无效图片',
        },
        'drawing-anchor': {
            title: '锚点属性',
            both: '与单元格一起移动和调整大小',
            position: '移动但不调整大小与单元格',
            none: '不要移动或调整大小与单元格',
        },
        'cell-image': {
            pasteTitle: '粘贴为单元格图片',
            pasteContent: '粘贴单元格图片将覆盖单元格中的现有内容，继续粘贴',
            pasteError: '此单元中不支持单元格图片复制粘贴',
        },
        permission: {
            dialog: {
                editErr: '该范围已被保护，目前无编辑权限。如需编辑，请联系创建者。',
            },
        },
        shortcut: {
            'drawing-view': '绘图视图',
            'drawing-move-down': '下移绘图',
            'drawing-move-up': '上移绘图',
            'drawing-move-left': '左移绘图',
            'drawing-move-right': '右移绘图',
            'drawing-delete': '删除绘图',
        },
    },
};

export default locale;
