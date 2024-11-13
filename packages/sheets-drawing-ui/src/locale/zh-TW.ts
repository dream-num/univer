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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    sheetImage: {
        title: '圖片',

        upload: {
            float: '浮動圖片',
            cell: '儲存格圖片',
        },

        panel: {
            title: '編圖',
        },
    },
    'image-popup': {
        replace: '替換',
        delete: '刪除',
        edit: '編輯',
        crop: '裁切',
        reset: '重置大小',
    },
    'drawing-anchor': {
        title: '錨點屬性',
        both: '與儲存格一起移動和調整大小',
        position: '移動但不調整大小與儲存格',
        none: '不要移動或調整大小與單元格',
    },

    'update-status': {
        exceedMaxSize: '圖片大小超過限制, 限制為{0}M',
        invalidImageType: '圖片類型錯誤',
        exceedMaxCount: '圖片只能一次上傳{0}張',
        invalidImage: '無效圖片',
    },
    'sheet-drawing-view': '繪圖',
    shortcut: {
        sheet: {
            'drawing-move-down': '下移繪圖',
            'drawing-move-up': '上移繪圖',
            'drawing-move-left': '左移繪圖',
            'drawing-move-right': '右移繪圖',
            'drawing-delete': '刪除繪圖',
        },
    },
};

export default locale;
