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
    docImage: {
        title: '圖片',

        upload: {
            float: '插入圖片',
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
    'image-text-wrap': {
        title: '文繞圖',
        wrappingStyle: '文繞圖方式',
        square: '矩形',
        topAndBottom: '上及下',
        inline: '與文字排列',
        behindText: '文字在前',
        inFrontText: '文字在後',
        wrapText: '自動換行',
        bothSide: '兩側',
        leftOnly: '僅左側',
        rightOnly: '僅右側',
        distanceFromText: '與文字距離',
        top: '上（px）',
        left: '左（px）',
        bottom: '下（px）',
        right: '右（px）',
    },
    'image-position': {
        title: '位置',
        horizontal: '水平',
        vertical: '垂直',
        absolutePosition: '絕對位置（px）',
        relativePosition: '相對位置',
        toTheRightOf: '右側',
        relativeTo: '相對於',
        bellow: '下方',
        options: '選項',
        moveObjectWithText: '物件隨文字移動',
        column: '欄',
        margin: '邊界',
        page: '頁面',
        line: '行',
        paragraph: '段落',
    },
    'update-status': {
        exceedMaxSize: '圖片大小超過限制, 限制為{0}M',
        invalidImageType: '圖片類型錯誤',
        exceedMaxCount: '圖片只能一次上傳{0}張',
        invalidImage: '無效圖片',
    },
};

export default locale;
