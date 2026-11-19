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
            progressReading: '添付ファイルを読み込み中…',
            progressUploading: '添付ファイルをアップロード中…',
            progressCreating: 'オンラインファイルを作成中…',
            progressSaving: 'リンクを保存中…',
            externalAttachment: 'リンクされた添付ファイル',
            externalHint: 'この添付ファイルの参照先の元ファイルは文書に埋め込まれていないため、プレビューやダウンロードはできません。',
            missingHint: 'この文書には添付ファイルのデータがないため、プレビューやダウンロードはできません。',
            unavailableSummary: 'この文書には利用できない添付ファイルが {0} 件あります。プレースホルダーは保持されています。警告アイコンにカーソルを合わせると理由を確認できます。',
            rename: '名前の変更',
            saveName: '名前を保存',
            cancel: 'キャンセル',
            invalidName: '255 文字以内の有効なファイル名を入力してください。',
            renameFailed: '添付ファイルの名前を変更できません。再試行してください。',
            actions: '添付ファイルの操作',
            linkSaveFailed: 'オンラインファイルは作成されましたが、リンクを保存できませんでした。リンクの保存を再試行してください。',
            conversionFailed: '添付ファイルを変換できませんでした。再試行してください。',
            converted: '変換が完了しました',
            open: '開く',
            converting: '変換中…',
            openSlide: 'オンラインプレゼンテーションを新しいタブで開く',
            openDoc: 'オンラインドキュメントを新しいタブで開く',
            openSheet: 'オンラインスプレッドシートを新しいタブで開く',
            convertSlide: 'オンラインプレゼンテーションに変換',
            convertDoc: 'オンラインドキュメントに変換',
            convertSheet: 'オンラインスプレッドシートに変換',
            nativePreviewHint: 'ブラウザーで表示できない場合は、元のファイルをダウンロードしてください。',
            attachment: 'OLE 添付ファイル',
            external: '外部ファイルを利用できません',
            missing: '添付ファイルのデータを利用できません',
            opaque: '元の OLE バイナリ（ダウンロード可能）',
            download: 'ダウンロード',
            preview: 'プレビュー',
            remove: '削除',
            failed: '元の添付ファイルを読み取れませんでした。再試行してください。',
            unsupported: 'このファイルはプレビューできません。元のファイルをダウンロードできます。',
        },
        mobile: { close: '閉じる', more: 'もっと見る' },
        'image-cropper': {
            error: '画像以外のオブジェクトはトリミングできません。',
        },
        objectListPanel: {
            title: 'レイヤー',
            empty: 'オブジェクトがありません',
            showAll: 'すべて表示',
            hideAll: 'すべて非表示',
            lockAll: 'すべてロック',
            unlockAll: 'すべてロック解除',
            moveForward: '前面へ移動',
            moveBackward: '背面へ移動',
            close: '閉じる',
            show: '表示',
            hide: '非表示',
            lock: 'ロック',
            unlock: 'ロック解除',
            lockHint: '誤選択を防ぐためにロック',
            unlockHint: 'ロック済み。クリックして解除',
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
                cancel: 'キャンセル',
                apply: '完了',
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
            square: '四角形',
            topAndBottom: '上下',
            inline: '行内',
            behindText: '文字列の背面',
            inFrontText: '文字列の前面',
        },
    },
};

export default locale;
