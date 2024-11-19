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

const locale = {
    sheetImage: {
        title: '图片',

        upload: {
            float: '浮动图片',
            cell: '单元格图片',
        },

        panel: {
            title: '编辑图片',
        },
    },
    'image-popup': {
        replace: '替换',
        delete: '删除',
        edit: '编辑',
        crop: '裁剪',
        reset: '重置大小',
    },
    'drawing-anchor': {
        title: '锚点属性',
        both: '与单元格一起移动和调整大小',
        position: '移动但不调整大小与单元格',
        none: '不要移动或调整大小与单元格',
    },
    'update-status': {
        exceedMaxSize: '图片大小超过限制, 限制为{0}M',
        invalidImageType: '图片类型错误',
        exceedMaxCount: '图片只能一次上传{0}张',
        invalidImage: '无效图片',
    },
    'sheet-drawing-view': '绘图',
    shortcut: {
        sheet: {
            'drawing-move-down': '下移绘图',
            'drawing-move-up': '上移绘图',
            'drawing-move-left': '左移绘图',
            'drawing-move-right': '右移绘图',
            'drawing-delete': '删除绘图',
        },
    },
};

export default locale;
