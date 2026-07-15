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
    design: {
        Accessibility: {
            closeBadge: '關閉徽章',
            imageGallery: '圖片庫',
            image: '第 {0} 張圖片，共 {1} 張',
            zoomIn: '放大',
            zoomOut: '縮小',
            resetZoom: '重設縮放',
            increment: '增加',
            decrement: '減少',
        },
        Confirm: {
            cancel: '取消',
            confirm: '確定',
        },
        CascaderList: {
            empty: '無',
        },
        Calendar: {
            year: '年',
            weekDays: ['日', '一', '二', '三', '四', '五', '六'],
            months: [
                '一月',
                '二月',
                '三月',
                '四月',
                '五月',
                '六月',
                '七月',
                '八月',
                '九月',
                '十月',
                '十一月',
                '十二月',
            ],
            ariaLabels: {
                previousMonth: '上一個月',
                nextMonth: '下一個月',
                selectYear: '選擇年份',
                selectMonth: '選擇月份',
            },
        },
        Select: {
            empty: '無',
        },
        ColorPicker: {
            more: '更多顏色',
            cancel: '取消',
            confirm: '確定',
        },
        GradientColorPicker: {
            linear: '線性',
            radial: '徑向',
            angular: '角向',
            diamond: '菱形',
            offset: '偏移',
            angle: '角度',
            flip: '翻轉',
            delete: '刪除',
            transparency: '透明度',
        },
    },
};

export default locale;
