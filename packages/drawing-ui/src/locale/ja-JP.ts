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
    'image-popup': {
        replace: '置換',
        delete: '削除',
        edit: '編集',
        crop: 'トリミング',
        reset: 'サイズをリセット',
    },
    'image-cropper': {
        error: '画像以外のオブジェクトはトリミングできません。',
    },
    'image-panel': {
        arrange: {
            title: '配置',
            forward: '前面へ移動',
            backward: '背面へ移動',
            front: '最前面へ移動',
            back: '最背面へ移動',
        },
        transform: {
            title: '変形',
            rotate: '回転 (°)',
            x: 'X座標 (px)',
            y: 'Y座標 (px)',
            width: '幅 (px)',
            height: '高さ (px)',
            lock: '縦横比を固定 (%)',
        },
        crop: {
            title: 'トリミング',
            start: 'トリミングを開始',
            mode: '自由モード',
        },
        group: {
            title: 'グループ',
            group: 'グループ化',
            reGroup: '再グループ化',
            unGroup: 'グループ解除',
        },
        align: {
            title: '整列',
            default: '整列タイプを選択',
            left: '左揃え',
            center: '中央揃え',
            right: '右揃え',
            top: '上揃え',
            middle: '中央揃え',
            bottom: '下揃え',
            horizon: '水平間隔を均等に配分',
            vertical: '垂直間隔を均等に配分',
        },
        null: '選択されたオブジェクトがありません',
    },
    'drawing-view': '描画',
    shortcut: {
        'drawing-move-down': '図形を下へ移動',
        'drawing-move-up': '図形を上へ移動',
        'drawing-move-left': '図形を左へ移動',
        'drawing-move-right': '図形を右へ移動',
        'drawing-delete': '図形を削除',
    },
};

export default locale;
