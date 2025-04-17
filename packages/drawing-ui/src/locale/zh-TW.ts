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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    'image-popup': {
        replace: '替換',
        delete: '刪除',
        edit: '編輯',
        crop: '裁切',
        reset: '重置大小',
    },
    'image-cropper': {
        error: '無法裁切非圖片元素',
    },
    'image-panel': {
        arrange: {
            title: '排列',
            forward: '上移一層',
            backward: '下移一層',
            front: '置於頂層',
            back: '置於底層',
        },
        transform: {
            title: '變換',
            rotate: '旋轉 (°)',
            x: 'X (px)',
            y: 'Y (px)',
            width: '寬度 (px)',
            height: '高度 (px)',
            lock: '鎖定比例 (%)',
        },
        crop: {
            title: '裁切',
            start: '開始裁切',
            mode: '自由比例裁切',
        },
        group: {
            title: '組合',
            group: '組合',
            reGroup: '重新組合',
            unGroup: '取消組合',
        },
        align: {
            title: '對齊方式',
            default: '選擇對齊方式',
            left: '左對齊',
            center: '水平居中',
            right: '右對齊',
            top: '頂部對齊',
            middle: '垂直居中',
            bottom: '底部對齊',
            horizon: '水平分佈',
            vertical: '垂直分佈',
        },
        null: '未選取任何物件',
    },
    'drawing-view': '繪圖',
    shortcut: {
        'drawing-move-down': '下移繪圖',
        'drawing-move-up': '上移繪圖',
        'drawing-move-left': '左移繪圖',
        'drawing-move-right': '右移繪圖',
        'drawing-delete': '刪除繪圖',
    },
};

export default locale;
