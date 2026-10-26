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
        ole: {
            progressReading: '正在讀取附件…',
            progressUploading: '正在上傳附件…',
            progressCreating: '正在建立線上檔案…',
            progressSaving: '正在儲存連結…',
            externalAttachment: '外部連結附件',
            externalHint: '此附件參照的原始檔案未嵌入目前文件，無法預覽或下載。',
            missingHint: '目前文件缺少此附件的資料，無法預覽或下載。',
            unavailableSummary: '文件中有 {0} 個無法使用的附件，已保留預留位置。將游標移至警告圖示可查看原因。',
            rename: '重新命名',
            saveName: '儲存名稱',
            cancel: '取消',
            invalidName: '請輸入有效檔名，最多 255 個字元。',
            renameFailed: '無法重新命名此附件，請重試。',
            actions: '附件操作',
            linkSaveFailed: '線上檔案已建立，但連結儲存失敗。請重試儲存連結。',
            conversionFailed: '附件轉換失敗，請重試。',
            converted: '轉換完成，可在新分頁開啟線上檔案。',
            converting: '正在轉換…',
            openSlide: '在新分頁開啟線上簡報',
            openDoc: '在新分頁開啟線上文件',
            openSheet: '在新分頁開啟線上試算表',
            convertSlide: '轉換為線上簡報',
            convertDoc: '轉換為線上文件',
            convertSheet: '轉換為線上試算表',
            nativePreviewHint: '如果瀏覽器無法顯示此檔案，請下載原始檔案。',
            attachment: 'OLE 附件',
            external: '外部連結檔案無法使用',
            missing: '附件資料無法使用',
            opaque: '原始 OLE 二進位檔案（可下載）',
            download: '下載',
            preview: '預覽',
            remove: '刪除',
            failed: '無法讀取原始附件，請重試。',
            unsupported: '此檔案暫不支援預覽，可以下載原始檔案。',
        },
        mobile: { close: '關閉', more: '更多' },
        'image-cropper': {
            error: '無法裁切非圖片元素',
        },
        objectListPanel: {
            title: '圖層',
            empty: '暫無物件',
            showAll: '全部顯示',
            hideAll: '全部隱藏',
            lockAll: '全部鎖定',
            unlockAll: '全部解鎖',
            moveForward: '上移一層',
            moveBackward: '下移一層',
            close: '關閉',
            show: '顯示',
            hide: '隱藏',
            lock: '鎖定',
            unlock: '解鎖',
            lockHint: '鎖定，防止誤選',
            unlockHint: '已鎖定，點擊解鎖',
            name: '名稱',
            nameInput: '物件名稱',
            description: '描述',
            descriptionPlaceholder: '新增描述',
            details: '詳細資料',
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
                placeholder: '預留位置',
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
                cancel: '取消',
                apply: '完成',
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
            square: '矩形',
            topAndBottom: '上及下',
            inline: '與文字排列',
            behindText: '文字在前',
            inFrontText: '文字在後',
        },
    },
};

export default locale;
