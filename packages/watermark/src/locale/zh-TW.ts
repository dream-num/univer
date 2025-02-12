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
    'univer-watermark': {
        title: '浮水印',
        type: '類型',
        text: '文字',
        image: '圖片',
        uploadImage: '上傳圖片',
        replaceImage: '替換圖片',
        keepRatio: '保持比例',
        width: '長度',
        height: '高度',
        style: '樣式設置',
        content: '內容',
        textPlaceholder: '請輸入文字',
        fontSize: '字體大小',
        direction: '方向',
        ltr: '從左到右',
        rtl: '從右到左',
        inherits: '繼承',
        opacity: '透明度',
        layout: '佈局設置',
        rotate: '旋轉',
        repeat: '重複',
        spacingX: '水平間距',
        spacingY: '垂直間距',
        startX: '水平起始位置',
        startY: '垂直起始位置',

        cancel: '取消浮水印',
        close: '關閉面板',
        copy: '複製配置',
    },
};

export default locale;
