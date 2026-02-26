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
    sheetImage: {
        title: '圖片',

        upload: {
            float: '浮動圖片',
            cell: '儲存格圖片',
        },

        panel: {
            title: '編圖',
        },

        save: {
            title: '儲存儲存格圖片',
            menuLabel: '儲存儲存格圖片',
            imageCount: '圖片數量',
            fileNameConfig: '檔案名稱',
            useRowCol: '使用儲存格地址 (A1, B2...)',
            useColumnValue: '使用某欄的值',
            selectColumn: '選擇欄',
            cancel: '取消',
            confirm: '儲存',
            saving: '儲存中...',
            error: '儲存儲存格圖片失敗',
        },
    },
    'image-popup': {
        replace: '替換',
        delete: '刪除',
        edit: '編輯',
        crop: '裁切',
        reset: '重置大小',
        flipH: '水平翻轉',
        flipV: '垂直翻轉',
    },
    'drawing-anchor': {
        title: '錨點屬性',
        both: '與儲存格一起移動和調整大小',
        position: '移動但不調整大小與儲存格',
        none: '不要移動或調整大小與儲存格',
    },
    'update-status': {
        exceedMaxSize: '圖片大小超過限制, 限制為{0}M',
        invalidImageType: '圖片類型錯誤',
        exceedMaxCount: '圖片只能一次上傳{0}張',
        invalidImage: '無效圖片',
    },
    'cell-image': {
        pasteTitle: '貼上為儲存格圖片',
        pasteContent: '貼上儲存格圖片將覆蓋儲存格中的現有內容，繼續貼上',
        pasteError: '此儲存格不支援儲存格圖片複製貼上',
    },
};

export default locale;
