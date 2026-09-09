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
import emojiLocale from './emoji-locale/ja-JP.generated';

const locale: typeof enUS = {
    ui: {
        accessibility: {
            menu: 'メニュー',
            zoom: 'ズーム',
            zoomIn: '拡大',
            zoomOut: '縮小',
            resetZoom: 'ズームをリセット',
        },
        objectPermission: {
            operationDenied: 'このコンテンツは保護されているため、操作できません。',
            remove: '保護を削除',
            roleOwner: 'ファイル所有者',
            roleEditor: 'ファイル編集者',
            selectedCount: '選択済み: {0}',
            searchPeople: 'ユーザーを検索',
            noMatchingPeople: '一致するユーザーはいません',
            loadMore: 'さらに読み込む',
            fileHint: 'メンバーはファイルの共有設定で管理します。これらの設定はメンバーの操作を制限します。',
            documentParent: 'このセクションには文書の編集制限も適用されます。',
            paragraphParent: 'この段落には文書と所属するセクションの編集制限も適用されます。',
            documentObjectParent: '文書、およびこのオブジェクトを含むか固定先となるセクションや段落の編集制限も適用される場合があります。',
            slideParent: 'プレゼンテーションの編集制限も適用されます。',
            slideObjectParent: 'プレゼンテーションと所属するスライドまたはマスターの編集制限も適用されます。',
            baseParent: 'Base の編集制限も適用されます。',
            baseObjectParent: 'Base と所属するテーブルの編集制限も適用されます。',
            recordParent: 'Base とテーブルの制限も適用されます。値の編集にはフィールドの権限も必要です。',
            boardParent: 'このオブジェクトにはボードの編集制限も適用されます。',
            ownerInherit: 'ファイル所有者、継承されたアクセス権',
            peopleError: 'ユーザーを読み込めませんでした。再試行してください。',
            document: '文書',
            section: 'セクション',
            paragraph: '段落',
            entity: 'オブジェクト',
            presentation: 'プレゼンテーション',
            page: 'スライド',
            master: 'マスタービュー',
            base: 'Base',
            table: 'テーブル',
            field: 'フィールド',
            record: 'レコード',
            view: 'ビュー',
            board: 'ボード',
            objectName: '{0}: {1}',

            search: 'オブジェクトを検索',
            empty: '一致するオブジェクトはありません',
            more: '最初の 100 件を表示しています。検索して絞り込んでください。',
            title: '権限',
            cancel: 'キャンセル',
            save: '保存',
            saving: '保存中…',
            loading: '読み込み中…',
            conflict: '権限が変更されました。保存する前に再読み込みしてください。',
            error: '権限を読み込みまたは保存できませんでした。変更内容は保持されています。',
            reload: '再読み込み',
            denied: 'このオブジェクトの権限を管理することはできません。',
            edit: '編集できるユーザー',
            all: 'すべてのファイル編集者',
            owner: 'オブジェクト所有者のみ',
            members: '選択したメンバー',
            copy: '編集者によるコピーを許可',
            print: '編集者による印刷を許可',
            export: '編集者によるエクスポートを許可',
            comment: '編集者によるコメントを許可',
            parentHint: 'ファイルと親オブジェクトの制限も適用されます。',
        },
        featureSearch: {
            title: '機能を検索',
            placeholder: '機能またはメニュー名を入力…',
            empty: '利用可能な機能が見つかりません',
            ribbon: 'リボン',
            contextMenu: 'コンテキストメニュー',
        },
        emojiPicker: {
            search: '検索',
            random: 'ランダム絵文字',
            recents: '最近使用',
            emojis: '絵文字',
            animals: '動物',
            food: '食べ物',
            activities: 'アクティビティ',
            places: '場所',
            objects: 'オブジェクト',
            symbols: '記号',
            searchResults: '検索結果',
            noResults: '絵文字が見つかりません',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: '数学',
            greek: 'ギリシャ文字',
            common: '一般',
        },
        toolbar: {
            heading: {
                normal: '標準',
                title: 'タイトル',
                subTitle: 'サブタイトル',
                1: '見出し 1',
                2: '見出し 2',
                3: '見出し 3',
                4: '見出し 4',
                5: '見出し 5',
            },
        },
        ribbon: {
            start: '開始',
            startDesc: 'ワークシートを初期化し、基本パラメータを設定します。',
            insert: '挿入',
            insertDesc: '行、列、グラフなどさまざまな要素を挿入します。',
            formulas: '数式',
            formulasDesc: 'データ計算のための関数と数式を使用します。',
            data: 'データ',
            dataDesc: 'データの管理（インポート、並べ替え、フィルタリングを含む）。',
            view: '表示',
            viewDesc: '表示モードを切り替え、表示効果を調整します。',
            others: 'その他',
            othersDesc: 'その他の機能と設定。',
            more: 'もっと見る',
        },
        fontFamily: {
            'not-supported': 'システムにそのようなフォントが見つからないため、デフォルトのフォントを使用しています。',
        },
        'shortcut-panel': {
            title: 'ショートカット',
        },
        shortcut: {
            undo: '元に戻す',
            redo: 'やり直す',
            cut: '切り取り',
            copy: 'コピー',
            paste: '貼り付け',
            'shortcut-panel': 'ショートカットパネルを切り替え',
        },
        'common-edit': '一般編集ショートカット',
        'toggle-shortcut-panel': 'ショートカットパネルを切り替え',
        navigation: {
            back: '戻る',
            previous: '前へ',
            next: '次へ',
        },
        sidebar: {
            panel: 'サイドバーパネル',
            resize: 'サイドバーのサイズを変更',
            close: 'サイドバーを閉じる',
        },
        beforeClose: {
            title: '一部の変更が保存されていません',
        },
        clipboard: {
            authentication: {
                title: '権限が拒否されました',
                content: 'Univerにクリップボードアクセスの権限を付与してください。',
            },
        },
        rangeSelector: {
            cancel: 'キャンセル',
        },
        'global-shortcut': 'グローバルショートカット',
        row: '行',
        column: '列',
    },
};

export default locale;
