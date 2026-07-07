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
            error: '画像以外のオブジェクトはトリミングできません。',
        },
        objectListPanel: {
            title: 'オブジェクト',
            empty: 'オブジェクトがありません',
            showAll: 'すべて表示',
            hideAll: 'すべて非表示',
            moveForward: '前面へ移動',
            moveBackward: '背面へ移動',
            close: '閉じる',
            show: '表示',
            hide: '非表示',
            lock: 'ロック',
            unlock: 'ロック解除',
            name: '名前',
            nameInput: 'オブジェクト名',
            description: '説明',
            descriptionPlaceholder: '説明を追加',
            details: '詳細',
            locate: '位置を表示',
            expand: '展開',
            collapse: '折りたたむ',
            dragToReorder: 'ドラッグして並べ替え',
            search: 'オブジェクトを検索',
            filterAll: 'すべて',
            filterHidden: '非表示',
            filterLocked: 'ロック済み',
            sectionCanvas: 'キャンバスレイヤー',
            sectionFloating: 'フローティングレイヤー',
            typeNames: {
                object: 'オブジェクト',
                shape: '図形',
                connector: 'コネクタ',
                image: '画像',
                chart: 'グラフ',
                table: '表',
                smartArt: 'SmartArt',
                video: 'ビデオ',
                group: 'グループ',
                unit: 'ユニット',
                dom: 'DOM',
                text: 'テキスト',
                placeholder: 'プレースホルダー',
                container: 'コンテナー',
            },
            noSelection: 'オブジェクトを選択して詳細を編集',
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
        'image-text-wrap': {
            title: '文字列の折り返し',
            wrappingStyle: '折り返しのスタイル',
            square: '四角形',
            topAndBottom: '上下',
            inline: '行内',
            behindText: '文字列の背面',
            inFrontText: '文字列の前面',
            wrapText: '文字列の折り返し',
            bothSide: '両側',
            leftOnly: '左のみ',
            rightOnly: '右のみ',
            distanceFromText: '文字列からの距離',
            top: '上(px)',
            left: '左(px)',
            bottom: '下(px)',
            right: '右(px)',
        },
        'image-popup': {
            replace: '置換',
            delete: '削除',
            edit: '編集',
            crop: 'トリミング',
            reset: 'サイズをリセット',
        },
    },
};

export default locale;
