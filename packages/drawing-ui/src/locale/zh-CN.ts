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
    'image-popup': {
        replace: '替换',
        delete: '删除',
        edit: '编辑',
        crop: '裁剪',
        reset: '重置大小',
    },
    'image-cropper': {
        error: '无法裁剪非图片元素',
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
            reGroup: '重新组合',
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
    'drawing-view': '绘图',
    shortcut: {
        'drawing-move-down': '下移绘图',
        'drawing-move-up': '上移绘图',
        'drawing-move-left': '左移绘图',
        'drawing-move-right': '右移绘图',
        'drawing-delete': '删除绘图',
    },
};

export default locale;
