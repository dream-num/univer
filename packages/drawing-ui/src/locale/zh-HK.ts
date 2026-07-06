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
        'image-cropper': {
            error: '無法裁切非圖片元素',
        },
        objectListPanel: {
            title: '物件',
            empty: '暫無物件',
            showAll: '全部顯示',
            hideAll: '全部隱藏',
            moveForward: '上移一層',
            moveBackward: '下移一層',
            close: '關閉',
            show: '顯示',
            hide: '隱藏',
            lock: '鎖定',
            unlock: '解鎖',
            name: '名稱',
            nameInput: '物件名稱',
            description: '描述',
            descriptionPlaceholder: '新增描述',
            details: '詳情',
            locate: '定位',
            expand: '展開',
            collapse: '摺疊',
            dragToReorder: '拖曳調整圖層',
            search: '搜尋物件',
            filterAll: '全部',
            filterHidden: '隱藏',
            filterLocked: '鎖定',
            sectionCanvas: '畫布層',
            sectionFloating: '浮動層',
            typeNames: {
                object: '物件',
                shape: '形狀',
                connector: '連接線',
                image: '圖片',
                chart: '圖表',
                table: '表格',
                smartArt: 'SmartArt',
                video: '影片',
                group: '群組',
                unit: '單元',
                dom: 'DOM',
                text: '文字',
                placeholder: '佔位符',
                container: '容器',
            },
            noSelection: '請選取一個物件以編輯詳細資訊',
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
        'image-popup': {
            replace: '替換',
            delete: '刪除',
            edit: '編輯',
            crop: '裁切',
            reset: '重置大小',
        },
    },
};

export default locale;
